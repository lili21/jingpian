"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import type { StoryboardResponse } from "@/lib/ai/schemas";

type BriefPreset = {
  id: string;
  label: string;
  value: string;
};

const briefPresets: BriefPreset[] = [
  {
    id: "launch",
    label: "新品上新",
    value:
      "为一款家用咖啡机做 20 秒上新短片，面向首次购买人群，目标是在前三秒明确卖点并建立品质感。",
  },
  {
    id: "promo",
    label: "活动预热",
    value:
      "为品牌周年活动做 15 秒预热视频，面向老客和潜在新客，目标是突出限时权益并提升活动页点击率。",
  },
  {
    id: "brand",
    label: "品牌故事",
    value:
      "为国货护肤品牌做 20 秒品牌故事视频，面向注重成分与口碑的用户，目标是传递真实可信的专业感。",
  },
];

const showcaseCases = [
  {
    title: "新品上新样片",
    brief: "20 秒新品发布，先确认第一镜头是否能立住卖点。",
    storyboard: ["开场问题镜头", "核心卖点展开", "用户场景演示", "收束行动指引"],
  },
  {
    title: "活动招商视频",
    brief: "活动期招商宣讲，先明确价值顺序和节奏。",
    storyboard: ["痛点切入", "活动机制说明", "资源位展示", "报名行动闭环"],
  },
  {
    title: "品牌叙事短片",
    brief: "品牌升级沟通，先对齐视觉气质与口播语气。",
    storyboard: ["品牌主张", "工艺或能力证明", "使用场景切片", "品牌记忆收束"],
  },
];

const loadingSteps = ["理解简报", "生成分镜", "跳转工作台"];

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
    <main className="landing-root">
      {isSubmitting && (
        <div className="landing-loading" role="status" aria-live="polite">
          <div className="landing-loading-panel">
            <div className="landing-loading-title-wrap">
              <LoaderCircle className="size-5 animate-spin" />
              <p className="landing-loading-title">正在准备你的分镜</p>
            </div>
            <div className="landing-loading-steps">
              {loadingSteps.map((step, index) => (
                <div key={step} className={`landing-loading-step ${index <= stepIndex ? "is-active" : ""}`}>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="landing-hero section-shell">
        <div className="page-shell">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="landing-hero-inner"
          >
            <p className="landing-brand">Jingpian</p>
            <h1 className="landing-title">先把结构说清楚，再让视频开拍。</h1>
            <p className="landing-subtitle">
              输入你的业务意图，立即生成可评审分镜，并自动进入工作台继续推进关键帧与视频任务。
            </p>

            <form onSubmit={handleSubmit} className="landing-composer">
              <textarea
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                placeholder="告诉 Jingpian 你的项目目标、受众与想要的风格，例如：我要为新品上新做 20 秒短片，前三秒要建立可信感。"
                className="landing-composer-input"
                minLength={12}
                required
              />
              <div className="landing-composer-foot">
                <p className="landing-composer-hint">至少输入 12 个字符，先生成分镜，再进入工作台。</p>
                <button type="submit" className="landing-submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  开始生成
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </form>

            <div className="landing-presets" aria-label="推荐输入">
              {briefPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  className="landing-preset-chip"
                  onClick={() => applyPreset(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-shell pt-6 md:pt-10">
        <div className="page-shell">
          <div className="landing-showcase-head">
            <h2 className="landing-showcase-title">三类常见项目的分镜结构示意</h2>
            <p className="landing-showcase-note">展示为静态案例，用于首访理解。实际生成以你的输入为准。</p>
          </div>

          <div className="landing-showcase-grid">
            {showcaseCases.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
                className="landing-showcase-card"
              >
                <p className="landing-showcase-kicker">Case 0{index + 1}</p>
                <h3 className="landing-showcase-card-title">{item.title}</h3>
                <p className="landing-showcase-brief">{item.brief}</p>
                <div className="landing-showcase-steps">
                  {item.storyboard.map((step) => (
                    <p key={step}>{step}</p>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>

          <div className="landing-end-cta">
            <Link href="/workspace" className="cta-secondary">
              直接进入工作台
            </Link>
            <Link href="/pricing" className="cta-secondary">
              查看套餐
            </Link>
            <Link href="/sign-in" className="cta-secondary">
              登录账号
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
