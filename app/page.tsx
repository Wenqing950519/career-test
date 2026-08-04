import { SiteHeader } from "./SiteHeader";
import { QuizExperience } from "./quiz/QuizExperience";

export default function Home() {
  return (
    <>
      <SiteHeader active="quiz" />
      <QuizExperience />
    </>
  );
}
