# 2026-06-10 Product Refresh v1

## 本轮目标

把首页从“功能演示页”升级为“面向财经类高校毕业生的正式求职产品首页”，减少技术暴露感，提升视觉层次、产品叙事和信任感。

## 参考的 GitHub 项目

- [Reactive Resume](https://github.com/amruthpillai/reactive-resume)
  - 可借鉴点：强首屏、模板感、结果预期明确、用户信任信息足。
- [OpenResume](https://github.com/xitanggg/open-resume)
  - 可借鉴点：更像消费级产品而不是工具页，实时反馈与“现代专业设计”表达清晰。
- [Resume Matcher](https://github.com/srbhr/Resume-Matcher)
  - 可借鉴点：岗位匹配流程清楚，强调“上传简历 + 粘贴 JD + 查看建议”的使用路径。
- [LingyiChen-AI/JadeAI](https://github.com/LingyiChen-AI/JadeAI)
  - 可借鉴点：模板、工作台、AI 功能并存，视觉上更接近完整产品。

## 这次落地的调整

1. 新增带有人群定位的首屏，明确“上财及财经类高校本科毕业生”这一目标用户。
2. 改成“产品首页 + 工作台”结构，不再一进页面就是两个大文本框。
3. 使用更温和的财经类配色与更有成品感的卡片布局，避免工具页和开发者 Demo 气质。
4. 隐去底层技术表达，改为用户能直接理解的语言，例如“表达建议”“岗位贴合度”“导入已有简历”。
5. 保留 PDF / Word 上传、AI 润色、JD 匹配三项核心能力，但重新包装成更顺的使用流程。
6. 当 AI 服务繁忙或返回异常时，改成自然的用户提示，不再直接暴露底层模型报错。

## 主要改动文件

- `app/page.tsx`
- `app/globals.css`

## 迭代说明

这次迭代仍然遵循“双重备份”原则：本地目录归档一份，同时提交并推送到 GitHub 仓库保留一份。
