import Link from "next/link";
import { ArrowRight, Clapperboard } from "lucide-react";

type StudioHeaderProps = {
  active?: "workspace" | "pricing";
};

export function StudioBackdrop() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="pointer-events-none absolute -top-44 -left-28 size-[520px] rounded-full bg-amber-500/16 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-120px] bottom-10 size-[520px] rounded-full bg-cyan-500/16 blur-[140px]" />
    </>
  );
}

export function StudioHeader({ active }: StudioHeaderProps) {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4 md:px-8">
      <nav className="mx-auto flex w-full max-w-[1180px] items-center justify-between rounded-full border border-white/10 bg-zinc-950/75 px-4 py-3 shadow-[0_10px_44px_rgba(0,0,0,0.42)] backdrop-blur-md md:px-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            <Clapperboard className="size-4" />
          </span>
          <span className="font-heading text-xs font-semibold tracking-[0.2em] text-zinc-100 uppercase">Jingpian</span>
        </Link>
        <div className="hidden items-center gap-5 text-sm text-zinc-400 md:flex">
          <Link href="/workspace" className={active === "workspace" ? "text-zinc-100" : "hover:text-zinc-100"}>
            Workspace
          </Link>
          <Link href="/pricing" className={active === "pricing" ? "text-zinc-100" : "hover:text-zinc-100"}>
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="rounded-full px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100">
            Sign in
          </Link>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3.5 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
          >
            Start Free
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function StudioFrameCorners() {
  return (
    <>
      <div className="pointer-events-none absolute top-4 left-4 size-4 border-t border-l border-zinc-500/70" />
      <div className="pointer-events-none absolute top-4 right-4 size-4 border-t border-r border-zinc-500/70" />
      <div className="pointer-events-none absolute bottom-4 left-4 size-4 border-b border-l border-zinc-500/70" />
      <div className="pointer-events-none absolute right-4 bottom-4 size-4 border-r border-b border-zinc-500/70" />
    </>
  );
}

type StudioStatusStripProps = {
  left?: string;
  right?: string;
};

export function StudioStatusStrip({
  left = "REC 1080P 24FPS",
  right = "TC 00:00:18:24",
}: StudioStatusStripProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 font-mono text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
      <p className="inline-flex items-center gap-2">
        <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
        {left}
      </p>
      <p>{right}</p>
    </div>
  );
}
