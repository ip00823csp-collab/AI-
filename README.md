# AI 简历助手

> 面向中文求职者的 AI 简历工具：录入 → AI 润色 → JD 匹配评分 → 导出 PDF

## ✨ 功能

- **结构化录入**：基本信息 / 教育 / 工作 / 项目 / 技能
- **AI 润色**：基于智谱 GLM-4.6，STAR 法则重写要点，量化结果
- **JD 匹配评分**：粘贴岗位描述，输出匹配度 / 命中关键词 / 修改建议
- **导出**：JSON / 浏览器打印 PDF（A4 排版）

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置 GLM API key
cp .env.example .env.local
# 编辑 .env.local 填入 GLM_API_KEY

# 3. 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

需要智谱 API key：在 https://open.bigmodel.cn/ 注册并创建。

## 🛠 技术栈

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- 智谱 GLM-4.6（OpenAI 兼容端点）

## 📁 项目结构

详见 [CLAUDE.md](./CLAUDE.md)。

## 🗺 路线图

- [x] Phase 1 MVP：录入 + AI 润色 + JD 匹配 + PDF 导出
- [ ] Phase 2：PDF/Word 上传解析（Python 微服务 + OCR）
- [ ] Phase 2：多模板（学术 / 互联网 / 创意）
- [ ] Phase 3：用户系统 + 多份简历管理 + RAG 投递知识库

## 📜 License

MIT
