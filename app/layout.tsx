import type { Metadata } from "next";
import "./globals.css";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const ogImageUrl = `${siteUrl}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: { default: "你適合什麼工作？｜Career Test", template: "%s｜Career Test" },
  description: "15 題、約 5 分鐘，測出你的職涯人格。",
  openGraph: {
    title: "你適合什麼工作？｜Career Test",
    description: "15 題、約 5 分鐘，測出你的職涯人格。",
    type: "website",
    locale: "zh_TW",
    images: [{ url: ogImageUrl, width: 1200, height: 630, alt: "你適合什麼工作？Career Test 職涯測驗" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "你適合什麼工作？｜Career Test",
    description: "15 題、約 5 分鐘，測出你的職涯人格。",
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
