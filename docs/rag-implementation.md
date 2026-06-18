# RAG 系统实现文档

## 概述

本文档说明 RAG（Retrieval-Augmented Generation）系统的实现细节和使用方法。

## 系统架构

### 1. 核心组件

#### 1.1 向量数据库 (`lib/rag/vectorstore.ts`)

- **功能**：管理文档向量化存储和相似度检索
- **特性**：
  - 自动文本嵌入
  - 余弦相似度计算
  - 多文档管理
  - 中文关键词匹配

#### 1.2 初始化器 (`lib/rag/initializer.ts`)

- **功能**：初始化和重置向量数据库
- **数据源**：
  - 基础题库（四大事务所面试题）
  - 补充题库（高级财务、技术工具）
  - 总计约 100+ 道题目

#### 1.3 配置 (`lib/rag/config.ts`)

```typescript
{
  INDEX_NAME: "audit-questions",
  CHUNK_SIZE: 512,
  CHUNK_OVERLAP: 50,
  EMBEDDING_MODEL: "text-embedding-ada-002",
  TOP_K_RESULTS: 5,
  MIN_SIMILARITY_THRESHOLD: 0.6,
}
```

### 2. API 接口

#### 2.1 基础 RAG API (`/api/rag`)

**请求格式：**
```json
{
  "query": "需要审计经验，熟悉财务分析",
  "track": "审计与税务",
  "jd": "目标岗位描述"
}
```

**响应格式：**
```json
{
  "retrievedQuestions": [
    {
      "question": "请解释应收账款周转率的计算公式及其在财务分析中的意义。",
      "category": "财务分析",
      "source": "PwC",
      "difficulty": "初级",
      "relevance": "匹配关键词: 应收账款, 周转率"
    }
  ],
  "relatedConcepts": ["财务分析", "审计流程", "会计准则", ...],
  "keywordSuggestions": ["应收账款", "周转率", "财务分析", ...],
  "actionItems": ["建议增加更多专业技能描述", ...],
  "matchAnalysis": {
    "currentKeywords": [],
    "suggestedKeywords": [],
    "gapAreas": []
  }
}
```

#### 2.2 增强版 JD 匹配 API (`/api/jd-match-enhanced`)

**请求格式：**
```json
{
  "jd": "目标岗位描述",
  "resumeText": "简历内容",
  "track": "审计与税务"
}
```

**响应格式：**
```json
{
  "overallScore": 75,
  "matchedKeywords": ["财务分析", "审计", ...],
  "missingKeywords": ["内部控制", "风险评估", ...],
  "suggestions": [...],
  "ragEnhanced": {
    "relevantConcepts": [...],
    "missingCompetencies": [...],
    "skillGapAnalysis": [...],
    "learningPath": [...],
    "additionalKeywords": [...]
  },
  "detailedBreakdown": {
    "skills": 35,
    "experience": 30,
    "projects": 20,
    "education": 10,
    "expression": 5
  }
}
```

### 3. 题库数据

#### 3.1 数据来源

**四大事务所：**
- 普华永道 (PwC)
- 德勤 (Deloitte)
- 安永 (EY)
- 毕马威 (KPMG)

#### 3.2 数据分类

1. **面试题 (44 道)**
   - 财务分析
   - 审计流程
   - 会计准则
   - 税务
   - 风险管理

2. **案例分析 (5 个)**
   - 财务指标分析
   - 成本管理
   - 现金流分析

3. **分析框架 (4 个)**
   - 杜邦分析法
   - 财务比率体系
   - 现金流分析
   - 财务报表勾稽关系

4. **技术标准 (4 个)**
   - 审计准则
   - 会计准则
   - 税务法规
   - 风险管理框架

5. **补充题库 (54 道)**
   - 高级财务理论
   - 会计处理
   - 工具技能

6. **技术工具 (7 道)**
   - Excel 高级功能
   - Python/SQL 应用
   - 数据可视化工具

### 4. 使用方法

#### 4.1 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 GLM_API_KEY

# 3. 启动开发服务器
npm run dev

# 4. 测试 RAG API
curl -X POST http://localhost:3000/api/rag \
  -H "Content-Type: application/json" \
  -d '{
    "query": "审计相关技能",
    "track": "审计"
  }'
```

#### 4.2 前端集成

```typescript
import { callEnhancedMatch } from '@/lib/api';

const result = await callEnhancedMatch(jd, resumeText, '审计与税务');
console.log(result.ragEnhanced);
```

### 5. 性能优化

#### 5.1 向量嵌入缓存

- 当前实现每次查询都重新嵌入
- 可添加 Redis 缓存减少 API 调用

#### 5.2 批量处理

- 支持批量添加文档
- 查询时可返回排序结果

#### 5.3 相似度阈值

- 可调整 MIN_SIMILARITY_THRESHOLD
- 平衡召回率和准确率

### 6. 扩展建议

1. **增加题库来源**
   - 添加更多四大会计师事务所的真题
   - 收集行业案例研究
   - 补充最新的会计准则

2. **优化检索策略**
   - 添加关键词增强
   - 实现混合检索（关键词 + 语义）
   - 添加查询重写功能

3. **功能增强**
   - 添加个性化推荐
   - 实现学习路径生成
   - 增加交互式问答功能

### 7. 故障排查

#### 7.1 嵌入失败

- 检查 GLM_API_KEY 是否正确
- 确认 API 网络连接
- 查看向量嵌入模型配置

#### 7.2 检索无结果

- 检查 MIN_SIMILARITY_THRESHOLD 是否过高
- 验证文档是否成功初始化
- 确认查询文本是否有足够内容

#### 7.3 性能问题

- 检查文档数量是否过大
- 优化相似度计算算法
- 考虑添加缓存层

## 更新日志

### v1.0 (2026-06-18)
- 初始版本发布
- 集成四大事务所题库
- 基础 RAG 功能实现
- 增强版 JD 匹配 API
