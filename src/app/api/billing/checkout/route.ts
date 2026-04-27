import { getServerSession } from "@/lib/session";
import {
  getAppBaseUrl,
  getOrCreateStripeCustomer,
  getStripeClient,
  getStripePremiumPriceId,
  isStripeConfigured,
} from "@/lib/billing/stripe";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getServerSession();

  if (!session?.user?.id || !session.user.email) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return Response.json(
      {
        mode: "fallback",
        url: "/pricing?billing=disabled",
        message: "Stripe is not configured. Add STRIPE_SECRET_KEY to enable checkout.",
      },
      { status: 200 },
    );
  }

  const stripe = getStripeClient();
  const priceId = getStripePremiumPriceId();

  if (!stripe || !priceId) {
    return Response.json(
      {
        mode: "fallback",
        url: "/pricing?billing=misconfigured",
        message: "Stripe checkout is not fully configured.",
      },
      { status: 200 },
    );
  }

  const customer = await getOrCreateStripeCustomer({
    email: session.user.email,
    userId: session.user.id,
    name: session.user.name,
  });

  const baseUrl = getAppBaseUrl();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer?.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/workspace?billing=success`,
    cancel_url: `${baseUrl}/pricing?billing=cancelled`,
    metadata: {
      appUserId: session.user.id,
    },
  });

  return Response.json({
    mode: "stripe",
    url: checkoutSession.url,
  });
}
