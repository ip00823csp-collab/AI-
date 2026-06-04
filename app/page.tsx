"use client";

import { useState } from "react";

interface PolishResult {
  rewritten: string;
  reason: string;
}

interface MatchResult {
  overallScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: { section: string; advice: string }[];
}

type ResultType = "polish" | "match" | null;

export default function Home() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [polishResult, setPolishResult] = useState<PolishResult | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [activeResult, setActiveResult] = useState<ResultType>(null);
  const [loading, setLoading] = useState<"" | "polish" | "match">("");
  const [error, setError] = useState<string | null>(null);

  const callPolish = async () => {
    if (!resume.trim()) {
      setError("请先粘贴简历内容");
      setActiveResult(null);
      return;
    }
    setLoading("polish");
    setError(null);
    setPolishResult(null);
    setActiveResult("polish");
    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "summary", text: resume }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "润色失败");
      setPolishResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
      setActiveResult(null);
    } finally {
      setLoading("");
    }
  };

  const callMatch = async () => {
    if (!resume.trim() || !jd.trim()) {
      setError("简历内容和 JD 都需要填写");
      setActiveResult(null);
      return;
    }
    setLoading("match");
    setError(null);
    setMatchResult(null);
    setActiveResult("match");
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, resumeText: resume }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "匹配失败");
      setMatchResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
      setActiveResult(null);
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900">AI 简历助手</h1>
          <p className="text-sm text-zinc-500 mt-1">
            粘贴简历 → 一键润色 · 粘贴 JD → 匹配评分
          </p>
        </header>

        <section className="bg-white border border-zinc-200 rounded-lg p-5 mb-4 shadow-sm">
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            简历内容
          </label>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={10}
            placeholder="把你的简历全文粘贴到这里…&#10;&#10;例如：&#10;张三&#10;求职岗位：前端工程师&#10;3 年 React 开发经验…&#10;工作经历：&#10;- 负责公司后台系统重构…"
            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-zinc-400">{resume.length} 字</span>
          </div>
        </section>

        <section className="bg-white border border-zinc-200 rounded-lg p-5 mb-4 shadow-sm">
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            JD 岗位描述 <span className="text-zinc-400 font-normal">(JD 匹配必填)</span>
          </label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={6}
            placeholder="粘贴目标岗位的 JD（职位描述）…"
            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </section>

        <section className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={callPolish}
            disabled={loading !== ""}
            className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "polish" ? "✨ AI 润色中…" : "✨ AI 润色"}
          </button>
          <button
            onClick={callMatch}
            disabled={loading !== ""}
            className="px-5 py-2.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "match" ? "🎯 JD 匹配中…" : "🎯 JD 匹配"}
          </button>
          <button
            onClick={() => {
              setResume("");
              setJd("");
              setPolishResult(null);
              setMatchResult(null);
              setError(null);
              setActiveResult(null);
            }}
            disabled={loading !== ""}
            className="px-5 py-2.5 text-sm bg-white border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50 disabled:opacity-50"
          >
            清空
          </button>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        {activeResult === "polish" && polishResult && (
          <ResultPanel title="✨ AI 润色结果">
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-medium text-zinc-500 mb-1">润色后版本</h3>
                <pre className="bg-zinc-50 border border-zinc-200 rounded-md p-3 text-sm whitespace-pre-wrap font-sans">
                  {polishResult.rewritten}
                </pre>
              </div>
              <div>
                <h3 className="text-xs font-medium text-zinc-500 mb-1">改写思路</h3>
                <p className="text-sm text-zinc-700 bg-blue-50 border border-blue-200 rounded-md p-3">
                  {polishResult.reason}
                </p>
              </div>
              <button
                onClick={() => setResume(polishResult.rewritten)}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
              >
                👈 用润色结果替换简历内容
              </button>
            </div>
          </ResultPanel>
        )}

        {activeResult === "match" && matchResult && (
          <ResultPanel title="🎯 JD 匹配结果">
            <div className="space-y-4">
              <div className="flex items-baseline gap-3 pb-3 border-b border-zinc-200">
                <span className="text-5xl font-bold text-blue-600">
                  {Math.round(matchResult.overallScore)}
                </span>
                <span className="text-zinc-500">/ 100 总体匹配度</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KeywordGroup
                  title="✓ 已命中关键词"
                  items={matchResult.matchedKeywords}
                  color="green"
                />
                <KeywordGroup
                  title="✗ 缺失关键词"
                  items={matchResult.missingKeywords}
                  color="red"
                />
              </div>
              {matchResult.suggestions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-2">
                    📝 修改建议
                  </h3>
                  <ul className="space-y-2">
                    {matchResult.suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm bg-zinc-50 border border-zinc-200 rounded-md p-3"
                      >
                        <span className="font-medium text-blue-700">[{s.section}]</span>{" "}
                        {s.advice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ResultPanel>
        )}

        {!activeResult && !error && (
          <div className="text-center text-sm text-zinc-400 py-8">
            👆 填写内容后点击按钮，结果会显示在这里
          </div>
        )}

        <footer className="mt-12 text-center text-xs text-zinc-400">
          Powered by 智谱 GLM · Next.js {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
}

function ResultPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function KeywordGroup({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "green" | "red";
}) {
  const colorClass =
    color === "green"
      ? "bg-green-50 border-green-200 text-green-800"
      : "bg-red-50 border-red-200 text-red-800";
  return (
    <div>
      <h3 className="text-sm font-medium text-zinc-700 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
        {items.length === 0 ? (
          <span className="text-xs text-zinc-400">—</span>
        ) : (
          items.map((k, i) => (
            <span
              key={i}
              className={`px-2 py-1 text-xs border rounded ${colorClass}`}
            >
              {k}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
