"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { LABELS, QUESTIONS, type Question } from "./quiz-data";

type Answers = Record<string, string | string[]>;
type DimensionKey = "analysis" | "creative" | "people" | "influence" | "structure" | "handsOn";
type DimensionResult = { key: DimensionKey; label: string; percentage: number };
type RoleResult = { id: string; title: string; match: number; reason: string };
type QuizResult = {
  profile: { name: string; learningStage: string };
  dimensions: DimensionResult[];
  roles: RoleResult[];
  activityPreferences: string[];
  workValues: string[];
  capabilities: string[];
  constraints: string[];
  generatedAt: string;
};

type RoleProfile = {
  id: string;
  title: string;
  weights: Record<DimensionKey, number>;
  domainSignals: string[];
  capabilitySignals: string[];
};

const DIMENSIONS: Array<{ key: DimensionKey; label: string }> = [
  { key: "analysis", label: "分析研究" },
  { key: "creative", label: "創意表達" },
  { key: "people", label: "助人協作" },
  { key: "influence", label: "推動影響" },
  { key: "structure", label: "流程整理" },
  { key: "handsOn", label: "動手實作" },
];

const ROLE_POOL: RoleProfile[] = [
  { id: "brand-content", title: "品牌內容企劃", weights: { analysis: .18, creative: .29, people: .10, influence: .19, structure: .19, handsOn: .05 }, domainSignals: ["E1-1", "E1-3", "E1-7"], capabilitySignals: ["D1-1", "D1-5", "D1-6"] },
  { id: "social-marketing", title: "社群行銷專員", weights: { analysis: .14, creative: .26, people: .19, influence: .25, structure: .11, handsOn: .05 }, domainSignals: ["E1-3", "E1-7"], capabilitySignals: ["D1-1", "D1-5"] },
  { id: "project-ops", title: "專案營運專員", weights: { analysis: .18, creative: .08, people: .18, influence: .18, structure: .33, handsOn: .05 }, domainSignals: ["E1-2", "E1-3", "E1-4"], capabilitySignals: ["D1-4", "D1-6"] },
  { id: "hr-recruiting", title: "人資／招募專員", weights: { analysis: .14, creative: .07, people: .34, influence: .18, structure: .22, handsOn: .05 }, domainSignals: ["E1-2", "E1-3"], capabilitySignals: ["D1-1", "D1-4", "D1-6"] },
  { id: "customer-success", title: "客戶成功專員", weights: { analysis: .14, creative: .07, people: .33, influence: .22, structure: .19, handsOn: .05 }, domainSignals: ["E1-3", "E1-4"], capabilitySignals: ["D1-1", "D1-4", "D1-6"] },
  { id: "public-relations", title: "公關企劃專員", weights: { analysis: .10, creative: .21, people: .23, influence: .27, structure: .14, handsOn: .05 }, domainSignals: ["E1-1", "E1-3", "E1-7"], capabilitySignals: ["D1-1", "D1-4", "D1-5"] },
  { id: "event-planning", title: "活動企劃專員", weights: { analysis: .07, creative: .18, people: .20, influence: .22, structure: .25, handsOn: .08 }, domainSignals: ["E1-2", "E1-3", "E1-7"], capabilitySignals: ["D1-4", "D1-5", "D1-6"] },
  { id: "editorial-copy", title: "編輯／文案企劃", weights: { analysis: .23, creative: .38, people: .09, influence: .08, structure: .17, handsOn: .05 }, domainSignals: ["E1-1", "E1-2", "E1-7"], capabilitySignals: ["D1-1", "D1-5"] },
  { id: "business-development", title: "商務開發專員", weights: { analysis: .14, creative: .09, people: .25, influence: .34, structure: .13, handsOn: .05 }, domainSignals: ["E1-3", "E1-4"], capabilitySignals: ["D1-1", "D1-4", "D1-6"] },
  { id: "training", title: "教育培訓企劃", weights: { analysis: .13, creative: .18, people: .33, influence: .13, structure: .18, handsOn: .05 }, domainSignals: ["E1-1", "E1-2"], capabilitySignals: ["D1-1", "D1-4", "D1-6"] },
  { id: "market-research", title: "市場研究助理", weights: { analysis: .35, creative: .10, people: .20, influence: .08, structure: .22, handsOn: .05 }, domainSignals: ["E1-2", "E1-3"], capabilitySignals: ["D1-1", "D1-2", "D1-6"] },
  { id: "operations-coordinator", title: "營運協調專員", weights: { analysis: .18, creative: .05, people: .18, influence: .11, structure: .43, handsOn: .05 }, domainSignals: ["E1-2", "E1-3", "E1-4"], capabilitySignals: ["D1-4", "D1-6"] },
];

const exclusiveOptions = new Set(["C1-5", "C2-skip", "C3-7", "D1-7", "E1-9", "F1-8"]);
const label = (id: string) => LABELS[id] ?? id;
const list = (answers: Answers, id: string) => Array.isArray(answers[id]) ? answers[id] as string[] : [];
const text = (answers: Answers, id: string) => typeof answers[id] === "string" ? answers[id] as string : "";

function calculateDimensions(answers: Answers): DimensionResult[] {
  const scores: Record<DimensionKey, number> = { analysis: 0, creative: 0, people: 0, influence: 0, structure: 0, handsOn: 0 };
  const add = (key: DimensionKey | undefined, value: number) => { if (key) scores[key] += value; };
  const activityMap: Record<string, DimensionKey> = {
    "A1-1": "handsOn", "A1-2": "analysis", "A1-3": "creative", "A1-4": "people", "A1-5": "influence", "A1-6": "structure",
    "A2-1": "handsOn", "A2-2": "analysis", "A2-3": "creative", "A2-4": "people", "A2-5": "influence", "A2-6": "structure",
    "A3-1": "handsOn", "A3-2": "analysis", "A3-3": "creative", "A3-4": "people", "A3-5": "influence", "A3-6": "structure",
    "D1-2": "analysis", "D1-3": "handsOn", "D1-4": "people", "D1-5": "creative", "D1-6": "structure",
  };
  list(answers, "A1").forEach((id) => add(activityMap[id], 4));
  list(answers, "A2").forEach((id) => add(activityMap[id], 3));
  list(answers, "A3").forEach((id) => add(activityMap[id], 4));
  list(answers, "D1").forEach((id) => {
    if (id === "D1-1") { add("creative", 1); add("influence", 1); }
    else add(activityMap[id], 2);
  });

  const valueMap: Record<string, DimensionKey> = { "B1-1": "creative", "B1-2": "creative", "B1-3": "influence", "B1-4": "people", "B1-5": "structure", "B1-6": "structure" };
  list(answers, "B1").forEach((id) => add(valueMap[id], 1));
  const contextMap: Record<string, DimensionKey> = { "C1-1": "people", "C1-2": "analysis", "C1-3": "handsOn", "C1-4": "creative", "C2-1": "structure", "C2-2": "creative", "C2-3": "analysis", "C2-4": "analysis", "C2-5": "influence", "C2-6": "influence" };
  [...list(answers, "C1"), ...list(answers, "C2")].forEach((id) => add(contextMap[id], 1));

  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const exact = DIMENSIONS.map(({ key, label: dimensionLabel }) => ({ key, label: dimensionLabel, exact: total ? (scores[key] / total) * 100 : 100 / DIMENSIONS.length }));
  const percentages = exact.map((item) => Math.floor(item.exact));
  let remainder = 100 - percentages.reduce((sum, value) => sum + value, 0);
  exact.map((item, index) => ({ index, fraction: item.exact - percentages[index] })).sort((a, b) => b.fraction - a.fraction).forEach(({ index }) => {
    if (remainder > 0) { percentages[index] += 1; remainder -= 1; }
  });
  return exact.map(({ key, label: dimensionLabel }, index) => ({ key, label: dimensionLabel, percentage: percentages[index] }));
}

function pickRoles(answers: Answers, dimensions: DimensionResult[]): RoleResult[] {
  const profile = Object.fromEntries(dimensions.map((item) => [item.key, item.percentage / 100])) as Record<DimensionKey, number>;
  const domains = list(answers, "E1");
  const capabilities = list(answers, "D1");
  const topDimensionLabels = [...dimensions].sort((a, b) => b.percentage - a.percentage).slice(0, 2).map((item) => item.label);

  return ROLE_POOL.map((role) => {
    const distance = DIMENSIONS.reduce((sum, { key }) => sum + Math.abs(profile[key] - role.weights[key]), 0);
    const similarity = Math.max(0, 1 - distance / 2);
    const domainBonus = role.domainSignals.some((id) => domains.includes(id)) ? 3 : 0;
    const capabilityBonus = role.capabilitySignals.some((id) => capabilities.includes(id)) ? 3 : 0;
    const match = Math.min(96, Math.max(58, Math.round(46 + similarity * 48 + domainBonus + capabilityBonus)));
    const matchingDomain = role.domainSignals.find((id) => domains.includes(id));
    return {
      id: role.id,
      title: role.title,
      match,
      reason: matchingDomain ? `${topDimensionLabels.join("、")}較突出，也對${label(matchingDomain)}有興趣` : `${topDimensionLabels.join("、")}是目前較突出的偏好`,
    };
  }).sort((a, b) => b.match - a.match).slice(0, 3);
}

function buildResult(answers: Answers): QuizResult {
  const dimensions = calculateDimensions(answers);
  return {
    profile: { name: text(answers, "F3").trim(), learningStage: text(answers, "F4").trim() },
    dimensions,
    roles: pickRoles(answers, dimensions),
    activityPreferences: [...list(answers, "A1"), ...list(answers, "A3")].filter((id) => !id.endsWith("skip")).map(label),
    workValues: list(answers, "B1").map(label),
    capabilities: list(answers, "D1").filter((id) => id !== "D1-7").map(label),
    constraints: list(answers, "F1").filter((id) => id !== "F1-8").map(label),
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
  const updateChoice = (currentQuestion: Question, optionId: string) => {
    setAnswers((current) => {
      if (currentQuestion.kind === "single") return { ...current, [currentQuestion.id]: [optionId] };
      const previous = list(current, currentQuestion.id);
      if (previous.includes(optionId)) return { ...current, [currentQuestion.id]: previous.filter((id) => id !== optionId) };
      if (exclusiveOptions.has(optionId)) return { ...current, [currentQuestion.id]: [optionId] };
      const next = [...previous.filter((id) => !exclusiveOptions.has(id)), optionId];
      return { ...current, [currentQuestion.id]: currentQuestion.max && next.length > currentQuestion.max ? next.slice(1) : next };
    });
  };
  const restart = () => {
    setAnswers({}); setIndex(0); setFinished(false); setStarted(true);
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
          <p className="eyebrow">17 題職涯小測驗</p>
          <h1>找到三個<br />可以先試的職位。</h1>
          <p>約 5 分鐘。完成後會看到偏好比例與三個文組通用職位。</p>
          <button className="primary-action" onClick={() => setStarted(true)}>開始測驗 <span>→</span></button>
          <Link className="text-link" href="/resume">前往履歷生成器</Link>
          <small>不登入、不上傳，重新整理後答案即清空。</small>
        </section>
      </main>
    );
  }

  if (finished && result) {
    return (
      <main className="page-shell result-page" ref={stageRef}>
        <header className="result-heading">
          <p className="eyebrow">測驗結果</p>
          <h1>{result.profile.name ? `${result.profile.name} 的` : "你的"}職涯偏好</h1>
          <p>匹配度代表探索方向接近程度，不是錄取機率。</p>
        </header>
        <div className="result-grid">
          <section className="ratio-panel">
            <h2>偏好比例</h2>
            <div className="ratio-list">
              {result.dimensions.map((dimension) => (
                <div className="ratio-row" key={dimension.key}>
                  <div><span>{dimension.label}</span><strong>{dimension.percentage}%</strong></div>
                  <div className="ratio-track"><i style={{ width: `${dimension.percentage}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
          <section className="role-panel">
            <div className="section-title"><h2>推薦職位</h2><span>文組通用</span></div>
            <div className="role-list">
              {result.roles.map((role, roleIndex) => (
                <article className="role-card" key={role.id}>
                  <span className="role-rank">0{roleIndex + 1}</span>
                  <div><h3>{role.title}</h3><p>{role.reason}</p></div>
                  <strong>{role.match}<small>%</small></strong>
                </article>
              ))}
            </div>
          </section>
        </div>
        <section className="signal-summary">
          <h2>關鍵線索</h2>
          <SignalGroup title="偏好活動" items={result.activityPreferences} empty="尚未選擇" />
          <SignalGroup title="工作價值" items={result.workValues} empty="尚未選擇" />
          <SignalGroup title="能力線索" items={result.capabilities} empty="尚未提供" />
        </section>
        <div className="result-actions">
          <Link className="primary-action" href="/resume">建立履歷 <span>→</span></Link>
          <button className="secondary-action" onClick={downloadResult}>下載結果</button>
          <button className="text-link" onClick={restart}>重新測驗</button>
        </div>
      </main>
    );
  }

  return (
    <main className="quiz-run page-shell" ref={stageRef}>
      <div className="quiz-topline"><strong>{question.dimension}</strong><p>{index + 1} / {QUESTIONS.length}</p></div>
      <div className="progress-track" aria-label={`測驗進度 ${index + 1} / ${QUESTIONS.length}`}><i style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }} /></div>
      <article className="question-card">
        <header><span>{question.kind === "multi" ? `最多選 ${question.max ?? "多"} 項` : question.kind === "single" ? "請選 1 項" : question.kind === "free" ? "可留空" : "可複選"}</span><h1>{question.title}</h1>{question.hint && <p>{question.hint}</p>}</header>
        <QuestionInput question={question} answers={answers} onChoice={updateChoice} onText={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))} />
        <footer><button className="back-action" disabled={index === 0} onClick={() => goTo(index - 1)}>← 上一題</button><button className="next-action" onClick={() => index === QUESTIONS.length - 1 ? setFinished(true) : goTo(index + 1)}>{index === QUESTIONS.length - 1 ? "看結果" : "下一題"} →</button></footer>
      </article>
    </main>
  );
}

function QuestionInput({ question, answers, onChoice, onText }: { question: Question; answers: Answers; onChoice: (question: Question, optionId: string) => void; onText: (value: string) => void }) {
  if (question.kind === "free") return <textarea className="free-input" rows={5} value={text(answers, question.id)} onChange={(event) => onText(event.target.value)} placeholder={question.placeholder} autoFocus />;
  if (question.kind === "evidence-source" && list(answers, "D1").filter((id) => id !== "D1-7").length === 0) return <div className="skip-message"><strong>上一題沒有選擇能力線索</strong><p>可以直接前往下一題。</p></div>;
  const selected = list(answers, question.id);
  return <div className="option-list">{question.options?.map((option) => { const isSelected = selected.includes(option.id); return <button type="button" className={`quiz-option ${isSelected ? "selected" : ""}`} aria-pressed={isSelected} onClick={() => onChoice(question, option.id)} key={option.id}><span className="option-copy"><strong>{option.label}</strong>{option.desc && <small>{option.desc}</small>}</span><i aria-hidden="true">{isSelected ? "✓" : "+"}</i></button>; })}</div>;
}

function SignalGroup({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <div className="signal-group"><h3>{title}</h3><div>{items.length ? items.map((item) => <span key={item}>{item}</span>) : <span>{empty}</span>}</div></div>;
}
