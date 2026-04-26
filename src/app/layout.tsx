import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jingpian｜先出分镜，再出视频",
  description:
    "Jingpian 把业务简报、分镜评审、关键帧生成与视频任务统一到一个可评审的工作流里，帮助中国 B2B 团队更稳地做短视频样片。",
  openGraph: {
    title: "Jingpian｜先出分镜，再出视频",
    description:
      "先判断结构，再投入出片。给品牌方、商家与内容团队一个更可控的分镜到视频工作台。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
        <Toaster closeButton position="top-right" richColors />
      </body>
    </html>
  );
}
