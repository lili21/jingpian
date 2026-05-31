import Link from "next/link";

import { AuthFormCard } from "@/components/auth/auth-form-card";
import { getSubscriptionState } from "@/lib/billing/subscription";

export default async function SignInPage() {
  const subscription = await getSubscriptionState().catch(() => ({
    isSignedIn: false,
    isPremium: false,
    plan: "free" as const,
    source: "fallback" as const,
  }));
  const pricingLabel = subscription.isPremium ? "Manage subscription" : "Upgrade to Premium";

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="pointer-events-none absolute -top-44 -left-28 size-[520px] rounded-full bg-amber-500/16 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-120px] bottom-10 size-[520px] rounded-full bg-cyan-500/16 blur-[140px]" />

      <section className="relative z-10 px-4 py-16 md:px-8 md:py-22">
        <div className="mx-auto grid w-full max-w-[1180px] gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <section className="rounded-[28px] border border-white/12 bg-zinc-900/72 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.42)] md:p-8">
            <span className="inline-flex items-center rounded-full border border-white/14 bg-white/5 px-3 py-1 text-[11px] tracking-[0.18em] text-zinc-300 uppercase">
              Account Access
            </span>
            <h1 className="mt-4 text-[clamp(2rem,4vw,3.5rem)] leading-[0.98] font-semibold tracking-[-0.04em]">
              Sign in and continue production.
            </h1>
            <p className="mt-5 max-w-[60ch] text-base leading-8 text-zinc-300">
              Keep your storyboard-to-video workflow in one place with a persistent account identity.
            </p>
            <div className="mt-6 grid gap-3 text-sm leading-7 text-zinc-300">
              <div className="rounded-2xl border border-white/10 bg-zinc-800/45 px-4 py-3">Email and password sign-in</div>
              <div className="rounded-2xl border border-white/10 bg-zinc-800/45 px-4 py-3">Demo fallback remains available</div>
              <div className="rounded-2xl border border-white/10 bg-zinc-800/45 px-4 py-3">Auto-forward to workspace after auth</div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/" className="rounded-full border border-white/16 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800">
                Back Home
              </Link>
              <Link href="/workspace" className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-300">
                Open Workspace
              </Link>
              <Link href="/pricing" className="rounded-full border border-white/16 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800">
                {pricingLabel}
              </Link>
            </div>
          </section>
          <AuthFormCard mode="signin" pricingLabel={pricingLabel} />
        </div>
      </section>
    </main>
  );
}
