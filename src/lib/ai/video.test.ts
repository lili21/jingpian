import { beforeEach, describe, expect, it, vi } from "vitest";

import type { VideoRequest } from "@/lib/ai/schemas";
import { submitVideoJob } from "@/lib/ai/video";
import { experimental_generateVideo, gateway } from "ai";

vi.mock("ai", () => {
  return {
    experimental_generateVideo: vi.fn(),
    gateway: {
      videoModel: vi.fn((modelId: string) => ({ modelId })),
    },
  };
});

const request: VideoRequest = {
  brief: "为新品发布做一支 8 秒商业样片，先验证信息密度和节奏。",
  style: "高级、稳定、商业化",
  aspectRatio: "16:9",
  durationSeconds: 8,
  frames: [
    {
      id: "f1",
      title: "开场",
      durationSeconds: 4,
      shotType: "中景",
      goal: "建立卖点",
      visualPrompt: "产品置于桌面，暖光真实摄影感",
      voiceover: "开场文案",
      onScreenText: "主文案",
      transition: "切换",
      notes: "备注",
    },
  ],
};

describe("video generation path", () => {
  beforeEach(() => {
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.AI_GATEWAY_VIDEO_MODEL;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_VIDEO_MODEL;

    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses AI SDK experimental_generateVideo when AI_GATEWAY_API_KEY is configured", async () => {
    process.env.AI_GATEWAY_API_KEY = "gateway-key";
    process.env.AI_GATEWAY_VIDEO_MODEL = "bytedance/seedance-2.0";

    vi.mocked(experimental_generateVideo).mockResolvedValue({
      videos: [
        {
          mediaType: "video/mp4",
          base64: "dGVzdA==",
          uint8Array: new Uint8Array(),
        },
      ],
      warnings: [],
      responses: [],
      providerMetadata: {},
    } as Awaited<ReturnType<typeof experimental_generateVideo>>);

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await submitVideoJob(request);

    expect(vi.mocked(gateway.videoModel)).toHaveBeenCalledWith("bytedance/seedance-2.0");
    expect(vi.mocked(experimental_generateVideo)).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.mode).toBe("live");
    expect(result.provider).toBe("ai-gateway");
    expect(result.model).toBe("bytedance/seedance-2.0");
    expect(result.status).toBe("completed");
    expect(result.videoUrl?.startsWith("data:video/mp4;base64,")).toBe(true);
  });

  it("falls back to OpenRouter submit API when only OPENROUTER_API_KEY is configured", async () => {
    process.env.OPENROUTER_API_KEY = "openrouter-key";
    process.env.OPENROUTER_VIDEO_MODEL = "bytedance/seedance-2.0";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "job-123", status: "queued" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await submitVideoJob(request);

    expect(vi.mocked(experimental_generateVideo)).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.mode).toBe("live");
    expect(result.provider).toBe("openrouter");
    expect(result.model).toBe("bytedance/seedance-2.0");
    expect(result.status).toBe("queued");
    expect(result.pollingUrl).toBe("/api/videos/job-123");
  });
});
