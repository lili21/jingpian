import { describe, expect, it } from "vitest";

import {
  getStripePremiumPriceId,
  getStripeSecretKey,
  getStripeWebhookSecret,
  isStripeConfigured,
} from "@/lib/billing/stripe";

describe("stripe env helpers", () => {
  it("derives configuration state from environment helpers", () => {
    const secret = getStripeSecretKey();
    const webhookSecret = getStripeWebhookSecret();
    const priceId = getStripePremiumPriceId();

    expect(typeof secret).toBe("string");
    expect(typeof webhookSecret).toBe("string");
    expect(typeof priceId).toBe("string");
    expect(isStripeConfigured()).toBe(Boolean(secret));
  });
});
