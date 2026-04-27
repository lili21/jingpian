import Link from "next/link";

import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function SignInPage() {
  return (
    <main className="section-shell">
      <div className="page-shell grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
        <section className="surface-panel p-6 md:p-8">
          <span className="eyebrow">账号入口</span>
          <h1 className="section-title max-w-[12ch]">登录后继续你的分镜到视频流程</h1>
          <p className="section-subtitle max-w-[60ch]">
            Jingpian 仍保留当前 demo fallback，登录能力只是在现有产品基础上增加可持续使用的身份层，不改变现有工作台体验。
          </p>
          <div className="mt-6 grid gap-3 text-sm leading-7 text-muted-foreground">
            <div className="surface-soft px-4 py-3">支持邮箱 + 密码登录</div>
            <div className="surface-soft px-4 py-3">继续保留未接 key 时的演示流程</div>
            <div className="surface-soft px-4 py-3">登录后默认回到工作台继续处理任务</div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/" className="cta-secondary">
              返回首页
            </Link>
            <Link href="/workspace" className="cta-link">
              打开工作台
            </Link>
          </div>
        </section>
        <AuthFormCard mode="signin" />
      </div>
    </main>
  );
}
