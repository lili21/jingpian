"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Clapperboard, ImageIcon, LoaderCircle, RefreshCcw, Sparkles, Video } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type {
  ImageGenerationResponse,
  StoryboardResponse,
  VideoJobResponse,
} from "@/lib/ai/schemas";

type FormState = {
  brief: string;
  audience: string;
  scenario: string;
  style: string;
  objective: string;
  durationSeconds: number;
  aspectRatio: string;
};

const initialForm: FormState = {
  brief:
    "为一款新上市的厨房小家电做 20 秒商业样片，目标是在投放前让品牌和电商团队先确认镜头结构与卖点节奏。",
  audience: "品牌市场负责人 / 电商内容团队",
  scenario: "信息流投放 + 内部评审",
  style: "高级、克制、接近真实商业拍摄",
  objective: "先确认创意方向与镜头结构，再进入样片制作",
  durationSeconds: 20,
  aspectRatio: "16:9",
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "请求失败");
  }

  return data as T;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "轮询失败");
  }
  return data as T;
}

export function WorkspaceShell() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [storyboard, setStoryboard] = useState<StoryboardResponse | null>(null);
  const [images, setImages] = useState<ImageGenerationResponse | null>(null);
  const [videoJob, setVideoJob] = useState<VideoJobResponse | null>(null);
  const [activePanel, setActivePanel] = useState<"storyboard" | "images" | "video">("storyboard");
  const [loading, setLoading] = useState<null | "storyboard" | "images" | "video">(null);

  useEffect(() => {
    if (!videoJob || !["queued", "processing"].includes(videoJob.status)) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const next = await getJson<VideoJobResponse>(videoJob.pollingUrl);
        setVideoJob(next);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "视频轮询失败");
      }
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [videoJob]);

  const currentMode = useMemo(() => {
    return videoJob?.mode || images?.mode || storyboard?.mode || "demo";
  }, [images?.mode, storyboard?.mode, videoJob?.mode]);

  async function handleStoryboardSubmit() {
    setLoading("storyboard");
    try {
      const result = await postJson<StoryboardResponse>("/api/storyboard", form);
      setStoryboard(result);
      setImages(null);
      setVideoJob(null);
      setActivePanel("storyboard");
      toast.success(result.mode === "live" ? "已生成结构化分镜。" : "已生成演示分镜，可先验证流程。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "分镜生成失败");
    } finally {
      setLoading(null);
    }
  }

  async function handleGenerateImages() {
    if (!storyboard) {
      toast.error("请先生成分镜。");
      return;
    }

    setLoading("images");
    try {
      const result = await postJson<ImageGenerationResponse>("/api/images", {
        frames: storyboard.frames,
        style: form.style,
        aspectRatio: form.aspectRatio,
      });
      setImages(result);
      setActivePanel("images");
      toast.success(result.mode === "live" ? "关键帧已生成。" : "已生成演示关键帧。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "关键帧生成失败");
    } finally {
      setLoading(null);
    }
  }

  async function handleCreateVideo() {
    if (!storyboard) {
      toast.error("请先生成分镜。 ");
      return;
    }

    setLoading("video");
    try {
      const result = await postJson<VideoJobResponse>("/api/videos", {
        brief: form.brief,
        style: form.style,
        aspectRatio: form.aspectRatio,
        durationSeconds: Math.min(12, Math.max(6, Math.round(form.durationSeconds / 2))),
        frames: storyboard.frames,
      });
      setVideoJob(result);
      setActivePanel("video");
      toast.success(result.message || "视频任务已提交");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "视频任务提交失败");
    } finally {
      setLoading(null);
    }
  }

  const progressItems = [
    { label: "简报输入", done: true },
    { label: "分镜评审", done: Boolean(storyboard) },
    { label: "关键帧确认", done: Boolean(images) },
    { label: "视频任务", done: Boolean(videoJob) },
  ];

  return (
    <main className="section-shell">
      <div className="page-shell grid gap-8 xl:grid-cols-[0.95fr_1.2fr]">
        <div className="grid gap-5 self-start xl:sticky xl:top-8">
          <Card className="border-white/70 bg-white/90 shadow-[var(--shadow-card)]">
            <CardHeader className="gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-4" /> 返回首页
                </Link>
                <Badge variant="outline" className="rounded-full border-border/80 bg-white px-3 py-1 text-[11px] tracking-[0.16em] uppercase">
                  Workspace
                </Badge>
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl">Jingpian 工作台</CardTitle>
                <CardDescription className="mt-3 max-w-[56ch] text-sm leading-7 md:text-[15px]">
                  把 brief、分镜、关键帧和视频任务放在同一个评审界面里。先判断结构，再进入样片生产。
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-3">
                {progressItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-border/80 bg-secondary/45 px-4 py-3"
                  >
                    <span className="text-sm text-foreground">{item.label}</span>
                    <Badge
                      variant={item.done ? "default" : "outline"}
                      className="rounded-full px-2.5 py-1"
                    >
                      {item.done ? "已完成" : "待处理"}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="grid gap-3">
                <label className="grid gap-2 text-sm font-medium text-foreground">
                  项目简报
                  <Textarea
                    value={form.brief}
                    onChange={(event) => setForm((prev) => ({ ...prev, brief: event.target.value }))}
                    className="min-h-34 rounded-[18px] border-border/80 bg-white text-sm leading-7 shadow-none"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-foreground">
                  目标受众
                  <Input
                    value={form.audience}
                    onChange={(event) => setForm((prev) => ({ ...prev, audience: event.target.value }))}
                    className="h-11 rounded-[16px] border-border/80 bg-white shadow-none"
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    使用场景
                    <Input
                      value={form.scenario}
                      onChange={(event) => setForm((prev) => ({ ...prev, scenario: event.target.value }))}
                      className="h-11 rounded-[16px] border-border/80 bg-white shadow-none"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    风格要求
                    <Input
                      value={form.style}
                      onChange={(event) => setForm((prev) => ({ ...prev, style: event.target.value }))}
                      className="h-11 rounded-[16px] border-border/80 bg-white shadow-none"
                    />
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_120px_120px]">
                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    当前目标
                    <Input
                      value={form.objective}
                      onChange={(event) => setForm((prev) => ({ ...prev, objective: event.target.value }))}
                      className="h-11 rounded-[16px] border-border/80 bg-white shadow-none"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    时长
                    <Input
                      type="number"
                      min={6}
                      max={60}
                      value={form.durationSeconds}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          durationSeconds: Number(event.target.value) || 20,
                        }))
                      }
                      className="h-11 rounded-[16px] border-border/80 bg-white shadow-none"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    画幅
                    <select
                      value={form.aspectRatio}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, aspectRatio: event.target.value }))
                      }
                      className="h-11 rounded-[16px] border border-border/80 bg-white px-3 text-sm shadow-none outline-none"
                    >
                      <option value="16:9">16:9</option>
                      <option value="9:16">9:16</option>
                      <option value="1:1">1:1</option>
                    </select>
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="grid gap-3 border-t border-border/70 bg-secondary/35 md:grid-cols-3">
              <Button
                onClick={handleStoryboardSubmit}
                className="h-11 rounded-full"
                disabled={loading !== null}
              >
                {loading === "storyboard" ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                生成分镜
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateImages}
                className="h-11 rounded-full bg-white"
                disabled={loading !== null || !storyboard}
              >
                {loading === "images" ? <LoaderCircle className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
                生成关键帧
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateVideo}
                className="h-11 rounded-full bg-white"
                disabled={loading !== null || !storyboard}
              >
                {loading === "video" ? <LoaderCircle className="size-4 animate-spin" /> : <Video className="size-4" />}
                提交视频任务
              </Button>
            </CardFooter>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="grid gap-5"
        >
          <Card className="border-white/70 bg-white/90 shadow-[var(--shadow-card)]">
            <CardContent className="grid gap-5 py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">当前工作状态</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] md:text-[2.5rem]">
                    从业务简报到样片任务的一条线视图
                  </h1>
                </div>
                <Badge className="rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em]">
                  {currentMode === "live" ? "live mode" : "demo mode"}
                </Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setActivePanel("storyboard")}
                  className={`rounded-[20px] border px-4 py-4 text-left ${activePanel === "storyboard" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary/35"}`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clapperboard className="size-4" /> 分镜
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${activePanel === "storyboard" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    结构、口播、评审备注
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel("images")}
                  className={`rounded-[20px] border px-4 py-4 text-left ${activePanel === "images" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary/35"}`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="size-4" /> 关键帧
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${activePanel === "images" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    用图像验证气质与镜头方向
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel("video")}
                  className={`rounded-[20px] border px-4 py-4 text-left ${activePanel === "video" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary/35"}`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Video className="size-4" /> 视频任务
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${activePanel === "video" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    异步提交、轮询状态、等待回传
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>

          {activePanel === "storyboard" && (
            <Card className="border-white/70 bg-white/90 shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle>分镜输出</CardTitle>
                <CardDescription>
                  {storyboard
                    ? `${storyboard.provider} · ${storyboard.model}`
                    : "先生成结构化分镜，工作台会把口播、镜头和评审备注放在同一层。"}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                {!storyboard ? (
                  <div className="rounded-[24px] border border-dashed border-border bg-secondary/30 px-6 py-10 text-sm leading-7 text-muted-foreground">
                    还没有生成分镜。建议先从一个真实 brief 开始，例如新品上新、招商活动、投放前方向验证。
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 rounded-[24px] border border-border/80 bg-secondary/35 p-5 md:grid-cols-[1.2fr_0.8fr]">
                      <div>
                        <p className="text-sm font-medium text-foreground">简报摘要</p>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{storyboard.briefSummary}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">创意方向</p>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{storyboard.creativeDirection}</p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      {storyboard.frames.map((frame, index) => (
                        <motion.div
                          key={frame.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22, delay: index * 0.04 }}
                          className="rounded-[26px] border border-border/80 bg-white p-5 shadow-[var(--shadow-soft)]"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="outline" className="rounded-full px-2.5 py-1">{frame.id}</Badge>
                            <h3 className="text-xl font-semibold tracking-[-0.03em]">{frame.title}</h3>
                            <span className="text-sm text-muted-foreground">{frame.durationSeconds}s · {frame.shotType}</span>
                          </div>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="grid gap-3 text-sm leading-7 text-muted-foreground">
                              <p><span className="font-medium text-foreground">镜头目标：</span>{frame.goal}</p>
                              <p><span className="font-medium text-foreground">画面描述：</span>{frame.visualPrompt}</p>
                              <p><span className="font-medium text-foreground">口播：</span>{frame.voiceover}</p>
                            </div>
                            <div className="grid gap-3 text-sm leading-7 text-muted-foreground">
                              <p><span className="font-medium text-foreground">屏幕文案：</span>{frame.onScreenText}</p>
                              <p><span className="font-medium text-foreground">转场：</span>{frame.transition}</p>
                              <p><span className="font-medium text-foreground">评审备注：</span>{frame.notes}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <Separator />
                    <div className="grid gap-3 text-sm leading-7 text-muted-foreground">
                      <p className="font-medium text-foreground">评审建议</p>
                      <ul className="grid gap-2">
                        {storyboard.reviewGuidance.map((item) => (
                          <li key={item} className="rounded-2xl border border-border/70 bg-secondary/30 px-4 py-3">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {activePanel === "images" && (
            <Card className="border-white/70 bg-white/90 shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle>关键帧预览</CardTitle>
                <CardDescription>
                  {images
                    ? `${images.provider} · ${images.model}`
                    : "关键帧用于在出片前验证画面方向。未接入真实 Key 时会返回高保真演示图。"}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                {!images ? (
                  <div className="rounded-[24px] border border-dashed border-border bg-secondary/30 px-6 py-10 text-sm leading-7 text-muted-foreground">
                    还没有关键帧。你可以先生成分镜，再调用图像生成路径确认每一帧的视觉气质。
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {images.images.map((image) => (
                      <div key={image.id} className="overflow-hidden rounded-[26px] border border-border/80 bg-card shadow-[var(--shadow-soft)]">
                        <Image
                          src={image.url}
                          alt={image.title}
                          width={1200}
                          height={750}
                          unoptimized
                          className="aspect-[16/10] h-auto w-full object-cover"
                        />
                        <div className="grid gap-2 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold tracking-[-0.03em]">{image.title}</h3>
                            <Badge variant={image.source === "live" ? "default" : "outline"} className="rounded-full px-2.5 py-1">
                              {image.source}
                            </Badge>
                          </div>
                          <p className="text-sm leading-7 text-muted-foreground">{image.prompt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activePanel === "video" && (
            <Card className="border-white/70 bg-white/90 shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle>视频任务状态</CardTitle>
                <CardDescription>
                  {videoJob
                    ? `${videoJob.provider} · ${videoJob.model}`
                    : "提交后会返回 job id 与轮询状态，适合放进可交付的项目流程。"}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                {!videoJob ? (
                  <div className="rounded-[24px] border border-dashed border-border bg-secondary/30 px-6 py-10 text-sm leading-7 text-muted-foreground">
                    还没有视频任务。建议在分镜和关键帧确认后再提交视频生成，避免把问题留到最后一步。
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 rounded-[24px] border border-border/80 bg-secondary/35 p-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div className="grid gap-2">
                        <p className="text-sm font-medium text-foreground">Job ID</p>
                        <p className="font-mono text-sm text-muted-foreground">{videoJob.jobId}</p>
                        <p className="text-sm leading-7 text-muted-foreground">{videoJob.message}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em]">
                          {videoJob.status}
                        </Badge>
                        {videoJob.status !== "completed" && (
                          <Button
                            variant="outline"
                            className="rounded-full bg-white"
                            onClick={async () => {
                              const next = await getJson<VideoJobResponse>(videoJob.pollingUrl);
                              setVideoJob(next);
                            }}
                          >
                            <RefreshCcw className="size-4" /> 立即刷新
                          </Button>
                        )}
                      </div>
                    </div>

                    {videoJob.videoUrl ? (
                      <div className="overflow-hidden rounded-[26px] border border-border/80 bg-card shadow-[var(--shadow-soft)]">
                        <video
                          className="aspect-video w-full bg-black/10 object-cover"
                          controls
                          playsInline
                          poster={videoJob.thumbnailUrl}
                          src={videoJob.videoUrl}
                        />
                        <div className="grid gap-2 p-4 text-sm leading-7 text-muted-foreground">
                          <p>
                            当前界面已经具备异步任务和状态轮询结构。后续接入真实模型后，可以继续补“版本复核”、“导出交付单”和“投放建议”。
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-[24px] border border-border/80 bg-white p-6 text-sm leading-7 text-muted-foreground">
                        视频还未回传。工作台会继续轮询状态，一旦完成就会在这里显示预览。
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </main>
  );
}
