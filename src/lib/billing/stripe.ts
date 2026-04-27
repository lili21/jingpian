import Stripe from "stripe";

export function getStripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY ?? "";
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET ?? "";
}

export function getStripePremiumPriceId() {
  return process.env.STRIPE_PREMIUM_PRICE_ID ?? "";
}

export function getAppBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3000";
}

export function isStripeConfigured() {
  return Boolean(getStripeSecretKey());
}

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export async function getOrCreateStripeCustomer(input: {
  email: string;
  userId: string;
  name?: string | null;
}) {
  const stripe = getStripeClient();
  if (!stripe) {
    return null;
  }

  const existing = await stripe.customers.list({
    email: input.email,
    limit: 1,
  });

  const customer =
    existing.data[0] ??
    (await stripe.customers.create({
      email: input.email,
      name: input.name ?? undefined,
      metadata: {
        appUserId: input.userId,
      },
    }));

  return customer;
}
