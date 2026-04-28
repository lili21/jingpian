import { gateway, generateImage } from "ai";

import {
  getGatewayImageModel,
  getImageModel,
  getOpenRouterBaseUrl,
  hasGateway,
  hasOpenRouter,
  openRouterHeaders,
} from "@/lib/ai/provider";
import type {
  GeneratedImage,
  ImageGenerationResponse,
  ImageRequest,
} from "@/lib/ai/schemas";
import { buildDemoImages } from "@/lib/demo";

function collectImageCandidates(value: unknown, bucket: string[] = []): string[] {
  if (!value) return bucket;

  if (typeof value === "string") {
    if (value.startsWith("data:image/") || value.startsWith("https://")) {
      bucket.push(value);
    }
    return bucket;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectImageCandidates(item, bucket));
    return bucket;
  }

  if (typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (typeof nested === "string") {
        if (key.toLowerCase().includes("b64") || key.toLowerCase().includes("base64")) {
          bucket.push(`data:image/png;base64,${nested}`);
        } else if (
          key.toLowerCase().includes("image") ||
          key.toLowerCase().includes("url") ||
          key.toLowerCase().includes("content")
        ) {
          collectImageCandidates(nested, bucket);
        }
      } else {
        collectImageCandidates(nested, bucket);
      }
    }
  }

  return bucket;
}

async function requestSingleImage(prompt: string) {
  const response = await fetch(`${getOpenRouterBaseUrl()}/responses`, {
    method: "POST",
    headers: openRouterHeaders(),
    body: JSON.stringify({
      model: getImageModel(),
      input: prompt,
      tools: [
        {
          type: "openrouter:image_generation",
          parameters: {
            quality: "high",
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`image request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const candidates = collectImageCandidates(data);
  return candidates[0] || null;
}

async function requestSingleGatewayImage(prompt: string, aspectRatio: string) {
  const result = await generateImage({
    model: gateway.imageModel(getGatewayImageModel()),
    prompt,
    aspectRatio: aspectRatio as `${number}:${number}`,
  });

  const image = result.images[0];

  if (!image) {
    return null;
  }

  return `data:${image.mediaType};base64,${image.base64}`;
}

export async function generateStoryboardImages(
  input: ImageRequest,
): Promise<ImageGenerationResponse> {
  const canUseGateway = hasGateway();
  const canUseOpenRouter = hasOpenRouter();

  if (!canUseGateway && !canUseOpenRouter) {
    return buildDemoImages(input.frames);
  }

  const demo = buildDemoImages(input.frames);
  const provider = canUseGateway ? "ai-gateway" : "openrouter";
  const model = getImageModel();

  try {
    const images: GeneratedImage[] = await Promise.all(
      input.frames.map(async (frame, index) => {
        const prompt = [
          frame.visualPrompt,
          `画幅 ${input.aspectRatio}`,
          `风格要求：${input.style}`,
          "请保持真实、可拍摄、适合中国商业内容提案，不要过度 AI 风格化。",
        ].join("，");

        const liveUrl = await (canUseGateway
          ? requestSingleGatewayImage(prompt, input.aspectRatio)
          : requestSingleImage(prompt)
        ).catch(() => null);

        return {
          id: frame.id,
          title: frame.title,
          prompt,
          url: liveUrl || demo.images[index]?.url || demo.images[0].url,
          source: liveUrl ? "live" : "demo",
        };
      }),
    );

    const liveCount = images.filter((item) => item.source === "live").length;

    return {
      mode: liveCount > 0 ? "live" : "demo",
      provider: liveCount > 0 ? provider : "demo-fallback",
      model,
      images,
    };
  } catch (error) {
    console.error("image generation failed", error);
    return demo;
  }
}
