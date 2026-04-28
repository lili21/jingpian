import { beforeEach, describe, expect, it } from "vitest";

import {
  getCompatibleApiKey,
  getGatewayImageModel,
  getGatewayVideoModel,
  getImageModel,
  getOpenRouterBaseUrl,
  getOpenRouterVideoModel,
  getVideoModel,
  hasCompatibleProvider,
  hasGateway,
  hasOpenRouter,
} from "@/lib/ai/provider";

describe("ai provider defaults", () => {
  beforeEach(() => {
    delete process.env.AI_COMPATIBLE_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.AI_GATEWAY_IMAGE_MODEL;
    delete process.env.AI_GATEWAY_VIDEO_MODEL;
    delete process.env.OPENROUTER_BASE_URL;
    delete process.env.OPENROUTER_IMAGE_MODEL;
    delete process.env.OPENROUTER_VIDEO_MODEL;
  });

  it("uses OpenRouter defaults when env is absent", () => {
    expect(getOpenRouterBaseUrl()).toBe("https://openrouter.ai/api/v1");
    expect(getImageModel()).toBe("openai/gpt-5.4-image-2");
    expect(getVideoModel()).toBe("jingpian-demo-video");
    expect(getGatewayImageModel()).toBe("openai/gpt-image-1");
    expect(getGatewayVideoModel()).toBe("bytedance/seedance-2.0");
    expect(getOpenRouterVideoModel()).toBe("bytedance/seedance-2.0");
  });

  it("reports missing providers without keys", () => {
    expect(getCompatibleApiKey()).toBe("");
    expect(hasCompatibleProvider()).toBe(false);
    expect(hasGateway()).toBe(false);
    expect(hasOpenRouter()).toBe(false);
  });

  it("prefers gateway image model when AI_GATEWAY_API_KEY is present", () => {
    process.env.AI_GATEWAY_API_KEY = "gateway-key";

    expect(hasGateway()).toBe(true);
    expect(getImageModel()).toBe("openai/gpt-image-1");

    process.env.AI_GATEWAY_IMAGE_MODEL = "openai/gpt-image-2";
    expect(getImageModel()).toBe("openai/gpt-image-2");
  });

  it("uses OpenRouter image model when gateway key is absent", () => {
    process.env.OPENROUTER_IMAGE_MODEL = "openai/gpt-5.4-image-2";
    expect(getImageModel()).toBe("openai/gpt-5.4-image-2");
  });

  it("prefers gateway video model when AI_GATEWAY_API_KEY is present", () => {
    process.env.AI_GATEWAY_API_KEY = "gateway-key";
    expect(getVideoModel()).toBe("bytedance/seedance-2.0");

    process.env.AI_GATEWAY_VIDEO_MODEL = "bytedance/seedance-2.1";
    expect(getVideoModel()).toBe("bytedance/seedance-2.1");
  });

  it("uses OpenRouter video model when only OPENROUTER_API_KEY is present", () => {
    process.env.OPENROUTER_API_KEY = "openrouter-key";
    process.env.OPENROUTER_VIDEO_MODEL = "bytedance/seedance-2.0-pro";

    expect(getVideoModel()).toBe("bytedance/seedance-2.0-pro");
  });
});
