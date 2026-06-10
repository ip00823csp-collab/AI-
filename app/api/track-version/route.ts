import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatJson, getUserFacingLlmError, parseJsonResponse } from "@/lib/llm";
import { TRACK_PLAYBOOKS, isTrackKey } from "@/lib/track-playbooks";

export const runtime = "nodejs";

const trackVersionResponseSchema = z.object({
  positioning: z.string().min(1),
  recruiterLens: z.array(z.string()).min(1).max(6),
  keywordsToEmphasize: z.array(z.string()).min(1).max(10),
  evidenceMap: z
    .array(
      z.object({
        sourceFact: z.string().min(1),
        whyItMatters: z.string().min(1),
      })
    )
    .min(1)
    .max(6),
  rewritePack: z.object({
    summary: z.string().min(1),
    bullets: z
      .array(
        z.object({
          sourceFact: z.string().min(1),
          rewritten: z.string().min(1),
          purpose: z.string().min(1),
        })
      )
      .min(1)
      .max(6),
  }),
  gapRisks: z.array(z.string()).min(1).max(6),
  nextActions: z.array(z.string()).min(1).max(6),
});

const requestSchema = z.object({
  resumeText: z.string().min(1),
  trackKey: z.string().min(1),
  jd: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof requestSchema>;

  try {
    body = requestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "请求参数不完整" }, { status: 400 });
  }

  if (!isTrackKey(body.trackKey)) {
    return NextResponse.json({ error: "目标赛道无效" }, { status: 400 });
  }

  const playbook = TRACK_PLAYBOOKS[body.trackKey];
  const originalFacts = extractResumeFacts(body.resumeText);

  const systemPrompt =
    "你是一名专门服务中国财经类高校本科毕业生的求职策略顾问。" +
    "你的任务不是泛泛润色，而是基于特定岗位赛道，把用户现有经历翻译成更贴岗的版本。" +
    "必须严格遵守以下规则：\n" +
    "1. 只能使用用户简历里已经出现的事实，不得新增实习、项目、数字或技能。\n" +
    "2. 输出要明显贴合指定赛道，而不是通用简历语言。\n" +
    "3. evidenceMap 必须引用或紧贴用户现有事实。\n" +
    "4. gapRisks 要指出证据不足、岗位不够贴或表达偏弱的地方。\n" +
    "5. rewritePack.summary 和 bullets 要可直接用于改简历。\n" +
    "6. 输出严格 JSON，不要加 Markdown。";

  const userPrompt =
    `目标赛道：${playbook.label}\n` +
    `赛道说明：${playbook.description}\n` +
    `目标岗位：${playbook.targetRoles.join("、")}\n` +
    `招聘方重点关注：${playbook.recruiterFocus.join("；")}\n` +
    `建议强调关键词：${playbook.emphasisKeywords.join("、")}\n` +
    `改写规则：${playbook.rewriteRules.join("；")}\n` +
    `需要避免的弱表达：${playbook.avoidPhrases.join("、")}\n` +
    `\n原始事实清单（sourceFact 只能从这里原样复制，不能改写）：\n${originalFacts
      .map((fact, index) => `${index + 1}. ${fact}`)
      .join("\n")}\n` +
    `\n简历原文：\n${body.resumeText}\n` +
    (body.jd ? `\n目标 JD：\n${body.jd}\n` : "\n目标 JD：未提供，请仅根据赛道要求进行判断。\n") +
    `\n额外要求：\n` +
    `1. rewritePack.bullets 必须是对象数组，每个对象都包含 sourceFact、rewritten、purpose。\n` +
    `2. sourceFact 必须直接复制自上面的原始事实清单，不能重新组织语言。\n` +
    `3. rewritten 必须比 sourceFact 更像 ${playbook.label} 的简历句子，不能与 sourceFact 完全相同。\n` +
    `4. 如果原始事实偏弱，也要保留事实边界，只能加强岗位化表达，不能新增没有出现过的经历。\n` +
    `\n请输出 JSON，字段必须包含：` +
    `positioning, recruiterLens, keywordsToEmphasize, evidenceMap, rewritePack, gapRisks, nextActions。`;

  try {
    const parsed = await chatJson(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      (raw) => {
        try {
          const normalized = normalizeTrackVersionResponse(
            parseJsonResponse(raw),
            originalFacts
          );
          const parsed = trackVersionResponseSchema.parse(normalized);

          if (!hasMeaningfulTrackRewrite(parsed)) {
            throw new Error("LLM 结构化输出校验失败");
          }

          return parsed;
        } catch {
          throw new Error("LLM 结构化输出校验失败");
        }
      },
      {
        temperature: 0.15,
        responseFormat: "json_object",
        maxTokens: 2200,
        maxRetries: 1,
      }
    );

    return NextResponse.json(parsed);
  } catch (error) {
    const friendlyError = getUserFacingLlmError(error);
    return NextResponse.json(
      { error: friendlyError.message },
      { status: friendlyError.status }
    );
  }
}

function normalizeTrackVersionResponse(raw: unknown, originalFacts: string[]) {
  const source = isRecord(raw) ? raw : {};
  const rewritePackSource = isRecord(source.rewritePack)
    ? source.rewritePack
    : isRecord(source.versionPack)
    ? source.versionPack
    : {};

  return {
    positioning: pickFirstString(source, ["positioning", "position", "narrative"]),
    recruiterLens: normalizeStringArray(
      source.recruiterLens ?? source.recruiterFocus ?? source.focus
    ),
    keywordsToEmphasize: normalizeStringArray(
      source.keywordsToEmphasize ?? source.keywords ?? source.highlightKeywords
    ),
    evidenceMap: normalizeEvidenceItems(source.evidenceMap ?? source.evidence),
    rewritePack: {
      summary: pickFirstString(rewritePackSource, ["summary", "positionSummary"]),
      bullets: normalizeRewriteBullets(
        rewritePackSource.bullets ?? rewritePackSource.rewrites,
        originalFacts
      ),
    },
    gapRisks: normalizeStringArray(source.gapRisks ?? source.risks ?? source.gaps),
    nextActions: normalizeStringArray(source.nextActions ?? source.actions ?? source.nextSteps),
  };
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n；;]+/)
      .map((item) => item.trim().replace(/^[-•\d.、\s]+/, ""))
      .filter(Boolean);
  }

  return [];
}

function normalizeEvidenceItems(value: unknown) {
  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, rawValue]) => {
        const sourceFact = typeof rawValue === "string" && rawValue.trim() ? rawValue.trim() : key;
        const whyItMatters = `${key} 这条证据可以被前置成更贴近目标赛道的表达。`;

        return {
          sourceFact,
          whyItMatters,
        };
      })
      .filter((item) => item.sourceFact);
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return {
          sourceFact: item.trim(),
          whyItMatters: "这条经历和目标赛道存在直接关联，值得被前置表达。",
        };
      }

      if (!isRecord(item)) {
        return null;
      }

      const sourceFact = pickFirstString(item, [
        "sourceFact",
        "fact",
        "evidence",
        "rawFact",
      ]);
      const whyItMatters = pickFirstString(item, [
        "whyItMatters",
        "reason",
        "value",
        "translation",
      ]);

      if (!sourceFact || !whyItMatters) {
        return null;
      }

      return { sourceFact, whyItMatters };
    })
    .filter((item): item is { sourceFact: string; whyItMatters: string } => Boolean(item));
}

function normalizeRewriteBullets(value: unknown, originalFacts: string[]) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        const rewritten = item.trim();
        const sourceFact = findClosestOriginalFact(rewritten, originalFacts);

        return {
          sourceFact: sourceFact || rewritten,
          rewritten,
          purpose: "把这条经历调整成更贴近目标赛道的表达。",
        };
      }

      if (!isRecord(item)) {
        return null;
      }

      const sourceFact = pickFirstString(item, [
        "sourceFact",
        "rawFact",
        "fact",
        "before",
      ]);
      const rewritten = pickFirstString(item, [
        "rewritten",
        "after",
        "rewrite",
        "bullet",
      ]);
      const purpose = pickFirstString(item, [
        "purpose",
        "reason",
        "goal",
        "why",
      ]);

      if (!rewritten) {
        return null;
      }

      const resolvedSourceFact =
        sourceFact && !looksLikeRewriteInsteadOfFact(sourceFact, rewritten)
          ? sourceFact
          : findClosestOriginalFact(sourceFact || rewritten, originalFacts) || sourceFact || rewritten;

      return {
        sourceFact: resolvedSourceFact,
        rewritten,
        purpose: purpose || "把这条经历调整成更贴近目标赛道的表达。",
      };
    })
    .filter(
      (
        item
      ): item is { sourceFact: string; rewritten: string; purpose: string } => Boolean(item)
    );
}

function pickFirstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractResumeFacts(resumeText: string) {
  const lines = resumeText
    .split(/\n+/)
    .flatMap((line) => line.split(/[。；;]/))
    .map((item) => item.trim().replace(/^[-•\d.、\s]+/, ""))
    .filter((item) => item.length >= 8);

  return [...new Set(lines)].slice(0, 8);
}

function findClosestOriginalFact(candidate: string, originalFacts: string[]) {
  if (!candidate.trim() || originalFacts.length === 0) {
    return "";
  }

  let bestFact = "";
  let bestScore = 0;

  for (const fact of originalFacts) {
    const score = similarityScore(candidate, fact);

    if (score > bestScore) {
      bestScore = score;
      bestFact = fact;
    }
  }

  return bestScore >= 0.18 ? bestFact : originalFacts[0] ?? "";
}

function similarityScore(left: string, right: string) {
  const leftTokens = createNgrams(normalizeForMatch(left));
  const rightTokens = createNgrams(normalizeForMatch(right));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  return intersection / Math.max(leftTokens.size, rightTokens.size);
}

function createNgrams(text: string) {
  const tokens = new Set<string>();

  if (text.length <= 2) {
    if (text) {
      tokens.add(text);
    }
    return tokens;
  }

  for (let index = 0; index < text.length - 1; index += 1) {
    tokens.add(text.slice(index, index + 2));
  }

  return tokens;
}

function normalizeForMatch(text: string) {
  return text.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
}

function looksLikeRewriteInsteadOfFact(sourceFact: string, rewritten: string) {
  if (!sourceFact || !rewritten) {
    return false;
  }

  return similarityScore(sourceFact, rewritten) > 0.92 && sourceFact.length >= rewritten.length - 6;
}

function hasMeaningfulTrackRewrite(result: z.infer<typeof trackVersionResponseSchema>) {
  return result.rewritePack.bullets.some(
    (bullet) => similarityScore(bullet.sourceFact, bullet.rewritten) < 0.82
  );
}
