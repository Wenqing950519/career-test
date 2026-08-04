import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the quiz and resume routes", async () => {
  const [quizResponse, resumeResponse] = await Promise.all([render("/quiz"), render("/resume")]);
  assert.equal(quizResponse.status, 200);
  assert.equal(resumeResponse.status, 200);

  const [quizHtml, resumeHtml] = await Promise.all([quizResponse.text(), resumeResponse.text()]);
  assert.match(quizHtml, /17 題小測驗/);
  assert.match(quizHtml, /不是決定你適合什麼/);
  assert.match(quizHtml, /不登入、不上傳、不保留/);
  assert.match(resumeHtml, /履歷生成器/);
  assert.match(resumeHtml, /把做過的事/);
  assert.match(resumeHtml, /列印／儲存 PDF/);
});

test("keeps exactly 17 questions and no browser persistence", async () => {
  const [quizData, quizComponent, resumeComponent, page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/quiz/quiz-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/quiz/QuizExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/resume/ResumeBuilder.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.equal(quizData.match(/id: "[A-F][0-9]"/g)?.length, 17);
  assert.doesNotMatch(`${quizComponent}\n${resumeComponent}`, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.match(page, /redirect\("\/quiz"\)/);
  assert.doesNotMatch(layout, /codex-preview|Starter Project|_sites-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
