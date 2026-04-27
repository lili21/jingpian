import { getServerSession } from "@/lib/session";
import {
  getAppBaseUrl,
  getOrCreateStripeCustomer,
  getStripeClient,
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
        message: "Stripe is not configured. Add STRIPE_SECRET_KEY to enable portal.",
      },
      { status: 200 },
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return Response.json(
      {
        mode: "fallback",
        url: "/pricing?billing=misconfigured",
        message: "Stripe portal is not fully configured.",
      },
      { status: 200 },
    );
  }

  const customer = await getOrCreateStripeCustomer({
    email: session.user.email,
    userId: session.user.id,
    name: session.user.name,
  });

  if (!customer) {
    return Response.json(
      {
        mode: "fallback",
        url: "/pricing?billing=misconfigured",
        message: "Stripe customer could not be created.",
      },
      { status: 200 },
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${getAppBaseUrl()}/workspace`,
  });

  return Response.json({
    mode: "stripe",
    url: portalSession.url,
  });
}
