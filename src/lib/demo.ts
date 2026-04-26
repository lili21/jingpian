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
  const scene = short(input.scenario, "信息流投放");
  const brief = short(input.brief, "新品上新，需要先做结构判断");
  const audience = short(input.audience, "品牌与内容团队");
  const baseDuration = Math.max(2, Math.round(input.durationSeconds / 4));

  const frames: StoryboardFrame[] = [
    {
      id: "frame-01",
      title: "问题开场",
      durationSeconds: baseDuration,
      shotType: "中近景 / 节奏开场",
      goal: `用一句业务压力把 ${audience} 拉进场景。`,
      visualPrompt: `${brief}，办公场景，低饱和暖色光线，画面干净，真实商业摄影感，强调“决策前的压力”。`,
      voiceover: `不是先拼模型能力，而是先判断这个内容结构能不能过审。`,
      onScreenText: `${scene} 先定结构，再投制作`,
      transition: "从信息字幕切入工作台界面。",
      notes: "第一帧重点是建立项目负责人视角，而不是展示技术。",
    },
    {
      id: "frame-02",
      title: "分镜评审",
      durationSeconds: baseDuration + 1,
      shotType: "俯拍 / 文档式镜头",
      goal: "把抽象 brief 转成可评审的镜头结构。",
      visualPrompt: `分镜评审板、镜头卡片、简报摘要与风险备注同屏，${input.style}，纸感与产品界面混合。`,
      voiceover: `先把镜头意图、口播与节奏放到一张评审板上，团队才容易做同一个决定。`,
      onScreenText: "Brief → Storyboard → Review",
      transition: "镜头推进到关键帧草图。",
      notes: "第二帧突出“可留档”。",
    },
    {
      id: "frame-03",
      title: "关键帧确认",
      durationSeconds: baseDuration,
      shotType: "并列画面 / 版本对比",
      goal: "展示不同创意方向的差异，而不是只给一个答案。",
      visualPrompt: `两列关键帧方案 A/B 对比，左偏理性卖点，右偏情绪叙事，画面克制，高级品牌提案风。`,
      voiceover: `先看关键帧和版本差异，再决定往哪个方向出样片，返工会少很多。`,
      onScreenText: "版本 A / 版本 B / 推荐路径",
      transition: "切到任务状态与出片排期。",
      notes: "第三帧让用户感受到工作台是“决策系统”。",
    },
    {
      id: "frame-04",
      title: "视频任务提交",
      durationSeconds: baseDuration,
      shotType: "工作台 / 状态面板",
      goal: "收束到可执行的视频任务，形成产品闭环。",
      visualPrompt: `视频任务卡、轮询状态、交付清单与SLA提醒，浅色高级产品界面，细腻阴影，适合B2B采购展示。`,
      voiceover: `确认后再发起视频任务，团队看到的不只是结果，还有每一步的判断依据。`,
      onScreenText: "已提交视频任务 · 等待回传样片",
      transition: "结束于交付清单与下一步建议。",
      notes: "最后一帧要显得可采购、可交付。",
    },
  ];

  return {
    mode: "demo",
    provider: "demo-fallback",
    model: "jingpian-demo-storyboard",
    briefSummary: `${brief}。场景为 ${scene}，面向 ${audience}，先做评审再进入样片。`,
    creativeDirection: `整体方向采用“${input.style}”的商业提案气质，以结构判断和协作透明度作为第一优先级。`,
    reviewGuidance: [
      "先确认开场 3 秒是否足够快地说明商业问题。",
      "重点检查第二、三帧是否能支撑管理层快速做方向决策。",
      "如果目标是投放测试，建议保留理性卖点版与情绪叙事版各一套。",
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
        ? "演示模式已返回示例视频。接入真实 OpenRouter Key 后会改为真实异步任务。"
        : "当前为演示轮询状态，用于展示工作台反馈节奏。",
    videoUrl: status === "completed" ? demoVideoUrl : undefined,
    thumbnailUrl: makePoster("样片回传", "Demo video ready", 0),
  };
}
