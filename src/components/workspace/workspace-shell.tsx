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
import type { SubscriptionState } from "@/lib/billing/subscription";

type WorkspaceShellProps = {
  subscription: SubscriptionState;
};

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
    "Create a 20-second commercial sample for a newly launched kitchen appliance. Goal: align scene structure and value pacing with brand and e-commerce teams before media spend.",
  audience: "Brand marketing leads / e-commerce content team",
  scenario: "Paid social distribution + internal review",
  style: "Premium, restrained, close to real commercial shooting",
  objective: "Validate creative direction and scene structure before production",
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
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Polling failed");
  }
  return data as T;
}

export function WorkspaceShell({ subscription }: WorkspaceShellProps) {
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
        toast.error(error instanceof Error ? error.message : "Video polling failed");
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
      toast.success(result.mode === "live" ? "Structured storyboard generated." : "Demo storyboard generated for workflow validation.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Storyboard generation failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleGenerateImages() {
    if (!storyboard) {
      toast.error("Generate a storyboard first.");
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
      toast.success(result.mode === "live" ? "Keyframes generated." : "Demo keyframes generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Keyframe generation failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleCreateVideo() {
    if (!storyboard) {
      toast.error("Generate a storyboard first.");
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
      toast.success(result.message || "Video job submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Video job submission failed");
    } finally {
      setLoading(null);
    }
  }

  const progressItems = [
    { label: "Brief Input", done: true },
    { label: "Storyboard Review", done: Boolean(storyboard) },
    { label: "Keyframe Validation", done: Boolean(images) },
    { label: "Video Job", done: Boolean(videoJob) },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="pointer-events-none absolute -top-44 -left-28 size-[520px] rounded-full bg-amber-500/16 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-120px] bottom-10 size-[520px] rounded-full bg-cyan-500/16 blur-[140px]" />
      <div className="page-shell relative z-10 grid gap-8 py-16 xl:grid-cols-[0.95fr_1.2fr]">
        <div className="grid gap-5 self-start xl:sticky xl:top-8">
          <Card className="rounded-[28px] border border-white/12 bg-zinc-900/72 text-zinc-100 shadow-[0_18px_70px_rgba(0,0,0,0.42)]">
            <CardHeader className="gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100">
                  <ArrowLeft className="size-4" /> Back Home
                </Link>
                <Badge variant="outline" className="rounded-full border-white/20 bg-zinc-900 px-3 py-1 text-[11px] tracking-[0.16em] uppercase text-zinc-200">
                  Workspace
                </Badge>
                <Badge variant={subscription.isPremium ? "default" : "outline"} className="rounded-full px-3 py-1 text-[11px] tracking-[0.16em] uppercase">
                  {subscription.plan}
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] tracking-[0.16em] uppercase">
                  {subscription.source}
                </Badge>
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl">Jingpian Workspace</CardTitle>
                 <CardDescription className="mt-3 max-w-[56ch] text-sm leading-7 text-zinc-300 md:text-[15px]">
                  Keep brief input, storyboard review, keyframes, and video jobs in one operational view. Align structure first, then produce.
                </CardDescription>
                {!subscription.isPremium && (
                  <CardDescription className="mt-2 text-sm leading-7">
                    You are currently on Free. Upgrade to unlock higher limits and team workflows.
                    <Link href="/pricing" className="ml-1 underline-offset-4 hover:underline">View Pricing</Link>
                  </CardDescription>
                )}
                {subscription.source === "fallback" && (
                  <CardDescription className="mt-2 text-sm leading-7">
                    Subscription status is shown in fallback mode until Stripe persistence is connected.
                  </CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-3">
                {progressItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-white/12 bg-zinc-800/45 px-4 py-3"
                  >
                    <span className="text-sm text-zinc-100">{item.label}</span>
                    <Badge
                      variant={item.done ? "default" : "outline"}
                      className="rounded-full px-2.5 py-1"
                    >
                      {item.done ? "Done" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="grid gap-3">
                <label className="grid gap-2 text-sm font-medium text-zinc-100">
                  Project Brief
                  <Textarea
                    value={form.brief}
                    onChange={(event) => setForm((prev) => ({ ...prev, brief: event.target.value }))}
                    className="min-h-34 rounded-[18px] border-white/15 bg-zinc-950/70 text-sm leading-7 text-zinc-100 shadow-none"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-zinc-100">
                  Audience
                  <Input
                    value={form.audience}
                    onChange={(event) => setForm((prev) => ({ ...prev, audience: event.target.value }))}
                    className="h-11 rounded-[16px] border-white/15 bg-zinc-950/70 text-zinc-100 shadow-none"
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-zinc-100">
                    Scenario
                    <Input
                      value={form.scenario}
                      onChange={(event) => setForm((prev) => ({ ...prev, scenario: event.target.value }))}
                      className="h-11 rounded-[16px] border-white/15 bg-zinc-950/70 text-zinc-100 shadow-none"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-zinc-100">
                    Style
                    <Input
                      value={form.style}
                      onChange={(event) => setForm((prev) => ({ ...prev, style: event.target.value }))}
                      className="h-11 rounded-[16px] border-white/15 bg-zinc-950/70 text-zinc-100 shadow-none"
                    />
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_120px_120px]">
                  <label className="grid gap-2 text-sm font-medium text-zinc-100">
                    Objective
                    <Input
                      value={form.objective}
                      onChange={(event) => setForm((prev) => ({ ...prev, objective: event.target.value }))}
                      className="h-11 rounded-[16px] border-white/15 bg-zinc-950/70 text-zinc-100 shadow-none"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-zinc-100">
                    Duration
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
                      className="h-11 rounded-[16px] border-white/15 bg-zinc-950/70 text-zinc-100 shadow-none"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-zinc-100">
                    Aspect Ratio
                    <select
                      value={form.aspectRatio}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, aspectRatio: event.target.value }))
                      }
                      className="h-11 rounded-[16px] border border-white/15 bg-zinc-950/70 px-3 text-sm text-zinc-100 shadow-none outline-none"
                    >
                      <option value="16:9">16:9</option>
                      <option value="9:16">9:16</option>
                      <option value="1:1">1:1</option>
                    </select>
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="grid gap-3 border-t border-white/10 bg-zinc-950/45 md:grid-cols-3">
              <Button
                onClick={handleStoryboardSubmit}
                className="h-11 rounded-full bg-amber-400 text-zinc-950 hover:bg-amber-300"
                disabled={loading !== null}
              >
                {loading === "storyboard" ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Generate Storyboard
              </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerateImages}
                  className="h-11 rounded-full border-white/20 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                  disabled={loading !== null || !storyboard}
                >
                {loading === "images" ? <LoaderCircle className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
                Generate Keyframes
              </Button>
                <Button
                  variant="outline"
                  onClick={handleCreateVideo}
                  className="h-11 rounded-full border-white/20 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                  disabled={loading !== null || !storyboard}
                >
                {loading === "video" ? <LoaderCircle className="size-4 animate-spin" /> : <Video className="size-4" />}
                Submit Video Job
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
          <Card className="rounded-[28px] border border-white/12 bg-zinc-900/72 text-zinc-100 shadow-[0_18px_70px_rgba(0,0,0,0.42)]">
            <CardContent className="grid gap-5 py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-400">Current Workflow Status</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] md:text-[2.5rem]">
                    One continuous view from brief to video job
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
                    className={`rounded-[20px] border px-4 py-4 text-left ${activePanel === "storyboard" ? "border-amber-400/50 bg-amber-500/20 text-zinc-100" : "border-white/12 bg-zinc-800/45"}`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clapperboard className="size-4" /> Storyboard
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${activePanel === "storyboard" ? "text-zinc-200" : "text-zinc-400"}`}>
                    Structure, narration, and review notes
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel("images")}
                    className={`rounded-[20px] border px-4 py-4 text-left ${activePanel === "images" ? "border-amber-400/50 bg-amber-500/20 text-zinc-100" : "border-white/12 bg-zinc-800/45"}`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="size-4" /> Keyframes
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${activePanel === "images" ? "text-zinc-200" : "text-zinc-400"}`}>
                    Validate look, tone, and direction
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel("video")}
                    className={`rounded-[20px] border px-4 py-4 text-left ${activePanel === "video" ? "border-amber-400/50 bg-amber-500/20 text-zinc-100" : "border-white/12 bg-zinc-800/45"}`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Video className="size-4" /> Video Job
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${activePanel === "video" ? "text-zinc-200" : "text-zinc-400"}`}>
                    Async submission, polling, and delivery
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>

          {activePanel === "storyboard" && (
            <Card className="rounded-[28px] border border-white/12 bg-zinc-900/72 text-zinc-100 shadow-[0_18px_70px_rgba(0,0,0,0.42)]">
              <CardHeader>
                <CardTitle>Storyboard Output</CardTitle>
                <CardDescription>
                  {storyboard
                    ? `${storyboard.provider} · ${storyboard.model}`
                    : "Generate a structured storyboard first. Narration, shots, and review notes stay in one layer."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                {!storyboard ? (
                   <div className="rounded-[24px] border border-dashed border-white/16 bg-zinc-800/40 px-6 py-10 text-sm leading-7 text-zinc-400">
                    No storyboard yet. Start with a real brief to validate direction before production.
                  </div>
                ) : (
                  <>
                     <div className="grid gap-4 rounded-[24px] border border-white/12 bg-zinc-800/45 p-5 md:grid-cols-[1.2fr_0.8fr]">
                      <div>
                         <p className="text-sm font-medium text-zinc-100">Brief Summary</p>
                         <p className="mt-3 text-sm leading-7 text-zinc-300">{storyboard.briefSummary}</p>
                      </div>
                      <div>
                         <p className="text-sm font-medium text-zinc-100">Creative Direction</p>
                         <p className="mt-3 text-sm leading-7 text-zinc-300">{storyboard.creativeDirection}</p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      {storyboard.frames.map((frame, index) => (
                        <motion.div
                          key={frame.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22, delay: index * 0.04 }}
                           className="rounded-[26px] border border-white/12 bg-zinc-950/70 p-5"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="outline" className="rounded-full px-2.5 py-1">{frame.id}</Badge>
                           <h3 className="text-xl font-semibold tracking-[-0.03em]">{frame.title}</h3>
                             <span className="text-sm text-zinc-400">{frame.durationSeconds}s · {frame.shotType}</span>
                          </div>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                             <div className="grid gap-3 text-sm leading-7 text-zinc-300">
                               <p><span className="font-medium text-zinc-100">Shot Goal:</span> {frame.goal}</p>
                               <p><span className="font-medium text-zinc-100">Visual Prompt:</span> {frame.visualPrompt}</p>
                               <p><span className="font-medium text-zinc-100">Voiceover:</span> {frame.voiceover}</p>
                              </div>
                              <div className="grid gap-3 text-sm leading-7 text-zinc-300">
                               <p><span className="font-medium text-zinc-100">On-screen Text:</span> {frame.onScreenText}</p>
                               <p><span className="font-medium text-zinc-100">Transition:</span> {frame.transition}</p>
                               <p><span className="font-medium text-zinc-100">Review Notes:</span> {frame.notes}</p>
                              </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <Separator />
                     <div className="grid gap-3 text-sm leading-7 text-zinc-300">
                       <p className="font-medium text-zinc-100">Review Guidance</p>
                       <ul className="grid gap-2">
                        {storyboard.reviewGuidance.map((item) => (
                           <li key={item} className="rounded-2xl border border-white/12 bg-zinc-800/40 px-4 py-3">
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
             <Card className="rounded-[28px] border border-white/12 bg-zinc-900/72 text-zinc-100 shadow-[0_18px_70px_rgba(0,0,0,0.42)]">
              <CardHeader>
                <CardTitle>Keyframe Preview</CardTitle>
                <CardDescription>
                  {images
                    ? `${images.provider} · ${images.model}`
                    : "Keyframes validate visual direction before video generation. Demo images are returned if live keys are not connected."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                {!images ? (
                   <div className="rounded-[24px] border border-dashed border-white/16 bg-zinc-800/40 px-6 py-10 text-sm leading-7 text-zinc-400">
                    No keyframes yet. Generate a storyboard first, then validate each scene visually.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {images.images.map((image) => (
                       <div key={image.id} className="overflow-hidden rounded-[26px] border border-white/12 bg-zinc-950/70">
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
                           <p className="text-sm leading-7 text-zinc-300">{image.prompt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activePanel === "video" && (
             <Card className="rounded-[28px] border border-white/12 bg-zinc-900/72 text-zinc-100 shadow-[0_18px_70px_rgba(0,0,0,0.42)]">
              <CardHeader>
                <CardTitle>Video Job Status</CardTitle>
                <CardDescription>
                  {videoJob
                    ? `${videoJob.provider} · ${videoJob.model}`
                    : "Submission returns a job id and polling status for production-ready workflow tracking."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                {!videoJob ? (
                   <div className="rounded-[24px] border border-dashed border-white/16 bg-zinc-800/40 px-6 py-10 text-sm leading-7 text-zinc-400">
                    No video job yet. Submit after storyboard and keyframes are validated to reduce rework.
                  </div>
                ) : (
                  <>
                     <div className="grid gap-4 rounded-[24px] border border-white/12 bg-zinc-800/45 p-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div className="grid gap-2">
                         <p className="text-sm font-medium text-zinc-100">Job ID</p>
                         <p className="font-mono text-sm text-zinc-400">{videoJob.jobId}</p>
                         <p className="text-sm leading-7 text-zinc-300">{videoJob.message}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em]">
                          {videoJob.status}
                        </Badge>
                        {videoJob.status !== "completed" && (
                          <Button
                            variant="outline"
                           className="rounded-full border-white/20 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                            onClick={async () => {
                              const next = await getJson<VideoJobResponse>(videoJob.pollingUrl);
                              setVideoJob(next);
                            }}
                          >
                            <RefreshCcw className="size-4" /> Refresh Now
                          </Button>
                        )}
                      </div>
                    </div>

                    {videoJob.videoUrl ? (
                       <div className="overflow-hidden rounded-[26px] border border-white/12 bg-zinc-950/70">
                        <video
                          className="aspect-video w-full bg-black/10 object-cover"
                          controls
                          playsInline
                          poster={videoJob.thumbnailUrl}
                          src={videoJob.videoUrl}
                        />
                        <div className="grid gap-2 p-4 text-sm leading-7 text-zinc-300">
                          <p>
                            This workspace already supports async jobs and polling. Next upgrades can add version review, export packs, and distribution recommendations.
                          </p>
                        </div>
                      </div>
                    ) : (
                       <div className="rounded-[24px] border border-white/12 bg-zinc-950/70 p-6 text-sm leading-7 text-zinc-300">
                        Video is not returned yet. The workspace will continue polling and show preview once completed.
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
