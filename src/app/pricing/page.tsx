"use client";

import Link from "next/link";
import { Check, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type BillingAction = "checkout" | "portal";

async function launchBilling(action: BillingAction) {
  const endpoint = action === "checkout" ? "/api/billing/checkout" : "/api/billing/portal";
  const response = await fetch(endpoint, {
    method: "POST",
  });

  const data = (await response.json()) as { url?: string; error?: string; message?: string };

  if (!response.ok) {
    throw new Error(data.error || "Billing action failed.");
  }

  if (!data.url) {
    throw new Error(data.message || "No billing URL returned.");
  }

  window.location.href = data.url;
}

export default function PricingPage() {
  const [pendingAction, setPendingAction] = useState<BillingAction | null>(null);

  async function handleAction(action: BillingAction) {
    if (pendingAction) {
      return;
    }

    setPendingAction(action);
    try {
      await launchBilling(action);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Billing request failed.");
      setPendingAction(null);
    }
  }

  return (
    <main className="section-shell">
      <div className="page-shell grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        <section className="surface-panel p-6 md:p-8">
          <span className="eyebrow">Pricing</span>
          <h1 className="section-title max-w-[12ch]">选择适合团队节奏的计划</h1>
          <p className="section-subtitle max-w-[60ch]">
            当前版本先上线 Stripe 计费骨架与订阅状态基础能力。即使未配置 Stripe Key，演示流程也会继续可用，不会阻断现有工作台体验。
          </p>

          <div className="mt-8 grid gap-3 text-sm leading-7 text-muted-foreground">
            <div className="surface-soft px-4 py-3">免费计划：保留 demo fallback 与基础工作流体验</div>
            <div className="surface-soft px-4 py-3">Premium 计划：预留给更高配额、协作与管理能力</div>
            <div className="surface-soft px-4 py-3">计费门户：预留自助管理订阅入口</div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/workspace" className="cta-secondary">
              返回工作台
            </Link>
            <Link href="/" className="cta-secondary">
              返回首页
            </Link>
          </div>
        </section>

        <section className="surface-panel p-6 md:p-8">
          <div className="rounded-[26px] border border-border/80 bg-white p-5 shadow-[var(--shadow-soft)] md:p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">premium</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">$29 / month</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Stripe checkout 与 billing portal 已就位。订阅数据持久化将在下一步接入。
            </p>

            <ul className="mt-6 grid gap-3 text-sm leading-7 text-muted-foreground">
              {["团队级工作台配额（预留）", "更高任务并发与生成额度（预留）", "自助续费与取消入口（预留）"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-1 size-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-3">
              <Button
                onClick={() => handleAction("checkout")}
                className="h-11 rounded-full"
                disabled={pendingAction !== null}
              >
                {pendingAction === "checkout" ? <LoaderCircle className="size-4 animate-spin" /> : null}
                开始订阅
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction("portal")}
                className="h-11 rounded-full bg-white"
                disabled={pendingAction !== null}
              >
                {pendingAction === "portal" ? <LoaderCircle className="size-4 animate-spin" /> : null}
                管理订阅
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
