"use client";

import Link from "next/link";
import { Check, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StudioBackdrop, StudioFrameCorners, StudioHeader, StudioStatusStrip } from "@/components/studio/studio-chrome";

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

  const tiers = [
    {
      name: "Free",
      price: "$0",
      cadence: "/ month",
      summary: "For solo ideation and demo-safe validation.",
      points: ["Storyboard workflow", "Demo fallback enabled", "Basic workspace usage"],
      cta: "Start Free",
      href: "/workspace",
      featured: false,
    },
    {
      name: "Pro",
      price: "$29",
      cadence: "/ month",
      summary: "For regular production and faster iteration.",
      points: ["Higher generation throughput", "Priority processing", "Billing portal access"],
      cta: "Start Pro",
      action: "checkout" as BillingAction,
      featured: true,
    },
    {
      name: "Ultra",
      price: "$99",
      cadence: "/ month",
      summary: "For teams running high-volume creative pipelines.",
      points: ["Top-tier throughput", "Premium queue priority", "Advanced support lane"],
      cta: "Start Ultra",
      action: "checkout" as BillingAction,
      featured: false,
    },
  ];

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
      <StudioBackdrop />
      <StudioHeader active="pricing" />

      <section className="relative z-10 px-4 py-12 md:px-8 md:py-18">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8">
          <section className="relative grid gap-4 rounded-[28px] border border-white/12 bg-zinc-900/72 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.42)] md:p-8">
            <StudioFrameCorners />
            <StudioStatusStrip left="RATE CARD // ACTIVE" right="3 TIERS // USD" />
            <span className="inline-flex w-fit items-center rounded-full border border-white/14 bg-white/5 px-3 py-1 text-[11px] tracking-[0.18em] text-zinc-300 uppercase">
              Pricing
            </span>
            <h1 className="font-heading text-[clamp(2rem,4vw,3.5rem)] leading-[0.98] font-semibold tracking-[-0.04em]">
              Choose your production tier.
            </h1>
            <p className="max-w-[68ch] text-base leading-8 text-zinc-300">
              Start with Free, move to Pro for daily production, and scale with Ultra for high-volume creative operations.
            </p>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            {tiers.map((tier) => (
              <article
                key={tier.name}
                className={`rounded-[28px] border p-6 shadow-[0_18px_70px_rgba(0,0,0,0.42)] md:p-7 ${
                  tier.featured
                    ? "border-amber-300/40 bg-amber-500/12"
                    : "border-white/12 bg-zinc-900/72"
                }`}
              >
                <p className="text-sm tracking-[0.16em] text-zinc-400 uppercase">{tier.name}</p>
                <h2 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.03em]">
                  {tier.price}
                  <span className="ml-1 text-base font-normal text-zinc-400">{tier.cadence}</span>
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-300">{tier.summary}</p>

                <ul className="mt-6 grid gap-3 text-sm leading-7 text-zinc-300">
                  {tier.points.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-1 size-4 text-amber-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {tier.href ? (
                    <Link
                      href={tier.href}
                      className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/20 bg-zinc-900 px-5 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
                    >
                      {tier.cta}
                    </Link>
                  ) : (
                    <Button
                      onClick={() => handleAction(tier.action!)}
                      className={`h-11 w-full rounded-full ${
                        tier.featured
                          ? "bg-amber-400 text-zinc-950 hover:bg-amber-300"
                          : "border border-white/20 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                      }`}
                      disabled={pendingAction !== null}
                    >
                      {pendingAction === tier.action ? <LoaderCircle className="size-4 animate-spin" /> : null}
                      {tier.cta}
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => handleAction("portal")}
              className="h-11 rounded-full border-white/20 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
              disabled={pendingAction !== null}
            >
              {pendingAction === "portal" ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Manage Subscription
            </Button>
            <Link href="/workspace" className="rounded-full border border-white/16 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800">
              Back to Workspace
            </Link>
            <Link href="/" className="rounded-full border border-white/16 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800">
              Back Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
