"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type ReactNode } from "react";

type Education = { school: string; major: string; degree: string; time: string; details: string };
type ExperienceCategory = "實習經歷" | "實踐經歷" | "校園經歷";
type Experience = { category: ExperienceCategory; title: string; role: string; time: string; details: string };
type ResumeDraft = {
  photo: string;
  name: string;
  birthDate: string;
  phone: string;
  status: string;
  email: string;
  city: string;
  certifications: string;
  skills: string;
  hobbies: string;
  education: Education[];
  experiences: Experience[];
};

const blankEducation = (): Education => ({ school: "", major: "", degree: "", time: "", details: "" });
const blankExperience = (category: ExperienceCategory): Experience => ({ category, title: "", role: "", time: "", details: "" });
const blankResume = (): ResumeDraft => ({
  photo: "", name: "", birthDate: "", phone: "", status: "", email: "", city: "",
  certifications: "", skills: "", hobbies: "", education: [blankEducation()],
  experiences: [blankExperience("實習經歷"), blankExperience("實踐經歷"), blankExperience("校園經歷")],
});
const splitLines = (value: string) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

export function ResumeBuilder() {
  const [resume, setResume] = useState<ResumeDraft>(blankResume);
  const [formOpen, setFormOpen] = useState(true);

  const setField = <K extends keyof ResumeDraft>(key: K, value: ResumeDraft[K]) => setResume((current) => ({ ...current, [key]: value }));
  const updateEducation = (index: number, key: keyof Education, value: string) => setResume((current) => ({
    ...current,
    education: current.education.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
  }));
  const updateExperience = (index: number, key: keyof Experience, value: string) => setResume((current) => ({
    ...current,
    experiences: current.experiences.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
  }));

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      window.alert("照片請控制在 5MB 以內。");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setField("photo", String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const exportJson = () => {
    const payload = {
      basics: {
        name: resume.name,
        email: resume.email || undefined,
        phone: resume.phone || undefined,
        location: resume.city ? { city: resume.city } : undefined,
      },
      education: resume.education.filter((item) => item.school || item.major || item.details).map((item) => ({ institution: item.school, area: item.major, studyType: item.degree, startDate: item.time, summary: item.details })),
      work: resume.experiences.filter((item) => item.category === "實習經歷" && (item.title || item.details)).map((item) => ({ name: item.title, position: item.role, startDate: item.time, summary: item.details })),
      projects: resume.experiences.filter((item) => item.category !== "實習經歷" && (item.title || item.details)).map((item) => ({ name: item.title, description: item.details, roles: item.role ? [item.role] : [], startDate: item.time })),
      certificates: splitLines(resume.certifications).map((name) => ({ name })),
      skills: splitLines(resume.skills).map((name) => ({ name, keywords: [] })),
      interests: resume.hobbies.split(/[、,，]/).map((name) => name.trim()).filter(Boolean).map((name) => ({ name, keywords: [] })),
      meta: { version: "v1.0.0", generatedBy: "Career Town Mini" },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${resume.name.trim() || "resume"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (window.confirm("要清空目前填寫的履歷嗎？這個動作無法復原。")) setResume(blankResume());
  };

  return (
    <main className="resume-page page-shell">
      <section className="resume-heading">
        <div><p className="eyebrow">BUILD IT, ONE STORY AT A TIME</p><h1>把做過的事，<br /><em>整理成看得懂的履歷。</em></h1></div>
        <div><p>左邊填寫，右邊會即時長成一份 A4 履歷。沒有自動潤稿，也不會替你補數字——只把你親自確認的內容排整齊。</p><span className="memory-note"><b aria-hidden="true">●</b> 內容不會上傳或保存，重新整理後即清空</span></div>
      </section>
      <div className="mobile-resume-switch" aria-label="手機版履歷檢視切換">
        <button className={formOpen ? "active" : ""} onClick={() => setFormOpen(true)}>填寫內容</button>
        <button className={!formOpen ? "active" : ""} onClick={() => setFormOpen(false)}>預覽履歷</button>
      </div>
      <div className={`resume-workspace ${formOpen ? "show-form" : "show-preview"}`}>
        <section className="resume-form-panel">
          <div className="form-panel-head"><div><span>FORM</span><h2>履歷內容</h2></div><button className="text-link danger" onClick={reset}>全部清空</button></div>
          <FormSection number="01" title="證件照（選填）">
            <div className="photo-field">
              <label><input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhoto} /><span>{resume.photo ? "更換照片" : "選擇照片"}</span><small>JPG、PNG 或 WebP，5MB 以內</small></label>
              {resume.photo && <button className="text-link danger" onClick={() => setField("photo", "")}>移除</button>}
            </div>
          </FormSection>
          <FormSection number="02" title="基本資料">
            <div className="field-grid">
              <Field label="姓名" value={resume.name} onChange={(value) => setField("name", value)} placeholder="王小明" />
              <Field label="出生年月（選填）" value={resume.birthDate} onChange={(value) => setField("birthDate", value)} placeholder="2003 年 6 月" />
              <Field label="電話" value={resume.phone} onChange={(value) => setField("phone", value)} placeholder="0912-345-678" inputMode="tel" />
              <Field label="身分狀態（選填）" value={resume.status} onChange={(value) => setField("status", value)} placeholder="依投遞地區需要填寫" />
              <Field label="電子郵件" value={resume.email} onChange={(value) => setField("email", value)} placeholder="name@example.com" inputMode="email" />
              <Field label="現居城市" value={resume.city} onChange={(value) => setField("city", value)} placeholder="臺北市" />
            </div>
          </FormSection>
          <FormSection number="03" title="教育背景">
            {resume.education.map((item, index) => (
              <ItemCard label={`第 ${index + 1} 筆`} onRemove={resume.education.length > 1 ? () => setField("education", resume.education.filter((_, itemIndex) => itemIndex !== index)) : undefined} key={index}>
                <div className="field-grid"><Field label="學校" value={item.school} onChange={(value) => updateEducation(index, "school", value)} /><Field label="科系" value={item.major} onChange={(value) => updateEducation(index, "major", value)} /><Field label="學位" value={item.degree} onChange={(value) => updateEducation(index, "degree", value)} placeholder="學士" /><Field label="期間" value={item.time} onChange={(value) => updateEducation(index, "time", value)} placeholder="2023.09 – 2027.06" /></div>
                <Area label="主修課程／說明（每行一點）" value={item.details} onChange={(value) => updateEducation(index, "details", value)} placeholder={'資料結構與演算法\n數位產品設計'} />
              </ItemCard>
            ))}
            <button className="add-action" onClick={() => setField("education", [...resume.education, blankEducation()])}>＋ 新增教育背景</button>
          </FormSection>
          <FormSection number="04" title="資格證書與技能">
            <Area label="資格證書（每行一張）" value={resume.certifications} onChange={(value) => setField("certifications", value)} placeholder={'TOEIC 850\nGoogle Analytics Certification'} />
            <Area label="專業技能（每行一項）" value={resume.skills} onChange={(value) => setField("skills", value)} placeholder={'能獨立完成短影音腳本與剪輯\n能用 Excel 整理與分析問卷資料'} />
          </FormSection>
          {(["實習經歷", "實踐經歷", "校園經歷"] as ExperienceCategory[]).map((category, categoryIndex) => (
            <FormSection number={`0${categoryIndex + 5}`} title={category} key={category}>
              {resume.experiences.map((item, index) => ({ item, index })).filter(({ item }) => item.category === category).map(({ item, index }, visibleIndex) => (
                <ItemCard label={`第 ${visibleIndex + 1} 筆`} onRemove={() => setField("experiences", resume.experiences.filter((_, itemIndex) => itemIndex !== index))} key={`${category}-${index}`}>
                  <div className="field-grid"><Field label={category === "實習經歷" ? "公司／單位" : category === "校園經歷" ? "組織／社團" : "專案／活動名稱"} value={item.title} onChange={(value) => updateExperience(index, "title", value)} /><Field label="角色" value={item.role} onChange={(value) => updateExperience(index, "role", value)} /><Field label="時間（選填）" value={item.time} onChange={(value) => updateExperience(index, "time", value)} placeholder="2025.02 – 2025.06" /></div>
                  <Area label="內容描述（每行一點）" value={item.details} onChange={(value) => updateExperience(index, "details", value)} placeholder={'負責什麼任務、服務誰\n採取了什麼做法\n產生什麼可確認的結果'} />
                </ItemCard>
              ))}
              <button className="add-action" onClick={() => setField("experiences", [...resume.experiences, blankExperience(category)])}>＋ 新增{category}</button>
            </FormSection>
          ))}
          <FormSection number="08" title="愛好與特長">
            <Field label="以逗號分隔" value={resume.hobbies} onChange={(value) => setField("hobbies", value)} placeholder="攝影、羽球、讀書會" />
          </FormSection>
          <div className="form-bottom-note"><span>✦</span><p>填完別忘了右側預覽，使用「列印／儲存 PDF」下載。離開前也可匯出 JSON 備份到自己的裝置。</p></div>
        </section>
        <aside className="resume-preview-panel">
          <div className="preview-toolbar"><div><span>LIVE PREVIEW</span><strong>A4 · 即時預覽</strong></div><button className="secondary-action" onClick={exportJson}>匯出 JSON</button><button className="primary-action compact" onClick={() => window.print()}>列印／儲存 PDF</button></div>
          <div className="resume-stage"><div className="resume-scaler"><ResumePaper resume={resume} /></div></div>
          <p className="preview-tip">列印時在系統視窗選擇「另存為 PDF」即可。建議關閉瀏覽器的頁首與頁尾。</p>
        </aside>
      </div>
      <section className="resume-next"><p>還不知道履歷要寫什麼？</p><h2>先從你願意做、做過，或想靠近的事開始。</h2><Link className="text-link" href="/quiz">回去做 17 題小測驗 →</Link></section>
    </main>
  );
}

function FormSection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <section className="form-section"><h2><span>{number}</span>{title}</h2>{children}</section>;
}

function Field({ label, value, onChange, placeholder = "", inputMode }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; inputMode?: "text" | "email" | "tel" }) {
  return <label className="field"><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode={inputMode} /></label>;
}

function Area({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="field"><span>{label}</span><textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function ItemCard({ label, onRemove, children }: { label: string; onRemove?: () => void; children: ReactNode }) {
  return <article className="item-card"><header><span>{label}</span>{onRemove && <button className="text-link danger" onClick={onRemove}>刪除</button>}</header>{children}</article>;
}

function ResumePaper({ resume }: { resume: ResumeDraft }) {
  const info = [["姓　　名", resume.name], ["出生年月", resume.birthDate], ["電　　話", resume.phone], ["身分狀態", resume.status], ["電子郵件", resume.email], ["現居城市", resume.city]].filter(([, value]) => value.trim());
  const education = resume.education.filter((item) => item.school || item.major || item.degree || item.details);
  const groups = (["實習經歷", "實踐經歷", "校園經歷"] as ExperienceCategory[]).map((category) => ({ category, items: resume.experiences.filter((item) => item.category === category && (item.title || item.role || item.details)) })).filter((group) => group.items.length);
  const certifications = splitLines(resume.certifications);
  const skills = splitLines(resume.skills);
  const hobbies = resume.hobbies.split(/[、,，]/).map((item) => item.trim()).filter(Boolean);
  const empty = education.length === 0 && groups.length === 0 && skills.length === 0;

  return (
    <article className="resume-paper" id="resume-paper">
      <h1>個 人 履 歷</h1>
      <div className="resume-basic"><div>{info.length ? info.map(([itemLabel, value]) => <p key={itemLabel}><span>{itemLabel}：</span><strong>{value}</strong></p>) : <p className="resume-empty">左側填入基本資料後，這裡會即時顯示。</p>}</div><div className="resume-photo">{resume.photo ? <img src={resume.photo} alt="證件照" /> : <span>證件照</span>}</div></div>
      {education.length > 0 && <ResumeSection title="教育背景">{education.map((item, index) => <div className="resume-entry" key={index}><div><strong>{[item.school, item.major, item.degree].filter(Boolean).join("｜")}</strong><time>{item.time}</time></div>{splitLines(item.details).length > 0 && <ul>{splitLines(item.details).map((line) => <li key={line}>{line}</li>)}</ul>}</div>)}</ResumeSection>}
      {(certifications.length > 0 || skills.length > 0) && <ResumeSection title="資格證書與技能">{certifications.length > 0 && <p className="resume-inline resume-certifications">{certifications.map((item) => <span key={item}>{item}</span>)}</p>}{skills.length > 0 && <ul>{skills.map((line) => <li key={line}>{line}</li>)}</ul>}</ResumeSection>}
      {groups.map((group) => <ResumeSection title={group.category} key={group.category}>{group.items.map((item, index) => <div className="resume-entry" key={index}><div><strong>{[item.title, item.role].filter(Boolean).join("｜")}</strong><time>{item.time}</time></div>{splitLines(item.details).length > 0 && <ul>{splitLines(item.details).map((line) => <li key={line}>{line}</li>)}</ul>}</div>)}</ResumeSection>)}
      {hobbies.length > 0 && <ResumeSection title="愛好與特長"><p className="resume-inline resume-certifications">{hobbies.map((item) => <span key={item}>{item}</span>)}</p></ResumeSection>}
      {empty && <p className="resume-empty empty-body">還沒有可顯示的段落。先填一段教育背景或經歷，履歷就會長出來。</p>}
    </article>
  );
}

function ResumeSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="resume-section"><h2>{title}</h2><div>{children}</div></section>;
}
