import Link from "next/link";

export function SiteHeader({ active }: { active: "quiz" | "resume" }) {
  return (
    <header className="site-header">
      <Link className="brand" href="/quiz" aria-label="Career Town Mini 首頁">
        <span className="brand-mark" aria-hidden="true"><i /><b /></span>
        <span><strong>Career Town</strong><small>MINI · 職涯小鎮</small></span>
      </Link>
      <nav className="main-nav" aria-label="主要功能">
        <Link className={active === "quiz" ? "active" : ""} href="/quiz">
          <span>01</span> 17 題小測驗
        </Link>
        <Link className={active === "resume" ? "active" : ""} href="/resume">
          <span>02</span> 履歷生成器
        </Link>
      </nav>
      <p className="privacy-note"><span aria-hidden="true">●</span> 不儲存資料</p>
    </header>
  );
}
