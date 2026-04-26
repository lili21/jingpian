import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const DEFAULT_COMPATIBLE_BASE_URL =
  process.env.AI_COMPATIBLE_BASE_URL ||
  process.env.OPENROUTER_BASE_URL ||
  "https://openrouter.ai/api/v1";

export function getCompatibleApiKey() {
  return (
    process.env.AI_COMPATIBLE_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.AI_GATEWAY_API_KEY ||
    ""
  );
}

export function hasCompatibleProvider() {
  return Boolean(getCompatibleApiKey());
}

export function getCompatibleProvider() {
  return createOpenAICompatible({
    name: "jingpian",
    baseURL: DEFAULT_COMPATIBLE_BASE_URL,
    apiKey: getCompatibleApiKey(),
  });
}

export function getStoryboardModel() {
  return (
    process.env.STORYBOARD_MODEL ||
    process.env.OPENROUTER_TEXT_MODEL ||
    "openai/gpt-4.1-mini"
  );
}

export function getOpenRouterBaseUrl() {
  return process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
}

export function getOpenRouterApiKey() {
  return process.env.OPENROUTER_API_KEY || "";
}

export function hasOpenRouter() {
  return Boolean(getOpenRouterApiKey());
}

export function getImageModel() {
  return process.env.OPENROUTER_IMAGE_MODEL || "openai/gpt-5.4-image-2";
}

export function getVideoModel() {
  return process.env.OPENROUTER_VIDEO_MODEL || "bytedance/seedance-2.0";
}

export function openRouterHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getOpenRouterApiKey()}`,
  };

  if (process.env.OPENROUTER_SITE_URL) {
    headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  }

  if (process.env.OPENROUTER_SITE_NAME) {
    headers["X-Title"] = process.env.OPENROUTER_SITE_NAME;
  }

  return headers;
}
