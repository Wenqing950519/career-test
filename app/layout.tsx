import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);

  return {
    metadataBase: base,
    title: { default: "Career Town Mini｜職涯小鎮", template: "%s｜Career Town Mini" },
    description: "用 17 題認識自己的工作偏好，再把經歷整理成一份清楚的履歷。所有內容只保留在當前分頁。",
    openGraph: {
      title: "Career Town Mini｜職涯小鎮",
      description: "先認識自己，再把故事寫成履歷。",
      type: "website",
      locale: "zh_TW",
      images: [{ url: new URL("/og.png", base).toString(), width: 1536, height: 1024, alt: "Career Town Mini 職涯小鎮" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Career Town Mini｜職涯小鎮",
      description: "先認識自己，再把故事寫成履歷。",
      images: [new URL("/og.png", base).toString()],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
