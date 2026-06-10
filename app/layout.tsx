import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "财经类高校 AI 简历工作台",
  description: "面向财经类高校本科毕业生的 AI 简历整理、表达建议与岗位贴合度分析工具。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
