"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type AuthMode = "signin" | "signup";

type AuthFormCardProps = {
  mode: AuthMode;
  pricingLabel?: string;
};

export function AuthFormCard({ mode, pricingLabel = "升级 Premium" }: AuthFormCardProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const isSignUp = mode === "signup";

  const copy = useMemo(
    () =>
      isSignUp
        ? {
            title: "创建 Jingpian 账号",
            subtitle: "完成注册后即可在工作台保存你的项目上下文。",
            submit: "创建账号",
            icon: UserPlus,
            altCtaLabel: "已有账号？",
            altCtaAction: "去登录",
            altCtaHref: "/sign-in",
            success: "注册成功，已自动登录。",
          }
        : {
            title: "登录 Jingpian",
            subtitle: "登录后可以继续你的分镜、关键帧与视频任务流程。",
            submit: "登录",
            icon: LogIn,
            altCtaLabel: "还没有账号？",
            altCtaAction: "去注册",
            altCtaHref: "/sign-up",
            success: "登录成功。",
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
        if (error) throw new Error(error.message || "注册失败");
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/workspace",
        });
        if (error) throw new Error(error.message || "登录失败");
      }

      toast.success(copy.success);
      window.location.href = "/workspace";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : isSignUp ? "注册失败" : "登录失败");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="surface-panel border-white/70 bg-white/90 py-0">
      <CardHeader className="px-6 pt-6 md:px-7 md:pt-7">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-border/80 bg-secondary/50 px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
            auth
          </span>
          <Link href="/workspace" className="text-sm text-muted-foreground hover:text-foreground">
            先浏览工作台
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
            {pricingLabel}
          </Link>
        </div>
        <CardTitle className="text-2xl tracking-[-0.03em]">{copy.title}</CardTitle>
        <CardDescription className="text-sm leading-7 md:text-[15px]">{copy.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 md:px-7 md:pb-7">
        <form onSubmit={handleSubmit} className="grid gap-4">
          {isSignUp && (
            <div className="grid gap-2">
              <Label htmlFor="name">昵称</Label>
              <Input
                id="name"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 rounded-[16px] border-border/80 bg-white"
                placeholder="例如：项目负责人"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-[16px] border-border/80 bg-white"
              placeholder="you@company.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-[16px] border-border/80 bg-white"
              placeholder="至少 8 位字符"
            />
          </div>

          <Button type="submit" className="mt-2 h-11 rounded-full" disabled={isPending}>
            {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <copy.icon className="size-4" />}
            {copy.submit}
          </Button>

          <p className="text-sm text-muted-foreground">
            {copy.altCtaLabel}
            <Link href={copy.altCtaHref} className="ml-1 font-medium text-foreground hover:text-primary">
              {copy.altCtaAction}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
