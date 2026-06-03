# AI 简历助手 — 项目说明

## 项目定位

面向**中文求职者**的 AI 简历工具，核心功能：
1. 简历录入与结构化存储（基本信息 / 教育 / 工作 / 项目 / 技能）
2. AI 润色（智谱 GLM-4.6，STAR 法则重写）
3. JD 匹配评分（关键词命中 + LLM 语义评估）
4. 多模板导出（PDF 打印 / JSON）

## 技术栈

- **Next.js 16 (App Router)** + React 19 + TypeScript
- **Tailwind CSS 4** + 自定义组件（不依赖 shadcn/ui）
- **react-hook-form + Zod**（数据校验）
- **智谱 GLM** 通过 OpenAI 兼容端点（`https://open.bigmodel.cn/api/paas/v4`）
- 持久化：localStorage（MVP 阶段，后续接 Supabase）

## 目录约定

```
app/
  api/
    polish/route.ts       # AI 简历润色接口
    jd-match/route.ts     # JD 匹配评分接口
  page.tsx                # 主编辑器（左编辑 / 右预览）
  layout.tsx
  globals.css
components/
  ResumeForm.tsx          # 录入表单（含每个要点的「AI 润色」按钮）
  ResumePreview.tsx       # 简历预览（打印友好）
  JdMatcher.tsx           # JD 粘贴 + 评分面板
lib/
  types/resume.ts         # 简历数据类型
  schemas/resume.ts       # Zod schema
  llm.ts                  # GLM 客户端封装
  sample-data.ts          # 初始示例数据
  utils.ts                # cn() / uid()
```

## 常用命令

```bash
npm run dev      # 本地开发 http://localhost:3000
npm run build    # 生产构建
npm run lint     # ESLint
```

## 环境变量

复制 `.env.example` 为 `.env.local`，填入：

```
GLM_API_KEY=你的智谱 API key
# 可选: GLM_MODEL=glm-4.6
```

## 开发约束

- **语言**：所有用户可见文案使用中文；代码注释中英文均可，简洁优先
- **LLM 输出**：所有 LLM 调用必须 `response_format: json_object`，并通过 `parseJsonResponse` 解析，绝不直接 eval 字符串
- **类型**：API 返回结构必须与 `lib/types/resume.ts` 一致；新增字段需同步更新 schema
- **打印**：`ResumePreview` 必须保持 `print:` 友好，所有交互元素加 `print:hidden`
- **不引入**大型 UI 库（MUI/Antd），优先用 Tailwind 原子类 + 自定义组件

## 待办（按优先级）

- [ ] Phase 2: PDF/Word 上传解析（Python FastAPI 微服务 + PyMuPDF + PaddleOCR）
- [ ] Phase 2: 多模板（学术风 / 互联网风 / 创意风）
- [ ] Phase 3: 用户系统（Supabase Auth）+ 多份简历管理
- [ ] Phase 3: RAG 历史投递知识库（向量检索 + GLM rerank）

## Git 工作流

- 主开发分支：`main`
- 每完成一个功能点立即 commit，不堆积大 PR
- commit message 格式：`<type>: <description>`，type ∈ feat/fix/refactor/docs/chore
- 示例：`feat: 接入 GLM 实现简历要点润色`
