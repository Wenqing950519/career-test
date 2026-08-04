"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { DIRECTION_POOL, LABELS, QUESTIONS, type Question } from "./quiz-data";

type Answers = Record<string, string | string[]>;
type DirectionResult = { id: string; title: string; score: number; reasons: string[] };
type QuizResult = {
  profile: { name: string; learningStage: string };
  directions: DirectionResult[];
  activityPreferences: string[];
  workValues: string[];
  workContexts: string[];
  capabilities: string[];
  domainInterests: string[];
  constraints: string[];
  avoidances: string[];
  certificates: string;
  softPreferences: string;
  summary: string;
  nextAction: string;
  generatedAt: string;
};

const exclusiveOptions = new Set(["C1-5", "C2-skip", "C3-7", "D1-7", "E1-9", "F1-8"]);
const label = (id: string) => LABELS[id] ?? id;
const list = (answers: Answers, id: string) => Array.isArray(answers[id]) ? answers[id] as string[] : [];
const text = (answers: Answers, id: string) => typeof answers[id] === "string" ? answers[id] as string : "";

function pickDirections(answers: Answers): DirectionResult[] {
  const score = new Map(DIRECTION_POOL.map((direction) => [direction.id, 0]));
  const activityTag: Record<string, string> = { "A1-1": "make", "A1-2": "investigate", "A1-3": "create", "A1-4": "help", "A1-5": "lead", "A1-6": "organize" };
  const domainTag: Record<string, string> = { "E1-1": "content", "E1-2": "social", "E1-3": "biz", "E1-4": "tech", "E1-5": "science", "E1-6": "engineering", "E1-7": "design", "E1-8": "environment" };
  const capabilityTag: Record<string, string> = { "D1-1": "content", "D1-2": "data", "D1-3": "tech", "D1-4": "help", "D1-5": "design", "D1-6": "biz" };
  const addByTag = (tag: string | undefined, amount: number) => {
    if (!tag) return;
    DIRECTION_POOL.forEach((direction) => {
      if (direction.tags.includes(tag)) score.set(direction.id, (score.get(direction.id) ?? 0) + amount);
    });
  };

  list(answers, "A1").forEach((id) => addByTag(activityTag[id], 2));
  list(answers, "E1").forEach((id) => addByTag(domainTag[id], 2));
  list(answers, "D1").forEach((id) => addByTag(capabilityTag[id], 1));
  if (list(answers, "B1").includes("B1-4")) addByTag("help", 1);
  if (list(answers, "B1").includes("B1-2")) addByTag("create", 1);
  if (list(answers, "B1").includes("B1-3")) addByTag("lead", 1);

  const activities = list(answers, "A1").filter((id) => !id.endsWith("skip")).map(label);
  const domains = list(answers, "E1").filter((id) => id !== "E1-9").map(label);
  const capabilities = list(answers, "D1").filter((id) => id !== "D1-7").map(label);
  const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]);
  const selected = ranked.filter(([, value]) => value > 0).slice(0, 4);
  const fallbacks = ["dir-product-design", "dir-research-data", "dir-content-creation"];

  for (const id of fallbacks) {
    if (selected.length >= 2) break;
    if (!selected.some(([current]) => current === id)) selected.push([id, 0]);
  }

  return selected.slice(0, 4).map(([id, value]) => {
    const direction = DIRECTION_POOL.find((item) => item.id === id)!;
    return {
      id,
      title: direction.title,
      score: value,
      reasons: [
        activities.length ? `你偏好的活動包含：${activities.slice(0, 2).join("、")}` : "活動偏好仍可繼續觀察",
        domains.length ? `你願意接觸的題材包含：${domains.slice(0, 2).join("、")}` : "題材尚未限定，保留探索空間",
        capabilities.length ? `目前可用的能力線索：${capabilities.slice(0, 2).join("、")}` : "先接觸實際工作，再累積能力證據",
      ],
    };
  });
}

function buildResult(answers: Answers): QuizResult {
  const directions = pickDirections(answers);
  const activityPreferences = [...list(answers, "A1"), ...list(answers, "A3")].filter((id) => !id.endsWith("skip")).map(label);
  const workValues = list(answers, "B1").map(label);
  const workContexts = [...list(answers, "C1").filter((id) => id !== "C1-5"), ...list(answers, "C2").filter((id) => !id.endsWith("skip"))].map(label);
  const capabilities = list(answers, "D1").filter((id) => id !== "D1-7").map(label);
  const domainInterests = list(answers, "E1").filter((id) => id !== "E1-9").map(label);
  const constraints = list(answers, "F1").filter((id) => id !== "F1-8").map(label);
  const avoidances = list(answers, "C3").filter((id) => id !== "C3-7").map(label);
  const name = text(answers, "F3").trim();

  return {
    profile: { name, learningStage: text(answers, "F4").trim() },
    directions,
    activityPreferences,
    workValues,
    workContexts,
    capabilities,
    domainInterests,
    constraints,
    avoidances,
    certificates: text(answers, "D3").trim(),
    softPreferences: text(answers, "F2").trim(),
    summary: `從你的活動偏好、工作價值與想接觸的題材交叉來看，可以先把「${directions.map((item) => item.title).join("、")}」當成探索假設。這不是適合度排名，而是下一步值得靠近看看的方向。`,
    nextAction: `找一段能在 30 分鐘內了解「${directions[0]?.title ?? "一種真實工作"}」日常的影片或文章，看完只記下：哪個畫面讓你想繼續、哪個部分讓你退縮。`,
    generatedAt: new Date().toISOString(),
  };
}

export function QuizExperience() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [finished, setFinished] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const question = QUESTIONS[index];
  const result = useMemo(() => finished ? buildResult(answers) : null, [answers, finished]);

  const goTo = (next: number) => {
    setIndex(Math.max(0, Math.min(QUESTIONS.length - 1, next)));
    requestAnimationFrame(() => stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const updateChoice = (question: Question, optionId: string) => {
    setAnswers((current) => {
      if (question.kind === "single") return { ...current, [question.id]: [optionId] };
      const previous = list(current, question.id);
      if (previous.includes(optionId)) return { ...current, [question.id]: previous.filter((id) => id !== optionId) };
      if (exclusiveOptions.has(optionId)) return { ...current, [question.id]: [optionId] };
      const withoutExclusive = previous.filter((id) => !exclusiveOptions.has(id));
      const next = [...withoutExclusive, optionId];
      return { ...current, [question.id]: question.max && next.length > question.max ? next.slice(1) : next };
    });
  };

  const restart = () => {
    setAnswers({});
    setIndex(0);
    setFinished(false);
    setStarted(true);
    requestAnimationFrame(() => stageRef.current?.scrollIntoView({ behavior: "smooth" }));
  };

  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${result.profile.name || "career-town"}-quiz-result.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!started) {
    return (
      <main className="quiz-landing page-shell">
        <section className="quiz-hero">
          <div className="hero-copy">
            <p className="eyebrow">17 QUESTIONS · ABOUT 6 MINUTES</p>
            <h1>不是決定你適合什麼，<br /><em>是找到下一個想靠近的方向。</em></h1>
            <p className="hero-lead">用生活裡真正會遇到的情境，整理你偏好的活動、在意的工作價值、舒服的工作方式，以及目前可用的能力線索。</p>
            <div className="hero-actions">
              <button className="primary-action" onClick={() => setStarted(true)}>開始 17 題 <span>→</span></button>
              <Link className="text-link" href="/resume">我想先做履歷</Link>
            </div>
            <p className="memory-note"><span aria-hidden="true">✦</span> 不登入、不上傳、不保留。關閉分頁後，答案就會消失。</p>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit-card card-a"><span>01</span><strong>我喜歡怎麼做事？</strong></div>
            <div className="orbit-card card-b"><span>02</span><strong>我在意什麼？</strong></div>
            <div className="orbit-card card-c"><span>03</span><strong>下一站去哪裡看看？</strong></div>
            <div className="orbit-center"><b>17</b><small>個生活情境</small></div>
          </div>
        </section>
        <section className="quiz-intro-grid" aria-label="測驗涵蓋內容">
          <article><span>01–03</span><h2>活動偏好</h2><p>哪些動作讓你願意開始，也比較容易忘記時間。</p></article>
          <article><span>04–09</span><h2>價值與情境</h2><p>什麼值得你投入，以及哪種工作結構比較自在。</p></article>
          <article><span>10–17</span><h2>證據與現實</h2><p>目前做得到什麼，又有哪些條件需要先被尊重。</p></article>
        </section>
      </main>
    );
  }

  if (finished && result) {
    return (
      <main className="page-shell result-page" ref={stageRef}>
        <section className="result-heading">
          <p className="eyebrow">YOUR EXPLORATION MAP</p>
          <span className="result-kicker">完成 17 題 · 這份結果不會被儲存</span>
          <h1>{result.profile.name ? `${result.profile.name}，` : ""}先別急著選答案。<br /><em>這幾個方向值得親自去看看。</em></h1>
          <p>{result.summary}</p>
        </section>
        <section className="direction-grid">
          {result.directions.map((direction, directionIndex) => (
            <article className={`direction-card tone-${directionIndex + 1}`} key={direction.id}>
              <span>0{directionIndex + 1}</span>
              <div><small>{directionIndex === 0 ? "最先浮現" : "值得探索"}</small><h2>{direction.title}</h2></div>
              <ul>{direction.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
            </article>
          ))}
        </section>
        <section className="signals-panel">
          <div><p className="eyebrow">SIGNALS, NOT LABELS</p><h2>你留下的線索</h2><p>這些詞比職稱更有用：之後看課程、實習或職缺時，可以拿它們逐項比對。</p></div>
          <SignalGroup title="喜歡的活動" items={result.activityPreferences} empty="目前還說不準" />
          <SignalGroup title="在意的價值" items={result.workValues} empty="目前還分不出來" />
          <SignalGroup title="能力線索" items={result.capabilities} empty="等待下一次實作累積" />
          <SignalGroup title="現實條件" items={result.constraints} empty="目前沒有硬限制" />
        </section>
        <section className="next-card">
          <span>下一個 30 分鐘</span><h2>先接觸真實工作，再決定要不要靠近。</h2><p>{result.nextAction}</p>
        </section>
        <div className="result-actions">
          <Link className="primary-action" href="/resume">把經歷整理成履歷 <span>→</span></Link>
          <button className="secondary-action" onClick={downloadResult}>下載我的結果</button>
          <button className="text-link" onClick={restart}>重新測驗</button>
        </div>
      </main>
    );
  }

  return (
    <main className="quiz-run page-shell" ref={stageRef}>
      <div className="quiz-topline">
        <div><p className="eyebrow">CAREER TOWN MINI</p><strong>{question.dimension}</strong></div>
        <p>第 {index + 1} 題 <span>/ {QUESTIONS.length}</span></p>
      </div>
      <div className="progress-track" aria-label={`測驗進度 ${index + 1} / ${QUESTIONS.length}`}><i style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }} /></div>
      <section className="question-layout">
        <aside>
          <span>0{index + 1}</span>
          <p>{question.kind === "multi" ? `最多選 ${question.max ?? "多"} 項` : question.kind === "single" ? "請選 1 項" : question.kind === "free" ? "自由填寫 · 可留空" : "可選多個來源"}</p>
          <small>所有問題都可以跳過。這份測驗只提供探索線索，不是能力或人格診斷。</small>
        </aside>
        <article className="question-card">
          <header><span>{question.dimension}</span><h1>{question.title}</h1>{question.hint && <p>{question.hint}</p>}</header>
          <QuestionInput question={question} answers={answers} onChoice={updateChoice} onText={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))} />
          <footer>
            <button className="back-action" disabled={index === 0} onClick={() => goTo(index - 1)}>← 上一題</button>
            <span>{Array.isArray(answers[question.id]) && (answers[question.id] as string[]).length ? `已選 ${(answers[question.id] as string[]).length} 項` : text(answers, question.id) ? "已填寫" : "可直接跳過"}</span>
            <button className="next-action" onClick={() => index === QUESTIONS.length - 1 ? setFinished(true) : goTo(index + 1)}>{index === QUESTIONS.length - 1 ? "看結果" : "下一題"} →</button>
          </footer>
        </article>
      </section>
    </main>
  );
}

function QuestionInput({ question, answers, onChoice, onText }: { question: Question; answers: Answers; onChoice: (question: Question, optionId: string) => void; onText: (value: string) => void }) {
  if (question.kind === "free") {
    return <textarea className="free-input" rows={5} value={text(answers, question.id)} onChange={(event) => onText(event.target.value)} placeholder={question.placeholder} autoFocus />;
  }
  if (question.kind === "evidence-source" && list(answers, "D1").filter((id) => id !== "D1-7").length === 0) {
    return <div className="skip-message"><span>↷</span><div><strong>上一題沒有選擇能力線索</strong><p>這題會自動略過，直接按「下一題」即可。</p></div></div>;
  }
  const selected = list(answers, question.id);
  return (
    <div className="option-list">
      {question.options?.map((option, optionIndex) => {
        const isSelected = selected.includes(option.id);
        return (
          <button type="button" className={`quiz-option ${isSelected ? "selected" : ""} ${option.skip ? "skip" : ""}`} aria-pressed={isSelected} onClick={() => onChoice(question, option.id)} key={option.id}>
            <span className="option-index">{String(optionIndex + 1).padStart(2, "0")}</span>
            <span className="option-copy"><strong>{option.label}</strong>{option.desc && <small>{option.desc}</small>}</span>
            <i aria-hidden="true">{isSelected ? "✓" : "+"}</i>
          </button>
        );
      })}
    </div>
  );
}

function SignalGroup({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <article><h3>{title}</h3><div>{items.length ? items.map((item) => <span key={item}>{item}</span>) : <span className="muted-chip">{empty}</span>}</div></article>;
}
