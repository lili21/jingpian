import type {
  GeneratedImage,
  ImageGenerationResponse,
  StoryboardFrame,
  StoryboardRequest,
  StoryboardResponse,
  VideoJobResponse,
} from "@/lib/ai/schemas";

const demoVideoUrl =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const accentPalette = ["#12344A", "#7A5A31", "#5D6E7E", "#9C7A44", "#273C50"];

function dataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function makePoster(title: string, subtitle: string, index: number) {
  const accent = accentPalette[index % accentPalette.length];
  return dataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" fill="none">
      <rect width="1280" height="720" rx="40" fill="#F6F3EC" />
      <rect x="42" y="42" width="1196" height="636" rx="30" fill="#FCFBF8" stroke="#D8D0C2" />
      <rect x="92" y="104" width="412" height="468" rx="28" fill="${accent}" fill-opacity="0.11" stroke="${accent}" stroke-opacity="0.35" />
      <rect x="140" y="152" width="316" height="190" rx="24" fill="${accent}" fill-opacity="0.18" />
      <rect x="140" y="378" width="240" height="18" rx="9" fill="#B8A27C" fill-opacity="0.55" />
      <rect x="140" y="410" width="292" height="12" rx="6" fill="#C7B9A5" />
      <rect x="140" y="438" width="260" height="12" rx="6" fill="#D2C8B8" />
      <rect x="556" y="136" width="566" height="18" rx="9" fill="#B8A27C" fill-opacity="0.65" />
      <rect x="556" y="186" width="468" height="72" rx="18" fill="#EFE9DD" />
      <rect x="556" y="286" width="566" height="15" rx="7.5" fill="#CCC1AF" />
      <rect x="556" y="318" width="510" height="15" rx="7.5" fill="#D7CCBD" />
      <rect x="556" y="350" width="430" height="15" rx="7.5" fill="#E1D8CC" />
      <rect x="556" y="418" width="162" height="146" rx="22" fill="#F4F0E7" stroke="#DDD2C4" />
      <rect x="742" y="418" width="162" height="146" rx="22" fill="#F4F0E7" stroke="#DDD2C4" />
      <rect x="928" y="418" width="162" height="146" rx="22" fill="#F4F0E7" stroke="#DDD2C4" />
      <text x="140" y="640" fill="#253140" font-size="48" font-family="Arial, PingFang SC, sans-serif" font-weight="700">${title}</text>
      <text x="556" y="238" fill="#253140" font-size="34" font-family="Arial, PingFang SC, sans-serif" font-weight="700">${subtitle}</text>
    </svg>
  `);
}

function short(text: string, fallback: string) {
  const clean = text.trim();
  if (!clean) return fallback;
  return clean.length > 38 ? `${clean.slice(0, 38)}…` : clean;
}

export function buildDemoStoryboard(input: StoryboardRequest): StoryboardResponse {
  const scene = short(input.scenario, "Paid social distribution");
  const brief = short(input.brief, "New product launch campaign requires structure review");
  const audience = short(input.audience, "Marketing and creative team");
  const baseDuration = Math.max(2, Math.round(input.durationSeconds / 4));

  const frames: StoryboardFrame[] = [
    {
      id: "frame-01",
      title: "Problem Hook",
      durationSeconds: baseDuration,
      shotType: "Medium close-up / high-tempo open",
      goal: `Pull ${audience} into the business pressure quickly.`,
      visualPrompt: `${brief}, office setting, low-saturation warm lighting, clean frame, realistic commercial photography tone, emphasizing pre-production decision pressure.`,
      voiceover: "Do not start with model hype. Start by validating structure quality.",
      onScreenText: `${scene} | Structure first, production second`,
      transition: "Cut from text overlay into workspace UI.",
      notes: "Frame one should establish the project-owner perspective, not showcase technology.",
    },
    {
      id: "frame-02",
      title: "Storyboard Review",
      durationSeconds: baseDuration + 1,
      shotType: "Top-down / document-style composition",
      goal: "Translate abstract brief into a reviewable scene structure.",
      visualPrompt: `Storyboard board, scene cards, brief summary, and risk notes in one layout; ${input.style}; mixed paper texture and product UI language.`,
      voiceover: "Put scene intent, narration, and pacing in one review board so teams can decide on one direction.",
      onScreenText: "Brief → Storyboard → Review",
      transition: "Push camera into keyframe draft wall.",
      notes: "Frame two should emphasize auditability and review trace.",
    },
    {
      id: "frame-03",
      title: "Keyframe Validation",
      durationSeconds: baseDuration,
      shotType: "Split composition / version comparison",
      goal: "Show differences across creative directions instead of one answer.",
      visualPrompt: "Two-column keyframe comparison A/B, left side rational value-led scenes, right side emotional narrative, restrained premium proposal visual style.",
      voiceover: "Review keyframe differences first, then commit to one direction and reduce downstream rework.",
      onScreenText: "Version A / Version B / Recommended Path",
      transition: "Cut to job status and delivery timeline panel.",
      notes: "Frame three should position the workspace as a decision system.",
    },
    {
      id: "frame-04",
      title: "Video Job Submission",
      durationSeconds: baseDuration,
      shotType: "Workspace / status panel",
      goal: "Converge into an executable video job and close the loop.",
      visualPrompt: "Video job card, polling state, delivery checklist, and SLA highlights in a premium B2B-friendly interface.",
      voiceover: "Submit the video task only after review so teams can track both output and decision rationale.",
      onScreenText: "Video job submitted · Waiting for return",
      transition: "End on delivery checklist and next-step recommendations.",
      notes: "Final frame should feel procurement-ready and deliverable.",
    },
  ];

  return {
    mode: "demo",
    provider: "demo-fallback",
    model: "jingpian-demo-storyboard",
    briefSummary: `${brief}. Scenario: ${scene}. Audience: ${audience}. Review first, then production.`,
    creativeDirection: `Use a ${input.style} commercial proposal tone, with structural clarity and collaboration transparency as top priorities.`,
    reviewGuidance: [
      "Verify whether the first 3 seconds communicate the business problem clearly.",
      "Check whether frames two and three support fast direction decisions.",
      "For performance tests, keep both rational value-led and emotional narrative variants.",
    ],
    frames,
  };
}

export function buildDemoImages(frames: StoryboardFrame[]): ImageGenerationResponse {
  const images: GeneratedImage[] = frames.map((frame, index) => ({
    id: frame.id,
    title: frame.title,
    prompt: frame.visualPrompt,
    url: makePoster(frame.title, short(frame.onScreenText, frame.goal), index),
    source: "demo",
  }));

  return {
    mode: "demo",
    provider: "demo-fallback",
    model: "jingpian-demo-image-board",
    images,
  };
}

export function createDemoVideoJobId() {
  return `demo-${Date.now()}`;
}

export function getDemoVideoJob(jobId: string): VideoJobResponse {
  const match = jobId.match(/^demo-(\d+)$/);
  const createdAt = match ? Number(match[1]) : Date.now();
  const elapsed = Date.now() - createdAt;
  const status = elapsed < 2500 ? "queued" : elapsed < 6500 ? "processing" : "completed";

  return {
    mode: "demo",
    provider: "demo-fallback",
    model: "jingpian-demo-video",
    jobId,
    status,
    pollingUrl: `/api/videos/${jobId}`,
    message:
      status === "completed"
        ? "Demo mode has returned a sample video. Connect a live OpenRouter key for real async jobs."
        : "Demo polling is active to simulate workspace feedback rhythm.",
    videoUrl: status === "completed" ? demoVideoUrl : undefined,
    thumbnailUrl: makePoster("Sample Returned", "Demo video ready", 0),
  };
}
