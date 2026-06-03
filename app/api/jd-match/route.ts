import { NextRequest, NextResponse } from "next/server";
import { chat, parseJsonResponse } from "@/lib/llm";
import type { ResumeData, JdMatchResult } from "@/lib/types/resume";

export const runtime = "nodejs";

interface JdBody {
  jd: string;
  resume: ResumeData;
}

const jdSchema = {
  type: "object",
  required: ["overallScore", "matchedKeywords", "missingKeywords", "suggestions"],
  properties: {
    overallScore: { type: "number", description: "0-100 整数" },
    matchedKeywords: { type: "array", items: { type: "string" } },
    missingKeywords: { type: "array", items: { type: "string" } },
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section: { type: "string" },
          advice: { type: "string" },
        },
      },
    },
  },
};

export async function POST(req: NextRequest) {
  let body: JdBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const { jd, resume } = body;
  if (!jd || !resume) {
    return NextResponse.json({ error: "jd 和 resume 字段必填" }, { status: 400 });
  }

  const systemPrompt =
    "你是资深技术招聘官，擅长评估候选人简历与岗位描述的匹配度。请基于简历内容与 JD 严格匹配，输出 JSON。\n" +
    "评分标准：技能关键词命中 40%、相关经验 30%、项目契合 20%、整体表达 10%。\n" +
    "matchedKeywords/missingKeywords 列出技能、工具、领域关键词。\n" +
    "suggestions 给出针对简历具体段落的可操作修改建议。";

  const userPrompt =
    `# 简历\n${JSON.stringify(resume, null, 2)}\n\n` +
    `# JD\n${jd}\n\n` +
    `请严格按以下 JSON Schema 输出：\n${JSON.stringify(jdSchema, null, 2)}`;

  try {
    const raw = await chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.2, responseFormat: "json_object", maxTokens: 1500 }
    );
    const parsed = parseJsonResponse<JdMatchResult>(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
