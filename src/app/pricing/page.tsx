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
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="pointer-events-none absolute -top-44 -left-28 size-[520px] rounded-full bg-amber-500/16 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-120px] bottom-10 size-[520px] rounded-full bg-cyan-500/16 blur-[140px]" />

      <section className="relative z-10 px-4 py-16 md:px-8 md:py-22">
        <div className="mx-auto grid w-full max-w-[1180px] gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
          <section className="rounded-[28px] border border-white/12 bg-zinc-900/72 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.42)] md:p-8">
            <span className="inline-flex items-center rounded-full border border-white/14 bg-white/5 px-3 py-1 text-[11px] tracking-[0.18em] text-zinc-300 uppercase">
              Pricing
            </span>
            <h1 className="mt-4 text-[clamp(2rem,4vw,3.5rem)] leading-[0.98] font-semibold tracking-[-0.04em]">
              Scale your production rhythm.
            </h1>
            <p className="mt-5 max-w-[60ch] text-base leading-8 text-zinc-300">
              Keep demo flow available while unlocking billing-ready subscription paths for real teams.
            </p>

            <div className="mt-8 grid gap-3 text-sm leading-7 text-zinc-300">
              <div className="rounded-2xl border border-white/10 bg-zinc-800/45 px-4 py-3">Free: full storyboard workflow with demo fallback</div>
              <div className="rounded-2xl border border-white/10 bg-zinc-800/45 px-4 py-3">Premium: higher limits and team-ready scale</div>
              <div className="rounded-2xl border border-white/10 bg-zinc-800/45 px-4 py-3">Portal: self-serve billing management</div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/workspace" className="rounded-full border border-white/16 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800">
                Back to Workspace
              </Link>
              <Link href="/" className="rounded-full border border-white/16 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800">
                Back Home
              </Link>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/12 bg-zinc-900/72 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.42)] md:p-8">
            <div className="rounded-[26px] border border-white/12 bg-zinc-950/70 p-5 md:p-6">
              <p className="text-sm tracking-[0.16em] text-zinc-400 uppercase">Premium</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">$29 / month</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                Stripe checkout and billing portal are ready for production-grade subscriptions.
              </p>

              <ul className="mt-6 grid gap-3 text-sm leading-7 text-zinc-300">
                {["Team-level workflow quotas", "Higher generation throughput", "Self-serve renew and cancel"].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-1 size-4 text-amber-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 grid gap-3">
                <Button
                  onClick={() => handleAction("checkout")}
                  className="h-11 rounded-full bg-amber-400 text-zinc-950 hover:bg-amber-300"
                  disabled={pendingAction !== null}
                >
                  {pendingAction === "checkout" ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  Start Subscription
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAction("portal")}
                  className="h-11 rounded-full border-white/20 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                  disabled={pendingAction !== null}
                >
                  {pendingAction === "portal" ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  Manage Subscription
                </Button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
