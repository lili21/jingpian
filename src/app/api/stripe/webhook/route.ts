import Stripe from "stripe";

import {
  getStripeClient,
  getStripeWebhookSecret,
  isStripeConfigured,
} from "@/lib/billing/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      break;
    default:
      break;
  }

  return Response.json({ received: true });
}
