import { cache } from "react";

import { getAuthDb } from "@/lib/auth";
import { getServerSession } from "@/lib/session";
import { isStripeConfigured } from "@/lib/billing/stripe";

export type SubscriptionState = {
  isSignedIn: boolean;
  isPremium: boolean;
  plan: "free" | "premium";
  source: "fallback" | "stripe";
};

export const getSubscriptionState = cache(async (): Promise<SubscriptionState> => {
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

  const row = getAuthDb()
    .prepare(
      `SELECT plan, status
       FROM user_subscription
       WHERE userId = ?`,
    )
    .get(session.user.id) as { plan?: string; status?: string } | undefined;

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
