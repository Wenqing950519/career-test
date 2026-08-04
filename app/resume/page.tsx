import type { Metadata } from "next";
import { SiteHeader } from "../SiteHeader";
import { ResumeBuilder } from "./ResumeBuilder";

export const metadata: Metadata = {
  title: "履歷生成器",
  description: "在瀏覽器中整理個人資料、教育與實作經歷，即時預覽 A4 履歷並列印成 PDF。",
};

export default function ResumePage() {
  return (
    <>
      <SiteHeader active="resume" />
      <ResumeBuilder />
    </>
  );
}
