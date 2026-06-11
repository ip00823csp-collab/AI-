import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatJson, parseJsonResponse } from "@/lib/llm";
import {
  TRACK_PLAYBOOKS,
  type TrackKey,
  isTrackKey,
} from "@/lib/track-playbooks";

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

const trackRewriteSchema = z.object({
  positioning: z.string().min(1),
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
    "你的任务是基于特定岗位赛道，把用户现有经历翻译成更贴岗的简历表达。" +
    "必须严格遵守以下规则：\n" +
    "1. 只能使用用户简历里已经出现的事实，不得新增实习、项目、数字或技能。\n" +
    "2. 你只需要输出 positioning 和 rewritePack，不要输出多余字段。\n" +
    "3. sourceFact 必须直接复制原始事实清单里的原句。\n" +
    "4. rewritten 必须明显比 sourceFact 更像目标赛道简历句子，不能与 sourceFact 完全相同。\n" +
    "5. 输出严格 JSON，不要加 Markdown。";

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
    `1. rewritePack.summary 必须是一段可以直接放进简历开头的赛道版定位摘要。\n` +
    `2. rewritePack.bullets 必须是对象数组，每个对象都包含 sourceFact、rewritten、purpose。\n` +
    `3. sourceFact 必须直接复制自上面的原始事实清单，不能重新组织语言。\n` +
    `4. rewritten 必须比 sourceFact 更像 ${playbook.label} 的简历句子，不能与 sourceFact 完全相同。\n` +
    `5. 如果原始事实偏弱，也要保留事实边界，只能加强岗位化表达，不能新增没有出现过的经历。\n` +
    `\n请只输出 JSON，字段必须包含：positioning, rewritePack。`;

  try {
    const rewriteResult = await chatJson(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      (raw) => {
        try {
          const parsed = trackRewriteSchema.parse(
            normalizeTrackRewriteResponse(parseJsonResponse(raw), originalFacts)
          );

          if (!hasMeaningfulTrackRewrite(parsed)) {
            throw new Error("LLM 结构化输出校验失败");
          }

          return parsed;
        } catch {
          throw new Error("LLM 结构化输出校验失败");
        }
      },
      {
        temperature: 0.1,
        responseFormat: "json_object",
        maxTokens: 1100,
        maxRetries: 0,
        timeoutMs: 18000,
      }
    );

    const parsed = trackVersionResponseSchema.parse(
      buildTrackVersionResponse(rewriteResult, playbook, originalFacts, body.jd)
    );

    return NextResponse.json(parsed);
  } catch {
    const fallback = buildDeterministicTrackVersion(playbook, originalFacts, body.jd);

    return NextResponse.json(fallback);
  }
}

function normalizeTrackRewriteResponse(raw: unknown, originalFacts: string[]) {
  const source = isRecord(raw) ? raw : {};
  const rewritePackSource = isRecord(source.rewritePack)
    ? source.rewritePack
    : isRecord(source.versionPack)
    ? source.versionPack
    : {};

  return {
    positioning: pickFirstString(source, ["positioning", "position", "narrative"]),
    rewritePack: {
      summary: pickFirstString(rewritePackSource, ["summary", "positionSummary"]),
      bullets: normalizeRewriteBullets(
        rewritePackSource.bullets ?? rewritePackSource.rewrites,
        originalFacts
      ),
    },
  };
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

function buildTrackVersionResponse(
  rewriteResult: z.infer<typeof trackRewriteSchema>,
  playbook: (typeof TRACK_PLAYBOOKS)[keyof typeof TRACK_PLAYBOOKS],
  originalFacts: string[],
  jd?: string
) {
  const highlightedKeywords = pickHighlightedKeywords(playbook, jd);

  return {
    positioning:
      rewriteResult.positioning ||
      `这份简历更适合定位为${playbook.label}候选人，建议围绕 ${highlightedKeywords.join("、")} 继续强化表达。`,
    recruiterLens: playbook.recruiterFocus.slice(0, 3),
    keywordsToEmphasize: playbook.emphasisKeywords.slice(0, 7),
    evidenceMap: buildEvidenceMap(originalFacts, playbook),
    rewritePack: rewriteResult.rewritePack,
    gapRisks: buildGapRisks(originalFacts, playbook, jd),
    nextActions: buildNextActions(playbook, jd),
  };
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

function hasMeaningfulTrackRewrite(result: z.infer<typeof trackRewriteSchema>) {
  return result.rewritePack.bullets.some(
    (bullet) => similarityScore(bullet.sourceFact, bullet.rewritten) < 0.82
  );
}

function buildEvidenceMap(
  originalFacts: string[],
  playbook: (typeof TRACK_PLAYBOOKS)[keyof typeof TRACK_PLAYBOOKS]
) {
  return originalFacts.slice(0, 4).map((fact, index) => ({
    sourceFact: fact,
    whyItMatters:
      index === 0
        ? `这条事实可以被翻译成更贴近${playbook.shortLabel}方向的核心卖点。`
        : `这条事实能支撑 ${playbook.emphasisKeywords[index % playbook.emphasisKeywords.length]} 相关表达。`,
  }));
}

function buildGapRisks(
  originalFacts: string[],
  playbook: (typeof TRACK_PLAYBOOKS)[keyof typeof TRACK_PLAYBOOKS],
  jd?: string
) {
  const risks: string[] = [];

  if (!originalFacts.some((fact) => /结果|提升|分析|指标|报表|核对|沟通|协作/.test(fact))) {
    risks.push("现有事实更多是经历罗列，缺少结果、分析动作或岗位价值的明确呈现。");
  }

  if (jd && !/报表|指标|预算|分析|估值|研究|客户|沟通/.test(jd)) {
    risks.push("当前 JD 信息偏少，赛道版本更多依赖岗位通用打法，贴岗精度会受影响。");
  }

  risks.push(`还需要继续补强与${playbook.shortLabel}直接相关的证据，比如 ${playbook.emphasisKeywords.slice(0, 3).join("、")}。`);

  return risks.slice(0, 3);
}

function buildNextActions(
  playbook: (typeof TRACK_PLAYBOOKS)[keyof typeof TRACK_PLAYBOOKS],
  jd?: string
) {
  const actions = [
    `优先把现有经历改写成更贴近 ${playbook.shortLabel} 的语言，避免出现 ${playbook.avoidPhrases.slice(0, 2).join("、")} 这类弱表达。`,
    `下一轮补充能支撑 ${playbook.emphasisKeywords.slice(0, 3).join("、")} 的事实证据，比如处理量、分析动作或输出结果。`,
  ];

  if (jd) {
    actions.push("把目标 JD 里的关键词逐条对照这份赛道版本，再决定哪些段落需要继续补强。");
  }

  return actions.slice(0, 3);
}

function buildDeterministicTrackVersion(
  playbook: (typeof TRACK_PLAYBOOKS)[keyof typeof TRACK_PLAYBOOKS],
  originalFacts: string[],
  jd?: string
) {
  const facts = originalFacts.slice(0, 3);
  const highlightedKeywords = pickHighlightedKeywords(playbook, jd);

  return trackVersionResponseSchema.parse({
    positioning: buildDeterministicPositioning(playbook, originalFacts, highlightedKeywords),
    recruiterLens: playbook.recruiterFocus.slice(0, 3),
    keywordsToEmphasize: playbook.emphasisKeywords.slice(0, 7),
    evidenceMap: buildEvidenceMap(originalFacts, playbook),
    rewritePack: {
      summary: buildDeterministicSummary(playbook, originalFacts, highlightedKeywords),
      bullets: facts.map((fact, index) => ({
        sourceFact: fact,
        rewritten: rewriteFactForTrack(playbook.key, fact, highlightedKeywords[index % highlightedKeywords.length] ?? highlightedKeywords[0]),
        purpose: buildRewritePurpose(playbook, fact),
      })),
    },
    gapRisks: buildGapRisks(originalFacts, playbook, jd),
    nextActions: buildNextActions(playbook, jd),
  });
}

function pickHighlightedKeywords(
  playbook: (typeof TRACK_PLAYBOOKS)[keyof typeof TRACK_PLAYBOOKS],
  jd?: string
) {
  if (!jd) {
    return playbook.emphasisKeywords.slice(0, 3);
  }

  const matched = playbook.emphasisKeywords.filter((keyword) =>
    jd.toLowerCase().includes(keyword.toLowerCase())
  );

  return (matched.length > 0 ? matched : playbook.emphasisKeywords).slice(0, 3);
}

function buildDeterministicPositioning(
  playbook: (typeof TRACK_PLAYBOOKS)[keyof typeof TRACK_PLAYBOOKS],
  originalFacts: string[],
  highlightedKeywords: string[]
) {
  const hasInternship = originalFacts.some((fact) => classifyFact(fact) === "internship");
  const hasProject = originalFacts.some((fact) => classifyFact(fact) === "project");

  if (hasInternship && hasProject) {
    return `这份简历可以定位成${playbook.label}候选人，现有经历已经覆盖实习执行和分析训练两类基础，建议重点放大 ${highlightedKeywords.join("、")} 相关卖点。`;
  }

  if (hasInternship) {
    return `这份简历更适合走${playbook.label}路线，建议把现有实习经历进一步翻译成 ${highlightedKeywords.join("、")} 的岗位语言。`;
  }

  return `这份简历可以先按${playbook.label}方向包装，重点围绕 ${highlightedKeywords.join("、")} 建立更清楚的岗位形象。`;
}

function buildDeterministicSummary(
  playbook: (typeof TRACK_PLAYBOOKS)[keyof typeof TRACK_PLAYBOOKS],
  originalFacts: string[],
  highlightedKeywords: string[]
) {
  const educationFact =
    originalFacts.find((fact) => classifyFact(fact) === "education") ??
    "具备财经类本科基础训练";
  const internshipFact = originalFacts.find((fact) => classifyFact(fact) === "internship");
  const projectFact = originalFacts.find((fact) => classifyFact(fact) === "project");

  const summaryParts = [trimFact(educationFact)];

  if (internshipFact) {
    summaryParts.push("拥有与财务数据处理相关的实习基础");
  }

  if (projectFact) {
    summaryParts.push("具备课程项目中的分析训练");
  }

  summaryParts.push(`可围绕 ${highlightedKeywords.join("、")} 方向投递${playbook.shortLabel}相关岗位`);

  return `${summaryParts.filter(Boolean).join("，")}。`;
}

function buildRewritePurpose(
  playbook: (typeof TRACK_PLAYBOOKS)[keyof typeof TRACK_PLAYBOOKS],
  fact: string
) {
  const kind = classifyFact(fact);

  if (kind === "education") {
    return `把基础背景翻译成更贴近${playbook.shortLabel}方向的岗位起点。`;
  }

  if (kind === "internship") {
    return `把经历描述从“做过哪些事”升级成“能为${playbook.shortLabel}岗位提供什么支持”。`;
  }

  if (kind === "project") {
    return `把项目事实转成更像${playbook.shortLabel}会认可的分析与输出能力。`;
  }

  if (kind === "campus") {
    return `把校园经历提炼成${playbook.shortLabel}岗位也看重的沟通、推进或执行能力。`;
  }

  return `先把这条事实对齐到${playbook.shortLabel}方向，再继续补充证据和结果。`;
}

function rewriteFactForTrack(trackKey: TrackKey, fact: string, keyword: string) {
  const cleanFact = trimFact(fact);
  const kind = classifyFact(cleanFact);

  switch (trackKey) {
    case "finance_analysis":
      return rewriteFinanceAnalysisFact(cleanFact, kind, keyword);
    case "audit_tax":
      return rewriteAuditTaxFact(cleanFact, kind, keyword);
    case "industry_research":
      return rewriteIndustryResearchFact(cleanFact, kind, keyword);
    case "banking_mt":
      return rewriteBankingMtFact(cleanFact, kind, keyword);
    case "business_analysis":
      return rewriteBusinessAnalysisFact(cleanFact, kind, keyword);
    default:
      return `${cleanFact}，建议继续突出 ${keyword} 相关动作、结果和岗位价值。`;
  }
}

function rewriteFinanceAnalysisFact(fact: string, kind: FactKind, keyword: string) {
  if (kind === "education") {
    return `${fact}，具备财务与会计基础训练，可快速进入财务分析、报表解读和经营复盘场景。`;
  }

  if (kind === "internship") {
    return `${fact}，并将数据整理与核对工作进一步转化为对 ${joinUniquePhrases([
      "财务报表",
      "经营指标",
      keyword,
    ]).join("、")} 逻辑的基础理解。`;
  }

  if (kind === "project") {
    return `${fact}，体现出对财务数据对比、关键指标观察和分析结论表达的基础能力。`;
  }

  if (kind === "campus") {
    return `${fact}，可补充为跨团队协作、汇报推进和结果跟进能力，支撑财务分析中的沟通场景。`;
  }

  return `${fact}，建议继续围绕 ${keyword} 视角补强分析动作、判断过程和结论表达。`;
}

function rewriteAuditTaxFact(fact: string, kind: FactKind, keyword: string) {
  if (kind === "education") {
    return `${fact}，具备财务与审计基础课程训练，可快速适应底稿整理、凭证核对和复核类工作。`;
  }

  if (kind === "internship") {
    return `${fact}，能够进一步体现对底稿、凭证核对、数据准确性和审计流程支持的执行能力。`;
  }

  if (kind === "project") {
    return `${fact}，可转化为报表阅读、数据核对和 ${keyword} 相关的基础判断能力。`;
  }

  return `${fact}，建议继续强调 ${keyword}、细节准确性和稳定执行能力。`;
}

function rewriteIndustryResearchFact(fact: string, kind: FactKind, keyword: string) {
  if (kind === "education") {
    return `${fact}，具备财经基础训练，可作为财报阅读、行业理解和研究表达的起点。`;
  }

  if (kind === "internship") {
    return `${fact}，可进一步翻译成资料整理、数据校验和支持研究判断的基础工作能力。`;
  }

  if (kind === "project") {
    return `${fact}，体现出公司对比、财务数据梳理和 ${keyword} 相关的研究型表达能力。`;
  }

  return `${fact}，建议继续围绕 ${keyword}、观点整理和输出能力强化表达。`;
}

function rewriteBankingMtFact(fact: string, kind: FactKind, keyword: string) {
  if (kind === "education") {
    return `${fact}，具备财经类本科基础训练，可作为银行管培与综合管理培养路径的起点。`;
  }

  if (kind === "internship") {
    return `${fact}，可进一步强调执行稳定性、沟通配合和对业务流程的支持能力。`;
  }

  if (kind === "campus") {
    return `${fact}，能够突出组织协调、推进落地和 ${keyword} 相关的综合素质表现。`;
  }

  return `${fact}，建议继续补强 ${keyword}、服务意识和可靠执行的岗位表达。`;
}

function rewriteBusinessAnalysisFact(fact: string, kind: FactKind, keyword: string) {
  if (kind === "education") {
    return `${fact}，具备数据与财经基础训练，可快速进入商业分析与经营分析场景。`;
  }

  if (kind === "internship") {
    return `${fact}，建议进一步突出数据整理如何支持问题拆解、指标观察和业务判断。`;
  }

  if (kind === "project") {
    return `${fact}，可以被翻译成围绕业务问题的分析过程、指标解读和结论输出能力。`;
  }

  return `${fact}，建议继续围绕 ${keyword}、结构化分析和落地建议增强表达。`;
}

type FactKind = "education" | "internship" | "project" | "campus" | "general";

function classifyFact(fact: string): FactKind {
  if (/(大学|本科|专业|应届|学院|GPA)/.test(fact)) {
    return "education";
  }

  if (/(项目|课程|商赛|研究|比赛|案例|分析|报告)/.test(fact)) {
    return "project";
  }

  if (/(学生会|社团|活动|部长|主席|班长|志愿|组织)/.test(fact)) {
    return "campus";
  }

  if (/(实习|事务所|公司|银行|券商|咨询|底稿|凭证|核对|汇总|Excel|报表)/.test(fact)) {
    return "internship";
  }

  return "general";
}

function trimFact(fact: string) {
  return fact.trim().replace(/[。；;，,\s]+$/u, "");
}

function joinUniquePhrases(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}
