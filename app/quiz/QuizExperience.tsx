"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { LABELS, QUESTIONS, type Question } from "./quiz-data";

type Answers = Record<string, string | string[]>;
type DimensionKey = "analysis" | "creative" | "people" | "influence" | "structure" | "handsOn";
type DimensionResult = { key: DimensionKey; label: string; percentage: number };
type Personality = { name: string; tagline: string; dimensions: string; image: string; color: string };
type RoleResult = { id: string; title: string; match: number; reason: string; salary: string; description: string; searchUrl: string };
type QuizResult = {
  profile: { learningStage: string };
  personality: Personality;
  dimensions: DimensionResult[];
  roles: RoleResult[];
  activityPreferences: string[];
  workValues: string[];
  capabilities: string[];
  teamPreferences: string[];
  constraints: string[];
  generatedAt: string;
};

type RoleProfile = {
  id: string;
  title: string;
  category: string;
  salary: string;
  description: string;
  weights: Record<DimensionKey, number>;
  domainSignals: string[];
  capabilitySignals: string[];
  teamSignals?: string[];
};

const DIMENSIONS: Array<{ key: DimensionKey; label: string }> = [
  { key: "analysis", label: "分析研究" }, { key: "creative", label: "創意表達" },
  { key: "people", label: "助人協作" }, { key: "influence", label: "推動影響" },
  { key: "structure", label: "流程整理" }, { key: "handsOn", label: "動手實作" },
];

const w = (analysis: number, creative: number, people: number, influence: number, structure: number, handsOn: number) => ({ analysis, creative, people, influence, structure, handsOn });
const role = (id: string, title: string, category: string, salary: string, description: string, weights: Record<DimensionKey, number>, domainSignals: string[], capabilitySignals: string[], teamSignals: string[] = []): RoleProfile => ({ id, title, category, salary, description, weights, domainSignals, capabilitySignals, teamSignals });

const ROLE_POOL: RoleProfile[] = [
  role("digital-marketing", "數位行銷企劃", "行銷與內容", "32K–38K", "廣告投放、成效追蹤與 A/B 測試，是企業數位轉型的常見入門角色。", w(.16,.20,.15,.22,.20,.07), ["E1-3","E1-4","E1-7"], ["D1-1","D1-2","D1-5","D1-6"], ["C4-2"]),
  role("social-media", "社群經營專員", "行銷與內容", "30K–35K", "經營 FB、IG、Threads 與 LINE，規劃貼文並追蹤社群互動。", w(.12,.28,.18,.25,.12,.05), ["E1-3","E1-7"], ["D1-1","D1-5"], ["C4-1"]),
  role("content-copy", "內容編輯／文案", "行銷與內容", "32K–38K", "撰寫文章、SEO 內容、電子報與產品文案，媒體與電商皆有需求。", w(.20,.38,.08,.10,.19,.05), ["E1-1","E1-2","E1-7"], ["D1-1","D1-5"], ["C4-3"]),
  role("video-content", "影音內容企劃", "行銷與內容", "33K–40K", "規劃 YouTube、TikTok、Reels 腳本，並參與拍攝與剪輯。", w(.12,.30,.12,.18,.20,.08), ["E1-4","E1-7"], ["D1-1","D1-5","D1-6"], ["C4-1","C4-3"]),
  role("public-relations", "公關企劃", "行銷與內容", "33K–40K", "處理媒體關係、議題操作與危機溝通，可在代理商或企業品牌端發展。", w(.10,.21,.23,.27,.14,.05), ["E1-1","E1-3","E1-7"], ["D1-1","D1-4","D1-5"], ["C4-2"]),
  role("product-pm", "產品企劃／PM", "科技與數據", "38K–45K", "做需求訪談、規格撰寫與跨部門協調，是文組進入科技業的常見路徑。", w(.22,.18,.18,.20,.17,.05), ["E1-3","E1-4"], ["D1-1","D1-2","D1-4","D1-6"], ["C4-2"]),
  role("ux-research", "UX 研究員", "科技與數據", "38K–45K", "執行使用者訪談、可用性測試與研究報告，重視洞察與同理。", w(.28,.18,.25,.10,.14,.05), ["E1-2","E1-4"], ["D1-1","D1-2","D1-4"], ["C4-2"]),
  role("data-analyst", "數據分析師", "科技與數據", "38K–45K", "以 Excel、GA4 或 SQL 整理資料、找出洞察，電商與 SaaS 都有需求。", w(.38,.10,.12,.08,.27,.05), ["E1-3","E1-4"], ["D1-2","D1-6"], ["C4-2","C4-3"]),
  role("project-management", "專案管理專員", "營運與電商", "35K–42K", "負責跨部門協調、進度追蹤與資源調度，讓專案準時落地。", w(.18,.08,.18,.18,.33,.05), ["E1-2","E1-3","E1-4"], ["D1-4","D1-6"], ["C4-2"]),
  role("ecommerce-ops", "電商營運專員", "營運與電商", "32K–38K", "管理商品上下架、平台活動、訂單與庫存，適合兼具數字感與執行力的人。", w(.20,.10,.15,.15,.33,.07), ["E1-3","E1-4"], ["D1-2","D1-6"], ["C4-2"]),
  role("operations", "營運協調專員", "營運與電商", "32K–38K", "優化內部流程、建立 SOP 並串接部門，是組織穩定運作的關鍵。", w(.18,.05,.18,.11,.43,.05), ["E1-2","E1-3","E1-4"], ["D1-4","D1-6"], ["C4-2"]),
  role("international-sales", "國外業務／貿易", "業務與商務", "35K–45K+", "運用外語處理進出口、客戶開發與商務協調，適合出口導向產業。", w(.14,.09,.25,.34,.13,.05), ["E1-1","E1-3","E1-4"], ["D1-1","D1-4","D1-6"], ["C4-4"]),
  role("domestic-sales", "國內業務專員", "業務與商務", "30K–35K＋獎金", "進行 B2B 或 B2C 銷售、客戶拜訪與報價談判，成長與收入彈性高。", w(.12,.08,.28,.35,.12,.05), ["E1-3","E1-4"], ["D1-1","D1-4"], ["C4-2"]),
  role("business-development", "商務開發專員", "業務與商務", "35K–42K", "尋找合作夥伴、談授權並開拓新市場，兼具策略與關係經營。", w(.16,.12,.22,.30,.15,.05), ["E1-3","E1-4"], ["D1-1","D1-2","D1-4"], ["C4-1","C4-4"]),
  role("hr-recruiting", "人資／招募專員", "人資與行政", "32K–40K", "負責履歷篩選、面試安排、員工關係與教育訓練規劃。", w(.14,.07,.34,.18,.22,.05), ["E1-2","E1-3"], ["D1-1","D1-4","D1-6"], ["C4-2"]),
  role("administration", "行政／總務專員", "人資與行政", "28K–33K", "處理文書、採購、設備與環境管理，適合重視秩序與穩定節奏的人。", w(.12,.05,.15,.08,.50,.10), ["E1-2","E1-3"], ["D1-4","D1-6"], ["C4-2","C4-3"]),
  role("visual-design", "視覺設計師", "設計與創意", "30K–38K", "製作品牌視覺、平面與社群圖文，需要用作品集展現美感與執行力。", w(.12,.38,.08,.10,.20,.12), ["E1-1","E1-7"], ["D1-5","D1-6"], ["C4-1","C4-3"]),
  role("uiux-design", "UI/UX 設計師", "設計與創意", "35K–45K", "規劃介面與使用者流程，是文組跨入科技產品設計的熱門選項。", w(.18,.30,.15,.10,.20,.07), ["E1-4","E1-7"], ["D1-2","D1-4","D1-5","D1-6"], ["C4-1","C4-2"]),
  role("learning-design", "教育訓練／課程企劃", "教育與服務", "32K–40K", "規劃企業內訓或線上課程，把知識整理成好理解的學習體驗。", w(.13,.18,.33,.13,.18,.05), ["E1-1","E1-2"], ["D1-1","D1-4","D1-6"], ["C4-1","C4-2"]),
  role("customer-success", "客戶成功專員", "教育與服務", "35K–42K", "引導客戶使用 SaaS、解決問題並維護續約關係，兼具服務與產品理解。", w(.14,.07,.33,.22,.19,.05), ["E1-3","E1-4"], ["D1-1","D1-4","D1-6"], ["C4-2","C4-4"]),
  role("event-planning", "活動企劃專員", "教育與服務", "30K–38K", "籌辦記者會、校園招募或品牌活動，需要協調、臨場反應與執行力。", w(.07,.18,.20,.22,.25,.08), ["E1-2","E1-3","E1-7"], ["D1-4","D1-5","D1-6"], ["C4-1","C4-2"]),
  role("creator", "自媒體／內容創作者", "公共與社會", "收入浮動", "經營個人品牌與影音、圖文或 Podcast，收入可能來自接案、業配與課程。", w(.10,.35,.12,.25,.13,.05), ["E1-1","E1-7"], ["D1-1","D1-5"], ["C4-1","C4-3"]),
  role("public-sector", "公部門／約聘人員", "公共與社會", "32K–38K", "在政府機關或國營相關單位協助專案與行政，工作穩定但需留意聘期。", w(.16,.10,.25,.15,.29,.05), ["E1-2","E1-8"], ["D1-1","D1-4","D1-6"], ["C4-2"]),
  role("ngo-project", "NGO／社會企業專案", "公共與社會", "30K–36K", "執行非營利或社會企業專案，適合在意公共議題與社會影響的人。", w(.14,.12,.28,.16,.25,.05), ["E1-2","E1-8"], ["D1-1","D1-4","D1-6"], ["C4-1"]),
];

const PERSONALITIES: Record<string, Personality> = {
  "analysis+creative": { name: "數據創作者型", tagline: "用數字說故事的人", dimensions: "分析 × 創意", image: "/characters/data-creator.png", color: "#4e83a8" },
  "analysis+people": { name: "知識偵探型", tagline: "追真相也懂人心", dimensions: "分析 × 助人", image: "/characters/knowledge-detective.png", color: "#4f8d77" },
  "analysis+influence": { name: "策略推手型", tagline: "用邏輯推動改變", dimensions: "分析 × 影響", image: "/characters/strategy-catalyst.png", color: "#b37935" },
  "analysis+structure": { name: "系統建築師型", tagline: "把混亂變秩序", dimensions: "分析 × 流程", image: "/characters/systems-architect.png", color: "#3f8993" },
  "analysis+handsOn": { name: "實驗工匠型", tagline: "動手驗證假設", dimensions: "分析 × 實作", image: "/characters/experiment-craftsperson.png", color: "#b55c4c" },
  "creative+people": { name: "共感創作者型", tagline: "懂人也懂表達", dimensions: "創意 × 助人", image: "/characters/empathic-creator.png", color: "#538b70" },
  "creative+influence": { name: "魅力發射台型", tagline: "創意感染全場", dimensions: "創意 × 影響", image: "/characters/charisma-broadcaster.png", color: "#b95f83" },
  "creative+structure": { name: "美學策展人型", tagline: "用美感建結構", dimensions: "創意 × 流程", image: "/characters/aesthetic-curator.png", color: "#498c98" },
  "creative+handsOn": { name: "手感藝術家型", tagline: "把創意做出來", dimensions: "創意 × 實作", image: "/characters/tactile-artist.png", color: "#bb6650" },
  "people+influence": { name: "連結隊長型", tagline: "帶人又帶心", dimensions: "助人 × 影響", image: "/characters/connection-captain.png", color: "#aa7738" },
  "people+structure": { name: "守護後盾型", tagline: "默默撐住全場", dimensions: "助人 × 流程", image: "/characters/guardian-support.png", color: "#3e858a" },
  "people+handsOn": { name: "實踐照顧者型", tagline: "用雙手照顧人", dimensions: "助人 × 實作", image: "/characters/practical-caregiver.png", color: "#b65c4c" },
  "influence+structure": { name: "效率指揮官型", tagline: "推動又把關", dimensions: "影響 × 流程", image: "/characters/efficiency-commander.png", color: "#4f8790" },
  "influence+handsOn": { name: "行動開路者型", tagline: "邊做邊帶頭", dimensions: "影響 × 實作", image: "/characters/action-pathfinder.png", color: "#bd6049" },
  "structure+handsOn": { name: "穩定工程師型", tagline: "按部就班做出來", dimensions: "流程 × 實作", image: "/characters/steady-engineer.png", color: "#a85e4d" },
};

const exclusiveOptions = new Set(["C1-5", "C2-skip", "C3-7", "C4-5", "D1-7", "E1-9", "F1-8"]);
const dimensionOrder: DimensionKey[] = ["analysis", "creative", "people", "influence", "structure", "handsOn"];
const label = (id: string) => LABELS[id] ?? id;
const list = (answers: Answers, id: string) => Array.isArray(answers[id]) ? answers[id] as string[] : [];

function calculateDimensions(answers: Answers): DimensionResult[] {
  const scores: Record<DimensionKey, number> = { analysis: 0, creative: 0, people: 0, influence: 0, structure: 0, handsOn: 0 };
  const add = (key: DimensionKey | undefined, value: number) => { if (key) scores[key] = Math.max(0, scores[key] + value); };
  const activityMap: Record<string, DimensionKey> = {
    "A1-1":"handsOn","A1-2":"analysis","A1-3":"creative","A1-4":"people","A1-5":"influence","A1-6":"structure",
    "A2-1":"handsOn","A2-2":"analysis","A2-3":"creative","A2-4":"people","A2-5":"influence","A2-6":"structure",
    "A3-1":"handsOn","A3-2":"analysis","A3-3":"creative","A3-4":"people","A3-5":"influence","A3-6":"structure",
    "D1-2":"analysis","D1-3":"handsOn","D1-4":"people","D1-5":"creative","D1-6":"structure",
  };
  list(answers,"A1").forEach((id) => add(activityMap[id],4));
  list(answers,"A2").forEach((id) => add(activityMap[id],3));
  list(answers,"A3").forEach((id) => add(activityMap[id],4));
  list(answers,"D1").forEach((id) => id === "D1-1" ? (add("creative",1), add("influence",1)) : add(activityMap[id],2));

  const valueMap: Record<string, DimensionKey> = { "B1-1":"creative","B1-2":"creative","B1-3":"influence","B1-4":"people","B1-5":"structure","B1-6":"structure", "B2-1":"creative","B2-2":"creative","B2-3":"influence","B2-4":"people","B2-5":"structure","B2-6":"structure" };
  list(answers,"B1").forEach((id) => add(valueMap[id],1));
  list(answers,"B2").forEach((id) => add(valueMap[id],2));
  const b3Map: Record<string, DimensionKey> = { "B3-1":"analysis","B3-2":"people","B3-3":"influence","B3-4":"structure" };
  list(answers,"B3").forEach((id) => add(b3Map[id],1));

  const contextMap: Record<string, DimensionKey> = { "C1-1":"people","C1-2":"analysis","C1-3":"handsOn","C1-4":"creative","C2-1":"structure","C2-2":"creative","C2-3":"analysis","C2-4":"analysis","C2-5":"influence","C2-6":"influence" };
  [...list(answers,"C1"),...list(answers,"C2")].forEach((id) => add(contextMap[id],1));
  list(answers,"C3").forEach((id) => {
    if (id === "C3-1") add("people",1);
    if (id === "C3-2" || id === "C3-3") add("people",-1);
    if (id === "C3-4") add("handsOn",1);
    if (id === "C3-5" || id === "C3-6") add("structure",1);
  });

  const total = Object.values(scores).reduce((sum,value) => sum + value,0);
  const exact = DIMENSIONS.map(({key,label: dimensionLabel}) => ({ key, label: dimensionLabel, exact: total ? scores[key] / total * 100 : 100 / DIMENSIONS.length }));
  const percentages = exact.map((item) => Math.floor(item.exact));
  let remainder = 100 - percentages.reduce((sum,value) => sum + value,0);
  exact.map((item,index) => ({index,fraction:item.exact-percentages[index]})).sort((a,b) => b.fraction-a.fraction).forEach(({index}) => { if (remainder > 0) { percentages[index] += 1; remainder -= 1; } });
  return exact.map(({key,label: dimensionLabel},index) => ({key,label:dimensionLabel,percentage:percentages[index]}));
}

function getPersonality(dimensions: DimensionResult[]): Personality {
  const top = [...dimensions].sort((a,b) => b.percentage-a.percentage || dimensionOrder.indexOf(a.key)-dimensionOrder.indexOf(b.key)).slice(0,2).map((item) => item.key).sort((a,b) => dimensionOrder.indexOf(a)-dimensionOrder.indexOf(b));
  return PERSONALITIES[top.join("+")] ?? PERSONALITIES["analysis+creative"];
}

function pickRoles(answers: Answers, dimensions: DimensionResult[]): RoleResult[] {
  const profile = Object.fromEntries(dimensions.map((item) => [item.key,item.percentage/100])) as Record<DimensionKey,number>;
  const domains = list(answers,"E1"); const capabilities = list(answers,"D1"); const teams = list(answers,"C4");
  const topLabels = [...dimensions].sort((a,b) => b.percentage-a.percentage).slice(0,2).map((item) => item.label);
  return ROLE_POOL.map((item) => {
    const distance = DIMENSIONS.reduce((sum,{key}) => sum + Math.abs(profile[key]-item.weights[key]),0);
    const similarity = Math.max(0,1-distance/2);
    const domain = item.domainSignals.find((id) => domains.includes(id));
    const domainBonus = domain ? 3 : 0;
    const capabilityBonus = item.capabilitySignals.some((id) => capabilities.includes(id)) ? 3 : 0;
    const teamBonus = item.teamSignals?.some((id) => teams.includes(id)) ? 2 : 0;
    const match = Math.min(96,Math.max(58,Math.round(46+similarity*48+domainBonus+capabilityBonus+teamBonus)));
    return { id:item.id, title:item.title, match, salary:item.salary, description:item.description, searchUrl:`https://www.104.com.tw/jobs/search/?keyword=${encodeURIComponent(item.title)}`, reason: domain ? `${topLabels.join("、")}較突出，也對${label(domain)}有興趣` : `${topLabels.join("、")}是目前較突出的偏好` };
  }).sort((a,b) => b.match-a.match).slice(0,3);
}

function buildResult(answers: Answers): QuizResult {
  const dimensions = calculateDimensions(answers);
  return {
    profile:{learningStage:list(answers,"F4").map(label)[0] ?? ""}, personality:getPersonality(dimensions), dimensions, roles:pickRoles(answers,dimensions),
    activityPreferences:[...list(answers,"A1"),...list(answers,"A3")].filter((id) => !id.endsWith("skip")).map(label),
    workValues:[...list(answers,"B1"),...list(answers,"B2")].filter((id) => !id.endsWith("skip")).map(label),
    capabilities:list(answers,"D1").filter((id) => id !== "D1-7").map(label), teamPreferences:list(answers,"C4").map(label),
    constraints:list(answers,"F1").filter((id) => id !== "F1-8").map(label), generatedAt:new Date().toISOString(),
  };
}

export function QuizExperience() {
  const [started,setStarted] = useState(false); const [index,setIndex] = useState(0); const [answers,setAnswers] = useState<Answers>({}); const [finished,setFinished] = useState(false); const [shareMessage,setShareMessage] = useState("");
  const stageRef = useRef<HTMLDivElement>(null); const question = QUESTIONS[index]; const result = useMemo(() => finished ? buildResult(answers) : null,[answers,finished]);
  const goTo = (next:number) => { setIndex(Math.max(0,Math.min(QUESTIONS.length-1,next))); requestAnimationFrame(() => stageRef.current?.scrollIntoView({behavior:"smooth",block:"start"})); };
  const updateChoice = (currentQuestion:Question,optionId:string) => setAnswers((current) => {
    if (currentQuestion.kind === "single") return {...current,[currentQuestion.id]:[optionId]};
    const previous = list(current,currentQuestion.id);
    if (previous.includes(optionId)) return {...current,[currentQuestion.id]:previous.filter((id) => id !== optionId)};
    if (exclusiveOptions.has(optionId)) return {...current,[currentQuestion.id]:[optionId]};
    const next = [...previous.filter((id) => !exclusiveOptions.has(id)),optionId];
    return {...current,[currentQuestion.id]:currentQuestion.max && next.length > currentQuestion.max ? next.slice(1) : next};
  });
  const restart = () => { setAnswers({}); setIndex(0); setFinished(false); setStarted(true); setShareMessage(""); requestAnimationFrame(() => stageRef.current?.scrollIntoView({behavior:"smooth"})); };
  const downloadResult = () => { if (!result) return; const blob = new Blob([JSON.stringify(result,null,2)],{type:"application/json;charset=utf-8"}); const url=URL.createObjectURL(blob); const anchor=document.createElement("a"); anchor.href=url; anchor.download="career-town-quiz-result.json"; anchor.click(); URL.revokeObjectURL(url); };
  const shareResult = async () => { if (!result) return; const shareData={title:`我是${result.personality.name}`,text:`我的職涯人格是「${result.personality.name}」：${result.personality.tagline}。`,url:window.location.href}; try { if (navigator.share) await navigator.share(shareData); else { await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`); setShareMessage("結果連結已複製"); } } catch { setShareMessage(""); } };

  if (!started) return <main className="quiz-landing page-shell"><section className="quiz-hero"><p className="eyebrow">15 題職涯小測驗</p><h1>找到三個<br />可以先試的職位。</h1><p>約 5 分鐘。完成後會看到你的職涯人格、六維偏好與三個適合大學生探索的台灣職位。</p><button className="primary-action" onClick={() => setStarted(true)}>開始測驗 <span>→</span></button><Link className="text-link" href="/resume">前往履歷生成器</Link><small>不登入、不上傳，重新整理後答案即清空。</small></section></main>;

  if (finished && result) return (
    <main className="page-shell result-page" ref={stageRef}>
      <header className="result-heading"><p className="eyebrow">測驗結果 · {result.profile.learningStage || "職涯探索中"}</p><h1>你是<span style={{color:result.personality.color}}>【{result.personality.name}】</span></h1><p>匹配度代表探索方向接近程度，不是錄取機率；薪資為修訂稿提供的入門月薪參考。</p></header>
      <section className="personality-hero" style={{"--personality-color":result.personality.color} as React.CSSProperties}>
        <div className="personality-copy"><span>{result.personality.dimensions}</span><h2>{result.personality.tagline}</h2><p>你的前兩項核心偏好組成這個人格標籤。它不是能力定論，而是一張幫你選擇下一個小實驗的地圖。</p><button className="secondary-action" onClick={shareResult}>分享結果</button>{shareMessage && <small role="status">{shareMessage}</small>}</div>
        <div className="personality-portrait"><Image src={result.personality.image} width={620} height={620} priority unoptimized alt={`${result.personality.name}人物插畫`} /></div>
      </section>
      <div className="result-grid">
        <section className="ratio-panel"><h2>偏好比例</h2><div className="ratio-list">{result.dimensions.map((dimension) => <div className="ratio-row" key={dimension.key}><div><span>{dimension.label}</span><strong>{dimension.percentage}%</strong></div><div className="ratio-track"><i style={{width:`${dimension.percentage}%`}} /></div></div>)}</div></section>
        <section className="role-panel"><div className="section-title"><h2>推薦職位</h2><span>台灣職涯探索</span></div><div className="role-list">{result.roles.map((item,roleIndex) => <article className="role-card result-role-card" key={item.id}><span className="role-rank">0{roleIndex+1}</span><div><div className="role-card-heading"><h3>{item.title}</h3><b>{item.salary}</b></div><p>{item.reason}</p><small>{item.description}</small><a href={item.searchUrl} target="_blank" rel="noreferrer">到 104 查看職缺 ↗</a></div><strong>{item.match}<small>%</small></strong></article>)}</div></section>
      </div>
      <section className="signal-summary"><h2>關鍵線索</h2><SignalGroup title="偏好活動" items={result.activityPreferences} empty="尚未選擇"/><SignalGroup title="工作價值" items={result.workValues} empty="尚未選擇"/><SignalGroup title="能力線索" items={result.capabilities} empty="尚未提供"/><SignalGroup title="團隊偏好" items={result.teamPreferences} empty="開放探索"/><SignalGroup title="現實條件" items={result.constraints} empty="目前沒有硬限制"/></section>
      <div className="result-actions"><Link className="primary-action" href="/resume">建立履歷 <span>→</span></Link><button className="secondary-action" onClick={downloadResult}>下載結果</button><button className="text-link" onClick={restart}>重新測驗</button></div>
    </main>
  );

  return <main className="quiz-run page-shell" ref={stageRef}><div className="quiz-topline"><strong>{question.dimension}</strong><p>{index+1} / {QUESTIONS.length}</p></div><div className="progress-track" aria-label={`測驗進度 ${index+1} / ${QUESTIONS.length}`}><i style={{width:`${(index+1)/QUESTIONS.length*100}%`}} /></div><article className="question-card"><header><span>{question.kind === "multi" ? `最多選 ${question.max ?? "多"} 項` : question.kind === "single" ? "請選 1 項" : question.kind === "free" ? "可留空" : "可複選"}</span><h1>{question.title}</h1>{question.hint && <p>{question.hint}</p>}</header><QuestionInput question={question} answers={answers} onChoice={updateChoice}/><footer><button className="back-action" disabled={index===0} onClick={() => goTo(index-1)}>← 上一題</button><button className="next-action" onClick={() => index===QUESTIONS.length-1 ? setFinished(true) : goTo(index+1)}>{index===QUESTIONS.length-1 ? "看結果" : "下一題"} →</button></footer></article></main>;
}

function QuestionInput({question,answers,onChoice}:{question:Question;answers:Answers;onChoice:(question:Question,optionId:string)=>void}) {
  if (question.kind === "evidence-source" && list(answers,"D1").filter((id) => id !== "D1-7").length === 0) return <div className="skip-message"><strong>上一題沒有選擇能力線索</strong><p>可以直接前往下一題。</p></div>;
  const selected=list(answers,question.id);
  return <div className="option-list">{question.options?.map((option) => { const isSelected=selected.includes(option.id); return <button type="button" className={`quiz-option ${isSelected ? "selected" : ""}`} aria-pressed={isSelected} onClick={() => onChoice(question,option.id)} key={option.id}><span className="option-copy"><strong>{option.label}</strong>{option.desc && <small>{option.desc}</small>}</span><i aria-hidden="true">{isSelected ? "✓" : "+"}</i></button>; })}</div>;
}

function SignalGroup({title,items,empty}:{title:string;items:string[];empty:string}) { return <div className="signal-group"><h3>{title}</h3><div>{items.length ? items.map((item) => <span key={item}>{item}</span>) : <span>{empty}</span>}</div></div>; }
