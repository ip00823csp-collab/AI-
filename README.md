# AI 简历助手

> 面向中文求职者的 AI 简历工具。当前仓库已完成“简历粘贴 + AI 润色 + JD 匹配”MVP，正在迭代为面向财经类高校本科毕业生的 AI 简历产品。

## 当前状态

- 已完成：
  - 粘贴简历全文并调用 AI 润色
  - 粘贴 JD 输出匹配分数、命中关键词和修改建议
  - 支持上传 PDF / DOC / DOCX 简历并自动抽取文本
  - 支持按财经求职赛道生成岗位版本包
  - 中文界面与 Next.js 16 / React 19 基础工程
- 仓库中已有待接入能力：
  - 结构化简历表单组件
  - 预览组件与类型定义
- 正在规划：
  - 面向上海财经大学等财经类高校的结构化简历引导
  - 多求职赛道版本生成
  - 上传后的结构化字段抽取 / 多模板导出 / 多版本管理

## 最新迭代文档

- [开源项目参考研究](./docs/iterations/2026-06-10-sufe-ai-resume-v1/open-source-benchmark.md)
- [产品 PRD](./docs/iterations/2026-06-10-sufe-ai-resume-v1/product-prd.md)
- [文件上传迭代说明](./docs/iterations/2026-06-10-upload-parser-v1/README.md)
- [演示稳定性修复说明](./docs/iterations/2026-06-10-demo-stability-v1/README.md)
- [赛道版本迭代说明](./docs/iterations/2026-06-10-track-version-v1/README.md)
- [迭代归档说明](./docs/iterations/README.md)

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置 GLM API key
cp .env.example .env.local
# 编辑 .env.local 填入 GLM_API_KEY
# 如需稳定演示，建议显式设置 GLM_MODEL=glm-4-flash-250414

# 3. 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

需要智谱 API key：在 https://open.bigmodel.cn/ 注册并创建。

当前支持：
- 直接粘贴简历文本
- 上传 `PDF / DOC / DOCX` 自动抽取文本
- 基于文本执行 AI 润色和 JD 匹配
- 基于财经赛道生成岗位版本摘要、证据映射和改写建议

## 技术栈

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- 智谱 BigModel Chat Completions API（默认模型 `glm-4-flash-250414`）

## 项目结构

详见 [CLAUDE.md](./CLAUDE.md)。

## 迭代备份规则

- 本地备份：每次重要迭代都在 `docs/iterations/YYYY-MM-DD-topic-vN/` 下沉淀文档或方案
- 远端备份：每次迭代完成后提交 Git 并推送到 `origin`
- 本次迭代目录：`docs/iterations/2026-06-10-sufe-ai-resume-v1/`
- 本次功能迭代目录：`docs/iterations/2026-06-10-upload-parser-v1/`

## 路线图

- [x] Phase 1 MVP：简历粘贴 + AI 润色 + JD 匹配
- [ ] Phase 1.5：面向财经类高校毕业生的产品定位与 PRD 固化
- [ ] Phase 2：结构化录入 + 求职赛道模板 + 多版本导出
- [ ] Phase 3：上传解析 / 用户系统 / 多份简历管理 / 知识库

## License

MIT
