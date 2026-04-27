import Link from "next/link";

import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function SignUpPage() {
  return (
    <main className="section-shell">
      <div className="page-shell grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
        <section className="surface-panel p-6 md:p-8">
          <span className="eyebrow">创建账号</span>
          <h1 className="section-title max-w-[12ch]">注册 Jingpian，沉淀你的内容项目节奏</h1>
          <p className="section-subtitle max-w-[60ch]">
            先做登录基础设施，不引入 Stripe，不打断当前 landing/workspace/AI 路径。你可以继续用现有流程，也可以把它逐步转为真实账号体验。
          </p>
          <div className="mt-6 grid gap-3 text-sm leading-7 text-muted-foreground">
            <div className="surface-soft px-4 py-3">本地 sqlite 持久化账号数据</div>
            <div className="surface-soft px-4 py-3">最小化改动，不影响现有 CTA 与工作台链路</div>
            <div className="surface-soft px-4 py-3">后续可在此基础上接入项目列表与权限</div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/" className="cta-secondary">
              返回首页
            </Link>
            <Link href="/workspace" className="cta-link">
              继续体验工作台
            </Link>
          </div>
        </section>
        <AuthFormCard mode="signup" />
      </div>
    </main>
  );
}
