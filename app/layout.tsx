import type { Metadata } from "next";
import "./globals.css";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const ogImageUrl = `${siteUrl}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: { default: "Career Town Mini｜職涯小鎮", template: "%s｜Career Town Mini" },
  description: "用 17 題認識自己的工作偏好，再把經歷整理成一份清楚的履歷。所有內容只保留在當前分頁。",
  openGraph: {
    title: "Career Town Mini｜職涯小鎮",
    description: "先認識自己，再把故事寫成履歷。",
    type: "website",
    locale: "zh_TW",
    images: [{ url: ogImageUrl, width: 1536, height: 1024, alt: "Career Town Mini 職涯小鎮" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Town Mini｜職涯小鎮",
    description: "先認識自己，再把故事寫成履歷。",
    images: [ogImageUrl],
  },
};

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
