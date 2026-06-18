import type { RAGResponse } from "@/lib/rag/types";

export interface EnhancedMatchResult {
  overallScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: { section: string; advice: string }[];
  ragEnhanced: {
    relevantConcepts: string[];
    missingCompetencies: string[];
    skillGapAnalysis: string[];
    learningPath: string[];
    additionalKeywords: string[];
  };
  detailedBreakdown: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
    expression: number;
  };
}

export async function callRag(query: string, track: string = "", jd: string = ""): Promise<RAGResponse> {
  const response = await fetch("/api/rag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, track, jd }),
  });

  if (!response.ok) {
    throw new Error(`RAG API 错误 (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

export async function callEnhancedMatch(
  jd: string,
  resumeText: string,
  track: string = ""
): Promise<EnhancedMatchResult> {
  const response = await fetch("/api/jd-match-enhanced", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jd, resumeText, track }),
  });

  if (!response.ok) {
    throw new Error(`增强匹配 API 错误 (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

export function parseKeywordScore(keyword: string, resumeText: string): number {
  const resumeLower = resumeText.toLowerCase();
  const keywordLower = keyword.toLowerCase();

  const count = (resumeLower.match(new RegExp(keywordLower, "g")) || []).length;

  if (count === 0) return 0;
  if (count === 1) return 50;
  if (count === 2) return 70;
  return 90;
}

export function calculateOverallScore(scores: { section: string; score: number }[]): number {
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const totalWeight = scores.reduce((sum, s) => sum + (s.weight || 20), 0);
  return Math.round((totalScore / totalWeight) * 100);
}
