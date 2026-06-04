import { NextRequest, NextResponse } from "next/server";
import { chat, parseJsonResponse } from "@/lib/llm";

export const runtime = "nodejs";

interface MatchBody {
  jd: string;
  resumeText: string;
}

const responseSchema = {
  type: "object",
  required: ["overallScore", "matchedKeywords", "missingKeywords", "suggestions"],
  properties: {
    overallScore: { type: "number", description: "0-100 整数，简历与 JD 的总体匹配度" },
    matchedKeywords: {
      type: "array",
      items: { type: "string" },
      description: "简历中已命中的 JD 关键词（技能/工具/领域）",
    },
    missingKeywords: {
      type: "array",
      items: { type: "string" },
      description: "JD 中要求但简历未体现的关键词",
    },
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section: { type: "string", description: "针对简历的哪个部分" },
          advice: { type: "string", description: "具体可操作的修改建议" },
        },
      },
    },
  },
};

export async function POST(req: NextRequest) {
  let body: MatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const { jd, resumeText } = body;
  if (!jd || typeof jd !== "string") {
    return NextResponse.json({ error: "jd 字段必填" }, { status: 400 });
  }
  if (!resumeText || typeof resumeText !== "string") {
    return NextResponse.json({ error: "resumeText 字段必填" }, { status: 400 });
  }

  const systemPrompt =
    "你是资深技术招聘官，擅长评估候选人简历与岗位描述的匹配度。请基于简历文本与 JD 严格匹配，输出 JSON。\n" +
    "评分维度：技能关键词命中 40%、相关经验 30%、项目契合 20%、整体表达 10%。\n" +
    "matchedKeywords / missingKeywords 列出具体的技能、工具、领域关键词。\n" +
    "suggestions 给出针对简历具体段落的可操作修改建议（哪一段、怎么改）。";

  const userPrompt =
    `# 简历内容\n${resumeText}\n\n` +
    `# JD（岗位描述）\n${jd}\n\n` +
    `请严格按以下 JSON Schema 输出：\n${JSON.stringify(responseSchema, null, 2)}`;

  try {
    const raw = await chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.2, responseFormat: "json_object", maxTokens: 1500 }
    );
    const parsed = parseJsonResponse(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
