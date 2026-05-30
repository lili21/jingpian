"use client";

import Link from "next/link";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { useMemo, useState } from "react";
import { ArrowRight, Clapperboard, Film, LoaderCircle, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { StoryboardResponse } from "@/lib/ai/schemas";

type BriefPreset = {
  id: string;
  label: string;
  value: string;
};

const bodyFont = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const briefPresets: BriefPreset[] = [
  {
    id: "launch",
    label: "冷启上新",
    value:
      "我们要为一款新上市的厨房咖啡机制作 20 秒冷启动视频，目标受众是首次购买人群。请在前 3 秒先建立可信感，再用真实场景证明易用性，结尾给出明确下单动机。",
  },
  {
    id: "promo",
    label: "大促预热",
    value:
      "我们要做一支 15 秒大促预热短片，目标是拉回老客并吸引新客点击活动页。请突出时限权益和价格优势，镜头节奏要快，但信息层次要清晰。",
  },
  {
    id: "brand",
    label: "品牌升级",
    value:
      "我们正在做品牌升级传播，需要一支 20 秒品牌叙事视频，面向关注成分与口碑的人群。请通过专家背书、工艺细节和使用前后对比建立专业可信感。",
  },
];

const showcaseCases = [
  {
    title: "冷启动上新短片",
    brief: "目标是用一个镜头抓住注意力，再把卖点讲透。",
    storyboard: ["痛点钩子镜头", "核心卖点拆解", "真实场景验证", "转化动作收束"],
  },
  {
    title: "大促倒计时预热",
    brief: "目标是讲清权益强度，同时保持高节奏和记忆点。",
    storyboard: ["倒计时开场", "权益强度对比", "爆品场景穿插", "限时召回行动"],
  },
  {
    title: "品牌信任感叙事",
    brief: "目标是把抽象品牌价值变成可感知、可记住的画面。",
    storyboard: ["品牌主张定调", "专业能力背书", "用户结果呈现", "记忆锚点落版"],
  },
];

const loadingSteps = ["拆解业务目标", "编排镜头结构", "进入创作工作台"];

const faqItems = [
  {
    question: "Jingpian 和普通文生视频工具有什么区别？",
    answer:
      "普通工具更强调直接出片，Jingpian 更强调先把策略讲清。你会先得到可评审分镜，再推进关键帧和视频任务，让品牌、市场、内容团队在同一版本上对齐。",
  },
  {
    question: "我可以不生成视频，只做分镜评审吗？",
    answer:
      "可以。你可以只使用分镜和关键帧模块完成提案、评审与修改，等方向稳定后再提交视频任务，避免预算浪费在错误方向上。",
  },
  {
    question: "配置不足时还能正常演示流程吗？",
    answer:
      "可以。系统优先使用已配置供应商，在缺少线上配置时仍保留演示回退路径，便于你先跑通流程、确认协作方式，再接入正式生产环境。",
  },
];

async function createStoryboard(brief: string) {
  const response = await fetch("/api/storyboard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      brief,
      audience: "品牌市场与内容团队",
      scenario: "商业提案与投放评审",
      style: "专业、克制、可信",
      objective: "先评审结构，再进入样片制作",
      durationSeconds: 20,
      aspectRatio: "16:9",
    }),
  });

  const data = (await response.json()) as StoryboardResponse | { error?: string };

  if (!response.ok) {
    throw new Error((data as { error?: string }).error || "分镜生成失败");
  }

  return data as StoryboardResponse;
}

export default function Home() {
  const [brief, setBrief] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const canSubmit = useMemo(() => brief.trim().length >= 12, [brief]);

  function applyPreset(value: string) {
    setBrief(value);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setStepIndex(0);

    const timerA = window.setTimeout(() => setStepIndex(1), 500);
    const timerB = window.setTimeout(() => setStepIndex(2), 1300);

    try {
      await createStoryboard(brief.trim());
      window.location.href = "/workspace";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "分镜生成失败");
      toast.message("你也可以直接去工作台继续。", {
        action: {
          label: "打开工作台",
          onClick: () => {
            window.location.href = "/workspace";
          },
        },
      });
      setIsSubmitting(false);
      setStepIndex(0);
    } finally {
      window.clearTimeout(timerA);
      window.clearTimeout(timerB);
    }
  }

  return (
    <main className={`${bodyFont.className} relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="pointer-events-none absolute -top-44 -left-28 size-[520px] rounded-full bg-amber-500/16 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-120px] bottom-10 size-[520px] rounded-full bg-cyan-500/16 blur-[140px]" />

      {isSubmitting ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/75 backdrop-blur-md" role="status" aria-live="polite">
          <div className="grid w-[min(92vw,460px)] gap-4 rounded-3xl border border-white/15 bg-zinc-900/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center gap-2 text-zinc-100">
              <LoaderCircle className="size-5 animate-spin" />
              <p className="text-base font-semibold tracking-[-0.02em]">正在准备你的分镜</p>
            </div>
            <div className="grid gap-2">
              {loadingSteps.map((step, index) => (
                <div
                  key={step}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    index <= stepIndex
                      ? "border-amber-400/40 bg-amber-500/15 text-zinc-100"
                      : "border-white/10 bg-zinc-800/40 text-zinc-400"
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <header className="sticky top-4 z-40 px-4 pt-4 md:px-8">
        <nav className="mx-auto flex w-full max-w-[1180px] items-center justify-between rounded-full border border-white/10 bg-zinc-950/75 px-4 py-3 shadow-[0_10px_44px_rgba(0,0,0,0.42)] backdrop-blur-md md:px-6">
          <div className="inline-flex items-center gap-2.5">
            <div className="inline-flex size-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
              <Clapperboard className="size-4" />
            </div>
            <p className={`${displayFont.className} text-xs font-semibold tracking-[0.2em] text-zinc-100 uppercase`}>Jingpian</p>
          </div>
          <div className="hidden items-center gap-5 text-sm text-zinc-400 md:flex">
            <Link href="/workspace" className="hover:text-zinc-100">
              工作台
            </Link>
            <Link href="/pricing" className="hover:text-zinc-100">
              套餐
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/sign-in" className="rounded-full px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100">
              登录
            </Link>
            <Link
              href="/workspace"
              className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3.5 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
            >
              免费试做
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative z-10 px-4 pb-18 pt-12 md:px-8 md:pt-16">
        <div className="mx-auto w-full max-w-[1180px]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mx-auto grid max-w-[900px] gap-7 text-center"
          >
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[11px] font-semibold tracking-[0.18em] text-zinc-300 uppercase">
              <Sparkles className="size-3.5 text-amber-300" />
              Storyboard First Workflow
            </p>
            <h1 className={`${displayFont.className} text-balance text-[clamp(2.3rem,5vw,4.6rem)] leading-[0.95] font-semibold tracking-[-0.045em] text-zinc-50`}>
              先过分镜评审，
              <br className="hidden md:block" />
              再把每一秒预算花在对的镜头上。
            </h1>
            <p className="mx-auto max-w-[64ch] text-base leading-8 text-zinc-300 md:text-lg">
              Jingpian 把你的商业目标翻译成可讨论、可修改、可交付的镜头结构。
              在真正开拍之前，就把方向、节奏和卖点在团队内一次对齐。
            </p>

            <form
              onSubmit={handleSubmit}
              className="relative mx-auto grid w-full max-w-[860px] gap-4 rounded-[30px] border border-white/12 bg-zinc-900/70 p-4 text-left shadow-[0_18px_70px_rgba(0,0,0,0.42)] backdrop-blur-sm md:p-5"
            >
              <div className="pointer-events-none absolute top-4 left-4 size-4 border-t border-l border-zinc-500/70" />
              <div className="pointer-events-none absolute top-4 right-4 size-4 border-t border-r border-zinc-500/70" />
              <div className="pointer-events-none absolute bottom-4 left-4 size-4 border-b border-l border-zinc-500/70" />
              <div className="pointer-events-none absolute right-4 bottom-4 size-4 border-r border-b border-zinc-500/70" />

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
                <p className="inline-flex items-center gap-2 font-mono">
                  <span className="size-1.5 animate-pulse rounded-full bg-red-400" /> REC 1080P 24FPS
                </p>
                <p className="font-mono">TC 00:00:18:24</p>
              </div>

              <textarea
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                placeholder="请写下你的目标、受众、场景、风格和转化诉求。例如：我们为新品首发做 20 秒投放视频，受众是 25-35 岁一线城市女性，前 3 秒建立信任，中段展示差异化卖点，结尾引导点击领券。"
                className="min-h-[172px] w-full resize-none rounded-[20px] border border-white/12 bg-zinc-950/70 px-4 py-3 text-[15px] leading-7 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-amber-300/50"
                minLength={12}
                required
              />

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] tracking-[0.12em] text-zinc-400 uppercase">
                <p className="font-mono">Aspect 16:9 // Audio CH1 ▁▃▅▃</p>
                <p className="font-mono">System Ready // Workspace Secured</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-400">输入越具体，生成的分镜越可执行。建议至少包含目标、受众、场景与风格。</p>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  生成首版分镜
                  <ArrowRight className="size-4" />
                </button>
              </div>

              <div className="mt-1 flex flex-wrap gap-2.5" aria-label="推荐输入">
                {briefPresets.map((preset) => (
                  <button
                    type="button"
                    key={preset.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-800/65 px-4 py-2 text-sm text-zinc-200 hover:border-amber-300/30 hover:bg-zinc-800"
                    onClick={() => applyPreset(preset.value)}
                  >
                    <Film className="size-3.5 text-amber-300" />
                    {preset.label}
                  </button>
                ))}
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-4 pb-14 md:px-8 md:pb-18">
        <div className="mx-auto grid w-full max-w-[1180px] gap-6">
          <div className="grid gap-2 text-center">
            <h2 className={`${displayFont.className} text-2xl font-semibold tracking-[-0.035em] text-zinc-50 md:text-3xl`}>把创意灵感变成可落地的镜头脚本</h2>
            <p className="mx-auto text-sm text-zinc-400">以下是三种高频商业场景的结构示意。你输入业务简报后，会得到同样可评审、可迭代的镜头路径。</p>
          </div>

          <div className="grid gap-4 md:gap-5">
            {showcaseCases.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
                className="overflow-hidden rounded-[24px] border border-white/12 bg-zinc-900/70 p-5 shadow-[0_10px_36px_rgba(0,0,0,0.34)]"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2">
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-800/60 px-3 py-1 text-[11px] tracking-[0.16em] text-zinc-400 uppercase">
                      <Clapperboard className="size-3.5 text-amber-300" />
                      Case 0{index + 1}
                    </p>
                    <h3 className={`${displayFont.className} text-lg font-semibold tracking-[-0.02em] text-zinc-100 md:text-xl`}>{item.title}</h3>
                  </div>
                  <p className="text-sm text-zinc-400">{item.brief}</p>
                </div>

                <div className="mb-3 flex flex-wrap justify-between gap-1 opacity-55">
                  {Array.from({ length: 22 }).map((_, dotIndex) => (
                    <span key={`top-${item.title}-${dotIndex}`} className="h-2 w-1.5 rounded-[2px] bg-zinc-600/70" />
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  {item.storyboard.map((step, stepIndex) => (
                    <div
                      key={step}
                      className="rounded-2xl border border-zinc-700/70 bg-zinc-950/70 p-3.5 transition-colors hover:border-amber-300/40"
                    >
                      <p className="mb-1 font-mono text-[11px] tracking-[0.11em] text-amber-300 uppercase">Frame 0{stepIndex + 1}</p>
                      <p className="text-sm text-zinc-200">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap justify-between gap-1 opacity-55">
                  {Array.from({ length: 22 }).map((_, dotIndex) => (
                    <span key={`bottom-${item.title}-${dotIndex}`} className="h-2 w-1.5 rounded-[2px] bg-zinc-600/70" />
                  ))}
                </div>
              </motion.article>
            ))}
          </div>

          <section className="mt-4 grid gap-3 rounded-[24px] border border-white/12 bg-zinc-900/72 p-5 shadow-[0_10px_36px_rgba(0,0,0,0.34)] md:p-6">
            <div className="inline-flex items-center gap-2 text-zinc-200">
              <Sparkles className="size-4 text-amber-300" />
              <h3 className={`${displayFont.className} text-lg font-semibold tracking-[-0.02em]`}>你可能会关心的问题</h3>
            </div>
            <Accordion defaultValue={[faqItems[0].question]} className="w-full">
              {faqItems.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question} className="border-zinc-700/80">
                  <AccordionTrigger className="text-zinc-100 hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-zinc-400">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 pb-12">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
            >
              免费进入工作台
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-white/16 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
            >
              查看定价方案
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-white/16 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
            >
              登录继续创作
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
