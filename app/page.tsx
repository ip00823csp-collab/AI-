"use client";

import { ChangeEvent, DragEvent, type ReactNode, useState } from "react";
import {
  MAX_RESUME_FILE_SIZE,
  RESUME_FILE_ACCEPT,
  RESUME_FILE_LABEL,
} from "@/lib/resume-upload-config";

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

interface UploadSummary {
  fileName: string;
  fileType: string;
  warnings: string[];
  charCount: number;
}

type ResultType = "polish" | "match" | null;

const DISPLAY_FONT = '"Iowan Old Style", "Songti SC", "STSong", serif';

const ROLE_TRACKS = [
  "审计与税务",
  "财务分析",
  "研究助理",
  "管培生",
  "银行与券商",
  "商业分析",
];

const VALUE_POINTS = [
  {
    title: "先整理",
    description: "把课程、证书、实习和项目经历放回一个清晰的叙事顺序里。",
  },
  {
    title: "再对照",
    description: "结合目标岗位描述，快速找出应该补强的关键词和表达重点。",
  },
  {
    title: "后成稿",
    description: "输出更稳妥、更职业的简历文案，而不是生硬堆砌术语。",
  },
];

const WORKFLOW_STEPS = [
  {
    index: "01",
    title: "导入原始简历",
    description: "上传已有 PDF / Word，或者直接把现在的简历全文粘贴进来。",
  },
  {
    index: "02",
    title: "贴上目标岗位",
    description: "把银行、券商、咨询、四大或企业财务岗位的 JD 一并放进来。",
  },
  {
    index: "03",
    title: "查看建议与差距",
    description: "得到更顺的表达建议和一份更像招聘视角的匹配反馈。",
  },
];

const EMPLOYER_SIGNALS = [
  "教育背景不要只列学校名，要把主修方向、成绩亮点和资格证放在一起看。",
  "实习与项目不是流水账，要突出你做了什么、影响了什么、用了什么分析方法。",
  "岗位语言尽量贴近用人单位，少一点校园式描述，多一点结果感与专业感。",
];

const PRODUCT_SIGNALS = [
  { label: "适用阶段", value: "秋招 / 春招 / 实习投递" },
  { label: "重点岗位", value: "财务、审计、咨询、研究" },
  { label: "样板人群", value: "上财及财经类高校本科生" },
  { label: "使用方式", value: "导入原稿后直接改" },
];

const AUDIENCE_TAGS = [
  "会计学",
  "金融学",
  "经济学",
  "统计学",
  "工商管理",
];

const TEXTAREA_CLASS =
  "min-h-[280px] w-full rounded-[24px] border border-[#d8e0e8] bg-[#fcfcfb] px-4 py-4 text-[15px] leading-7 text-[#1f3042] outline-none transition placeholder:text-[#96a1ad] focus:border-[#4f6b88] focus:ring-4 focus:ring-[#dce7f1]";

const PANEL_CLASS =
  "rounded-[30px] border border-[#ddd4c8] bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_18px_50px_rgba(22,34,49,0.08)] backdrop-blur md:p-7";

export default function Home() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [polishResult, setPolishResult] = useState<PolishResult | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [activeResult, setActiveResult] = useState<ResultType>(null);
  const [loading, setLoading] = useState<"" | "polish" | "match">("");
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetResults = () => {
    setPolishResult(null);
    setMatchResult(null);
    setActiveResult(null);
  };

  const clearAll = () => {
    setResume("");
    setJd("");
    setUploadSummary(null);
    setError(null);
    resetResults();
  };

  const uploadResumeFile = async (file: File | null) => {
    if (!file) {
      return;
    }

    setIsDragActive(false);
    setUploading(true);
    setError(null);
    setUploadSummary(null);
    resetResults();

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "文件解析失败");
      }

      setResume(json.text);
      setUploadSummary({
        fileName: json.fileName,
        fileType: String(json.fileType).toUpperCase(),
        warnings: Array.isArray(json.warnings) ? json.warnings : [],
        charCount: typeof json.text === "string" ? json.text.length : 0,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "文件解析失败");
    } finally {
      setUploading(false);
    }
  };

  const handleResumeFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    await uploadResumeFile(file);
  };

  const handleUploadDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (loading !== "" || uploading) {
      return;
    }

    setIsDragActive(true);
  };

  const handleUploadDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsDragActive(false);
  };

  const handleUploadDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (loading !== "" || uploading) {
      return;
    }

    const file = event.dataTransfer.files?.[0] ?? null;
    await uploadResumeFile(file);
  };

  const callPolish = async () => {
    if (!resume.trim()) {
      setError("先放入你的简历内容，再生成表达建议。");
      setActiveResult(null);
      return;
    }

    setLoading("polish");
    setError(null);
    resetResults();
    setActiveResult("polish");

    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "summary", text: resume }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "润色失败");
      }

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
      setError("简历内容和目标岗位描述都需要填写。");
      setActiveResult(null);
      return;
    }

    setLoading("match");
    setError(null);
    resetResults();
    setActiveResult("match");

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, resumeText: resume }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "匹配失败");
      }

      setMatchResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
      setActiveResult(null);
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="paper-grid pointer-events-none absolute inset-x-0 top-0 h-[32rem] opacity-50" />
      <div className="pointer-events-none absolute inset-0">
        <div className="drift-slow absolute left-[-7rem] top-[-6rem] h-72 w-72 rounded-full bg-[#d1bc96]/35 blur-3xl" />
        <div className="drift-slow absolute right-[-5rem] top-24 h-80 w-80 rounded-full bg-[#90a9b8]/28 blur-3xl [animation-delay:1.6s]" />
        <div className="absolute bottom-20 left-1/3 h-60 w-60 rounded-full bg-[#e6d7bf]/30 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-6 md:px-8 lg:py-10">
        <section className="fade-up rounded-[34px] border border-[#d9cfbe] bg-[rgba(251,247,240,0.88)] p-6 shadow-[0_24px_70px_rgba(22,34,49,0.08)] backdrop-blur md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-stretch">
            <div className="flex flex-col justify-between">
              <div>
                <span className="inline-flex rounded-full border border-[#d4c5ac] bg-[#f5ede0] px-4 py-1.5 text-xs tracking-[0.24em] text-[#7c5d31] uppercase">
                  面向上财及财经类高校本科毕业生
                </span>
                <h1
                  className="mt-5 max-w-3xl text-4xl leading-tight text-[#12253a] md:text-5xl lg:text-[3.35rem]"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  为财经院校应届生准备的 AI 简历工作台
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[#516376] md:text-lg">
                  以上海财经大学的求职语境为样板，把课程、实习、项目和校园经历整理成更像企业愿意继续往下看的简历表达。
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {ROLE_TRACKS.map((track) => (
                  <span
                    key={track}
                    className="rounded-full border border-[#d7dfe7] bg-white/70 px-4 py-2 text-sm text-[#304256] shadow-sm"
                  >
                    {track}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {VALUE_POINTS.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[22px] border border-[#e2d8ca] bg-white/72 p-4"
                  >
                    <p className="text-sm font-semibold text-[#17324b]">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[#5a6a7c]">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="fade-up-delay rounded-[30px] bg-[#102536] p-6 text-[#f5efe4] shadow-[0_20px_60px_rgba(16,37,54,0.28)]">
              <p className="text-xs uppercase tracking-[0.32em] text-[#c7d6df]">
                简历应该呈现的样子
              </p>
              <h2
                className="mt-4 text-2xl leading-10 text-white md:text-[2rem]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                不是把内容写满，而是让招聘方三十秒看懂你。
              </h2>

              <div className="mt-6 space-y-4">
                <PreviewRow
                  title="教育经历"
                  detail="把 GPA、资格证、相关课程和求职方向放进同一个判断框架里。"
                />
                <PreviewRow
                  title="实习与项目"
                  detail="强调你的分析动作、参与深度和结果，而不是只写职责名词。"
                />
                <PreviewRow
                  title="岗位贴合度"
                  detail="把岗位关键词与简历里的真实经历连上，而不是机械堆词。"
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {PRODUCT_SIGNALS.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[20px] border border-white/12 bg-white/8 p-4"
                  >
                    <p className="text-xs text-[#c5d2db]">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
          <div className="space-y-6">
            <section className={`${PANEL_CLASS} fade-up`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[#8b6d42]">
                    工作台
                  </p>
                  <h2
                    className="mt-3 text-2xl text-[#12253a] md:text-[2rem]"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    先导入，再对照岗位调整
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f6f80] md:text-[15px]">
                    上传已有简历或直接粘贴内容都可以。你会在同一页看到表达建议和岗位差距，不需要来回切换工具。
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-[#59687a]">
                  <span className="rounded-full bg-[#eef2f5] px-3 py-1.5">
                    支持 PDF / Word
                  </span>
                  <span className="rounded-full bg-[#eef2f5] px-3 py-1.5">
                    表达建议
                  </span>
                  <span className="rounded-full bg-[#eef2f5] px-3 py-1.5">
                    岗位差距检查
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[24px] border border-[#d9e1e8] bg-[#f5f8fb] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#16314b]">导入已有简历</p>
                      <p className="mt-2 text-sm leading-7 text-[#5c7083]">
                        支持 {RESUME_FILE_LABEL}，建议{" "}
                        {formatMegabytes(MAX_RESUME_FILE_SIZE)} 以内。扫描版 PDF
                        如果没有可选中文本，提取效果会比较有限。
                      </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#17314a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#21415f]">
                      <input
                        type="file"
                        accept={RESUME_FILE_ACCEPT}
                        onChange={handleResumeFileUpload}
                        disabled={loading !== "" || uploading}
                        className="sr-only"
                      />
                      {uploading ? "正在读取简历..." : "选择简历文件"}
                    </label>
                  </div>

                  <div
                    onDragOver={handleUploadDragOver}
                    onDragEnter={handleUploadDragOver}
                    onDragLeave={handleUploadDragLeave}
                    onDrop={handleUploadDrop}
                    className={`mt-4 rounded-[24px] border-2 border-dashed px-5 py-6 text-center transition ${
                      isDragActive
                        ? "border-[#3e617f] bg-[#e8f0f6]"
                        : "border-[#c8d5df] bg-white/70"
                    } ${loading !== "" || uploading ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    <p className="text-sm font-semibold text-[#17314a]">
                      {uploading ? "正在解析你拖入的简历..." : "拖拽简历到这里也可以"}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#607080]">
                      支持 {RESUME_FILE_LABEL}，也可以继续点击上方按钮选择文件。
                    </p>
                    <p className="mt-3 text-xs text-[#8a96a2]">
                      为了演示更顺畅，建议使用文字版 PDF 或 Word 文件。
                    </p>
                  </div>

                  {uploadSummary && (
                    <div className="mt-4 rounded-[20px] border border-[#cae0d3] bg-[#eef7f1] px-4 py-3 text-sm text-[#2c5a41]">
                      <p>
                        已导入 {uploadSummary.fileName} · {uploadSummary.fileType} · 共提取{" "}
                        {uploadSummary.charCount} 字
                      </p>
                      {uploadSummary.warnings.length > 0 && (
                        <p className="mt-2 text-[#8a6329]">
                          解析提示：{uploadSummary.warnings.join("；")}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-[24px] border border-[#ebdbc3] bg-[#fff8ee] p-5">
                  <p className="text-sm font-semibold text-[#6f4f23]">简历表达提醒</p>
                  <div className="mt-3 space-y-3">
                    {EMPLOYER_SIGNALS.map((signal) => (
                      <div
                        key={signal}
                        className="rounded-[18px] border border-[#f0e3cf] bg-white/55 px-4 py-3 text-sm leading-7 text-[#755a35]"
                      >
                        {signal}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-[#213549]">
                    简历内容
                  </label>
                  <textarea
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    rows={12}
                    placeholder="把你的简历全文粘贴到这里，或先上传已有文件。建议包含教育经历、实习、项目、校园经历与技能证书。"
                    className={TEXTAREA_CLASS}
                  />
                  <div className="mt-2 flex justify-between text-xs text-[#8a96a2]">
                    <span>{resume.length} 字</span>
                    <span>上传后会自动回填到这里</span>
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-[#213549]">
                    目标岗位描述
                  </label>
                  <textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    rows={12}
                    placeholder="把你要投递的岗位描述放进来，例如财务分析、投研助理、审计、咨询或管培生岗位。"
                    className={TEXTAREA_CLASS}
                  />
                  <div className="mt-2 flex justify-between text-xs text-[#8a96a2]">
                    <span>{jd.length} 字</span>
                    <span>岗位差距检查时会用到这里的内容</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={callPolish}
                  disabled={loading !== "" || uploading}
                  className="rounded-full bg-[#163149] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#21415f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading === "polish" ? "正在生成表达建议..." : "生成表达建议"}
                </button>
                <button
                  onClick={callMatch}
                  disabled={loading !== "" || uploading}
                  className="rounded-full bg-[#1f6a54] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#2a7b62] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading === "match" ? "正在检查岗位贴合度..." : "检查岗位贴合度"}
                </button>
                <button
                  onClick={clearAll}
                  disabled={loading !== "" || uploading}
                  className="rounded-full border border-[#d6dbe2] bg-white px-5 py-3 text-sm font-medium text-[#526172] transition hover:bg-[#f5f7f9] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  清空内容
                </button>
              </div>

              {error && (
                <div className="mt-5 rounded-[20px] border border-[#efc6c6] bg-[#fff4f4] px-4 py-3 text-sm text-[#a34747]">
                  {error}
                </div>
              )}
            </section>

            <section className={`${PANEL_CLASS} fade-up-delay`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[#8b6d42]">
                    输出区
                  </p>
                  <h2
                    className="mt-3 text-2xl text-[#12253a] md:text-[2rem]"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    在这里看修改建议与岗位反馈
                  </h2>
                </div>
                <span className="rounded-full bg-[#f3f5f7] px-3 py-1.5 text-xs text-[#5e6c7c]">
                  同一份简历可反复调整
                </span>
              </div>

              <div className="mt-6">
                {activeResult === "polish" && polishResult && (
                  <ResultPanel title="表达建议稿">
                    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                      <div className="rounded-[24px] border border-[#dde3ea] bg-[#fafcfd] p-5">
                        <p className="text-xs uppercase tracking-[0.22em] text-[#7f8d9a]">
                          建议稿
                        </p>
                        <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#203244]">
                          {polishResult.rewritten}
                        </pre>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-[24px] border border-[#e8dcc7] bg-[#fff8ee] p-5">
                          <p className="text-xs uppercase tracking-[0.22em] text-[#8b6d42]">
                            调整逻辑
                          </p>
                          <p className="mt-4 text-sm leading-7 text-[#684e2b]">
                            {polishResult.reason}
                          </p>
                        </div>

                        <button
                          onClick={() => setResume(polishResult.rewritten)}
                          className="w-full rounded-full bg-[#17314a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#21415f]"
                        >
                          用建议稿替换上方简历内容
                        </button>
                      </div>
                    </div>
                  </ResultPanel>
                )}

                {activeResult === "match" && matchResult && (
                  <ResultPanel title="岗位贴合度反馈">
                    <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
                      <div className="rounded-[26px] bg-[#102536] p-6 text-white shadow-[0_18px_42px_rgba(16,37,54,0.2)]">
                        <p className="text-xs uppercase tracking-[0.24em] text-[#c7d6df]">
                          当前匹配度
                        </p>
                        <div className="mt-4 flex items-end gap-3">
                          <span className="text-6xl font-semibold text-[#f6efe4]">
                            {Math.round(matchResult.overallScore)}
                          </span>
                          <span className="pb-2 text-sm text-[#c5d1da]">/ 100</span>
                        </div>
                        <p className="mt-4 text-sm leading-7 text-[#d2dde5]">
                          这个分数更适合当成迭代起点，重点看缺口关键词和修改建议，而不是只盯着数值本身。
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <KeywordGroup
                            title="已命中关键词"
                            items={matchResult.matchedKeywords}
                            color="green"
                          />
                          <KeywordGroup
                            title="待补强关键词"
                            items={matchResult.missingKeywords}
                            color="amber"
                          />
                        </div>

                        <div className="rounded-[24px] border border-[#dde3ea] bg-[#fafcfb] p-5">
                          <h3 className="text-sm font-semibold text-[#223649]">
                            优先处理的修改建议
                          </h3>
                          {matchResult.suggestions?.length > 0 ? (
                            <ul className="mt-4 space-y-3">
                              {matchResult.suggestions.map((suggestion, index) => (
                                <li
                                  key={`${suggestion.section}-${index}`}
                                  className="rounded-[18px] border border-[#e7ecf1] bg-white px-4 py-3 text-sm leading-7 text-[#435466]"
                                >
                                  <span className="font-semibold text-[#17314a]">
                                    {suggestion.section}
                                  </span>
                                  ：{suggestion.advice}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-4 text-sm text-[#8391a0]">
                              这次没有返回额外修改建议，你可以尝试补充更完整的岗位描述后再检查一次。
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </ResultPanel>
                )}

                {!activeResult && !error && (
                  <ResultPanel title="结果会在这里出现">
                    <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                      <div className="rounded-[24px] border border-dashed border-[#d7dde4] bg-[#fbfcfc] p-5">
                        <p className="text-sm font-semibold text-[#203447]">
                          你会看到什么
                        </p>
                        <div className="mt-4 space-y-3 text-sm leading-7 text-[#5f6f80]">
                          <p>1. 一版更顺、更职业的简历表达建议。</p>
                          <p>2. 一份从岗位视角出发的贴合度反馈。</p>
                          <p>3. 对应到具体模块的补强方向。</p>
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-[#e8dcc7] bg-[#fff8ee] p-5">
                        <p className="text-sm font-semibold text-[#6f4f23]">
                          更适合这类同学
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {AUDIENCE_TAGS.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-[#edd9b9] bg-white/70 px-3 py-1.5 text-xs text-[#7b6138]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="mt-4 text-sm leading-7 text-[#745836]">
                          如果你正在准备秋招、春招或暑期实习，这一页会更像一个简历整理台，而不是一堆难懂的技术按钮。
                        </p>
                      </div>
                    </div>
                  </ResultPanel>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className={`${PANEL_CLASS} fade-up-delay`}>
              <p className="text-xs uppercase tracking-[0.28em] text-[#8b6d42]">
                使用路径
              </p>
              <h2
                className="mt-3 text-2xl text-[#12253a]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                三步完成一轮简历迭代
              </h2>
              <div className="mt-5 space-y-4">
                {WORKFLOW_STEPS.map((step) => (
                  <article
                    key={step.index}
                    className="rounded-[22px] border border-[#e5dbcf] bg-[#fbfaf7] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#17314a] text-sm font-semibold text-white">
                        {step.index}
                      </span>
                      <p className="text-sm font-semibold text-[#1f3448]">{step.title}</p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[#607080]">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className={`${PANEL_CLASS} fade-up-delay`}>
              <p className="text-xs uppercase tracking-[0.28em] text-[#8b6d42]">
                招聘视角
              </p>
              <h2
                className="mt-3 text-2xl text-[#12253a]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                财经类校招常看的几个信号
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  "课程与证书是否支持你的岗位方向",
                  "实习与项目有没有体现分析、建模、沟通或执行成果",
                  "关键词是否和岗位描述能真正对应上",
                  "一页内的信息主次是否足够清楚",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[20px] border border-[#e7edf2] bg-[#f8fafb] px-4 py-3 text-sm leading-7 text-[#4f6275]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="fade-up-delay rounded-[30px] bg-[#17314a] p-6 text-white shadow-[0_18px_42px_rgba(23,49,74,0.22)]">
              <p className="text-xs uppercase tracking-[0.28em] text-[#c8d6df]">
                这版的目标
              </p>
              <h2
                className="mt-3 text-2xl leading-10 text-white"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                少一点工具感，多一点真正可投递的成品感。
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#d7e1e8]">
                页面不再把技术信息摆在最前面，而是先帮助用户确认自己适不适合、该怎么开始、最终能得到什么。
              </p>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

function ResultPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-lg font-semibold text-[#15283d]">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PreviewRow({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/12 bg-white/6 px-4 py-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[#ced9e1]">{detail}</p>
    </div>
  );
}

function KeywordGroup({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "green" | "amber";
}) {
  const colorClass =
    color === "green"
      ? "border-[#cfe5d7] bg-[#eef8f1] text-[#2f6243]"
      : "border-[#eadab8] bg-[#fff6e7] text-[#886028]";

  return (
    <div className="rounded-[24px] border border-[#dde4ea] bg-white p-5">
      <h3 className="text-sm font-semibold text-[#223649]">{title}</h3>
      <div className="mt-4 flex min-h-[2.5rem] flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-xs text-[#93a0ad]">暂无</span>
        ) : (
          items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={`rounded-full border px-3 py-1.5 text-xs ${colorClass}`}
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function formatMegabytes(bytes: number) {
  return `${Math.round((bytes / 1024 / 1024) * 10) / 10}MB`;
}
