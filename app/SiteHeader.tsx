import Link from "next/link";

export function SiteHeader({ active }: { active: "quiz" | "resume" }) {
  return (
    <header className="site-header">
      <Link className="brand" href="/quiz" aria-label="Career Test 首頁">
        <span className="brand-mark" aria-hidden="true"><i /><b /></span>
        <span><strong>CAREER TEST</strong><small>職涯性格測驗</small></span>
      </Link>
      <nav className="main-nav" aria-label="主要功能">
        <Link className={active === "quiz" ? "active" : ""} href="/quiz">
          <span>01</span> 15 題小測驗
        </Link>
        <Link className={active === "resume" ? "active" : ""} href="/resume">
          <span>02</span> 履歷生成器
        </Link>
      </nav>
    </header>
  );
}
