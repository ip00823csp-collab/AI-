export type TrackKey =
  | "audit_tax"
  | "finance_analysis"
  | "industry_research"
  | "banking_mt"
  | "business_analysis";

export interface TrackPlaybook {
  key: TrackKey;
  label: string;
  shortLabel: string;
  description: string;
  targetRoles: string[];
  recruiterFocus: string[];
  emphasisKeywords: string[];
  rewriteRules: string[];
  avoidPhrases: string[];
}

export const TRACK_PLAYBOOKS: Record<TrackKey, TrackPlaybook> = {
  audit_tax: {
    key: "audit_tax",
    label: "四大审计 / 税务版",
    shortLabel: "审计税务",
    description: "更强调底稿、核对、报表、细节严谨与跨团队协作。",
    targetRoles: ["审计实习生", "税务实习生", "财务审计岗", "风险咨询岗"],
    recruiterFocus: [
      "有没有体现财务报表、底稿、凭证或数据核对的细节工作",
      "能不能证明细致、严谨、抗压和执行稳定性",
      "是否出现跨部门沟通、盘点、抽样、合规相关表达",
    ],
    emphasisKeywords: ["底稿", "凭证核对", "报表分析", "抽样", "盘点", "Excel", "准确性"],
    rewriteRules: [
      "把杂项协助翻译成核对、盘点、复核、整理分析等专业动作",
      "优先强调准确率、处理量、时效和审计流程理解",
      "避免写成单纯行政支持或学生会式口吻",
    ],
    avoidPhrases: ["帮忙整理材料", "参与一些工作", "做过基础事务"],
  },
  finance_analysis: {
    key: "finance_analysis",
    label: "财务分析版",
    shortLabel: "财务分析",
    description: "更强调报表理解、预算意识、数据处理和经营分析视角。",
    targetRoles: ["财务分析实习生", "FP&A", "管理会计", "经营分析"],
    recruiterFocus: [
      "是否体现报表、预算、成本、经营指标等基础分析能力",
      "有没有把数据整理升级成分析判断和业务支持",
      "是否能证明 Excel、建模、汇报和沟通能力",
    ],
    emphasisKeywords: ["财务报表", "预算", "经营指标", "成本分析", "Excel", "数据整理", "汇报"],
    rewriteRules: [
      "把数据处理写成支持业务判断或经营分析的动作",
      "优先出现指标、分析、复盘、汇总、对比等表达",
      "不要只停留在做表和搬运数据",
    ],
    avoidPhrases: ["负责做表", "整理过数据", "做过一些分析"],
  },
  industry_research: {
    key: "industry_research",
    label: "行业研究版",
    shortLabel: "行业研究",
    description: "更强调信息搜集、公司对比、观点整理和研究表达。",
    targetRoles: ["行研助理", "券商研究所实习生", "投资研究实习生"],
    recruiterFocus: [
      "有没有资料收集、行业跟踪、公司对比、财报阅读相关证据",
      "是否体现观点整理、输出能力和研究耐心",
      "是否能把课程项目或商赛翻译成研究场景",
    ],
    emphasisKeywords: ["行业跟踪", "公司对比", "财报阅读", "资料整理", "观点输出", "Excel", "Wind"],
    rewriteRules: [
      "把写报告翻译成资料收集、公司比较、逻辑整理和观点表达",
      "优先出现行业、公司、财报、估值、跟踪等词",
      "避免空泛地说自己热爱研究却没有证据",
    ],
    avoidPhrases: ["写过报告", "看过研报", "对行业有兴趣"],
  },
  banking_mt: {
    key: "banking_mt",
    label: "银行 / 管培生版",
    shortLabel: "银行管培",
    description: "更强调综合素质、客户意识、执行稳定性和轮岗成长潜力。",
    targetRoles: ["银行管培生", "银行营销培训生", "运营管理培训生"],
    recruiterFocus: [
      "是否体现服务意识、沟通协作、执行与抗压能力",
      "有没有活动组织、跨团队推进或客户接触相关经历",
      "表达是否成熟稳妥，适合综合管理培养路径",
    ],
    emphasisKeywords: ["沟通协作", "客户意识", "执行力", "协调推进", "抗压", "服务", "综合素质"],
    rewriteRules: [
      "把校园经历和实习经历改成组织协调、流程推进和服务结果",
      "突出稳定、可靠、执行和成长潜力",
      "不要写得过于锋利或只强调单点技术能力",
    ],
    avoidPhrases: ["只是打杂", "跟着做", "做了很多琐事"],
  },
  business_analysis: {
    key: "business_analysis",
    label: "商业分析版",
    shortLabel: "商业分析",
    description: "更强调数据洞察、业务理解、问题拆解和结果表达。",
    targetRoles: ["商业分析", "经营分析", "数据分析实习生", "策略分析"],
    recruiterFocus: [
      "有没有问题拆解、指标分析、可视化或结论输出相关证据",
      "能否把课程、竞赛、项目经历转成业务分析语言",
      "是否体现结构化表达和沟通落地能力",
    ],
    emphasisKeywords: ["指标分析", "问题拆解", "数据洞察", "可视化", "SQL", "Excel", "业务理解"],
    rewriteRules: [
      "把数据清洗改成围绕业务问题的分析和结论输出",
      "优先出现指标、分析框架、结论、建议、可视化等表达",
      "避免只有工具名，没有业务结果",
    ],
    avoidPhrases: ["会一点数据分析", "做过清洗", "学过相关课程"],
  },
};

export const TRACK_OPTIONS = Object.values(TRACK_PLAYBOOKS);

export function isTrackKey(value: string): value is TrackKey {
  return value in TRACK_PLAYBOOKS;
}
