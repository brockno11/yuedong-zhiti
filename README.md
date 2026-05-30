# 跃动智体

> 面向中学生体质健康提升的 AI 智能评价与个性化运动指导系统

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black)](https://ui.shadcn.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**跃动智体**是一个面向中学体育教学场景的 AI 智能信息系统。采用移动端优先的响应式设计，包含统一登录入口、角色选择、学生体测记录、AI 体质分析、教师审核工作流，完整覆盖"数据采集 → AI 分析 → 教师审核 → 学生查看"闭环。

> 🔬 本项目用于 **「创AI案例——智能信息系统」** 申报。

---

## ✨ 核心功能

### 登录系统
- 🔐 **统一登录入口** — 学生/教师角色切换，下拉选择已有演示账号，密码自动填充
- 🚪 **登录守卫** — 未登录自动跳转登录页，已登录跳过登录页
- 🚶 **退出登录** — 学生端和教师端均支持退出

### 学生端（移动端优先）
- 🏠 **体质画像仪表盘** — 5 维雷达图、趋势图、本期洞察、AI 建议入口
- 📝 **引导式信息填写** — 5 步卡片式引导
- 📊 **体测记录向导** — 逐项体感采集，每个项目独立记录疲劳/恢复/酸痛
- 🤖 **AI 智能指导** — 结构化报告，跨页面持久化分析
- 👤 **个人中心** — 账号信息、隐私说明、退出登录

### 教师端
- 📋 **班级总览** — 12 列桌面网格，今日教学建议，待审核提醒
- 👥 **学生画像列表** — 搜索过滤，学生详情页
- 📄 **AI 班级报告** — 编号章节，前往审核 CTA
- ✅ **审核中心** — AI 报告审核：通过 / 修改 / 退回

### 核心设计原则
- 🧠 **AI 辅助 · 教师主导** — AI 生成建议，教师审核把关
- 🔒 **不做医学诊断** — 仅提供体育锻炼参考
- 💬 **反标签化表达** — "有提升空间"替代"差"，保护学生自尊
- 📱 **移动端优先** — 375px 基准，触控 ≥44px，iOS 26 液态玻璃导航
- 🎨 **高级响应式 UI** — 手机端贴边导航、桌面端多列 Dashboard、Apple Health/Fitness 风格视觉层级

### 最新 UI 优化
- 学生首页从简单欢迎页升级为“创建体质画像 / 个人体质首页”两种状态
- 学生 Dashboard 从窄屏卡片堆叠升级为移动端单列、桌面端多列数据仪表盘
- 底部导航在手机端填充两侧，在宽屏端限制最大宽度，全部功能始终展开
- AI 生成区域增加分步骤进度、骨架屏和处理状态，避免用户误以为页面卡住
- AI 报告统一提示：**AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。**

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14（App Router + Server Components） |
| 语言 | TypeScript（严格模式） |
| UI 组件 | shadcn/ui（21 个组件） |
| 样式 | Tailwind CSS（CSS variables 主题系统） |
| 图表 | Recharts（雷达图、折线图、柱状图、环形图） |
| 表单 | react-hook-form + zod |
| 图标 | lucide-react |
| AI | DeepSeek API（支持 Mock 回退） |
| 质量验证 | TypeScript typecheck + Next build + 浏览器响应式走查 |

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 8+

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 学生端：http://localhost:3000
# 教师端：http://localhost:3000/teacher
```

### 可选：接入真实 AI

```bash
cp .env.example .env.local
# 编辑 .env.local 填入 DeepSeek API Key
# 不配置则自动使用 Mock 数据
```

```bash
npm run build     # 生产构建
npm run typecheck # 类型检查
npm run lint      # 代码检查
```

> 开发提示：如果本地开发页面突然变成“裸 HTML 样式”或出现 `__webpack_modules__[moduleId] is not a function`，通常是 `.next` 开发缓存损坏。停止 dev server，删除 `.next`，再重新执行 `npm run dev` 即可恢复。

---

## 📁 项目结构

```
src/
├── app/                          # Next.js App Router
│   ├── (student)/                # 学生端路由组（首页、引导、记录、画像、AI指导、个人中心）
│   ├── teacher/                  # 教师端路由（总览、学生、报告、审核）
│   └── api/ai/route.ts           # AI API 路由
├── components/
│   ├── ui/                       # shadcn/ui 基础组件
│   ├── layout/                   # 布局组件（液态玻璃导航、侧边栏）
│   ├── forms/                    # 表单组件（滚轮选择器、体感滑杆）
│   ├── charts/                   # 图表组件（雷达图、趋势图、柱状图、环形图）
│   └── features/                 # 业务组件（AI 报告卡、训练计划卡、审核卡）
└── lib/
    ├── types.ts                  # 类型定义
    ├── constants.ts              # 常量配置
    ├── validators.ts             # 数据验证
    ├── scoring.ts                # 体测评分
    ├── data/                     # Mock 数据集
    └── ai/                       # AI 提示词与客户端
```

---

## 🔒 AI 与隐私说明

### 数据保护
- **匿名标识**：Mock 数据使用 S001-S020 编号，不包含真实学生身份信息
- **最小化收集**：仅收集必要的体测和身体数据
- **权限控制**：学生仅查看自己数据，教师查看班级数据
- **不公开排名**：不进行学生之间的成绩排名展示
- **API Key 保护**：AI API Key 仅存储在服务端环境变量

### AI 使用说明
- AI 分析仅提供体育锻炼参考，**不进行任何医学诊断**
- AI 生成内容**需经体育教师审核后使用**
- 不使用 AI 进行成绩评定或打分
- Prompt 中约束：鼓励性表达、保护学生自尊、反标签化
- 所有 AI 内容标注「**AI 生成，需经体育教师审核后使用**」

---

## 📄 许可证

本项目基于 MIT 许可证开源。

---

## 🙏 致谢

- [Next.js](https://nextjs.org/) · [shadcn/ui](https://ui.shadcn.com/) · [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) · [lucide-react](https://lucide.dev/) · [Radix UI](https://www.radix-ui.com/)

---

> 🤖 AI 辅助开发 · 体育教师主导审核 · 不做医学诊断 · 保护学生隐私
