import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatJson, getUserFacingLlmError, parseJsonResponse } from "@/lib/llm";

export const runtime = "nodejs";

interface PolishBody {
  text: string;
  section?: "summary" | "bullet" | "full";
  context?: string;
}

const polishResponseSchema = z.object({
  rewritten: z.string().min(1),
  reason: z.string().min(1),
});

export async function POST(req: NextRequest) {
  console.log("[/api/polish] 收到请求");

  let body: PolishBody;
  try {
    body = await req.json();
  } catch {
    console.error("[/api/polish] 请求体不是合法 JSON");
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const { text, section = "full", context } = body;
  if (!text || typeof text !== "string") {
    console.error("[/api/polish] text 字段必填");
    return NextResponse.json({ error: "text 字段必填" }, { status: 400 });
  }

  console.log(`[/api/polish] 开始润色，长度: ${text.length}`);

  const systemPrompt =
    "你是一位资深中文简历优化专家。根据用户提供的简历内容，输出更专业、更量化、更具竞争力的中文重写版本。要求：\n" +
    "1. 使用 STAR 法则（情境/任务/行动/结果）改写工作经历要点\n" +
    "2. 优先量化结果（数字、百分比、规模、收益）\n" +
    "3. 使用强动词开头，避免「负责」「参与」「协助」等弱表述\n" +
    "4. 保留所有事实信息，不臆造、不增加未提供的技能或经历\n" +
    "5. 保留原文的段落结构与顺序，便于用户对照替换\n" +
    "6. 输出严格 JSON：{\"rewritten\": string, \"reason\": string}\n" +
    "7. reason 字段用 1-2 句话说明主要改写思路（不要罗列每条改动）";

  const sectionLabel =
    section === "summary"
      ? "个人总结"
      : section === "bullet"
      ? "单条工作经历要点"
      : "完整简历文本";

  const userPrompt =
    `片段类型: ${sectionLabel}\n` +
    `原始内容:\n${text}\n` +
    (context ? `\n上下文: ${context}\n` : "") +
    `\n请输出 JSON。`;

  try {
    const parsed = await chatJson(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      (raw) => {
        try {
          return polishResponseSchema.parse(parseJsonResponse(raw));
        } catch {
          throw new Error("LLM 结构化输出校验失败");
        }
      },
      {
        temperature: 0.35,
        responseFormat: "json_object",
        maxTokens: 2400,
        maxRetries: 1,
      }
    );
    console.log("[/api/polish] 润色成功");
    return NextResponse.json(parsed);
  } catch (err) {
    const rawMessage = err instanceof Error ? err.message : "未知错误";
    const friendlyError = getUserFacingLlmError(err);
    console.error("[/api/polish] 润色失败:", rawMessage);
    return NextResponse.json(
      { error: friendlyError.message },
      { status: friendlyError.status }
    );
  }
}
