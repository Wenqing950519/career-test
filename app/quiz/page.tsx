import type { Metadata } from "next";
import { SiteHeader } from "../SiteHeader";
import { QuizExperience } from "./QuizExperience";

export const metadata: Metadata = {
  title: "15 題職涯小測驗",
  description: "15 題、約 5 分鐘，測出你的職涯人格。",
};

export default function QuizPage() {
  return (
    <>
      <SiteHeader active="quiz" />
      <QuizExperience />
    </>
  );
}
