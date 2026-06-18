import { NextRequest, NextResponse } from "next/server";
import { initializeVectorStore, isInitialized } from "@/lib/rag/initializer";
import { vectorStore } from "@/lib/rag/vectorstore";

export const runtime = "nodejs";

interface RagRequestBody {
  query: string;
  track?: string;
  jd?: string;
}

interface RagResponse {
  retrievedQuestions: {
    question: string;
    category: string;
    source: string;
    difficulty: string;
    relevance: string;
  }[];
  relatedConcepts: string[];
  keywordSuggestions: string[];
  actionItems: string[];
  matchAnalysis: {
    currentKeywords: string[];
    suggestedKeywords: string[];
    gapAreas: string[];
  };
}

export async function POST(req: NextRequest) {
  console.log("[/api/rag] 收到请求");

  let body: RagRequestBody;
  try {
    body = await req.json();
  } catch {
    console.error("[/api/rag] 请求体不是合法 JSON");
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const { query, track = "", jd = "" } = body;
  if (!query || typeof query !== "string") {
    console.error("[/api/rag] query 字段必填");
    return NextResponse.json({ error: "query 字段必填" }, { status: 400 });
  }

  console.log(`[/api/rag] 开始 RAG 处理，查询长度: ${query.length}`);

  try {
    await initializeVectorStore();

    const results = await vectorStore.query(query, 8);

    const retrievedQuestions = results.map((result) => ({
      question: result.document.content,
      category: result.document.metadata.category,
      source: result.document.metadata.source,
      difficulty: result.document.metadata.difficulty || "未知",
      relevance: result.relevanceText,
    }));

    const relatedConcepts = extractRelatedConcepts(results);
    const keywordSuggestions = extractKeywordSuggestions(query, results);
    const actionItems = generateActionItems(query, track, results);
    const matchAnalysis = analyzeMatch(query, jd, keywordSuggestions);

    const response: RagResponse = {
      retrievedQuestions,
      relatedConcepts,
      keywordSuggestions,
      actionItems,
      matchAnalysis,
    };

    console.log("[/api/rag] 处理成功，返回结果");
    return NextResponse.json(response);
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "未知错误";
    console.error("[/api/rag] 处理失败:", rawMessage);
    return NextResponse.json(
      { error: "RAG 处理失败: " + rawMessage },
      { status: 500 }
    );
  }
}

function extractRelatedConcepts(results: Array<{
  document: { metadata: { category: string; source: string } };
}>) {
  const concepts = new Set<string>();
  const categoryMap: Record<string, string[]> = {
    "财务分析": ["毛利率", "净利率", "ROE", "ROA", "周转率", "偿债能力", "盈利能力", "成长能力", "现金流"],
    "审计流程": ["内部控制", "风险评估", "审计程序", "审计证据", "审计计划", "内部控制测试", "实质性程序", "审计抽样"],
    "会计准则": ["IFRS", "IAS", "收入确认", "金融工具", "租赁", "公允价值", "股份支付", "合并报表"],
    "税务": ["增值税", "企业所得税", "个人所得税", "税收筹划", "税前扣除", "税收优惠", "税务合规"],
    "风险管理": ["舞弊", "内控缺陷", "合规风险", "操作风险", "财务风险", "审计风险", "重要性"],
    "案例分析": ["财务指标", "盈利分析", "估值方法", "并购分析", "财务报表", "现金流分析"],
    "审计程序": ["函证", "存货盘点", "审计调整", "期后事项", "持续经营", "会计估计"],
  };

  for (const result of results) {
    const category = result.document.metadata.category;
    if (categoryMap[category]) {
      categoryMap[category].forEach(concept => concepts.add(concept));
    }
  }

  return Array.from(concepts).slice(0, 15);
}

function extractKeywordSuggestions(query: string, results: any[]) {
  const keywords = new Set<string>();

  for (const result of results) {
    const doc = result.document;
    const content = doc.content;

    const foundKeywords = [
      "应收账款", "毛利率", "ROE", "现金流", "内控", "审计", "税务筹划", "财务分析",
      "IFRS", "收入确认", "坏账准备", "存货减值", "资产减值", "公允价值",
      "流动比率", "速动比率", "资产负债率", "利息保障倍数",
    ];

    foundKeywords.forEach(keyword => {
      if (content.includes(keyword) && keyword.length > 2) {
        keywords.add(keyword);
      }
    });
  }

  return Array.from(keywords).slice(0, 20);
}

function generateActionItems(query: string, track: string, results: any[]): string[] {
  const items: string[] = [];

  if (results.length === 0) {
    items.push("建议增加更多与目标岗位相关的专业技能描述");
    items.push("考虑补充财务分析、风险管理等领域的专业知识");
  } else {
    items.push(`基于 RAG 检索，建议重点强化 ${track} 方面的专业知识`);
    items.push("关注检索到的核心概念，如：应收账款管理、内部控制评估、税务筹划等");
    items.push("准备相关案例或项目经验，体现实际应用能力");
  }

  return items.slice(0, 5);
}

function analyzeMatch(query: string, jd: string, suggestions: string[]): {
  currentKeywords: string[];
  suggestedKeywords: string[];
  gapAreas: string[];
} {
  const currentKeywords = extractKeywordsFromText(query + " " + jd);
  const suggestedKeywords = suggestions.filter(s => s.length > 2);
  const gapAreas = suggestedKeywords.filter(k => !currentKeywords.includes(k));

  return {
    currentKeywords: currentKeywords.slice(0, 10),
    suggestedKeywords,
    gapAreas,
  };
}

function extractKeywordsFromText(text: string): string[] {
  const keywordPattern = /\b(?:应收账款|毛利率|ROE|现金流|内控|审计|税务筹划|财务分析|IFRS|收入确认|坏账准备|存货减值|资产减值|公允价值|流动比率|速动比率|资产负债率|利息保障倍数|风险评估|内部控制测试|实质性程序|审计抽样|税务合规|舞弊|内控缺陷|合并报表|股份支付|资产减值|投资收益)\b/gi;
  const matches = text.match(keywordPattern);
  return matches ? [...new Set(matches.map(m => m.toLowerCase()))] : [];
}
