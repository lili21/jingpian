import Link from "next/link";
import * as motion from "motion/react-client";
import { ArrowRight, BadgeCheck, FolderKanban, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";

import { getSubscriptionState } from "@/lib/billing/subscription";

const workflow = [
  {
    title: "先收业务简报",
    body: "不是先让模型随便出结果，而是先确认渠道、卖点、时长限制与项目窗口期。",
  },
  {
    title: "再做分镜评审",
    body: "把镜头意图、口播、节奏与风险备注整理成一张可评审的结构板。",
  },
  {
    title: "关键帧验证方向",
    body: "通过图像先看画面气质和版本差异，再决定是不是值得进入样片生产。",
  },
  {
    title: "最后提交视频任务",
    body: "把任务状态、轮询和交付边界都纳入工作台，不把风险留到最后一秒。",
  },
];

const scenarios = [
  {
    title: "新品上新样片",
    body: "适合需要在拍摄或投放前先确认卖点顺序、开场节奏与视觉基调的团队。",
  },
  {
    title: "平台招商/活动页视频",
    body: "适合要和市场、运营、管理层一起做快速方向判断的项目。",
  },
  {
    title: "代理协作提案",
    body: "适合创意供应商先交付可评审材料，而不是一上来就给成片赌方向。",
  },
];

const artifacts = [
  "分镜评审板：镜头目标、口播、字幕、转场、备注同屏",
  "关键帧预览：先看画面方向，再决定是否进入视频任务",
  "任务状态：支持异步提交、轮询回传与交付说明",
];

const faq = [
  {
    q: "为什么不把视频生成器直接放在首页？",
    a: "因为 Jingpian 不是一个“看模型能力”的玩具页。首页先负责解释价值、工作方式和交付边界，真正的生成操作放到工作台里，页面会更像产品而不是 AI demo。",
  },
  {
    q: "如果没有 API Key，还能演示吗？",
    a: "可以。工作台内置了 demo fallback：没有接入真实 OpenRouter / 兼容 provider 时，会返回结构化演示分镜、演示关键帧和模拟视频轮询状态，方便先走通业务流程。",
  },
  {
    q: "接入真实模型后支持哪些路径？",
    a: "当前实现支持：AI SDK + OpenAI-compatible provider 做分镜结构化生成，OpenRouter Responses 做图像生成，OpenRouter Videos 做异步视频任务与轮询。模型 ID 全部可配置。",
  },
];

export default async function Home() {
  const subscription = await getSubscriptionState();
  const pricingLabel = subscription.isPremium ? "管理订阅" : "升级 Premium";

  return (
    <main>
      <section className="section-shell pb-10 md:pb-16">
        <div className="page-shell">
          <div className="surface-panel overflow-hidden px-5 py-5 md:px-7 md:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold tracking-[-0.02em]">
                  Jingpian
                </span>
                <span className="text-sm text-muted-foreground">先出分镜，再出视频</span>
              </div>
              <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <a href="#workflow" className="hover:text-foreground">工作方式</a>
                <a href="#artifact" className="hover:text-foreground">交付证明</a>
                <a href="#scenarios" className="hover:text-foreground">适用场景</a>
                <a href="#faq" className="hover:text-foreground">FAQ</a>
                <Link href="/pricing" className="hover:text-foreground">
                  {pricingLabel}
                </Link>
                <Link href="/sign-in" className="hover:text-foreground">
                  登录
                </Link>
                <Link href="/workspace" className="cta-link">
                  打开工作台
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-24">
        <div className="page-shell grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="grid gap-6"
          >
            <div>
              <span className="eyebrow">中国 B2B 短视频团队的结构化出片流程</span>
              <h1 className="section-title max-w-[12ch]">
                先判断结构，
                <br />
                再投入出片。
              </h1>
              <p className="section-subtitle max-w-[64ch]">
                Jingpian 把业务简报、分镜评审、关键帧验证和视频任务放到同一条工作流里。它更像一个面向品牌方、商家与内容团队的“出片判断系统”，而不是一个只会展示模型能力的 AI 页面。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/workspace" className="cta-link">
                立即体验工作台 <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link href="/sign-up" className="cta-secondary">
                注册账号
              </Link>
              <Link href="/pricing" className="cta-secondary">
                {pricingLabel}
              </Link>
              <a href="#artifact" className="cta-secondary">
                看交付结构
              </a>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="metric-chip">面向品牌 / 商家 / 内容负责人</span>
              <span className="metric-chip">支持 gpt-image-2 路径</span>
              <span className="metric-chip">支持 Seedance 2.0 视频任务配置</span>
              <span className="metric-chip">
                {subscription.isSignedIn
                  ? `当前计划：${subscription.plan}`
                  : "未登录：默认 Free 计划"}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
            className="surface-panel overflow-hidden"
          >
            <div className="grid gap-6 p-5 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">交付视图示意</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">一张看得懂的项目判断板</h2>
                </div>
                <span className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Workspace Preview
                </span>
              </div>

              <div className="grid gap-4 rounded-[26px] border border-border/80 bg-secondary/35 p-4 md:grid-cols-[0.92fr_1.08fr]">
                <div className="grid gap-3 rounded-[22px] border border-white/70 bg-white p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Brief 摘要</span>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">v1.2</span>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    新品上新前，先判断 20 秒结构是否足够支持品牌与电商双线团队共同过审。
                  </p>
                  <div className="fine-rule" />
                  <div className="grid gap-2 text-sm text-muted-foreground">
                    <p>• 渠道：信息流 / 活动页</p>
                    <p>• 风格：高级、真实、稳定</p>
                    <p>• 重点：先确认第一屏卖点与节奏</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {["开场问题", "分镜评审", "关键帧验证", "视频任务"].map((label, index) => (
                    <div
                      key={label}
                      className="grid gap-2 rounded-[22px] border border-white/70 bg-white p-4 shadow-[var(--shadow-soft)] md:grid-cols-[90px_1fr]"
                    >
                      <div className="text-sm font-semibold text-primary">0{index + 1}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {index === 0 && "先澄清业务问题，而不是直接让模型出片。"}
                          {index === 1 && "镜头、口播、转场与备注同屏，便于多人评审。"}
                          {index === 2 && "先看画面方向，再决定是不是要往下做视频。"}
                          {index === 3 && "提交后自动轮询任务状态，回传样片链接。"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="workflow" className="section-shell bg-white/50">
        <div className="page-shell grid gap-8">
          <div>
            <span className="eyebrow">工作方式</span>
            <h2 className="section-title max-w-[11ch]">把 AI 结果变成团队可以决策的流程</h2>
            <p className="section-subtitle max-w-[66ch]">
              首页不直接堆一个生成器，而是先把为什么这样工作讲清楚：对于中国 B2B 团队，最贵的不是一次调用，而是方向跑偏后整轮返工。
            </p>
          </div>
          <div className="data-grid">
            {workflow.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
                className="surface-panel p-5 md:p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    step 0{index + 1}
                  </span>
                  <Sparkles className="size-4 text-accent-foreground/70" />
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.03em]">{item.title}</h3>
                <p className="prose-copy mt-4">{item.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="artifact" className="section-shell">
        <div className="page-shell grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div>
            <span className="eyebrow">交付证明</span>
            <h2 className="section-title max-w-[12ch]">不是“给你一个视频”，而是给你可评审的过程</h2>
            <p className="section-subtitle max-w-[58ch]">
              对采购方、项目 owner 和内容负责人来说，最重要的是交付是不是可判断、可追溯、可复核。Jingpian 的价值来自这条证据链，而不是一条炫技 prompt。
            </p>
            <div className="mt-6 grid gap-3">
              {artifacts.map((item) => (
                <div key={item} className="surface-soft px-4 py-4 text-sm leading-7 text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="surface-panel overflow-hidden p-5 md:p-6">
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">交付文档示意</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">分镜评审板 v1.3</h3>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  for review
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                <div className="grid gap-3 rounded-[24px] border border-border/80 bg-secondary/35 p-4">
                  <div className="rounded-[20px] bg-white p-4 shadow-[var(--shadow-soft)]">
                    <p className="text-sm font-medium">Brief 摘要</p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      目标是为新品首发做 20 秒商业样片，先做方向评审，再决定最终画面方案。
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-white p-4 shadow-[var(--shadow-soft)]">
                    <p className="text-sm font-medium">风险备注</p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      避免把卖点压得太满；第一镜头必须在 3 秒内说明“为什么值得看”。
                    </p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {["镜头 01｜问题开场", "镜头 02｜分镜评审", "镜头 03｜关键帧对比", "镜头 04｜任务提交"].map((item, index) => (
                    <div key={item} className="rounded-[22px] border border-border/80 bg-white px-4 py-4 shadow-[var(--shadow-soft)]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{item}</p>
                        <span className="text-xs text-muted-foreground">0{index + 1}</span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {index === 0 && "用一句商业问题把决策者带进场景。"}
                        {index === 1 && "把画面、口播、文案和风险备注整理成同一层。"}
                        {index === 2 && "先对比 A/B 方向，再做样片投入。"}
                        {index === 3 && "提交后可持续查看状态和回传结果。"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="scenarios" className="section-shell bg-white/50">
        <div className="page-shell grid gap-8">
          <div>
            <span className="eyebrow">适用场景</span>
            <h2 className="section-title max-w-[10ch]">更适合需要先过审、再出片的团队</h2>
          </div>
          <div className="data-grid">
            {scenarios.map((item) => (
              <article key={item.title} className="surface-panel p-5 md:p-6">
                <div className="flex items-center gap-3 text-primary">
                  {item.title.includes("新品") && <PlayCircle className="size-5" />}
                  {item.title.includes("活动") && <FolderKanban className="size-5" />}
                  {item.title.includes("代理") && <ShieldCheck className="size-5" />}
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-foreground">{item.title}</h3>
                </div>
                <p className="prose-copy mt-4">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="page-shell grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <span className="eyebrow">为什么更像产品，而不是 AI demo</span>
            <h2 className="section-title max-w-[11ch]">把模型放在流程里面，而不是放在舞台中央</h2>
            <p className="section-subtitle max-w-[56ch]">
              工作台里的 AI 能力确实重要：分镜可以用 AI SDK 结构化生成，关键帧可以走 OpenRouter image generation，视频任务可以走 OpenRouter videos。但这些能力都被放到了“项目推进”里，而不是把页面做成一个只会展示魔法的演示页。
            </p>
          </div>
          <div className="grid gap-4">
            {[
              {
                icon: BadgeCheck,
                title: "决策前置",
                body: "先确定结构和镜头，再进入样片任务，避免团队在成片阶段才发现方向不对。",
              },
              {
                icon: ShieldCheck,
                title: "可采购感更强",
                body: "页面强调交付和边界：什么可以看、什么可以审、什么时候提交视频任务。",
              },
              {
                icon: FolderKanban,
                title: "更适合真实项目",
                body: "工作台保留了 demo fallback，既能对外演示，也能在拿到真实 key 后直接接入真实调用。",
              },
            ].map((item) => (
              <div key={item.title} className="surface-soft px-5 py-5">
                <div className="flex items-center gap-3">
                  <item.icon className="size-5 text-primary" />
                  <h3 className="text-lg font-semibold tracking-[-0.03em]">{item.title}</h3>
                </div>
                <p className="prose-copy mt-3">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-shell bg-white/50">
        <div className="page-shell grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="section-title max-w-[8ch]">上线前你最可能关心的三件事</h2>
          </div>
          <div className="grid gap-4">
            {faq.map((item) => (
              <details key={item.q} className="surface-panel px-5 py-4">
                <summary className="cursor-pointer list-none text-lg font-semibold tracking-[-0.03em]">
                  {item.q}
                </summary>
                <p className="prose-copy mt-4">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-24 md:pb-28">
        <div className="page-shell">
          <div className="surface-panel overflow-hidden px-6 py-8 md:px-10 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <span className="eyebrow">Ready to review before you render</span>
                <h2 className="section-title max-w-[12ch]">把首页当成产品说明，把工作台当成真正的执行界面</h2>
                <p className="section-subtitle max-w-[56ch]">
                  现在这个版本已经具备了 Next.js + Tailwind + shadcn/ui + Motion 的产品化骨架，也接上了分镜、图像、视频三条 AI 路径。下一步可以直接继续做本地验收、推到 GitHub，或者接着部署到 Vercel。
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link href="/workspace" className="cta-link">
                  打开工作台
                </Link>
                <Link href="/sign-in" className="cta-secondary">
                  登录
                </Link>
                <Link href="/pricing" className="cta-secondary">
                  {pricingLabel}
                </Link>
                <a href="#workflow" className="cta-secondary">
                  再看工作方式
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
