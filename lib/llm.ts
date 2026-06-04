const GLM_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  responseFormat?: "json_object" | "text";
  maxTokens?: number;
}

export async function chat(messages: ChatMessage[], options: ChatOptions = {}) {
  const apiKey = process.env.GLM_API_KEY;
  if (!apiKey) {
    throw new Error("GLM_API_KEY 环境变量未设置");
  }

  const model = options.model ?? process.env.GLM_MODEL ?? "glm-4.7-flash";

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 2048,
  };
  if (options.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(GLM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GLM API 错误 (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export function parseJsonResponse<T>(raw: string): T {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("LLM 返回内容不是合法 JSON");
  }
  return JSON.parse(trimmed.slice(start, end + 1)) as T;
}
