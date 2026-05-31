import { experimental_generateVideo, gateway } from "ai";

import {
  getGatewayVideoModel,
  getOpenRouterBaseUrl,
  getOpenRouterVideoModel,
  hasGateway,
  hasOpenRouter,
  openRouterHeaders,
} from "@/lib/ai/provider";
import type { VideoJobResponse, VideoRequest } from "@/lib/ai/schemas";
import { createDemoVideoJobId, getDemoVideoJob } from "@/lib/demo";

function pickString(value: unknown, keys: string[]): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  for (const [key, nested] of Object.entries(value)) {
    if (keys.includes(key.toLowerCase()) && typeof nested === "string") {
      return nested;
    }
  }

  for (const nested of Object.values(value)) {
    if (typeof nested === "object") {
      const found = pickString(nested, keys);
      if (found) return found;
    }
  }

  return undefined;
}

function normalizeStatus(value: string | undefined): VideoJobResponse["status"] {
  const raw = (value || "processing").toLowerCase();
  if (raw.includes("complete") || raw.includes("success") || raw.includes("finished")) {
    return "completed";
  }
  if (raw.includes("fail") || raw.includes("error") || raw.includes("cancel")) {
    return "failed";
  }
  if (raw.includes("queue") || raw.includes("pending") || raw.includes("submit")) {
    return "queued";
  }
  return "processing";
}

export async function submitVideoJob(input: VideoRequest): Promise<VideoJobResponse> {
  const canUseOpenRouter = hasOpenRouter();
  const canUseGateway = hasGateway();

  if (!canUseGateway && !canUseOpenRouter) {
    return getDemoVideoJob(createDemoVideoJobId());
  }

  const prompt = [
    input.brief,
    `Style: ${input.style}`,
    `Aspect ratio: ${input.aspectRatio}`,
    `Duration: ${input.durationSeconds} seconds`,
    "Maintain stable framing and realistic texture suitable for commercial proposal review.",
  ].join("\n");

  try {
    if (canUseOpenRouter) {
      const response = await fetch(`${getOpenRouterBaseUrl()}/videos`, {
        method: "POST",
        headers: openRouterHeaders(),
        body: JSON.stringify({
          model: getOpenRouterVideoModel(),
          prompt,
          aspect_ratio: input.aspectRatio,
          duration: input.durationSeconds,
          resolution: "720p",
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`video submit failed: ${response.status} ${text}`);
      }

      const data = await response.json();
      const jobId = pickString(data, ["id", "jobid", "job_id"]) || createDemoVideoJobId();
      const pollingUrl =
        pickString(data, ["polling_url", "pollingurl"]) || `/api/videos/${jobId}`;
      const status = normalizeStatus(pickString(data, ["status", "state"]) || "queued");

      return {
        mode: "live",
        provider: "openrouter",
        model: getOpenRouterVideoModel(),
        jobId,
        status,
        pollingUrl,
        message: "Video job submitted. Workspace will poll status automatically.",
      };
    }

    const result = await experimental_generateVideo({
      model: gateway.videoModel(getGatewayVideoModel()),
      prompt,
      aspectRatio: input.aspectRatio as `${number}:${number}`,
      duration: input.durationSeconds,
    });

    const video = result.videos[0];
    const videoUrl = video ? `data:${video.mediaType};base64,${video.base64}` : undefined;
    const jobId = createDemoVideoJobId();

    return {
      mode: "live",
      provider: "ai-gateway",
      model: getGatewayVideoModel(),
      jobId,
      status: videoUrl ? "completed" : "processing",
      pollingUrl: `/api/videos/${jobId}`,
      message: videoUrl
        ? "Video generated. Continue with review or second-pass refinements."
        : "Video job submitted. Workspace will poll status automatically.",
      videoUrl,
    };
  } catch (error) {
    console.error("video submit failed", error);
    return getDemoVideoJob(createDemoVideoJobId());
  }
}

export async function pollVideoJob(jobId: string): Promise<VideoJobResponse> {
  if (jobId.startsWith("demo-") || !hasOpenRouter()) {
    return getDemoVideoJob(jobId);
  }

  try {
    const response = await fetch(`${getOpenRouterBaseUrl()}/videos/${jobId}`, {
      method: "GET",
      headers: openRouterHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`video poll failed: ${response.status} ${text}`);
    }

    const data = await response.json();
    const status = normalizeStatus(pickString(data, ["status", "state"]));
    const videoUrl = pickString(data, ["video_url", "url", "content_url"]);
    const thumbnailUrl = pickString(data, ["thumbnail_url", "poster_url", "preview_url"]);

    return {
      mode: "live",
      provider: "openrouter",
      model: getOpenRouterVideoModel(),
      jobId,
      status,
      pollingUrl: `/api/videos/${jobId}`,
      message:
        status === "completed"
          ? "Sample returned. Continue with review or second-pass refinements."
          : status === "failed"
            ? "Video job failed. Adjust prompt inputs or retry shortly."
            : "Video job is processing. Waiting for OpenRouter response.",
      videoUrl,
      thumbnailUrl,
    };
  } catch (error) {
    console.error("video polling failed", error);
    return getDemoVideoJob(jobId);
  }
}
