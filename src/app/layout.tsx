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
  title: "Jingpian | Storyboard Before Video",
  description:
    "Jingpian unifies brief intake, storyboard review, keyframe generation, and video jobs in one production-grade workflow.",
  openGraph: {
    title: "Jingpian | Storyboard Before Video",
    description:
      "Align structure before rendering. Give marketing and creative teams a controllable storyboard-to-video workspace.",
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
        <Toaster closeButton position="top-right" richColors />
      </body>
    </html>
  );
}
