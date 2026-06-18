import { Document } from "@/lib/rag/vectorstore";

export const AUDIT_QUESTIONS: Omit<Document, "id">[] = [
  {
    content: "请解释应收账款周转率的计算公式及其在财务分析中的意义。",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "PwC",
      difficulty: "初级",
      year: 2024,
    },
  },
  {
    content: "在审计中，如何评估客户的内部控制有效性？请说明控制测试的步骤。",
    metadata: {
      type: "question",
      category: "审计流程",
      source: "Deloitte",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "请解释IFRS 15对收入确认的影响，以及如何判断合同履约进度。",
    metadata: {
      type: "question",
      category: "会计准则",
      source: "EY",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "风险管理在审计中的重要性，如何识别和应对重大错报风险？",
    metadata: {
      type: "question",
      category: "风险管理",
      source: "KPMG",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "请举例说明如何分析一家上市公司的盈利能力指标，包括毛利率、净利率、ROE等。",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "PwC",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "在审计存货时，如何识别存货减值迹象？请说明减值测试的流程。",
    metadata: {
      type: "question",
      category: "审计程序",
      source: "Deloitte",
      difficulty: "高级",
      year: 2024,
    },
  },
  {
    content: "解释增值税和企业所得税的主要区别，以及企业在税务筹划中应注意的原则。",
    metadata: {
      type: "question",
      category: "税务",
      source: "EY",
      difficulty: "初级",
      year: 2024,
    },
  },
  {
    content: "分析上市公司财务报表中的现金流量指标，包括经营活动现金流、投资活动现金流和筹资活动现金流。",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "KPMG",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "审计人员在发现重大错报风险时，应该如何与客户沟通并制定应对策略？",
    metadata: {
      type: "question",
      category: "审计沟通",
      source: "PwC",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "请解释IFRS 9金融工具分类，以及摊余成本和以公允价值计量且其变动计入其他综合收益的分类标准。",
    metadata: {
      type: "question",
      category: "会计准则",
      source: "Deloitte",
      difficulty: "高级",
      year: 2024,
    },
  },
  {
    content: "分析资产负债率、流动比率、速动比率等偿债能力指标的意义和局限性。",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "EY",
      difficulty: "初级",
      year: 2024,
    },
  },
  {
    content: "审计师如何评估坏账准备计提的合理性？请说明相关审计程序。",
    metadata: {
      type: "question",
      category: "审计程序",
      source: "KPMG",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "请解释税务筹划的含义、目的以及需要注意的法律风险和道德风险。",
    metadata: {
      type: "question",
      category: "税务",
      source: "PwC",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "分析现金流vs净利润的关系，为什么有时净利润为正但现金流为负？",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "Deloitte",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "审计人员在执行函证程序时，如何确保函证过程的独立性和有效性？",
    metadata: {
      type: "question",
      category: "审计程序",
      source: "EY",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "请分析ROA（总资产回报率）和ROE（净资产收益率）的区别，以及它们在评估公司绩效时的作用。",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "KPMG",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "解释公允价值计量的三个层次，以及评估资产公允价值时的主要考虑因素。",
    metadata: {
      type: "question",
      category: "会计准则",
      source: "PwC",
      difficulty: "高级",
      year: 2024,
    },
  },
  {
    content: "审计团队在项目开始时如何制定审计计划？包括风险评估、重要性水平设定和资源分配。",
    metadata: {
      type: "question",
      category: "审计流程",
      source: "Deloitte",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "分析公司短期偿债能力和长期偿债能力的关系，以及财务杠杆的影响。",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "EY",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "审计师如何应对舞弊风险？请说明舞弊三角理论的应用。",
    metadata: {
      type: "question",
      category: "风险管理",
      source: "KPMG",
      difficulty: "高级",
      year: 2024,
    },
  },
  {
    content: "请解释企业所得税的税前扣除项目和不允许扣除项目，以及税收递延的影响。",
    metadata: {
      type: "question",
      category: "税务",
      source: "PwC",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "分析运营杠杆对上市公司盈利波动性的影响，以及如何管理运营风险。",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "Deloitte",
      difficulty: "高级",
      year: 2024,
    },
  },
  {
    content: "审计质量控制体系包括哪些要素？如何在日常审计工作中保持质量控制？",
    metadata: {
      type: "question",
      category: "审计流程",
      source: "EY",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "请解释资本结构理论，包括权衡理论和优序融资理论在实务中的应用。",
    metadata: {
      type: "question",
      category: "会计准则",
      source: "KPMG",
      difficulty: "高级",
      year: 2024,
    },
  },
  {
    content: "分析上市公司分部报告的意义，以及如何评估各业务分部的盈利能力。",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "PwC",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "审计师如何评估期后事项的影响？请说明常见的期后事项类型和应对策略。",
    metadata: {
      type: "question",
      category: "审计程序",
      source: "Deloitte",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "解释股票回购和现金分红对公司财务指标的影响，以及投资者如何看待这些行为。",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "EY",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "审计报告的类型有哪些？无保留意见、保留意见、否定意见、无法表示意见的区别是什么？",
    metadata: {
      type: "question",
      category: "审计流程",
      source: "KPMG",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "请分析并购财务顾问在并购交易中的作用，包括估值方法、交易结构设计和风险控制。",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "PwC",
      difficulty: "高级",
      year: 2024,
    },
  },
  {
    content: "分析上市公司的成长能力指标，包括营业收入增长率、净利润增长率等，以及如何判断公司是否处于成长期。",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "Deloitte",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "审计师在信息化审计中面临哪些挑战？如何利用IT审计工具提高审计效率？",
    metadata: {
      type: "question",
      category: "审计程序",
      source: "EY",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "请解释企业年金制度、补充医疗保险等员工福利的会计处理方式。",
    metadata: {
      type: "question",
      category: "会计准则",
      source: "KPMG",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "分析上市公司关联交易对财务报表的影响，以及如何识别和披露关联交易。",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "PwC",
      difficulty: "高级",
      year: 2024,
    },
  },
  {
    content: "审计师如何评估研发费用资本化与费用化的判断？请说明相关会计政策和披露要求。",
    metadata: {
      type: "question",
      category: "审计程序",
      source: "Deloitte",
      difficulty: "高级",
      year: 2024,
    },
  },
  {
    content: "解释盈余管理的手法和动机，以及监管层如何识别和应对盈余管理行为。",
    metadata: {
      type: "question",
      category: "风险管理",
      source: "EY",
      difficulty: "高级",
      year: 2024,
    },
  },
  {
    content: "请分析供应链金融模式对企业资产负债表的影响，以及如何评估供应链金融的风险。",
    metadata: {
      type: "question",
      category: "财务分析",
      source: "KPMG",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "审计师在数据审计中如何进行数据采集、数据清洗和数据分析？请说明大数据审计的方法。",
    metadata: {
      type: "question",
      category: "审计程序",
      source: "PwC",
      difficulty: "高级",
      year: 2024,
    },
  },
];

export const FINANCIAL_CASES: Omit<Document, "id">[] = [
  {
    content: "案例：某上市公司2018-2022年营业收入连续增长，但毛利率从40%下降到25%，净利润增长缓慢。请分析可能的原因，并提出针对性的改进建议。",
    metadata: {
      type: "case",
      category: "案例分析",
      source: "PwC",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "案例：某制造企业应收账款周转率逐年下降，且逾期账款比例上升。请从客户信用管理、收账政策、合同条款等方面分析可能的原因，并提出改进措施。",
    metadata: {
      type: "case",
      category: "案例分析",
      source: "Deloitte",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "案例：某科技公司采用IFRS 16租赁准则后，资产负债率从50%上升至75%，负债水平大幅增加。请解释IFRS 16的影响，并分析这对财务分析的意义。",
    metadata: {
      type: "case",
      category: "会计准则",
      source: "EY",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "案例：某零售企业各季度毛利率波动较大，且年末存货减值准备激增。请分析可能的原因，并提出存货管理改进建议。",
    metadata: {
      type: "case",
      category: "案例分析",
      source: "KPMG",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "案例：某上市公司通过股权激励计划大幅增加当期成本，导致净利润率下降。请分析股权激励对财务报表的影响，以及如何评估股权激励方案的有效性。",
    metadata: {
      type: "case",
      category: "财务分析",
      source: "PwC",
      difficulty: "高级",
      year: 2024,
    },
  },
];

export const FINANCIAL_FRAMEWORKS: Omit<Document, "id">[] = [
  {
    content: "财务分析框架：杜邦分析法（DuPont Analysis）的三层分解，即ROE分解为净利润率×资产周转率×权益乘数，以及各指标的变化如何影响股东回报。",
    metadata: {
      type: "framework",
      category: "分析框架",
      source: "PwC",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "财务比率分类体系：流动性比率（流动比率、速动比率）、营运能力比率（存货周转率、应收账款周转率）、盈利能力比率（毛利率、净利率、ROE）、偿债能力比率（资产负债率、利息保障倍数）、发展能力比率（营收增长率、利润增长率）。",
    metadata: {
      type: "framework",
      category: "分析框架",
      source: "Deloitte",
      difficulty: "初级",
      year: 2024,
    },
  },
  {
    content: "现金流分析框架：经营活动现金流、投资活动现金流、筹资活动现金流的构成及其相互关系，以及自由现金流的计算方法。",
    metadata: {
      type: "framework",
      category: "分析框架",
      source: "EY",
      difficulty: "初级",
      year: 2024,
    },
  },
  {
    content: "财务报表勾稽关系：资产负债表、利润表、现金流量表之间的内在联系，以及如何通过勾稽关系验证财务报表的准确性。",
    metadata: {
      type: "framework",
      category: "分析框架",
      source: "KPMG",
      difficulty: "中级",
      year: 2024,
    },
  },
];

export const TECHNICAL_STANDARDS: Omit<Document, "id">[] = [
  {
    content: "审计准则要求：了解被审计单位及其环境时需要考虑哪些因素？包括行业状况、监管环境、被审计单位的性质、会计政策的选择和应用等。",
    metadata: {
      type: "technical",
      category: "审计准则",
      source: "PwC",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "会计准则重点：IFRS 9金融工具、IFRS 15收入确认、IFRS 16租赁、IFRS 16与IAS 17的区别、IFRS 2股份支付等。",
    metadata: {
      type: "technical",
      category: "会计准则",
      source: "Deloitte",
      difficulty: "高级",
      year: 2024,
    },
  },
  {
    content: "税务法规要点：增值税征收范围、企业所得税税前扣除项目、个人所得税扣除标准、税收优惠政策等。",
    metadata: {
      type: "technical",
      category: "税务",
      source: "EY",
      difficulty: "中级",
      year: 2024,
    },
  },
  {
    content: "风险管理框架：COSO内部控制框架五要素（控制环境、风险评估、控制活动、信息与沟通、监督活动）、SOX法案要求等。",
    metadata: {
      type: "technical",
      category: "风险管理",
      source: "KPMG",
      difficulty: "高级",
      year: 2024,
    },
  },
];

export const ALL_AUDIT_CONTENT = [
  ...AUDIT_QUESTIONS,
  ...FINANCIAL_CASES,
  ...FINANCIAL_FRAMEWORKS,
  ...TECHNICAL_STANDARDS,
];
