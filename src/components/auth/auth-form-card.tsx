"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudioFrameCorners } from "@/components/studio/studio-chrome";
import { authClient } from "@/lib/auth-client";

type AuthMode = "signin" | "signup";

type AuthFormCardProps = {
  mode: AuthMode;
  pricingLabel?: string;
};

export function AuthFormCard({ mode, pricingLabel = "Upgrade to Premium" }: AuthFormCardProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const isSignUp = mode === "signup";

  const copy = useMemo(
    () =>
      isSignUp
        ? {
            title: "Create your Jingpian account",
            subtitle: "Sign up to keep your production context in one persistent workspace.",
            submit: "Create account",
            icon: UserPlus,
            altCtaLabel: "Already have an account?",
            altCtaAction: "Sign in",
            altCtaHref: "/sign-in",
            success: "Account created. You are now signed in.",
          }
        : {
            title: "Sign in to Jingpian",
            subtitle: "Continue your storyboard, keyframe, and video production workflow.",
            submit: "Sign in",
            icon: LogIn,
            altCtaLabel: "Need an account?",
            altCtaAction: "Create one",
            altCtaHref: "/sign-up",
            success: "Signed in successfully.",
          },
    [isSignUp],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    setIsPending(true);
    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL: "/workspace",
        });
        if (error) throw new Error(error.message || "Sign-up failed");
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/workspace",
        });
        if (error) throw new Error(error.message || "Sign-in failed");
      }

      toast.success(copy.success);
      window.location.href = "/workspace";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : isSignUp ? "Sign-up failed" : "Sign-in failed");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="relative rounded-[28px] border border-white/12 bg-zinc-900/72 py-0 text-zinc-100 shadow-[0_18px_70px_rgba(0,0,0,0.42)]">
      <StudioFrameCorners />
      <CardHeader className="px-6 pt-6 md:px-7 md:pt-7">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-white/14 bg-white/5 px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase text-zinc-300">
            auth
          </span>
          <Link href="/workspace" className="text-sm text-zinc-400 hover:text-zinc-100">
            Preview workspace
          </Link>
          <Link href="/pricing" className="text-sm text-zinc-400 hover:text-zinc-100">
            {pricingLabel}
          </Link>
        </div>
        <CardTitle className="font-heading text-2xl tracking-[-0.03em]">{copy.title}</CardTitle>
        <CardDescription className="text-sm leading-7 text-zinc-300 md:text-[15px]">{copy.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 md:px-7 md:pb-7">
        <form onSubmit={handleSubmit} className="grid gap-4">
          {isSignUp && (
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-zinc-200">Name</Label>
              <Input
                id="name"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 rounded-[16px] border-white/15 bg-zinc-950/70 text-zinc-100"
                placeholder="e.g. Creative lead"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-zinc-200">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-[16px] border-white/15 bg-zinc-950/70 text-zinc-100"
              placeholder="you@company.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-zinc-200">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-[16px] border-white/15 bg-zinc-950/70 text-zinc-100"
              placeholder="At least 8 characters"
            />
          </div>

          <Button type="submit" className="mt-2 h-11 rounded-full bg-amber-400 text-zinc-950 hover:bg-amber-300" disabled={isPending}>
            {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <copy.icon className="size-4" />}
            {copy.submit}
          </Button>

          <p className="text-sm text-zinc-400">
            {copy.altCtaLabel}
            <Link href={copy.altCtaHref} className="ml-1 font-medium text-zinc-100 hover:text-amber-300">
              {copy.altCtaAction}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
