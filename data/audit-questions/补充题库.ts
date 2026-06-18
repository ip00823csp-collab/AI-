import { Omit } from "@/lib/rag/types";

export const ADDITIONAL_QUESTIONS: Omit<any, "id">[] = [
  {
    content: "请解释资本结构理论（MM理论、权衡理论、优序融资理论）的基本观点，并比较不同理论的适用场景。",
    metadata: { type: "question", category: "财务分析", source: "PwC", difficulty: "高级", year: 2024 },
  },
  {
    content: "分析上市公司股权激励计划的会计处理和税务影响，包括股份支付费用的确认、计量和摊销。",
    metadata: { type: "question", category: "会计准则", source: "Deloitte", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师在执行审计计划时，如何确定重要性水平？重要性水平的设定对审计程序有什么影响？",
    metadata: { type: "question", category: "审计流程", source: "EY", difficulty: "中级", year: 2024 },
  },
  {
    content: "请分析上市公司合并报表的编制方法，包括购买法、权益结合法的区别，以及商誉的确认和减值测试。",
    metadata: { type: "question", category: "财务分析", source: "KPMG", difficulty: "高级", year: 2024 },
  },
  {
    content: "审计师如何评估审计风险？请说明审计风险模型及其在审计计划中的应用。",
    metadata: { type: "question", category: "审计流程", source: "PwC", difficulty: "中级", year: 2024 },
  },
  {
    content: "分析上市公司管理层讨论与分析（MD&A）中应该包含哪些关键信息？如何评估管理层讨论的真实性？",
    metadata: { type: "question", category: "财务分析", source: "Deloitte", difficulty: "中级", year: 2024 },
  },
  {
    content: "请解释公允价值计量的三个层次，以及在不同层次下如何获取和验证公允价值数据。",
    metadata: { type: "question", category: "会计准则", source: "EY", difficulty: "高级", year: 2024 },
  },
  {
    content: "审计师在发现财务报表存在重大错报时，应该如何应对？请说明保留意见、否定意见、无法表示意见的区别。",
    metadata: { type: "question", category: "审计流程", source: "KPMG", difficulty: "高级", year: 2024 },
  },
  {
    content: "分析上市公司自由现金流（FCF）的计算方法和意义，以及如何用FCF进行企业估值。",
    metadata: { type: "question", category: "财务分析", source: "PwC", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师在执行关联方交易审计时，如何识别关联方关系？关联方交易的披露要求有哪些？",
    metadata: { type: "question", category: "审计程序", source: "Deloitte", difficulty: "中级", year: 2024 },
  },
  {
    content: "请解释股票回购的会计处理和税务影响，以及股票回购对股东权益的影响。",
    metadata: { type: "question", category: "会计准则", source: "EY", difficulty: "中级", year: 2024 },
  },
  {
    content: "分析上市公司分部报告的意义，以及如何评估各业务分部的盈利能力和风险特征。",
    metadata: { type: "question", category: "财务分析", source: "KPMG", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师如何评估期后事项的影响？请说明常见的期后事项类型和应对策略。",
    metadata: { type: "question", category: "审计程序", source: "PwC", difficulty: "中级", year: 2024 },
  },
  {
    content: "请解释企业年金制度、补充医疗保险等员工福利的会计处理方式及其对财务报表的影响。",
    metadata: { type: "question", category: "会计准则", source: "Deloitte", difficulty: "中级", year: 2024 },
  },
  {
    content: "分析上市公司每股收益（EPS）的计算方法和稀释EPS的含义，以及EPS在财务分析中的作用。",
    metadata: { type: "question", category: "财务分析", source: "EY", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师如何评估管理层诚信和职业怀疑态度？如何识别舞弊迹象？",
    metadata: { type: "question", category: "审计流程", source: "KPMG", difficulty: "高级", year: 2024 },
  },
  {
    content: "请解释税务筹划与避税的区别，企业如何进行合法的税务筹划？",
    metadata: { type: "question", category: "税务", source: "PwC", difficulty: "中级", year: 2024 },
  },
  {
    content: "分析上市公司存货周转率的变动原因，如何通过存货周转分析公司的经营效率？",
    metadata: { type: "question", category: "财务分析", source: "Deloitte", difficulty: "初级", year: 2024 },
  },
  {
    content: "审计师在信息化审计中面临哪些挑战？如何利用数据分析工具提高审计效率？",
    metadata: { type: "question", category: "审计程序", source: "EY", difficulty: "高级", year: 2024 },
  },
  {
    content: "请解释企业合并报表中商誉的确认和减值测试流程，以及减值测试的关键假设。",
    metadata: { type: "question", category: "会计准则", source: "KPMG", difficulty: "高级", year: 2024 },
  },
  {
    content: "分析上市公司长期股权投资的核算方法（成本法、权益法）及其适用场景。",
    metadata: { type: "question", category: "财务分析", source: "PwC", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师如何评估审计证据的充分性和适当性？请说明审计证据的类型和来源。",
    metadata: { type: "question", category: "审计程序", source: "Deloitte", difficulty: "中级", year: 2024 },
  },
  {
    content: "请解释个人所得税的税收优惠政策和适用条件，以及个人所得税筹划的基本原则。",
    metadata: { type: "question", category: "税务", source: "EY", difficulty: "中级", year: 2024 },
  },
  {
    content: "分析上市公司营运资本管理的效率，如何通过应收账款、存货和应付账款的管理提升企业现金流？",
    metadata: { type: "question", category: "财务分析", source: "KPMG", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师在执行函证程序时，如何确保函证过程的独立性和有效性？",
    metadata: { type: "question", category: "审计程序", source: "PwC", difficulty: "中级", year: 2024 },
  },
  {
    content: "请解释租赁会计准则（IFRS 16、ASC 842）的主要变化及其对财务报表的影响。",
    metadata: { type: "question", category: "会计准则", source: "Deloitte", difficulty: "高级", year: 2024 },
  },
  {
    content: "分析上市公司股权结构对公司治理的影响，如何通过股权结构优化公司治理？",
    metadata: { type: "question", category: "财务分析", source: "EY", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师如何评估审计风险的固有风险和控制风险？",
    metadata: { type: "question", category: "审计流程", source: "KPMG", difficulty: "中级", year: 2024 },
  },
  {
    content: "请解释企业重组、并购的会计处理方法，包括商誉的确认、减值测试和后续计量。",
    metadata: { type: "question", category: "会计准则", source: "PwC", difficulty: "高级", year: 2024 },
  },
  {
    content: "分析上市公司现金流分析的方法，如何通过现金流判断企业的财务健康状况？",
    metadata: { type: "question", category: "财务分析", source: "Deloitte", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师如何评估审计工作的独立性和客观性？",
    metadata: { type: "question", category: "审计程序", source: "EY", difficulty: "中级", year: 2024 },
  },
  {
    content: "请解释中小企业会计准则与上市公司会计准则的主要区别，及其适用范围。",
    metadata: { type: "question", category: "会计准则", source: "KPMG", difficulty: "中级", year: 2024 },
  },
  {
    content: "分析上市公司盈利质量，如何通过盈利质量指标评估企业的真实盈利能力？",
    metadata: { type: "question", category: "财务分析", source: "PwC", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师在执行穿行测试时，应该关注哪些关键控制点？",
    metadata: { type: "question", category: "审计程序", source: "Deloitte", difficulty: "中级", year: 2024 },
  },
  {
    content: "请解释增值税的纳税义务发生时间、税率结构和进项税额抵扣规则。",
    metadata: { type: "question", category: "税务", source: "EY", difficulty: "中级", year: 2024 },
  },
  {
    content: "分析上市公司企业社会责任（CSR）报告的披露内容，如何评估企业的可持续发展能力？",
    metadata: { type: "question", category: "财务分析", source: "KPMG", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师如何评估审计证据的可靠性？请说明不同审计证据的可靠性程度。",
    metadata: { type: "question", category: "审计程序", source: "PwC", difficulty: "中级", year: 2024 },
  },
  {
    content: "请解释企业债务重组的会计处理方法，包括以债转股、以资产抵债等方式。",
    metadata: { type: "question", category: "会计准则", source: "Deloitte", difficulty: "高级", year: 2024 },
  },
  {
    content: "分析上市公司投资者关系管理（IR）的作用，如何通过IR管理提升公司价值？",
    metadata: { type: "question", category: "财务分析", source: "EY", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师在执行细节测试时，如何选择测试样本和样本规模？",
    metadata: { type: "question", category: "审计程序", source: "KPMG", difficulty: "中级", year: 2024 },
  },
  {
    content: "请解释企业所得税的税前扣除项目和不允许扣除项目，以及税收递延的影响。",
    metadata: { type: "question", category: "税务", source: "PwC", difficulty: "中级", year: 2024 },
  },
  {
    content: "分析上市公司估值模型（DCF、相对估值、实物期权估值）的优缺点和适用场景。",
    metadata: { type: "question", category: "财务分析", source: "Deloitte", difficulty: "高级", year: 2024 },
  },
  {
    content: "审计师如何评估审计程序的恰当性和充分性？",
    metadata: { type: "question", category: "审计程序", source: "EY", difficulty: "中级", year: 2024 },
  },
  {
    content: "请解释企业利润分配的顺序和原则，股利政策对公司价值的影响。",
    metadata: { type: "question", category: "会计准则", source: "KPMG", difficulty: "中级", year: 2024 },
  },
  {
    content: "分析上市公司成长性指标，如何判断企业是否处于快速增长期？",
    metadata: { type: "question", category: "财务分析", source: "PwC", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师在审计计划阶段应该完成哪些主要工作？",
    metadata: { type: "question", category: "审计流程", source: "Deloitte", difficulty: "初级", year: 2024 },
  },
  {
    content: "请解释企业破产清算的会计处理方法，包括资产变现和债务清偿的顺序。",
    metadata: { type: "question", category: "会计准则", source: "EY", difficulty: "高级", year: 2024 },
  },
  {
    content: "分析上市公司绩效评价体系，如何通过关键绩效指标（KPI）评估企业绩效？",
    metadata: { type: "question", category: "财务分析", source: "KPMG", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师如何评估审计风险评估的结果？",
    metadata: { type: "question", category: "审计流程", source: "PwC", difficulty: "初级", year: 2024 },
  },
  {
    content: "请解释企业合并报表中少数股东权益的核算方法及其含义。",
    metadata: { type: "question", category: "会计准则", source: "Deloitte", difficulty: "中级", year: 2024 },
  },
  {
    content: "分析上市公司财务报表附注的披露要求，如何通过附注了解企业的财务状况？",
    metadata: { type: "question", category: "财务分析", source: "EY", difficulty: "中级", year: 2024 },
  },
  {
    content: "审计师如何选择审计抽样方法（随机抽样、系统抽样、分层抽样）？",
    metadata: { type: "question", category: "审计程序", source: "KPMG", difficulty: "中级", year: 2024 },
  },
  {
    content: "请解释企业风险管理框架（COSO）的内容及其在企业管理中的应用。",
    metadata: { type: "question", category: "风险管理", source: "PwC", difficulty: "中级", year: 2024 },
  },
];

export const TECHNICAL_STACK_QUESTIONS: Omit<any, "id">[] = [
  {
    content: "Excel 高级功能：数据透视表、VLOOKUP/XLOOKUP、条件格式、数据验证、图表制作技巧。",
    metadata: { type: "technical", category: "工具技能", source: "PwC", difficulty: "中级", year: 2024 },
  },
  {
    content: "Python 在财务分析中的应用：Pandas 处理财务数据、Matplotlib 绘图、统计分析。",
    metadata: { type: "technical", category: "工具技能", source: "Deloitte", difficulty: "中级", year: 2024 },
  },
  {
    content: "SQL 在财务分析中的应用：SELECT、JOIN、GROUP BY、聚合函数、窗口函数。",
    metadata: { type: "technical", category: "工具技能", source: "EY", difficulty: "中级", year: 2024 },
  },
  {
    content: "Power BI/Tableau 可视化工具在财务报表分析中的应用。",
    metadata: { type: "technical", category: "工具技能", source: "KPMG", difficulty: "中级", year: 2024 },
  },
  {
    content: "金融数据终端：Bloomberg Terminal、Wind、Choice 的基本操作和数据分析功能。",
    metadata: { type: "technical", category: "工具技能", source: "PwC", difficulty: "初级", year: 2024 },
  },
  {
    content: "数据分析工具：Tableau、Power BI 的数据连接、仪表板设计和数据清洗。",
    metadata: { type: "technical", category: "工具技能", source: "Deloitte", difficulty: "中级", year: 2024 },
  },
  {
    content: "Excel 宏（VBA）在自动化财务报表处理中的应用。",
    metadata: { type: "technical", category: "工具技能", source: "EY", difficulty: "高级", year: 2024 },
  },
  {
    content: "Python 财务库：NumPy、Pandas、Statsmodels 在财务数据分析中的应用。",
    metadata: { type: "technical", category: "工具技能", source: "KPMG", difficulty: "高级", year: 2024 },
  },
];
