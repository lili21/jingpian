import Link from "next/link";

import { AuthFormCard } from "@/components/auth/auth-form-card";
import { StudioBackdrop, StudioFrameCorners, StudioHeader, StudioStatusStrip } from "@/components/studio/studio-chrome";
import { getSubscriptionState } from "@/lib/billing/subscription";

export default async function SignUpPage() {
  const subscription = await getSubscriptionState().catch(() => ({
    isSignedIn: false,
    isPremium: false,
    plan: "free" as const,
    source: "fallback" as const,
  }));
  const pricingLabel = subscription.isPremium ? "Manage subscription" : "Upgrade to Premium";

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <StudioBackdrop />
      <StudioHeader />

      <section className="relative z-10 px-4 py-16 md:px-8 md:py-22">
        <div className="mx-auto grid w-full max-w-[1180px] gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <section className="relative rounded-[28px] border border-white/12 bg-zinc-900/72 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.42)] md:p-8">
            <StudioFrameCorners />
            <div className="mb-4">
              <StudioStatusStrip left="NEW SESSION // READY" right="ACCESS // STUDIO" />
            </div>
            <span className="inline-flex items-center rounded-full border border-white/14 bg-white/5 px-3 py-1 text-[11px] tracking-[0.18em] text-zinc-300 uppercase">
              Create Account
            </span>
            <h1 className="mt-4 font-heading text-[clamp(2.1rem,4.5vw,3.8rem)] leading-[0.96] font-semibold tracking-[-0.045em]">
              Create your studio account.
            </h1>
            <p className="mt-5 max-w-[60ch] text-base leading-8 text-zinc-300">
              Start with a persistent production identity and scale into repeatable team workflows.
            </p>
            <div className="mt-6 grid gap-3 text-sm leading-7 text-zinc-300 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-800/45 px-4 py-3">Account persistence built in</div>
              <div className="rounded-2xl border border-white/10 bg-zinc-800/45 px-4 py-3">No disruption to current creation flow</div>
              <div className="rounded-2xl border border-white/10 bg-zinc-800/45 px-4 py-3">Ready for permissions and team layers</div>
            </div>
            <div className="mt-7 rounded-3xl border border-cyan-300/25 bg-cyan-500/10 p-5">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-cyan-300 uppercase">Onboarding Tip</p>
              <p className="mt-2 text-sm leading-7 text-zinc-200">
                Start with one real campaign brief after sign-up to set your team style baseline and speed up downstream review.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/" className="rounded-full border border-white/16 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800">
                Back Home
              </Link>
              <Link href="/workspace" className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-300">
                Try Workspace
              </Link>
              <Link href="/pricing" className="rounded-full border border-white/16 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800">
                {pricingLabel}
              </Link>
            </div>
          </section>
          <AuthFormCard mode="signup" pricingLabel={pricingLabel} />
        </div>
      </section>
    </main>
  );
}
