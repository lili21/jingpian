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
  const canUseGateway = hasGateway();
  const canUseOpenRouter = hasOpenRouter();

  if (!canUseGateway && !canUseOpenRouter) {
    return getDemoVideoJob(createDemoVideoJobId());
  }

  const prompt = [
    input.brief,
    `风格：${input.style}`,
    `画幅：${input.aspectRatio}`,
    `时长：${input.durationSeconds} 秒`,
    "请保持商业提案级别的稳定镜头和真实质感。",
  ].join("\n");

  try {
    if (canUseGateway) {
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
          ? "视频已生成，可继续做复核或二次调整。"
          : "视频任务已提交，工作台会自动轮询状态。",
        videoUrl,
      };
    }

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
      message: "视频任务已提交，工作台会自动轮询状态。",
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
          ? "样片已回传，可以继续做复核或二次调整。"
          : status === "failed"
            ? "视频任务失败，请调整 prompt 或稍后重试。"
            : "视频任务处理中，等待 OpenRouter 返回结果。",
      videoUrl,
      thumbnailUrl,
    };
  } catch (error) {
    console.error("video polling failed", error);
    return getDemoVideoJob(jobId);
  }
}
