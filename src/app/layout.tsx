import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const notoSans = Noto_Sans_SC({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSerif = Noto_Serif_SC({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
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
      className={`${notoSans.variable} ${notoSerif.variable} ${geistMono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
        <Toaster closeButton position="top-right" richColors />
      </body>
    </html>
  );
}
