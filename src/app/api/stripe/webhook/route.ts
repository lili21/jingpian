import Stripe from "stripe";

import { getAuthDb } from "@/lib/auth";
import {
  getStripeClient,
  getStripeWebhookSecret,
  isStripeConfigured,
} from "@/lib/billing/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toUnixSeconds(value: number | null | undefined) {
  return typeof value === "number" ? value : null;
}

function getSubscriptionCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const raw = subscription as unknown as {
    current_period_end?: number;
    currentPeriodEnd?: number;
  };

  return toUnixSeconds(raw.current_period_end ?? raw.currentPeriodEnd);
}

function toPlan(status: string | undefined) {
  if (!status) return "free";
  return status === "active" || status === "trialing" ? "premium" : "free";
}

async function resolveAppUserId(
  stripe: Stripe,
  input: {
    customer?: string | null;
    metadataUserId?: string | null;
  },
) {
  if (input.metadataUserId) {
    return input.metadataUserId;
  }

  if (!input.customer) {
    return null;
  }

  const customer = await stripe.customers.retrieve(input.customer);
  if (customer.deleted) {
    return null;
  }

  return customer.metadata?.appUserId || null;
}

function upsertSubscription(input: {
  userId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status?: string | null;
  currentPeriodEnd?: number | null;
}) {
  const now = Math.floor(Date.now() / 1000);
  const status = input.status || "inactive";
  const plan = toPlan(status);

  getAuthDb()
    .prepare(
      `INSERT INTO user_subscription (
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        status,
        plan,
        currentPeriodEnd,
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(userId) DO UPDATE SET
        stripeCustomerId = excluded.stripeCustomerId,
        stripeSubscriptionId = excluded.stripeSubscriptionId,
        status = excluded.status,
        plan = excluded.plan,
        currentPeriodEnd = excluded.currentPeriodEnd,
        updatedAt = excluded.updatedAt`,
    )
    .run(
      input.userId,
      input.stripeCustomerId || null,
      input.stripeSubscriptionId || null,
      status,
      plan,
      input.currentPeriodEnd || null,
      now,
    );
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return Response.json({ received: true, mode: "fallback" });
  }

  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();
  const signature = request.headers.get("stripe-signature");

  if (!stripe || !webhookSecret || !signature) {
    return Response.json({ error: "stripe webhook misconfigured" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "invalid signature",
      },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") {
        break;
      }

      const appUserId = await resolveAppUserId(stripe, {
        customer: typeof session.customer === "string" ? session.customer : null,
        metadataUserId:
          session.metadata?.appUserId ||
          session.client_reference_id ||
          null,
      });

      if (!appUserId) {
        break;
      }

      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;
      let subscriptionStatus = "active";
      let currentPeriodEnd: number | null = null;

      if (subscriptionId) {
        const subscription =
          (await stripe.subscriptions.retrieve(subscriptionId)) as Stripe.Subscription;
        subscriptionStatus = subscription.status;
        currentPeriodEnd = getSubscriptionCurrentPeriodEnd(subscription);
      }

      upsertSubscription({
        userId: appUserId,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
        stripeSubscriptionId: subscriptionId,
        status: subscriptionStatus,
        currentPeriodEnd,
      });
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const appUserId = await resolveAppUserId(stripe, {
        customer: typeof subscription.customer === "string" ? subscription.customer : null,
        metadataUserId: subscription.metadata?.appUserId || null,
      });

      if (!appUserId) {
        break;
      }

      const isDeleted = event.type === "customer.subscription.deleted";

      upsertSubscription({
        userId: appUserId,
        stripeCustomerId:
          typeof subscription.customer === "string" ? subscription.customer : null,
        stripeSubscriptionId: subscription.id,
        status: isDeleted ? "canceled" : subscription.status,
        currentPeriodEnd: isDeleted ? null : getSubscriptionCurrentPeriodEnd(subscription),
      });
      break;
    }
    default:
      break;
  }

  return Response.json({ received: true });
}
