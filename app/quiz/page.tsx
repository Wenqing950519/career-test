import type { Metadata } from "next";
import { SiteHeader } from "../SiteHeader";
import { QuizExperience } from "./QuizExperience";

export const metadata: Metadata = {
  title: "17 題小測驗",
  description: "用 17 個生活情境，整理活動偏好、工作價值、工作情境與可能的探索方向。",
};

export default function QuizPage() {
  return (
    <>
      <SiteHeader active="quiz" />
      <QuizExperience />
    </>
  );
}
