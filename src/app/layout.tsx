import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "跃动智体 - 中学生体质健康 AI 智能评价系统",
    template: "%s | 跃动智体",
  },
  description:
    "面向中学生体质健康提升的 AI 智能评价与个性化运动指导系统。通过数据可视化展示身体情况和体测变化，AI 生成体质画像、薄弱项分析和个性化训练计划。",
  keywords: [
    "中学生",
    "体质健康",
    "体测",
    "AI",
    "运动指导",
    "体育教学",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(210 40% 97%)" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(222 47% 9%)" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-surface-subtle text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
