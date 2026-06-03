import type { ResumeData } from "./types/resume";

export const sampleResume: ResumeData = {
  basic: {
    name: "张三",
    title: "前端工程师",
    email: "zhangsan@example.com",
    phone: "13800000000",
    location: "上海",
    summary: "3 年前端开发经验，熟悉 React/Next.js 生态，主导过多个 B 端系统从 0 到 1 的建设。",
  },
  education: [
    {
      id: "edu-1",
      school: "某某大学",
      major: "计算机科学与技术",
      degree: "本科",
      startDate: "2018-09",
      endDate: "2022-06",
    },
  ],
  work: [
    {
      id: "work-1",
      company: "某互联网公司",
      position: "前端工程师",
      startDate: "2022-07",
      endDate: "至今",
      bullets: [
        "负责公司核心后台管理系统重构，将首屏加载时间从 4.2s 优化到 1.1s",
        "主导组件库建设，沉淀 30+ 通用组件，被 5 个业务团队复用",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "AI 简历助手",
      role: "全栈",
      link: "https://github.com/example/resume",
      startDate: "2026-05",
      endDate: "至今",
      bullets: ["基于 Next.js + GLM 实现 AI 简历润色与 JD 匹配评分"],
    },
  ],
  skills: ["TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS"],
};
