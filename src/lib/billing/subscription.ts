import { cache } from "react";

import { ensureAuthDatabase, getAuthPool } from "@/lib/auth";
import { getServerSession } from "@/lib/session";
import { isStripeConfigured } from "@/lib/billing/stripe";

export type SubscriptionState = {
  isSignedIn: boolean;
  isPremium: boolean;
  plan: "free" | "premium";
  source: "fallback" | "stripe";
};

export const getSubscriptionState = cache(async (): Promise<SubscriptionState> => {
  await ensureAuthDatabase();

  const source: SubscriptionState["source"] = isStripeConfigured() ? "stripe" : "fallback";
  const session = await getServerSession();

  if (!session?.user?.id) {
    return {
      isSignedIn: false,
      isPremium: false,
      plan: "free",
      source,
    };
  }

  const result = await getAuthPool().query(
    `SELECT plan, status
     FROM user_subscription
     WHERE user_id = $1
     LIMIT 1`,
    [session.user.id],
  );

  const row = result.rows[0] as { plan?: string; status?: string } | undefined;

  const isPremium =
    row?.plan === "premium" ||
    row?.status === "active" ||
    row?.status === "trialing";

  return {
    isSignedIn: true,
    isPremium,
    plan: isPremium ? "premium" : "free",
    source,
  };
});
