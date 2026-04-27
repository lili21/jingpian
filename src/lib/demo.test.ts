import { describe, expect, it } from "vitest";

import { buildDemoImages, buildDemoStoryboard, createDemoVideoJobId, getDemoVideoJob } from "@/lib/demo";

const request = {
  brief: "为一款新品家电做 20 秒商业样片，先验证结构与镜头节奏。",
  audience: "品牌市场负责人",
  scenario: "信息流投放",
  style: "高级、克制、可信",
  objective: "先评审结构，再进入样片阶段",
  durationSeconds: 20,
  aspectRatio: "16:9",
} as const;

describe("demo builders", () => {
  it("returns a structured storyboard fallback", () => {
    const storyboard = buildDemoStoryboard(request);
    expect(storyboard.mode).toBe("demo");
    expect(storyboard.frames.length).toBeGreaterThanOrEqual(4);
  });

  it("returns image fallbacks for storyboard frames", () => {
    const storyboard = buildDemoStoryboard(request);
    const images = buildDemoImages(storyboard.frames);
    expect(images.mode).toBe("demo");
    expect(images.images).toHaveLength(storyboard.frames.length);
    expect(images.images[0]?.url.startsWith("data:image/svg+xml")).toBe(true);
  });

  it("returns demo video polling states", () => {
    const jobId = createDemoVideoJobId();
    const result = getDemoVideoJob(jobId);
    expect(result.mode).toBe("demo");
    expect(result.pollingUrl).toContain(jobId);
  });
});
