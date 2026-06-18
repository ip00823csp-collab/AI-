"use client";

import { RAGResponse } from "@/lib/rag/types";
import { CheckCircle2, Lightbulb, Target, TrendingUp, BookOpen, ArrowRight } from "lucide-react";

interface RagResultsProps {
  ragResults: RAGResponse | null;
  loading?: boolean;
}

export default function RagResults({ ragResults, loading }: RagResultsProps) {
  if (loading) {
    return (
      <div className="rounded-[24px] border border-[#dce7f1] bg-[#f8fbf8] p-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1f6a54] border-t-transparent"></div>
          <p className="text-[#1f6a54] font-medium">正在分析相关知识点...</p>
        </div>
      </div>
    );
  }

  if (!ragResults) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-[#7a5b2f]" />
        <h3 className="text-lg font-semibold text-[#12253a]">RAG 智能分析结果</h3>
        <span className="rounded-full bg-[#fff6e7] px-2 py-0.5 text-xs text-[#7a5b2f]">
          四大题库检索
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <RagSection title="检索到的相关知识点" icon={Target} color="green">
          {ragResults.retrievedQuestions.slice(0, 5).map((q, idx) => (
            <RagQuestionCard key={idx} question={q} />
          ))}
        </RagSection>

        <RagSection title="建议补充的关键词" icon={TrendingUp} color="gold">
          <RagKeywordList keywords={ragResults.keywordSuggestions.slice(0, 10)} />
        </RagSection>
      </div>

      <RagSection title="技能差距分析" icon={Lightbulb} color="navy">
        <RagGapAnalysis gaps={ragResults.matchAnalysis.gapAreas} />
      </RagSection>

      <RagSection title="推荐行动项" icon={ArrowRight} color="green">
        <RagActionItems items={ragResults.actionItems} />
      </RagSection>

      {ragResults.relatedConcepts.length > 0 && (
        <RagSection title="相关概念体系" icon={BookOpen} color="navy">
          <div className="flex flex-wrap gap-2">
            {ragResults.relatedConcepts.map((concept, idx) => (
              <span
                key={idx}
                className="rounded-full border border-[#d9e2ea] bg-[#f8fafc] px-3 py-1.5 text-sm text-[#4d6174]"
              >
                {concept}
              </span>
            ))}
          </div>
        </RagSection>
      )}
    </div>
  );
}

function RagSection({
  title,
  icon: Icon,
  color,
  children,
}: {
  title: string;
  icon: any;
  color: "green" | "navy" | "gold";
  children: React.ReactNode;
}) {
  const colorClasses = {
    green: "border-[#d7e6dd] bg-[#f7fbf8] text-[#486454]",
    navy: "border-[#d9e2ea] bg-[#f8fafc] text-[#4d6174]",
    gold: "border-[#eadfc8] bg-[#fffaf1] text-[#7b653f]",
  };

  return (
    <div className={`rounded-[24px] border p-5 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5" />
        <h4 className="text-sm font-semibold text-[#203447]">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function RagQuestionCard({ question }: { question: any }) {
  return (
    <div className="rounded-[20px] border border-[#e2e7ec] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-7 text-[#3f5061] flex-1">{question.question}</p>
        <span className="flex-shrink-0 text-xs text-[#8b6d42] whitespace-nowrap ml-2">
          {question.source}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#f0f9f4] px-2 py-0.5 text-xs text-[#2f6243]">
          {question.category}
        </span>
        <span className="rounded-full bg-[#f5ede0] px-2 py-0.5 text-xs text-[#7a5b2f]">
          {question.difficulty}
        </span>
      </div>
      <p className="mt-3 text-xs text-[#8a96a2]">{question.relevance}</p>
    </div>
  );
}

function RagKeywordList({ keywords }: { keywords: string[] }) {
  if (keywords.length === 0) {
    return <p className="text-sm text-[#8391a0]">暂无建议</p>;
  }

  return (
    <div className="space-y-2">
      {keywords.map((keyword, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#2f6243]" />
          <span className="text-sm text-[#416052]">{keyword}</span>
        </div>
      ))}
    </div>
  );
}

function RagGapAnalysis({ gaps }: { gaps: string[] }) {
  if (gaps.length === 0) {
    return (
      <div className="rounded-[18px] border border-[#cfe5d7] bg-[#eef8f1] px-4 py-3 text-sm text-[#2f6243]">
        当前简历在关键技能领域表现良好，无明显差距
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {gaps.map((gap, idx) => (
        <div key={idx} className="rounded-[18px] border border-[#e8dcc7] bg-[#fff8ee] px-4 py-3 text-sm">
          <span className="font-semibold text-[#7b653f]">建议补充:</span> {gap}
        </div>
      ))}
    </div>
  );
}

function RagActionItems({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-[#8391a0]">暂无建议</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#1f6a54] mt-0.5 flex-shrink-0" />
          <span className="text-sm text-[#416052] leading-6">{item}</span>
        </div>
      ))}
    </div>
  );
}
