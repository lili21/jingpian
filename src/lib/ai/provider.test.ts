import { describe, expect, it } from "vitest";

import {
  getCompatibleApiKey,
  getImageModel,
  getOpenRouterBaseUrl,
  getVideoModel,
  hasCompatibleProvider,
  hasOpenRouter,
} from "@/lib/ai/provider";

describe("ai provider defaults", () => {
  it("uses OpenRouter defaults when env is absent", () => {
    expect(getOpenRouterBaseUrl()).toBe("https://openrouter.ai/api/v1");
    expect(getImageModel()).toBe("openai/gpt-5.4-image-2");
    expect(getVideoModel()).toBe("bytedance/seedance-2.0");
  });

  it("reports missing providers without keys", () => {
    expect(getCompatibleApiKey()).toBe("");
    expect(hasCompatibleProvider()).toBe(false);
    expect(hasOpenRouter()).toBe(false);
  });
});
