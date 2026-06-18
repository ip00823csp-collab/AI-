"use client";

import { useState } from "react";
import { callEnhancedMatch, type EnhancedMatchResult } from "@/lib/api/rag";
import RagResults from "@/components/RagResults";

export default function RagIntegrationExample() {
  const [jd, setJd] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [track, setTrack] = useState("审计与税务");
  const [enhancedResult, setEnhancedResult] = useState<EnhancedMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnhancedMatch = async () => {
    if (!resumeText.trim() || !jd.trim()) {
      setError("请填写简历内容和目标岗位描述");
      return;
    }

    setLoading(true);
    setError(null);
    setEnhancedResult(null);

    try {
      const result = await callEnhancedMatch(jd, resumeText, track);
      setEnhancedResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "匹配失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">RAG 增强匹配示例</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">目标岗位 (JD)</label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="请输入目标岗位的描述，例如：'
                需要3年以上审计经验，熟悉财务分析、内部控制评估、风险管理等技能'
                ..."
                className="w-full min-h-[200px] rounded-lg border p-4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">简历内容</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="请输入简历内容..."
                className="w-full min-h-[200px] rounded-lg border p-4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">目标赛道</label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="w-full rounded-lg border p-3"
              >
                <option value="审计与税务">审计与税务</option>
                <option value="财务分析">财务分析</option>
                <option value="研究助理">研究助理</option>
                <option value="管培生">管培生</option>
                <option value="银行与券商">银行与券商</option>
                <option value="商业分析">商业分析</option>
              </select>
            </div>

            <button
              onClick={handleEnhancedMatch}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "正在分析匹配..." : "执行增强匹配"}
            </button>

            {error && (
              <div className="rounded-lg bg-red-100 p-4 text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {enhancedResult && !loading && (
              <div className="space-y-6">
                <div className="rounded-lg bg-white p-6 shadow">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-blue-600">
                      {enhancedResult.overallScore}
                    </div>
                    <div>
                      <p className="text-lg font-medium">匹配度评分</p>
                      <p className="text-sm text-gray-500">
                        基于 5 个维度的综合评估
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {Object.entries(enhancedResult.detailedBreakdown).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="w-20 text-sm capitalize">{key}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <RagResults ragResults={null} loading={false} />
              </div>
            )}

            {!enhancedResult && !loading && (
              <div className="rounded-lg bg-gray-100 p-8 text-center text-gray-500">
                <p>执行增强匹配后，将在这里显示结果</p>
              </div>
            )}
          </div>
        </div>

        {enhancedResult && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">详细分析</h2>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="font-semibold mb-3">已命中关键词</h3>
                <div className="flex flex-wrap gap-2">
                  {enhancedResult.matchedKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="font-semibold mb-3">待补强关键词</h3>
                <div className="flex flex-wrap gap-2">
                  {enhancedResult.missingKeywords.slice(0, 10).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="font-semibold mb-3">建议补充技能</h3>
                <div className="flex flex-wrap gap-2">
                  {enhancedResult.ragEnhanced.missingCompetencies.slice(0, 10).map(
                    (skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-white p-6 shadow">
              <h3 className="font-semibold mb-4">学习路径建议</h3>
              <ol className="space-y-3">
                {enhancedResult.ragEnhanced.learningPath.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
