# 跃动智体（YueDong ZhiTi）

> 面向中学生体质健康提升的 AI 智能评价与个性化运动指导系统。当前演示场景以高二(1)班为例。

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black)](https://ui.shadcn.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma)](https://www.prisma.io/)
[![Recharts](https://img.shields.io/badge/Recharts-2.15-22b5bf)](https://recharts.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🔬 本项目用于 **「2026年教师人工智能应用案例征集活动——创AI案例：智能信息系统」** 申报。

---

## 📖 项目概述

**跃动智体**是一个面向中学体育教学场景的 AI 智能信息系统。系统采用移动端优先的响应式设计，以 **「AI 辅助 · 教师主导」** 为核心理念，完整覆盖 **「数据采集 → AI 分析 → 教师审核 → 学生查看」** 全闭环流程。

### 核心价值

| 维度 | 价值 |
|------|------|
| 🎯 **对学生** | 可视化理解自身体质、获得个性化训练指导、追踪进步轨迹 |
| 👨‍🏫 **对教师** | 快速掌握班级体质全貌、获取分层教学建议、高效审核 AI 报告 |
| 🏫 **对学校** | 数字化体测管理、AI 辅助教学决策、数据驱动的体育教改 |

当前演示数据聚焦 **高二(1)班**：20 名匿名学生（S001-S020）与 1 位体育教师（周老师，账号 `zhoulaoshi`），便于比赛演示时保持数据口径统一、场景真实。

---

## ✨ 核心功能

### 🔐 登录系统（统一入口 `/`）

- **角色切换**：登录页顶部"我是学生"/"我是教师"切换，带动画过渡
- **账号下拉选择**：学生端列出 S001-S020（含姓名、年级、性别），教师端列出周老师账号
- **自动填充**：选择账号后自动填入用户名和演示密码（`demo123`）
- **密码显隐切换**：眼睛图标切换密码可见性
- **登录守卫（AuthGuard）**：
  - 未登录访问受保护路由 → 自动跳转 `/`
  - 已登录访问 `/` → 自动跳转对应首页（学生→`/dashboard`，教师→`/teacher`）
- **退出登录**：学生端 `/profile` 和教师端 `/teacher/profile` 均支持退出，清除 localStorage
- **登录状态存储**：`localStorage.getItem("demo_login")` 存储登录数据（角色、用户名、姓名、班级、时间戳）

### 🧑‍🎓 学生端（4 Tab 底部导航 + 1 动作流程页，移动端优先）

**底部导航 4 入口**：首页 → 画像 → AI指导 → 我的

#### 1. 🏠 学生首页 `/dashboard`（Tab: 首页）
- **问候 Hero**：动态问候（早上好/中午好/下午好/晚上好）+ 姓名 + 评分等级 + "开始记录"大按钮
- **状态简卡**：综合评分 / BMI 状态 / 待提升项目数
- **最近记录摘要**：最近一次体测的项目 + 成绩 + 学期
- **本周关注**：最弱维度轻量提示
- **快捷入口**：查看体质画像 → `/portrait` · 查看 AI 指导 → `/ai-guide`

#### 2. 📊 体质画像 `/portrait`（Tab: 画像，v0.4.2 新增）
- **综合评分卡** + **本期洞察**（AI 风格评语 + 优势/待提升标签）
- **体质雷达图**：5 维（速度/力量/耐力/柔韧/身体形态），个人 vs 班级均值
- **50米跑趋势图**：历史成绩折线图
- **优势/待提升项目**：颜色标记列表（绿=优势、橙=待提升）
- **小型入口**："记录新数据" → `/record`

#### 3. 📝 引导式信息填写 `/onboarding`
- **5 步卡片式流程**（非传统长表单）：
  - Step 0：基础信息（年级 = 高一/高二/高三、性别 = 男/女、年龄 = 15-18岁）
  - Step 1：身体数据（身高 150-195cm、体重 40-110kg，iOS 风格滚轮选择器 + 快捷选项）
  - Step 2：运动目标（6 个卡片选项：提升耐力/增强力量/控制体重/提高柔韧性/全面健康提升/体测考试准备）
  - Step 3：运动基础（4 档：较少运动/轻度运动/中等运动/经常运动）
  - Step 4：健康状况（多选：无不适/运动性哮喘/心脏关注/关节不适/腰背不适/易头晕/其他）
- **进度指示器**：底部进度条 + 步骤验证
- **数据持久化**：保存到 localStorage `onboardingData`
- **隐私保护**：健康信息标注"仅你与体育教师可见"

#### 3. 📊 体测记录向导 `/record`
- **动态步骤流程**：
  - 含体力项目（speed/strength/endurance 类别）→ 4 步：选择项目 → 输入成绩 → 逐项体感 → 完成
  - 纯身体指标项目 → 3 步（跳过体感步骤）
- **项目选择**：9 个体测项目卡片多选（含 emoji 图标），性别过滤（男生不显示 800m/仰卧起坐，女生不显示 1000m/引体向上）
- **成绩输入**：iOS 滚轮选择器（滑动+±微调+快捷选项），每个项目独立输入
- **逐项体感采集（核心创新点）**：
  - 每个体力项目独立采集：疲劳程度（1-10 滑杆）、恢复感觉（快速/正常/较慢 三档）、肌肉酸痛（有/无）
  - 整体身体状况：有无不适 + 不适描述文本输入
- **数据保存**：POST `/api/fitness-records` + 同时保存到 localStorage `demo_records`
- **防重复**：同项目同日不可重复记录

#### 4. 🤖 AI 智能指导 `/ai-guide`
- **分析策略（核心设计决策）**：
  - **专项分析模式**：单项目记录 → AI 深入分析该项目技术要领、针对性训练方法
  - **综合分析模式**：2+ 项目记录 → AI 全面体质画像 + 跨维度训练建议
  - 两种模式在 UI 中以不同图标和标签区分（⚡专项分析 / 📈综合分析）
- **报告内容结构**：
  - 🧠 **体质画像**：综合评分、BMI 状态、优劣维度标签、生成时间 + 来源记录
  - 🎯 **待提升项目**：编号列表，含当前水平、可能原因、提升潜力
  - 💪 **个性化训练计划**：2 周递进式训练，每周含 3-4 个动作（名称、描述、组数、频率、时长、注意事项）
  - 🛡️ **运动安全提醒**：3-5 条安全注意事项
  - ✅ **审核状态**：待审核 / 已审核 / 已退回
- **报告记录（历史回看）**：每份 AI 报告标注生成时间（绝对+相对）、来源体测记录、分析类型、审核状态，点击可切换查看
- **AI 生成状态**：分步骤进度条（分析体测数据→生成体质画像→生成训练建议）、骨架屏加载态
- **超时回退**：AI API 15s 超时自动展示 Mock 示例报告，不卡住页面
- **跨页面持久化**：模块级 `inFlightRequests` Map 缓存进行中的 AI 请求，页面切换不中断
- **AI 标注**：所有 AI 内容标注「AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。」

#### 5. 👤 个人中心 `/profile`
- **基础信息**：头像占位、姓名、年级、性别、年龄
- **身体数据**：身高、体重、BMI 卡片展示
- **运动目标与基础**：双列卡片
- **健康关注信息**：标签展示 + 隐私说明
- **历史记录入口**：显示记录次数，链接到 `/record`
- **教师工作台入口**：学生端快捷访问教师端
- **隐私说明** + **AI 使用说明**：4 条说明
- **退出登录按钮**：清除 localStorage，跳转 `/`

### 👨‍🏫 教师端（6 个页面，桌面端优先）

#### 1. 📋 班级总览 `/teacher`
- **布局**：12 列桌面网格（CSS Grid）
- **今日教学建议**：卡片式，含演示模式标签
- **数据概览行**：4 个统计卡片（班级人数、已记录人数、平均 BMI、及格率）
- **待审核提醒**：红色脉冲动画圆点 + "前往审核"CTA 按钮
- **图表区域**（8 列）：
  - 班级薄弱项排行柱状图（横向，及格率从低到高，最多 6 项）
  - 体测等级分布环形图（优秀/良好/及格/待提升）
- **侧边栏**（4 列）：
  - 重点关注学生列表（多维度标记：BMI、不适状况、低分、无记录）
  - 快捷入口（AI 班级报告、学生列表）

#### 2. 👥 学生画像列表 `/teacher/students`
- **搜索过滤**：支持按学生编号、姓名、年级、性别、"关注"关键词搜索
- **学生卡片**：
  - 头像 + 姓名 + 性别 + 年级 + 年龄
  - 综合评分 + 等级标签（颜色区分）
  - 优势项目标签（绿色 ↑）+ 待提升项目标签（橙色 ↓）
  - AI 建议状态（待审核标签）
  - "需关注"标签（低分/身体不适）
- **空状态**：搜索无结果时显示 EmptyState 组件

#### 3. 🔍 学生详情页 `/teacher/students/[id]`
- **学生信息**：基础信息、身体数据、运动目标、健康关注
- **最近体测记录**：成绩表格（项目名、成绩、得分、等级）
- **体质雷达图**：5 维展示
- **历史记录列表**：按时间倒序
- **AI 报告审核状态**：独立的客户端组件显示审核状态
- **返回导航**：PageHeader 带 backHref

#### 4. 📄 AI 班级报告 `/teacher/report`
- **班级整体分析**：总人数、平均分、及格率、优秀率、综合评语
- **共性薄弱项目**：编号列表，含及格率、影响人数、原因分析
- **学生分层指导**：A/B/C/D 四层（综合优秀/良好基础/需要提升/重点关注），每层含人数和指导建议
- **课堂训练重点**：优先级排序，每项含建议活动列表 + 预期效果
- **教学改进建议**：具体可落地建议
- **"前往审核"CTA 按钮**：引导教师进入审核中心
- **AI 免责声明**：底部完整声明
- **布局**：桌面端 12 列网格

#### 5. ✅ 审核中心 `/teacher/review`
- **Tab 切换**：待审核 / 已处理
- **审核卡片**：报告预览（学生/班级）、AI 原始文本
- **操作按钮**：
  - ✅ 通过：确认后推送给学生
  - ✏️ 修改后通过：填写修改说明 + 对比原文
  - ↩️ 退回：需填写退回原因
- **操作反馈**：内联成功/失败消息（2s 自动消失）
- **状态颜色**：待审核=橙色、已通过=绿色、已修改=蓝色、已退回=红色

#### 6. 👤 教师个人中心 `/teacher/profile`
- **教师信息**：头像、姓名、任教班级、体育教研组
- **统计数据**：任教班级编号、班级学生数（20人）
- **快捷入口**：班级总览、审核中心（卡片+箭头）
- **AI 使用说明**：3 条教师端 AI 规范
- **退出登录按钮**

---

## 🛠️ 技术栈详解

### 前端框架与核心依赖

| 类别 | 技术 | 版本 | 选型理由 |
|------|------|------|---------|
| **框架** | Next.js 14 (App Router) | 14.2 | Server Components 默认、文件系统路由、API Routes |
| **语言** | TypeScript | 5.7 | 严格模式 `strict: true`，零 `any` 类型 |
| **UI 组件库** | shadcn/ui | latest | 21 个组件，源码可控、tree-shakable、无障碍 |
| **样式方案** | Tailwind CSS | 3.4 | CSS Variables 主题系统 + `tailwindcss-animate` |
| **图表库** | Recharts | 2.15 | React 原生、声明式 API、4 种图表类型 |
| **表单** | react-hook-form + zod | 7.54 / 3.24 | 类型安全表单验证、性能优化 |
| **图标** | lucide-react | 0.468 | 开源 SVG、tree-shakable |
| **动画** | CSS @keyframes + framer-motion | — | 页面过渡、骨架屏 shimmer、液态玻璃效果 |

### 后端与数据层

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **ORM** | Prisma | 6.19 | 类型安全数据库访问、迁移管理 |
| **本地数据库** | SQLite (better-sqlite3) | — | 演示环境零配置，`prisma/dev.db` 不入库 |
| **AI 引擎** | DeepSeek API (V4 Flash) | — | 服务端调用，API Key 仅存环境变量 |
| **密码** | 明文 `demo123` | — | 演示模式，非生产用途 |

### 开发工具链

| 类别 | 工具 | 命令 |
|------|------|------|
| **包管理** | npm 8+ | `npm install` |
| **类型检查** | `tsc --noEmit` | `npm run typecheck` |
| **代码检查** | ESLint | `npm run lint` |
| **生产构建** | `next build` | `npm run build` |
| **开发服务器** | `next dev --turbo` | `npm run dev` |
| **数据库 GUI** | Prisma Studio | `npm run db:studio` |

### CSS 设计 Token 系统

| Token 类别 | CSS 变量前缀 | 说明 |
|-----------|-------------|------|
| **主色** | `--primary` | 蓝色系，用于主动作、选中态 |
| **语义色** | `--level-excellent/good/pass/improve` | 绿/蓝/橙/红，用于等级标签 |
| **表面色** | `--background`, `--card`, `--muted` | 层级背景色 |
| **阴影** | `--shadow-sm/md/lg` | 三级阴影系统 |
| **圆角** | `--radius` | 统一圆角变量 |
| **安全区** | `env(safe-area-inset-*)` | iOS 刘海屏适配 |

---

## 🚀 快速开始

### 环境要求
- **Node.js** 18+
- **npm** 8+
- **操作系统**：Windows / macOS / Linux

### 一键启动

```bash
# 1. 克隆项目
cd E:\projects\体育课设

# 2. 安装依赖
npm install

# 3. 初始化数据库（生成 Prisma Client + 创建 SQLite + 写入种子数据）
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. 启动开发服务器
npm run dev

# 访问：
# 学生端 → http://localhost:3000
# 教师端 → http://localhost:3000/teacher
```

### 可选：接入真实 AI

```bash
cp .env.example .env.local
# 编辑 .env.local 填入：
#   DEEPSEEK_API_KEY=sk-your-key-here
#   DEEPSEEK_BASE_URL=https://api.deepseek.com/v1  （可选）
#   DEEPSEEK_MODEL=deepseek-v4-flash                （可选）
#   AI_REQUEST_TIMEOUT_MS=12000                      （可选）
# 不配置 API Key 则自动使用内置 Mock 数据
```

### 演示账号

| 角色 | 账号 | 密码 | 人数 |
|------|------|------|------|
| 学生 | `S001` ~ `S020` | `demo123` | 20人 |
| 教师 | `zhoulaoshi` | `demo123` | 1人 |

###常用命令

```bash
npm run dev          # 启动开发服务器（localhost:3000）
npm run build        # 生产构建
npm run typecheck    # TypeScript 类型检查（tsc --noEmit）
npm run lint         # ESLint 代码检查
npm run db:studio    # 打开 Prisma Studio 数据库 GUI
npm run db:seed      # 重新写入种子数据
npm run db:reset     # 重置数据库
```

> ⚠️ **开发提示**：如果页面突然变成"裸 HTML 样式"（CSS/JS chunk 404）或出现 `__webpack_modules__[moduleId] is not a function`，这是 `.next` 开发缓存损坏。解决方法：停止 dev server → 删除 `.next` 目录 → 重新 `npm run dev`。

---

## 🎬 演示流程

比赛演示建议按以下路径操作，覆盖「学生 → AI → 教师审核」完整闭环。

### 准备

```bash
npm install           # 安装依赖
npx prisma db push    # 初始化 SQLite 数据库
npm run db:seed       # 写入演示种子数据（20 学生 + 1 教师 + 体测记录 + AI 报告）
npm run dev           # 启动 → http://localhost:3000
```

### 学生侧演示路径（约 3 分钟）

| 步骤 | 操作 | 页面 | 演示要点 |
|------|------|------|----------|
| 1 | 打开 `/`，选"我是学生"→ 下拉选 `S001` → 输入 `demo123` → 登录 | 登录页 | 展示角色切换、账号下拉、自动填充 |
| 2 | 自动进入 `/dashboard` | 体质画像 | **亮点**：雷达图（个人 vs 班级）、综合评分、AI 洞察标签 |
| 3 | 点击"查看 AI 体质分析"→ 进入 `/ai-guide` | AI 指导 | **亮点**：专项/综合分析切换、报告历史、训练计划、安全提醒、教师审核状态 |
| 4 | 回到 `/`，退出登录，换 `S005` 重新登录 | — | **验证**：不同学生看到不同体质数据（证明不是静态页面） |

### 教师侧演示路径（约 3 分钟）

| 步骤 | 操作 | 页面 | 演示要点 |
|------|------|------|----------|
| 1 | 打开 `/`，选"我是教师"→ 选 `周老师` → 输入 `demo123` → 登录 | 登录页 | 教师角色切换 |
| 2 | 自动进入 `/teacher` | 班级总览 | **亮点**：今日教学建议、等级分布、薄弱项排行、重点关注学生 |
| 3 | 点击"AI 班级报告"→ `/teacher/report` | AI 班级报告 | **亮点**：AI 生成的班级体质分析、分层教学建议 |
| 4 | 点击"审核中心"→ `/teacher/review` | 审核中心 | **亮点**：教师审核 AI 报告（通过/退回/修改），展示「AI 辅助 · 教师主导」理念 |
| 5 | 进入某学生详情 `/teacher/students/S001` | 学生详情 | **亮点**：教师视角查看学生体质画像、记录历史、AI 报告 |

### 核心亮点话术

- **逐项体感采集**（`/record`）：每项运动后采集疲劳程度、恢复速度、肌肉酸痛 —— 这是区别于传统体测系统的创新点
- **专项/综合分析**（`/ai-guide`）：单项目深度分析 vs 多项目综合评估，AI 自动选择策略
- **教师审核闭环**：AI 生成 → 教师审核（通过/退回/修改）→ 学生查看，完整「AI 辅助 · 教师主导」
- **数据口径透明**：登录页顶部演示模式提示条，明确标注匿名模拟数据

---

## 📁 项目结构

```
体育课设/
├── prisma/
│   ├── schema.prisma              # Prisma 数据模型定义（6 个表）
│   ├── seed.ts                    # 种子数据脚本（20 学生 + 1 教师 + 体测记录 + AI 报告）
│   ├── migrations/                # 数据库迁移文件
│   └── migrate.ts                 # 自定义迁移脚本（better-sqlite3）
├── docs/                          # 比赛申报文档
│   └── 2026年教师人工智能应用案例征集通知及附件/
├── src/
│   ├── app/                       # Next.js App Router（15 个路由）
│   │   ├── layout.tsx             # 根布局（字体、metadata、viewport）
│   │   ├── globals.css            # CSS Variables 主题 + 液态玻璃动画 + 骨架屏
│   │   ├── page.tsx               # 登录首页 "/"
│   │   ├── loading.tsx            # 全局加载骨架屏
│   │   ├── error.tsx              # 全局错误边界
│   │   ├── not-found.tsx          # 404 页面
│   │   ├── (student)/             # 学生端路由组（URL 不含前缀）
│   │   │   ├── layout.tsx         # AuthGuard + AppShell（iOS 液态玻璃导航）
│   │   │   │   ├── dashboard/         # 学生首页（问候+CTA+快捷入口）
│   │   │   ├── portrait/          # 体质画像页（雷达图+趋势图+优劣项目）
│   │   │   ├── onboarding/        # 5 步引导
│   │   │   ├── record/            # 体测记录动作流程（不在导航中）
│   │   │   ├── ai-guide/          # AI 智能指导
│   │   │   └── profile/           # 个人中心
│   │   ├── teacher/               # 教师端路由（URL: /teacher/*）
│   │   │   ├── layout.tsx         # AuthGuard + AppShell（桌面侧边栏）
│   │   │   ├── page.tsx           # 班级总览
│   │   │   ├── students/          # 学生列表
│   │   │   ├── report/            # AI 班级报告
│   │   │   ├── review/            # 审核中心
│   │   │   └── profile/           # 教师个人中心
│   │   └── api/                   # API Routes（7 个端点）
│   │       ├── ai/route.ts        # AI 分析（POST）
│   │       ├── auth/login/route.ts # 登录验证（POST）
│   │       ├── students/route.ts  # 学生列表（GET）
│   │       ├── students/[id]/route.ts # 学生详情（GET）
│   │       ├── fitness-records/route.ts # 体测记录 CRUD（GET/POST）
│   │       ├── class-summary/route.ts # 班级统计（GET）
│   │       └── reviews/route.ts   # 审核 CRUD（GET/PATCH）
│   ├── components/
│   │   ├── ui/                    # shadcn/ui 基础组件（21 个）
│   │   │   ├── button.tsx         # 按钮（6 种 variant，4 种 size）
│   │   │   ├── card.tsx           # 卡片（Card/CardHeader/CardContent/CardTitle）
│   │   │   ├── input.tsx          # 输入框
│   │   │   ├── badge.tsx          # 标签（5 种 variant）
│   │   │   ├── dialog.tsx         # 对话框
│   │   │   ├── select.tsx         # 下拉选择
│   │   │   ├── separator.tsx      # 分割线
│   │   │   ├── skeleton.tsx       # 骨架屏
│   │   │   ├── progress.tsx       # 进度条
│   │   │   ├── tabs.tsx           # 标签页
│   │   │   ├── textarea.tsx       # 文本域
│   │   │   ├── label.tsx          # 标签
│   │   │   └── ...                # 其他 10 个组件
│   │   ├── layout/                # 布局组件
│   │   │   ├── app-shell.tsx      # 响应式外壳（根布局）
│   │   │   ├── ios-liquid-nav.tsx # iOS 26 液态玻璃浮动胶囊导航
│   │   │   ├── desktop-sidebar.tsx # 教师端桌面侧边栏（lg:block）
│   │   │   └── page-header.tsx    # 页面标题栏（含返回按钮）
│   │   ├── forms/                 # 表单组件
│   │   │   ├── wheel-picker.tsx   # iOS 风格滚轮选择器（触控拖动 + ±按钮）
│   │   │   └── feeling-slider.tsx # 运动体感滑杆（1-10 + Emoji 表情）
│   │   ├── charts/                # 图表组件（Recharts 封装）
│   │   │   ├── fitness-radar-chart.tsx  # 5 维体质雷达图
│   │   │   ├── fitness-trend-chart.tsx  # 成绩趋势折线图
│   │   │   ├── class-bar-chart.tsx      # 班级薄弱项横向柱状图
│   │   │   ├── level-donut-chart.tsx    # 等级分布环形图
│   │   │   └── stat-card.tsx            # 统计数字卡片
│   │   └── features/              # 业务功能组件
│   │       ├── landing-page.tsx         # 登录页（角色切换+账号下拉+密码）
│   │       ├── auth-guard.tsx           # 登录守卫（含骨架屏）
│   │       ├── logout-button.tsx        # 退出登录按钮
│   │       ├── onboarding-steps.tsx     # 5 步引导流程
│   │       ├── record-project-select.tsx # 体测项目选择（性别过滤）
│   │       ├── record-score-input.tsx   # 成绩输入
│   │       ├── record-feeling-step.tsx  # 逐项体感采集
│   │       ├── record-complete.tsx      # 记录完成页
│   │       ├── ai-student-report.tsx    # AI 学生报告（分析策略+历史记录）
│   │       ├── ai-class-report-view.tsx # AI 班级报告视图
│   │       ├── ai-generation-status.tsx # AI 生成状态指示器
│   │       ├── review-workflow.tsx      # 审核工作流
│   │       ├── student-search-list.tsx  # 学生搜索列表
│   │       ├── student-review-status.tsx # 学生详情审核状态
│   │       └── empty-state.tsx          # 空状态占位
│   ├── hooks/
│   │   └── use-auth.ts            # 认证 Hook（登录检查+路由守卫）
│   └── lib/
│       ├── types.ts               # 核心类型定义（20+ 接口/类型）
│       ├── constants.ts           # 常量配置（体测项目/评分标准/导航）
│       ├── validators.ts          # 数据验证（四级异常值检测）
│       ├── scoring.ts             # 体测评分算法
│       ├── utils.ts               # 工具函数（cn 类名合并）
│       ├── demo-store.ts          # 演示模式 localStorage 状态管理
│       ├── db.ts                  # Prisma 客户端单例
│       ├── data/
│       │   ├── mock-students.ts   # 20 名学生匿名数据
│       │   ├── mock-fitness-records.ts # 体测记录样例
│       │   └── mock-ai-reports.ts # AI 报告样例
│       └── server/
│           ├── data-service.ts    # 服务端数据服务层（业务逻辑）
│           └── db-mappers.ts      # Prisma Row → Domain 类型映射
```

---

## 🗄️ 数据库模型（Prisma Schema）

```
ClassGroup          — 班级（id, name, grade, semester, teacherId）
UserAccount         — 登录账号（id, role, username, displayName, passwordHash, studentId, classId）
Student             — 学生信息（id, name, gender, grade, age, height, weight, bmi, sportGoal, sportBase, discomfortsJson, classId）
FitnessRecord       — 体测记录（id, studentId, date, semester, fatigueLevel, recoveryStatus, hasSoreness, sorenessAreasJson, hasDiscomfort, discomfortNotes）
FitnessRecordItem   — 单项成绩（id, recordId, itemId, value, score, grade）
AIReport            — AI 报告（id, reportKind, studentId, classId, contentJson, mode, status, version, sourceRecordId, sourceRecordDate, sourceSummary, generatedAt）
TeacherReview       — 教师审核（id, reportId, reportType, reviewerName, status, teacherNotes, reviewedAt, modificationsJson）
```

---

## 🔒 AI 与隐私说明

### 数据保护
- **匿名标识**：Mock 数据使用 S001-S020 编号，不包含真实学生身份信息
- **最小化收集**：仅收集必要的体测和身体数据
- **权限控制**：学生仅查看自己数据（通过登录态 cookie 关联），教师查看班级数据
- **不公开排名**：不进行学生之间的成绩排名展示
- **API Key 保护**：AI API Key 仅存储在服务端 `.env.local`，前端永不可见
- **数据不入库**：`.env.local` 和 `prisma/dev.db` 已加入 `.gitignore`

### AI 使用说明
- 🤖 AI 分析仅提供**体育锻炼参考**，不进行任何医学诊断
- 👨‍🏫 AI 生成内容**需经体育教师审核后使用**
- 📋 不使用 AI 进行成绩评定或打分
- 💬 Prompt 中约束：鼓励性表达、保护学生自尊、反标签化
- 🏷️ 所有 AI 内容标注「**AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。**」

### 反标签化表达映射

| ❌ 禁止使用 | ✅ 应使用 |
|------------|----------|
| 差、很差、不及格 | 待提升、有提升空间 |
| 肥胖、超重 | BMI 指标值得关注 |
| 体能差、体质弱 | 在某方面有提升空间 |
| 诊断、治疗、处方 | 建议、参考、锻炼方案 |
| 排名第 X、倒数第 X | 不进行排名展示 |

---

## 🏗️ 架构决策记录

1. **Server Components 默认**：`page.tsx` 全部为 Server Component，`use client` 仅放在叶子组件
2. **组件五层分层**：ui → layout → forms → charts → features
3. **移动端优先**：先写 375px，再写 md/lg 断点，触控目标 ≥ 44px
4. **CSS Variables 主题**：禁止硬编码颜色值，全部使用语义 Token
5. **演示模式架构**：登录页 → 角色选择 → localStorage（登录态）+ cookie（学生 ID）→ AuthGuard 路由保护 → Server Component 从 cookie 读取当前学生 → SQLite 查询数据
6. **AI 分析策略**：单项目=专项分析，多项目=综合分析，超时自动回退 Mock
7. **数据流**：Prisma → data-service → Server Component → Client Component props
8. **演示模式存储**：SQLite 为唯一权威数据源（页面读写）；localStorage 仅存登录态（demo_login）、引导草稿（onboardingData）、AI 缓存（ai_analysis_cache）
9. **路由分组**：学生端使用 `(student)` route group（URL 不带前缀），教师端使用 `teacher/` 路径段

---

## 📊 体测评分逻辑

评分标准基于**国家学生体质健康标准（高中版）**，按性别（男/女）× 年级（高一/高二/高三）× 项目三维护索引查表：

- **优秀（≥90分）**：达到 excellent 阈值 → 95 分
- **良好（80-89分）**：达到 good 阈值 → 85 分
- **及格（60-79分）**：达到 pass 阈值 → 70 分
- **待提升（<60分）**：低于 pass 阈值 → 按比例计算（最低 30 分）

---

## 🌐 API 路由总览

| 方法 | 路由 | 功能 | 认证 |
|------|------|------|------|
| POST | `/api/auth/login` | 演示账号登录验证 | 否 |
| GET | `/api/students` | 获取全部学生列表 | 否（演示） |
| GET | `/api/students/[id]` | 获取学生详情 + 体测记录 | 否（演示） |
| POST | `/api/ai` | 生成 AI 分析报告 | 否（演示） |
| GET/POST | `/api/fitness-records` | 读取/创建体测记录 | 否（演示） |
| GET | `/api/class-summary` | 获取班级统计摘要 | 否（演示） |
| GET/PATCH | `/api/reviews` | 读取/更新审核状态 | 否（演示） |

---

## 📄 许可证

本项目基于 MIT 许可证开源。

---

## 🙏 致谢

- [Next.js](https://nextjs.org/) · [shadcn/ui](https://ui.shadcn.com/) · [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) · [lucide-react](https://lucide.dev/) · [Radix UI](https://www.radix-ui.com/)
- [Prisma](https://www.prisma.io/) · [DeepSeek](https://www.deepseek.com/)

---

> 🤖 AI 辅助开发 · 体育教师主导审核 · 不做医学诊断 · 保护学生隐私
