const DEFAULT_GLM_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const DEFAULT_GLM_MODEL = "glm-4-flash-250414";
const DEFAULT_RETRY_COUNT = 1;
const DEFAULT_RETRY_DELAY_MS = 700;

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

export interface StructuredChatOptions extends ChatOptions {
  fallbackModels?: string[];
  maxRetries?: number;
  retryDelayMs?: number;
}

export async function chat(messages: ChatMessage[], options: ChatOptions = {}) {
  const apiKey = process.env.GLM_API_KEY;
  if (!apiKey) {
    throw new Error("GLM_API_KEY 环境变量未设置");
  }

  const model = options.model ?? process.env.GLM_MODEL ?? DEFAULT_GLM_MODEL;
  const endpoint = process.env.GLM_BASE_URL ?? DEFAULT_GLM_ENDPOINT;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 2048,
  };
  if (options.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(endpoint, {
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

export async function chatJson<T>(
  messages: ChatMessage[],
  parser: (raw: string) => T,
  options: StructuredChatOptions = {}
) {
  const models = getModelCandidates(options.model, options.fallbackModels);
  const maxRetries = options.maxRetries ?? DEFAULT_RETRY_COUNT;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const raw = await chat(messages, { ...options, model });
        return parser(raw);
      } catch (error) {
        lastError = error;
        const canRetryCurrentModel =
          attempt < maxRetries && shouldRetryChatError(error);

        if (canRetryCurrentModel) {
          await sleep(retryDelayMs * (attempt + 1));
          continue;
        }

        break;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("暂时没能完成这次生成，请稍后再试。");
}

export function getUserFacingLlmError(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : "未知错误";

  if (rawMessage.includes("GLM_API_KEY")) {
    return {
      message: "当前智能服务还没有完成配置，请稍后再试。",
      status: 500,
    };
  }

  if (rawMessage.includes("GLM API 错误 (429)")) {
    return {
      message: "当前使用人数较多，智能服务有些繁忙，请稍后再试。",
      status: 503,
    };
  }

  if (rawMessage.includes("GLM API 错误")) {
    return {
      message: "智能服务暂时不可用，请稍后重试。",
      status: 503,
    };
  }

  if (
    rawMessage.includes("LLM 返回内容不是合法 JSON") ||
    rawMessage.includes("LLM 返回内容为空") ||
    rawMessage.includes("LLM 结构化输出校验失败")
  ) {
    return {
      message: "这次生成结果不够稳定，请再试一次。",
      status: 502,
    };
  }

  return {
    message: "暂时没能完成这次生成，请稍后再试。",
    status: 500,
  };
}

export function parseJsonResponse<T>(raw: string): T {
  const normalized = raw.replace(/^\uFEFF/, "").trim();

  if (!normalized) {
    throw new Error("LLM 返回内容为空");
  }

  const candidates = collectJsonCandidates(normalized);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      continue;
    }
  }

  throw new Error(`LLM 返回内容不是合法 JSON: ${previewText(normalized)}`);
}

function collectJsonCandidates(input: string) {
  const candidates = new Set<string>();
  candidates.add(input);

  for (const match of input.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)) {
    const candidate = match[1]?.trim();
    if (candidate) {
      candidates.add(candidate);
    }
  }

  for (const block of extractBalancedJsonBlocks(input)) {
    candidates.add(block);
  }

  return [...candidates];
}

function extractBalancedJsonBlocks(input: string) {
  const blocks: string[] = [];
  const stack: string[] = [];
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{" || char === "[") {
      if (stack.length === 0) {
        start = index;
      }
      stack.push(char);
      continue;
    }

    if (char === "}" || char === "]") {
      const last = stack[stack.length - 1];
      const isMatchingPair =
        (last === "{" && char === "}") || (last === "[" && char === "]");

      if (!isMatchingPair) {
        stack.length = 0;
        start = -1;
        continue;
      }

      stack.pop();

      if (stack.length === 0 && start !== -1) {
        blocks.push(input.slice(start, index + 1).trim());
        start = -1;
      }
    }
  }

  return blocks;
}

function getModelCandidates(preferredModel?: string, fallbackModels: string[] = []) {
  const primaryModel = preferredModel ?? process.env.GLM_MODEL ?? DEFAULT_GLM_MODEL;
  const configuredFallbacks =
    process.env.GLM_MODEL_FALLBACKS
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? [];

  return [...new Set([primaryModel, ...fallbackModels, ...configuredFallbacks])];
}

function shouldRetryChatError(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : "";

  if (!rawMessage) {
    return false;
  }

  if (rawMessage.includes("GLM_API_KEY")) {
    return false;
  }

  if (
    rawMessage.includes("LLM 返回内容为空") ||
    rawMessage.includes("LLM 返回内容不是合法 JSON") ||
    rawMessage.includes("LLM 结构化输出校验失败") ||
    rawMessage.includes("ZodError")
  ) {
    return true;
  }

  const statusMatch = rawMessage.match(/GLM API 错误 \((\d{3})\)/);
  if (!statusMatch) {
    return false;
  }

  const statusCode = Number(statusMatch[1]);
  return statusCode === 429 || statusCode >= 500;
}

function previewText(input: string, maxLength = 180) {
  const compact = input.replace(/\s+/g, " ").trim();
  return compact.length <= maxLength ? compact : `${compact.slice(0, maxLength)}...`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
