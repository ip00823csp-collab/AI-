import { NextRequest, NextResponse } from "next/server";
import { chat, parseJsonResponse } from "@/lib/llm";

export const runtime = "nodejs";

interface PolishBody {
  section: "summary" | "bullet";
  text: string;
  context?: string;
}

export async function POST(req: NextRequest) {
  let body: PolishBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const { section, text, context } = body;
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text 字段必填" }, { status: 400 });
  }

  const systemPrompt =
    "你是一位资深中文简历优化专家。根据用户提供的简历片段，输出更专业、更量化、更具竞争力的中文重写版本。要求：\n" +
    "1. 使用 STAR 法则（情境/任务/行动/结果）改写工作经历\n" +
    "2. 优先量化结果（数字、百分比、规模）\n" +
    "3. 使用强动词开头，避免'负责/参与/协助'等弱表述\n" +
    "4. 保留所有事实信息，不臆造\n" +
    "5. 输出严格 JSON 格式：{\"rewritten\": string, \"reason\": string}\n" +
    "6. reason 字段用一句话说明改写思路";

  const userPrompt =
    `片段类型: ${section === "summary" ? "个人总结" : "工作经历要点"}\n` +
    `原始内容: ${text}\n` +
    (context ? `上下文: ${context}\n` : "") +
    `请输出 JSON。`;

  try {
    const raw = await chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.5, responseFormat: "json_object", maxTokens: 800 }
    );
    const parsed = parseJsonResponse<{ rewritten: string; reason: string }>(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
