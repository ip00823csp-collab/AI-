"use client";

import { useState } from "react";
import type { JdMatchResult, ResumeData } from "@/lib/types/resume";

interface Props {
  resume: ResumeData;
}

export function JdMatcher({ resume }: Props) {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<JdMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!jd.trim()) {
      setError("请粘贴 JD 文本");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/jd-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, resume }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "匹配失败");
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white border border-zinc-200 rounded-md p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-700 mb-3 tracking-wide">JD 匹配评分</h2>
      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        rows={6}
        placeholder="粘贴目标岗位的 JD（职位描述）…"
        className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="mt-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "AI 评估中…" : "✨ 开始匹配"}
      </button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {result && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(result.overallScore)}
            </div>
            <div className="text-xs text-zinc-500">/ 100 总体匹配度</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <KeywordGroup title="✓ 已命中" items={result.matchedKeywords} color="green" />
            <KeywordGroup title="✗ 缺失" items={result.missingKeywords} color="red" />
          </div>
          {result.suggestions?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-600 mb-2">修改建议</h3>
              <ul className="space-y-1.5">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 rounded p-2">
                    <span className="font-medium text-blue-700">[{s.section}]</span> {s.advice}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
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
      <h3 className="text-xs font-semibold text-zinc-600 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.length === 0 && <span className="text-xs text-zinc-400">—</span>}
        {items.map((k, i) => (
          <span key={i} className={`px-2 py-0.5 text-xs border rounded ${colorClass}`}>
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
