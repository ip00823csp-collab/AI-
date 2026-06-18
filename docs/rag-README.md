# RAG 系统使用说明

## 概述

本项目已集成 RAG（检索增强生成）系统，通过四大事务所的面试题库提供智能的简历-JD 匹配分析和技能建议。

## 快速开始

### 1. 安装依赖

```bash
cd ~/Desktop/AI-
npm install
```

### 2. 配置 API Key

编辑 `.env.local` 文件：

```
GLM_API_KEY=你的智谱API密钥
```

### 3. 启动服务

```bash
npm run dev
```

访问 `http://localhost:3000`

## 主要功能

### 1. 基础 RAG 检索

**API 端点**: `POST /api/rag`

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/rag \
  -H "Content-Type: application/json" \
  -d '{
    "query": "需要审计经验，熟悉财务分析",
    "track": "审计与税务",
    "jd": "岗位描述"
  }'
```

**返回结果**:
- 检索到的相关面试题
- 相关概念体系
- 建议补充的关键词
- 推荐行动项
- 关键词匹配分析

### 2. 增强版 JD 匹配

**API 端点**: `POST /api/jd-match-enhanced`

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/jd-match-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "jd": "目标岗位JD",
    "resumeText": "简历内容",
    "track": "审计与税务"
  }'
```

**返回结果**:
- 整体匹配度评分（0-100）
- 已命中/缺失关键词
- 详细匹配度分解
- 技能差距分析
- 学习路径建议
- 相关面试题推荐

## 题库内容

### 数据来源
- 普华永道 (PwC)
- 德勤 (Deloitte)
- 安永 (EY)
- 毕马威 (KPMG)

### 分类统计

| 分类 | 数量 | 说明 |
|------|------|------|
| 面试题 | 44 | 财务分析、审计流程、会计准则、税务、风险管理 |
| 补充题库 | 54 | 高级财务理论、会计处理、工具技能 |
| 技术工具 | 7 | Excel、Python、SQL、数据可视化 |
| 案例分析 | 5 | 财务指标、成本管理、现金流分析 |
| 分析框架 | 4 | 杜邦分析、财务比率、现金流分析 |
| 技术标准 | 4 | 审计准则、会计准则、税务法规 |

**总计**: 约 100+ 道题目

## 核心技术

### 1. 向量数据库
- 自动文本嵌入（使用智谱 GLM 模型）
- 余弦相似度计算
- 多文档管理

### 2. 检索策略
- 语义相似度检索
- 关键词匹配增强
- 多维度过滤

### 3. 分析能力
- 关键词提取和分类
- 技能差距识别
- 学习路径生成
- 建议优先级排序

## 使用示例

### JavaScript/TypeScript

```typescript
import { callEnhancedMatch, callRag } from '@/lib/api/rag';

// 基础 RAG 检索
const ragResult = await callRag(
  '审计相关技能',
  '审计与税务'
);

// 增强版 JD 匹配
const enhancedMatch = await callEnhancedMatch(
  jdText,
  resumeText,
  '审计与税务'
);

console.log(enhancedMatch.overallScore); // 85
console.log(enhancedMatch.ragEnhanced); // { relevantConcepts, missingCompetencies, ... }
```

### React 组件

```typescript
import RagResults from '@/components/RagResults';

<RagResults ragResults={ragData} />
```

## 扩展题库

### 添加新题目

在 `data/audit-questions/` 目录下创建新文件：

```typescript
import { Omit } from "@/lib/rag/types";

export const NEW_QUESTIONS: Omit<any, "id">[] = [
  {
    content: "你的新问题内容",
    metadata: {
      type: "question",
      category: "分类名称",
      source: "PwC",
      difficulty: "初级",
      year: 2024,
    },
  },
];
```

然后在 `lib/rag/initializer.ts` 中引入：

```typescript
import { NEW_QUESTIONS } from "@/data/audit-questions/新文件";
```

## 性能优化

### 1. 批量处理
- 使用批量添加接口
- 减少重复计算

### 2. 缓存策略
- 查询结果缓存
- 文档嵌入缓存（待实现）

### 3. 检索优化
- 调整相似度阈值
- 优化返回数量

## 故障排查

### 嵌入失败
- 检查 GLM_API_KEY
- 确认网络连接
- 查看模型配置

### 检索无结果
- 降低相似度阈值
- 验证文档初始化
- 检查查询内容

### 性能问题
- 检查文档数量
- 优化算法复杂度
- 添加缓存层

## 文档链接

- [实现文档](./rag-implementation.md)
- [集成示例](./rag-integration-example.tsx)
- [API 参考](./docs/api.md)

## 更新日志

### v1.1 (2026-06-18)
- 增加补充题库 54 道题目
- 新增技术工具类题目 7 道
- 优化检索策略
- 完善文档

### v1.0 (2026-06-18)
- 初始版本
- 集成四大事务所题库
- 基础 RAG 功能
- 增强版 JD 匹配
