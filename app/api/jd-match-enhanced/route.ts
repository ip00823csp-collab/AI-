import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatJson, getUserFacingLlmError, parseJsonResponse } from "@/lib/llm";
import { initializeVectorStore, isInitialized } from "@/lib/rag/initializer";
import { vectorStore } from "@/lib/rag/vectorstore";
import type { RAGResponse } from "@/lib/rag/types";

export const runtime = "nodejs";

interface MatchBody {
  jd: string;
  resumeText: string;
  track?: string;
}

interface JdMatchEnhancedResponse {
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

export async function POST(req: NextRequest) {
  console.log("[/api/jd-match-enhanced] 收到请求");

  let body: MatchBody;
  try {
    body = await req.json();
  } catch {
    console.error("[/api/jd-match-enhanced] 请求体不是合法 JSON");
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const { jd, resumeText, track = "" } = body;
  if (!jd || typeof jd !== "string") {
    console.error("[/api/jd-match-enhanced] jd 字段必填");
    return NextResponse.json({ error: "jd 字段必填" }, { status: 400 });
  }
  if (!resumeText || typeof resumeText !== "string") {
    console.error("[/api/jd-match-enhanced] resumeText 字段必填");
    return NextResponse.json({ error: "resumeText 字段必填" }, { status: 400 });
  }

  console.log(`[/api/jd-match-enhanced] 开始增强 JD 匹配，JD 长度: ${jd.length}，简历长度: ${resumeText.length}，赛道: ${track}`);

  try {
    await initializeVectorStore();

    const ragResults = await vectorStore.query(jd, 6);

    const ragEnhanced = {
      relevantConcepts: ragResults.map(r => r.document.metadata.category).slice(0, 10),
      missingCompetencies: extractMissingCompetencies(ragResults, resumeText),
      skillGapAnalysis: analyzeSkillGaps(ragResults, track),
      learningPath: generateLearningPath(ragResults, track),
      additionalKeywords: extractAdditionalKeywords(ragResults, resumeText),
    };

    const overallScore = await calculateEnhancedScore(jd, resumeText, ragEnhanced);

    const suggestions = await generateEnhancedSuggestions(jd, resumeText, ragEnhanced, track);

    const response: JdMatchEnhancedResponse = {
      overallScore,
      matchedKeywords: extractMatchedKeywords(jd, resumeText),
      missingKeywords: extractMissingKeywords(jd, resumeText),
      suggestions,
      ragEnhanced,
      detailedBreakdown: {
        skills: 35,
        experience: 30,
        projects: 20,
        education: 10,
        expression: 5,
      },
    };

    console.log("[/api/jd-match-enhanced] 处理成功，增强匹配完成");
    return NextResponse.json(response);
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "未知错误";
    console.error("[/api/jd-match-enhanced] 处理失败:", rawMessage);
    return NextResponse.json(
      { error: "增强匹配失败: " + rawMessage },
      { status: 500 }
    );
  }
}

async function calculateEnhancedScore(
  jd: string,
  resumeText: string,
  ragEnhanced: RAGResponse["matchAnalysis"]
): Promise<number> {
  const baseScore = await calculateBaseScore(jd, resumeText);
  const ragBoost = calculateRagBoost(ragEnhanced);
  const adjustedScore = Math.min(100, Math.round((baseScore * 0.6) + (ragBoost * 0.4)));

  return adjustedScore;
}

async function calculateBaseScore(jd: string, resumeText: string): Promise<number> {
  const responseSchema = z.object({
    score: z.number().min(0).max(100),
    matchedKeywords: z.array(z.string()),
  });

  const systemPrompt =
    "你是资深技术招聘官，擅长评估候选人简历与岗位描述的匹配度。请基于简历文本与 JD 严格匹配，输出 JSON。\n" +
    "评分维度：技能关键词命中 40%、相关经验 30%、项目契合 20%、整体表达 10%。\n" +
    "matchedKeywords 列出具体的技能、工具、领域关键词。";

  const userPrompt =
    `# 简历内容\n${resumeText}\n\n` +
    `# JD（岗位描述）\n${jd}\n\n` +
    `请输出 JSON: {"score": 0-100的整数, "matchedKeywords": ["关键词1", "关键词2", ...]}`;

  const parsed = await chatJson(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    (raw) => {
      try {
        return responseSchema.parse(parseJsonResponse(raw));
      } catch {
        throw new Error("LLM 结构化输出校验失败");
      }
    },
    {
      temperature: 0.1,
      responseFormat: "json_object",
      maxTokens: 1000,
      maxRetries: 1,
    }
  );

  return parsed.score;
}

function calculateRagBoost(matchAnalysis: RAGResponse["matchAnalysis"]): number {
  if (matchAnalysis.suggestedKeywords.length === 0) return 0;

  const gapKeywords = matchAnalysis.gapAreas.length;
  const gapRatio = gapKeywords / Math.max(matchAnalysis.suggestedKeywords.length, 1);

  return Math.round((1 - gapRatio) * 20);
}

function extractMissingCompetencies(ragResults: any[], resumeText: string): string[] {
  const missing: string[] = [];

  const competencyKeywords = [
    "内部控制", "审计程序", "财务分析", "风险管理", "税务筹划",
    "会计准则", "IFRS", "数据分析", "Excel高级", "Python",
    "并购估值", "尽职调查", "财务报表分析", "现金流分析",
  ];

  for (const competency of competencyKeywords) {
    if (!resumeText.includes(competency) && !ragResults.some(r => r.document.metadata.category.includes(competency))) {
      missing.push(competency);
    }
  }

  return missing.slice(0, 8);
}

function analyzeSkillGaps(ragResults: any[], track: string): string[] {
  const gaps: string[] = [];

  const gapCategories = {
    "财务分析": ["多行业财务建模", "财报深度分析", "估值模型应用"],
    "审计流程": ["舞弊风险评估", "内部控制审计", "数据分析工具"],
    "风险管理": ["压力测试", "情景分析", "合规审计"],
    "税务": ["国际税收", "税务筹划实务", "税务合规管理"],
  };

  for (const [category, specificGaps] of Object.entries(gapCategories)) {
    const found = ragResults.some(r => r.document.metadata.category === category);
    if (!found) {
      gaps.push(...specificGaps);
    }
  }

  return gaps.slice(0, 5);
}

function generateLearningPath(ragResults: any[], track: string): string[] {
  const path: string[] = [];

  const learningSteps = {
    "财务分析": [
      "学习财务报表分析框架，掌握杜邦分析法",
      "练习财务比率计算，理解不同指标的含义",
      "学习现金流分析，掌握自由现金流计算",
      "深入理解估值方法，包括DCF和相对估值",
    ],
    "审计流程": [
      "掌握审计流程和审计程序",
      "学习内部控制评估方法",
      "理解审计证据收集和评估",
      "掌握审计抽样方法",
    ],
    "风险管理": [
      "学习风险识别和评估方法",
      "理解内部控制体系框架",
      "掌握风险应对策略",
    ],
    "税务": [
      "学习税收法律法规和税收政策",
      "理解税务筹划原理和合规要求",
      "掌握税务申报和税务合规流程",
    ],
  };

  for (const [category, steps] of Object.entries(learningSteps)) {
    const found = ragResults.some(r => r.document.metadata.category === category);
    if (found) {
      path.push(...steps.slice(0, 3));
      break;
    }
  }

  return path.slice(0, 4);
}

function extractAdditionalKeywords(ragResults: any[], resumeText: string): string[] {
  const keywords = new Set<string>();
  const allKeywords = [
    "内部控制", "风险评估", "财务分析", "审计程序", "税务筹划",
    "IFRS", "会计准则", "公允价值", "收入确认", "现金流分析",
    "资产负债表", "利润表", "现金流量表", "财务比率", "财务建模",
    "尽职调查", "并购估值", "财务报表审计", "内部控制审计", "舞弊风险",
  ];

  for (const result of ragResults) {
    const content = result.document.content;
    for (const keyword of allKeywords) {
      if (content.includes(keyword)) {
        keywords.add(keyword);
      }
    }
  }

  return Array.from(keywords).slice(0, 15);
}

async function generateEnhancedSuggestions(
  jd: string,
  resumeText: string,
  ragEnhanced: RAGResponse,
  track: string
): Promise<{ section: string; advice: string }[]> {
  const suggestions: { section: string; advice: string }[] = [];

  const ragContext = [
    `你是一个专业的财务审计顾问。请分析简历与JD的匹配情况，并提供具体的改进建议。`,
    `背景信息：JD中涉及的关键领域包括：${ragEnhanced.retrievedQuestions.map(q => q.category).join('、')}`,
    `需要补充的技能领域：${ragEnhanced.matchAnalysis.gapAreas.join('、') || '暂无明显差距'}`,
  ].join('\n');

  const systemPrompt =
    `${ragContext}\n\n你是一位资深财务招聘专家，擅长提供针对性的简历优化建议。请根据简历内容和JD，提供5-8条具体的改进建议。\n输出 JSON 格式：` +
    `[{"section": "简历部分", "advice": "具体建议"}, {"section": "简历部分", "advice": "具体建议"}]`;

  const userPrompt =
    `# JD（岗位描述）\n${jd}\n\n` +
    `# 简历内容\n${resumeText}\n\n` +
    `请输出 JSON 格式的建议。`;

  try {
    const result = await chatJson(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      (raw) => {
        const parsed = parseJsonResponse(raw);
        return z.array(z.object({
          section: z.string(),
          advice: z.string(),
        })).parse(parsed);
      },
      {
        temperature: 0.3,
        responseFormat: "json_object",
        maxTokens: 1500,
        maxRetries: 1,
      }
    );

    suggestions.push(...result.slice(0, 6));
  } catch (error) {
    console.error("[/api/jd-match-enhanced] 生成建议失败:", error);
  }

  return suggestions;
}

function extractMatchedKeywords(jd: string, resumeText: string): string[] {
  const keywordPattern = /\b(?:应收账款|毛利率|ROE|现金流|内控|审计|税务筹划|财务分析|IFRS|收入确认|坏账准备|存货减值|公允价值|流动比率|速动比率|资产负债率|利息保障倍数|风险评估|内部控制测试|实质性程序|审计抽样|税务合规|舞弊|内控缺陷|合并报表|股份支付|资产减值|投资收益|财务建模|尽职调查)\b/gi;

  const matched = jd.match(keywordPattern) || [];
  const inResume = new Set<string>();

  for (const keyword of matched) {
    if (resumeText.toLowerCase().includes(keyword.toLowerCase())) {
      inResume.add(keyword.toLowerCase());
    }
  }

  return Array.from(inResume).slice(0, 15);
}

function extractMissingKeywords(jd: string, resumeText: string): string[] {
  const keywordPattern = /\b(?:应收账款|毛利率|ROE|现金流|内控|审计|税务筹划|财务分析|IFRS|收入确认|坏账准备|存货减值|公允价值|流动比率|速动比率|资产负债率|利息保障倍数|风险评估|内部控制测试|实质性程序|审计抽样|税务合规|舞弊|内控缺陷|合并报表|股份支付|资产减值|投资收益|财务建模|尽职调查)\b/gi;

  const allKeywords = jd.match(keywordPattern) || [];
  const inResume = new Set<string>();

  for (const keyword of allKeywords) {
    if (resumeText.toLowerCase().includes(keyword.toLowerCase())) {
      inResume.add(keyword.toLowerCase());
    }
  }

  return allKeywords.filter(k => !inResume.has(k.toLowerCase())).slice(0, 15);
}
