import { cache } from "react";

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

  return {
    isSignedIn: true,
    isPremium: false,
    plan: "free",
    source,
  };
});
