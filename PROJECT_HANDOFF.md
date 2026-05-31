# 跃动智体 — 项目交接文档（AI 审查用超详细版）

> 生成日期：2026-06-01 | 版本：MVP 0.9.0 | 构建状态：✅ 通过 | 类型检查：✅ 0 错误 | Lint：✅ 0 警告 | 路由：✅ 23/23

本文档为 AI Agent 审查和接手项目提供最完整的项目信息。**阅读时长约 15 分钟**。

---

## 1. 项目身份

| 属性 | 值 |
|------|-----|
| **项目正式名称** | 跃动智体——面向中学生体质健康提升的 AI 智能评价与个性化运动指导系统 |
| **项目代号** | 跃动智体（曾用代号：体测星图） |
| **项目定位** | 面向中学体质健康测试与体育教学改进场景的 AI 智能信息系统 |
| **申报场景** | 2026年教师人工智能应用案例征集活动——「创AI案例——智能信息系统」 |
| **目标用户** | 中学体育教师（主要）、中学生 15-18 岁（次要）。当前演示场景以高二(1)班为例。 |
| **当前阶段** | MVP 核心功能完成，可演示，SQLite 数据持久化 |

### 演示数据口径
- **班级**：高二(1)班
- **学生**：20 名匿名学生（S001-S020），男女比例 ≈ 10:10，年龄 16-17 岁
- **教师**：1 位体育教师（周老师，账号 `zhoulaoshi`，密码 `demo123`）
- **运行时数据源**：SQLite（本地文件 `prisma/dev.db`，不入库）
- **演示密码**：统一 `demo123`

---

## 2. 项目背景与目标

### 背景
高中体质健康测试是教育部规定的常规工作，但当前面临三大痛点：
1. **数据难理解**：体测数据以表格呈现，学生看不懂自己的体质状况
2. **指导缺个性**：教师难以针对 40+ 名学生逐一给出个性化运动建议
3. **反馈不及时**：体测结果到学生手中往往只有分数，没有分析和改进方案

### 项目目标
1. **数据可视化**：将复杂体测数据转化为直观图表（雷达图、趋势图、分布图）
2. **AI 智能分析**：生成个性化体质画像、薄弱项分析和训练计划
3. **教学辅助**：帮助教师精准了解班级体质状况，分层指导学生
4. **辅助不替代**：AI 生成建议 → 教师审核把关 → 推送学生，全程教师主导

---

## 3. 当前技术栈（完整清单）

| 类别 | 技术 | 版本 | 用途与说明 |
|------|------|------|-----------|
| **框架** | Next.js | 14.2 | App Router + Server Components + API Routes |
| **语言** | TypeScript | 5.7 | `strict: true`，零 `any`，零类型错误 |
| **UI 组件** | shadcn/ui | latest | 21 个组件，基于 Radix UI，源码在 `src/components/ui/` |
| **样式** | Tailwind CSS | 3.4 | CSS Variables 主题 + `tailwindcss-animate` 动画库 |
| **图表** | Recharts | 2.15 | 4 种图表：RadarChart、LineChart、BarChart、PieChart（Donut） |
| **表单** | react-hook-form + zod | 7.54 / 3.24 | 前端表单状态管理 + 类型安全验证 schema |
| **图标** | lucide-react | 0.468 | 1000+ SVG 图标，tree-shakable |
| **AI 引擎** | DeepSeek API (V4 Flash) | — | 服务端调用，支持 12s 超时回退 Mock |
| **ORM** | Prisma | 6.19 | 类型安全数据库访问，6 个数据模型 |
| **数据库** | SQLite (better-sqlite3) | 11.7 | 本地单文件数据库，零配置 |
| **认证** | 自定义 localStorage | — | 演示模式简单认证，非生产 JWT |
| **动画** | CSS @keyframes + framer-motion | 11.x | 页面过渡、骨架屏 shimmer、液态玻璃效果 |
| **部署** | 未部署 | — | 当前仅本地开发，`next build` 可生成生产包 |
| **测试** | 无 | — | MVP 阶段，手动浏览器走查 |
| **包管理** | npm | 8+ | `package-lock.json` 锁定依赖 |

### package.json 核心依赖
```json
{
  "next": "14.2.x",
  "react": "^18",
  "react-dom": "^18",
  "typescript": "5.7.x",
  "@prisma/client": "6.19.x",
  "prisma": "6.19.x",
  "better-sqlite3": "11.7.x",
  "tailwindcss": "3.4.x",
  "recharts": "2.15.x",
  "lucide-react": "0.468.x",
  "react-hook-form": "7.54.x",
  "zod": "3.24.x",
  "clsx": "^2",
  "tailwind-merge": "^2",
  "framer-motion": "^11",
  "class-variance-authority": "^0.7"
}
```

---

## 4. 完整路由表（20 个路由 + 11 个 API 端点）

### 前端页面路由 — 学生端（5 个页面，4 Tab 底部导航）

| # | 路由 | 页面类型 | 功能描述 | 导航 |
|---|------|---------|---------|------|
| 1 | `/dashboard` | Server | 学生首页：问候+CTA"开始记录"+状态简卡+最近记录+快捷入口（画像/AI） | Tab: 首页 |
| 2 | `/portrait` | Server | 体质画像页：综合评分+雷达图+趋势图+优势/待提升+记录新数据入口 | Tab: 画像 |
| 3 | `/ai-guide` | Server | AI 指导：体质画像详情+薄弱项分析+训练计划+安全提醒+报告历史 | Tab: AI指导 |
| 4 | `/profile` | Server | 个人中心：基础信息+身体数据+健康关注+隐私说明+退出登录 | Tab: 我的 |
| 5 | `/record` | Client | 体测记录向导（不在导航中，通过首页CTA或画像页入口进入）| 无Tab |

### 前端页面路由 — 教师端 + 系统页

| # | 路由 | 页面类型 | 功能描述 | 布局组件 |
|---|------|---------|---------|---------|
| 1 | `/` | Server | 登录首页：角色切换（学生/教师）+ 账号下拉选择 + 密码输入 + 品牌文案 | 无导航 |
| 2 | `/onboarding` | Client | 5 步引导式信息填写 | AppShell + IosLiquidNav |
| 7 | `/teacher` | Server | 班级总览：统计卡+薄弱项排行+等级环形图+重点关注+今日建议 | AppShell + DesktopSidebar |
| 8 | `/teacher/class` | Server | 班级管理：班级列表+学生管理+添加学生表单+自动账号生成 | AppShell + DesktopSidebar |
| 9 | `/teacher/students` | Server | 学生画像列表：搜索过滤（编号/姓名/年级/性别/关注） | AppShell + DesktopSidebar |
| 10 | `/teacher/students/[id]` | Server | 学生详情页：基础信息+体测记录表+雷达图+AI报告审核 | AppShell + DesktopSidebar |
| 11 | `/teacher/report` | Server | AI 班级报告：整体分析+共性薄弱项+分层指导+教学建议 | AppShell + DesktopSidebar |
| 12 | `/teacher/review` | Server | 审核中心：待审核/已处理+通过/退回+内联反馈 | AppShell + DesktopSidebar |
| 13 | `/teacher/profile` | Client | 教师个人中心：信息+班级统计+快捷入口+退出登录 | AppShell + DesktopSidebar |

### API 端点

| # | 方法 | 路由 | 功能 | 请求体 | 返回 |
|---|------|------|------|--------|------|
| 1 | POST | `/api/auth/login` | 演示登录验证 | `{role, username, password}` | `{data: {...}}` |
| 2 | POST | `/api/ai` | AI 分析生成 | `{type, studentId, ...}` | AI报告JSON + `_mode` |
| 3 | GET | `/api/students` | 获取所有学生列表 | — | `StudentProfile[]` |
| 4 | GET | `/api/students/[id]` | 获取学生详情+体测记录 | — | `{student, records}` |
| 5 | GET/POST | `/api/fitness-records` | 读/写体测记录 | `{studentId, items[]}` | `FitnessRecord` |
| 5a | PATCH/DELETE | `/api/fitness-records/[id]` | 编辑/删除记录（日常训练学生可操作，正式体测仅教师） | `{items[], bodyFeeling}` | — |
| 6 | GET | `/api/class-summary` | 班级统计摘要 | — | `ClassSummary` |
| 7 | GET | `/api/reviews` | 获取审核列表 | — | `TeacherReview[]` |
| 8 | PATCH | `/api/reviews/[id]` | 更新审核状态 | `{status, notes}` | `TeacherReview` |
| 9 | GET/POST | `/api/classes` | 列出/创建班级 | `{name, grade}` | `ClassGroup` |
| 10 | GET | `/api/classes/[id]` | 班级详情+学生列表 | — | `ClassWithStudents` |
| 11 | POST | `/api/classes/[id]/students` | 添加学生(自动生成账号) | `{name, gender, ...}` | `{studentId, password}` |
| 12 | PATCH/DELETE | `/api/classes/[id]/students/[sid]` | 编辑/删除学生 | — | — |

---

## 5. 体测批次系统（v0.5.0 新增）

### AssessmentBatch 数据模型

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | batch-{uuid8} |
| name | String | 如 "2025春季学期首测" |
| academicYear | String | 如 "2024-2025" |
| semester | String | 春季/秋季 |
| round | Int | 第1次/第2次/补测 |
| type | BatchType | official/makeup/daily |
| classId | String | 关联 ClassGroup |
| status | BatchStatus | draft/active/completed/archived |

### FitnessRecord 扩展

| 字段 | 类型 | 说明 |
|------|------|------|
| batchId | String? | 关联 AssessmentBatch |
| batchType | BatchType? | 前端映射字段，来自关联批次 type，用于区分 official/makeup/daily |
| recordType | RecordType | official_test/daily_training |

### 数据完整度规则

- `calculateRecordCompleteness(recordedItemIds, gender)` — 按性别计算 6 项标准完整度
- 画像页：数据不完整时显示 amber 提示条，"综合评分"→"已记录项目平均分"
- 雷达图：只显示有数据的维度，缺失维度标注"暂无数据"
- AI 提示词 6 条硬规则：不推测、不补全、不基于缺失数据生成完整评价

### 种子数据

- S018：仅肺活量+坐位体前屈（2/6项，部分记录示例）
- S019：仅跑步项目（2/6项，部分记录示例）
- S020：无记录（未录入示例）

---

## 5b. AI 报告生成机制（v0.5.2 重构）

### 核心原则
- 进入页面不自动生成报告，不消耗 AI token
- 生成仅由用户主动点击触发
- 按 sourceRecordId 匹配报告与体测记录
- 已有报告优先展示，历史报告默认折叠

### 状态机
```
noRecord → hasRecordNoReport → [用户点击生成] → hasCurrentReport
                                                → hasNewerRecord → [用户选择]
```

### 报告匹配规则
1. 优先 `sourceRecordId === latestRecord.id`
2. 其次 `sourceRecordDate === latestRecord.date`

### 页面结构（从上到下）
1. 报告状态卡（根据状态显示不同内容）
2. 首屏摘要（审核状态 + 一句话画像 + 本周目标）
3. 数据完整度（局部分析/综合分析 + 已录/待补充列表）
4. 重点提升（weaknessAnalysis，最多3项）
5. 本周训练计划（按周展示）
6. 恢复与安全提醒
7. 教师审核状态
8. 历史报告（底部 Accordion，默认折叠）

## 6. 学生端功能详解

### 6.1 登录首页 `/`

**组件**：`src/components/features/landing-page.tsx`（Client Component）

**页面布局**：
- 顶部导航栏：Logo（Activity 图标 + "跃动智体"）+ 右侧角色切换按钮
- 左侧品牌区（lg 屏幕）：学生端/教师端不同的品牌文案+功能亮点卡片
- 右侧登录卡片：
  - 头像图标 + "学生登录"/"教师登录"
  - **下拉选择账号**：`<select>` 列出所有角色对应的账号（含姓名、年级、性别）
  - **账号输入框**：手动输入或下拉自动填充
  - **密码输入框**：type password + 眼睛图标切换显隐
  - **登录按钮**："进入系统"，loading 态显示"正在进入..."
  - 底部署名："演示模式 · AI辅助 · 教师主导 · 数据匿名"

**交互逻辑**：
1. 切换角色 → 清空账号密码 + 错误提示
2. 下拉选择账号 → 自动填充账号（username）+ 密码（demo123）
3. 点击登录 → 验证账号存在 → 验证密码 → POST `/api/auth/login` → 存 localStorage `demo_login` → 跳转
4. 登录失败 → 显示红色错误提示

**登录守卫（AuthGuard）**：
- `src/components/features/auth-guard.tsx` + `src/hooks/use-auth.ts`
- 未登录访问受保护页面 → 显示骨架屏 → `router.replace("/")`
- 已登录访问 `/` → `router.replace("/dashboard" 或 "/teacher")`

### 5.2 学生首页 `/dashboard`（v0.4.2 轻量化）

**组件**：`src/app/(student)/dashboard/page.tsx`（Server Component）+ `dashboard-hero.tsx`（Client Component）
**数据源**：Prisma 数据库（通过 `data-service.ts`）
**导航配置**：底部导航 Tab "首页"，无返回按钮

**页面布局（移动端单列，max-w-lg）**：
- **DashboardHero**：动态问候 + 姓名 + 评分等级 + 状态一句话 + "开始记录"大按钮
- **状态简卡**（3列）：综合评分 / BMI 状态 / 待提升项目数
- **最近记录摘要**：最近一次体测的项目名 + 成绩 badge
- **本周关注**：最弱维度的轻量提示
- **快捷入口**（2列）：查看体质画像 → `/portrait` · 查看 AI 指导 → `/ai-guide`

> 📌 首页不展示雷达图、趋势图等完整数据分析，这些内容已迁移到 `/portrait`。

### 5.2a 体质画像页 `/portrait`（v0.4.2 新增）

**组件**：`src/app/(student)/portrait/page.tsx`（Server Component）
**数据源**：Prisma 数据库（通过 `data-service.ts`）
**导航配置**：底部导航 Tab "画像"，无返回按钮

**页面布局**：
- PageHeader：标题"体质画像" + 副标题"学生A · 年级 · 学期"
- 核心指标区（lg:grid-cols-3）：综合评分卡 + 本期洞察卡
- 体质雷达图（5维，个人 vs 班级均值）
- 50米跑趋势图（≥2条记录时显示）
- 优势/待提升项目双列卡片
- 底部"记录新数据"按钮 → `/record`

### 5.3 引导式信息填写 `/onboarding`

**组件**：`src/components/features/onboarding-steps.tsx`（Client Component）

**5 步流程**：
| 步骤 | 内容 | 组件 | 数据字段 |
|------|------|------|---------|
| Step 0 | 基础信息 | 年级按钮组 + 性别按钮组 + 年龄滚轮 | grade, gender, age |
| Step 1 | 身体数据 | 身高滚轮（150-195cm）+ 体重滚轮（40-110kg） | height, weight |
| Step 2 | 运动目标 | 6 个卡片按钮（含 emoji 图标） | sportGoal |
| Step 3 | 运动基础 | 4 个卡片按钮（含描述文字） | sportBase |
| Step 4 | 健康状况 | 7 个多选按钮 | discomforts[] |

**表单组件**：
- `wheel-picker.tsx`：iOS 风格滚轮，支持拖动、±微调按钮、快捷选项
- 每个步骤有独立的验证逻辑
- 进度指示器：底部 5 段进度条 + "第 X/5 步"文字
- 数据保存到 localStorage `onboardingData`

**年龄范围**：15-18 岁（高中），快捷选项：15/16/17/18 岁

### 5.4 体测记录向导 `/record`

**组件**：`src/app/(student)/record/record-wizard.tsx`（Client Component）

**动态步骤**：
- 含体力项目（speed/strength/endurance 类别）→ 4 步流程
- 纯身体指标（仅身高体重）→ 3 步流程（跳过体感）

**Step 1 — 选择项目**：
- 组件：`record-project-select.tsx`
- 9 个体测项目卡片网格（3 列）
- 每张卡片：emoji 图标 + 项目名 + 单位 + 分类标签
- **性别过滤规则**：
  - `pull_up`（引体向上）、`1000m_run` → 仅男生可见
  - `sit_up`（仰卧起坐）、`800m_run` → 仅女生可见
  - 其他 5 项 → 通用
- 过滤掉 `height_weight`（身高体重已在引导时收集）和 `body` 类别
- 多选模式，选中卡片高亮（primary 边框+背景）
- 验证：至少选 1 项

**Step 2 — 输入成绩**：
- 组件：`record-score-input.tsx`
- 每个已选项目一个滚轮输入区
- `wheel-picker.tsx`：显示单位、当前值、支持快捷选项
- 验证：所有已选项目必须有值（> 0）

**Step 3 — 逐项体感**（仅体力项目时显示）：
- 组件：`record-feeling-step.tsx`
- **每个项目独立卡片**：
  - 疲劳程度：1-10 滑杆（`feeling-slider.tsx`），1=轻松、10=很累
  - 恢复感觉：3 档按钮（恢复很快/恢复正常/恢复较慢）
  - 肌肉酸痛：有/无 切换按钮
- **整体身体状况**（底部共享卡）：
  - 有/无不适切换
  - 不适时显示文本输入框

**Step 4 — 完成**：
- 组件：`record-complete.tsx`
- 展示已记录的摘要信息
- "查看体质画像"按钮 → POST `/api/fitness-records` → 清除 AI 缓存 → 跳转 `/dashboard`

**保存逻辑**：
1. POST `/api/fitness-records` 将记录写入 SQLite 数据库
2. 同时保存到 localStorage `demo_records`（演示模式冗余）
3. 清除 `ai_analysis_cache` 保证下次 AI 分析基于最新数据
4. 跳转到 `/dashboard`

### 5.5 AI 智能指导 `/ai-guide`（核心功能）

**组件**：`src/app/(student)/ai-guide/page.tsx`（Server Component）+ `src/components/features/ai-student-report.tsx`（Client Component）
**数据源**：Prisma 数据库（学生信息 + 体测记录 + AI 报告历史）
**展示学生**：当前固定 S001（演示模式）

#### 分析策略（核心设计决策）

```
单项目记录（1 项） → 专项分析模式 ⚡
  ├── 深入分析该项目的技术水平
  ├── 给出针对性技术要领和改进方法
  ├── 提供 2-3 个专项训练动作
  └── 评估该项目与其他体能维度的关联

多项目记录（2+ 项） → 综合分析模式 📈
  ├── 全面体质画像（5 维度评估）
  ├── 跨维度训练建议
  ├── 2 周递进式训练计划
  └── 历史趋势参考
```

#### 页面结构
1. **PageHeader**：标题"AI 智能指导" + 返回按钮
2. **GuidanceStrategyCard**：蓝色提示卡片，说明当前分析模式
   - 显示分析类型标签（专项分析/综合分析）
   - 显示来源记录摘要（时间+项目列表）
   - 相对时间显示（如"3天前记录"）
   - "生成分析报告"按钮
3. **AIGenerationStatus**：步骤进度指示器
   - 3 步：分析体测数据 → 生成体质画像 → 生成训练建议
   - 每步有独立图标（Activity/Brain/Target）
   - 已完成步骤显示 ✓，当前步骤有骨架屏动画
   - 底部骨架屏预览文本
4. **ReportHistoryList**：历史分析报告列表
   - 每项显示：来源记录名、分析类型标签（⚡专项/📈综合）、生成时间（绝对+相对）、审核状态、摘要预览
   - 点击切换查看不同时期的报告
   - 最新报告有"最新"标签
5. **ReportContent**：报告内容（4 个卡片）
   - 🧠 体质画像卡：综合评分+BMI 状态+优劣标签+生成时间+来源记录
   - 🎯 待提升项目卡：编号列表，含当前水平、可能原因、提升潜力评估
   - 💪 训练计划卡：2 周递进式（Week1 建立习惯→Week2 提升强度），每动作含名称/描述/组数/频率/时长/注意事项
   - 🛡️ 安全提醒卡：3-5 条安全注意事项
6. **审核状态卡**：显示当前报告的审核状态（待审核/已审核/已退回）

#### AI 调用流程
```
前端 ai-student-report.tsx
  → POST /api/ai {type:"student-report", studentId, studentData, sourceRecordId/Date/Summary}
  → 服务端检查 DEEPSEEK_API_KEY
    ├── 未配置 → 返回 Mock 数据（_mode:"mock"）
    ├── 已配置 → 调用 DeepSeek API（12s 超时）
    │   ├── 成功 → 解析 JSON → merge 到 mock 结构 → 返回（_mode:"ai"）
    │   └── 失败/超时 → 返回 Mock 数据（_mode:"mock", _fallback:true）
    └── 持久化 → upsert AIReport + TeacherReview 到 SQLite
```

#### 跨页面持久化
- 模块级 `inFlightRequests` Map：同 studentId 的 AI 请求去重，页面切换不中断
- 前端 15s 超时 AbortController
- localStorage 缓存 (`ai_analysis_cache`)：新记录保存时清除

### 5.6 个人中心 `/profile`

**组件**：`src/app/(student)/profile/page.tsx`（Server Component）

**内容区域**：
1. **基础信息卡片**：头像占位 + 姓名 + 年级/性别/年龄 + 身高/体重/BMI 数据
2. **运动目标与基础**：双列卡片
3. **健康关注信息**：标签展示 + 隐私提示
4. **历史记录入口**：显示记录次数，卡片样式可点击
5. **教师工作台入口**：快捷跳转 `/teacher`
6. **隐私说明**：3 条数据保护说明
7. **AI 使用说明**：4 条规范说明
8. **退出登录按钮**：`LogoutButton` 组件，清除 `demo_login` + 跳转 `/`

---

## 6. 教师端功能详解

### 6.1 班级总览 `/teacher`

**组件**：`src/app/teacher/page.tsx`（Server Component）
**数据源**：`getClassSummary()` 从 Prisma 数据库实时计算

**布局：12 列 CSS Grid（lg:grid-cols-12）**：
- Row 1（col-span-12）：PageHeader "高二(1)班" + "2025年春季学期"
- Row 2（col-span-12）：今日教学建议卡片（primary 浅色背景+左侧边框）
  - 含动态统计文案（薄弱项+建议）
  - "数据库统计 · 演示模式"标签
- Row 3（col-span-12）：4 个统计卡片（2 列 → sm:4 列）
  - `StatCard`：班级人数、已记录、平均 BMI、及格率
- Row 4（col-span-12）：待审核提醒卡片（红色脉冲动画圆点）
  - 显示待审核数量 + "前往审核"链接
- Row 5（col-span-8）：图表区
  - 班级薄弱项排行（ClassBarChart）：横向柱状，及格率从低到高
  - 等级分布环形图（LevelDonutChart）：优秀/良好/及格/待提升
- Row 5（col-span-4）：侧边栏
  - 重点关注学生列表：可点击进入详情
  - 快捷入口：AI 班级报告 + 学生列表

### 6.2 学生画像列表 `/teacher/students`

**组件**：`src/components/features/student-search-list.tsx`（Client Component）
**数据源**：Prisma 数据库

**功能**：
- 搜索框：支持搜索编号/姓名/年级/性别/"关注"
- 学生卡片列表：头像+综合评分+等级+优劣标签+AI 状态
- 空状态："未找到匹配的学生"
- 点击卡片 → `/teacher/students/[id]`

### 6.3 学生详情页 `/teacher/students/[id]`

**组件**：`src/app/teacher/students/[id]/page.tsx`（Server Component）

**内容**：
1. PageHeader：学生姓名 + 返回按钮
2. 学生信息卡：头像+姓名+性别+年级+年龄+身高+体重+BMI
3. 体测成绩表格：项目名+成绩+单位+得分+等级（颜色标记）
4. 5 维雷达图
5. AI 报告审核状态（独立 Client Component：`student-review-status.tsx`）

### 6.4 AI 班级报告 `/teacher/report`

**组件**：`src/components/features/ai-class-report-view.tsx`（Client Component）

**内容**：
1. 整体分析：总人数/平均分/及格率/优秀率 + 综合评语
2. 共性薄弱项（编号列表）：每项含及格率+影响人数+原因分析
3. 学生分层指导（A/B/C/D 四层）：每层人数+指导建议
4. 课堂训练重点（优先级排序）：建议活动列表+预期效果
5. 教学改进建议：具体可落地建议
6. "前往审核"CTA 按钮
7. AI 免责声明（底部）

### 6.5 审核中心 `/teacher/review`

**组件**：`src/components/features/review-workflow.tsx`（Client Component）

**功能**：
- Tab 切换：待审核 / 已处理
- 审核卡片：报告类型+状态+AI 原始文本+教师操作区
- 通过：确认 → 状态变为 approved
- 修改后通过：编辑原文 + 填写修改原因 → 状态变为 modified
- 退回：填写退回原因（必填）→ 状态变为 rejected
- 操作反馈：内联成功/失败消息（2s 自动消失）
- 状态颜色：pending=橙色、approved=绿色、modified=蓝色、rejected=红色

### 6.6 教师个人中心 `/teacher/profile`

**组件**：`src/app/teacher/profile/page.tsx`（Client Component）

**内容**：
1. 教师信息卡片：头像+姓名+班级+教研组
2. 统计数字：任教班级编号 + 班级学生数（20人）
3. 快捷入口卡片：班级总览 + 审核中心
4. AI 使用说明：3 条教师端规范
5. 退出登录按钮

---

## 7. AI 模块完整设计

### 7.1 架构图

```
┌─────────────────────────────────────────────────────┐
│  前端 Client Component                                │
│  ai-student-report.tsx / ai-class-report-view.tsx    │
│  ├── 模块级 Map 去重缓存                               │
│  ├── 15s AbortController 超时                         │
│  └── localStorage 结果缓存                             │
└──────────────────┬──────────────────────────────────┘
                   │ POST /api/ai
                   ▼
┌─────────────────────────────────────────────────────┐
│  API Route: src/app/api/ai/route.ts                  │
│  ├── 检查 DEEPSEEK_API_KEY（starts with "sk-"）       │
│  ├── 未配置 → Mock 模式                               │
│  └── 已配置 → DeepSeek API 调用                       │
│       ├── 12s AbortController 超时                    │
│       ├── 失败/超时 → Fallback Mock                   │
│       └── 成功 → JSON.parse + merge 到默认结构         │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  DeepSeek API (https://api.deepseek.com/v1)          │
│  model: deepseek-v4-flash / deepseek-chat            │
│  temperature: 0.4                                    │
│  max_tokens: 4096                                    │
└─────────────────────────────────────────────────────┘
```

### 7.2 提示词设计

#### 学生报告 System Prompt
```
你是中学（高中）体育教师助手。你只提供体育锻炼建议，不进行任何医学诊断。
语言要积极、鼓励、保护学生自尊。不要使用"诊断""治疗""处方""肥胖""差""不行""排名"等表达。
使用"有提升空间""待提升""值得关注""锻炼建议""训练参考"等积极表达。

分析模式有两种：
1. 专项分析模式（单项目）：当学生只录入了一个体能项目时，针对该项目进行深入的技术分析。
2. 综合分析模式（多项目）：当学生录入了多个项目时，进行全面的体质画像分析。

训练计划要循序渐进，适合校园体育锻炼场景（高中）。
如果学生体感疲劳较高（≥7/10），必须在训练建议中明确提醒降低强度。
如果学生有身体不适状况，训练计划中必须避免可能加重不适的动作。
所有训练建议必须标注"需经体育教师审核授权后实施"。
输出结构化JSON，不要输出任何其他内容。
```

#### 学生报告 User Prompt 结构
```json
{
  "student": { 学生基本信息 },
  "currentRecord": { 当前体测记录+逐项体感 },
  "previousRecords": [ 历史记录（最多3条） ],
  "analysisMode": "single_record_with_history_context"
}
```

根据记录项目数自动追加：
- 1 项 → 【专项分析模式】仅一个项目，深入分析技术要领和针对性训练方法
- N 项 → 【综合分析模式】N 个项目，全面体质画像分析

#### 班级报告 System Prompt
```
你是高中体育教研助手。根据班级体测数据生成班级体质健康分析报告。
分析整体表现、共性薄弱项目、学生分层指导建议。
提出课堂训练重点和分层运动指导建议。
不给任何学生贴负面标签，不点名具体学生。
不使用"差""不及格""肥胖""诊断""治疗""处方"等表达。
所有建议必须标注"AI生成，需经体育教师审核后使用"。
输出结构化JSON，不要输出任何其他内容。
```

### 7.3 AI 报告持久化

`/api/ai` 生成报告后立即调用 `upsertAIReportForReview()`：
1. `AIReport` 表：upsert 报告内容 JSON + 来源记录信息 + 生成时间
2. `TeacherReview` 表：创建/更新对应的待审核记录（reviewer: "周老师"）
3. 审核中心以数据库为唯一权威来源

### 7.4 报告历史查询

```typescript
// src/lib/server/data-service.ts
getStudentReportHistory(studentId) → StudentReportHistoryItem[]
// 返回：id, report, generatedAt, mode, status, sourceRecordId, sourceRecordDate, sourceSummary
```

---

## 8. 完整数据模型

### 8.1 TypeScript 类型（`src/lib/types.ts`）

```
基础枚举：
  Gender            = "male" | "female"
  GradeLevel        = "高一" | "高二" | "高三"
  FitnessItemId     = "height_weight" | "vital_capacity" | "50m_run" | "standing_long_jump" | "sit_and_reach" | "pull_up" | "sit_up" | "800m_run" | "1000m_run"
  GradeTier         = "excellent" | "good" | "pass" | "improve"
  SportGoal         = "improve_endurance" | "build_strength" | "lose_weight" | "improve_flexibility" | "overall_health" | "exam_preparation"
  SportBase         = "none" | "light" | "moderate" | "active"
  DiscomfortType    = "none" | "asthma" | "heart_concern" | "joint_pain" | "back_pain" | "dizziness" | "other"

核心实体：
  StudentProfile    — {id, name, gender, grade, age, height, weight, bmi, sportGoal, sportBase, discomforts[], createdAt, updatedAt}
  FitnessRecord     — {id, studentId, date, semester, batchId?, batchName?, batchType?, recordType, items[], bodyFeeling}
  FitnessRecordItem — {itemId, value, score, grade}
  BodyFeeling       — {fatigueLevel(1-10), recoveryStatus, hasSoreness, sorenessAreas[], hasDiscomfort, discomfortNotes}
  AIStudentReport   — {id, studentId, generatedAt, version, status, fitnessProfile, weaknessAnalysis[], trainingPlan[], safetyReminders[]}
  AIClassReport     — {id, generatedAt, version, status, overallAnalysis, commonWeaknesses[], studentTiers[], classTrainingFocus[], teachingSuggestions[]}
  TeacherReview     — {id, reportId, reportType, reviewedAt, reviewerName, status, teacherNotes, modifications[]}
  ClassSummary      — {totalStudents, recordedStudents, averageBmi, passRate, excellentRate, weakItemRanking[], projectAverages[], attentionStudents[]}

图表数据：
  RadarChartDataPoint  — {dimension, score, classAverage, fullMark}
  TrendChartDataPoint  — {date, value, grade}
  BarChartDataPoint    — {itemName, passRate, excellentRate}
  DonutChartSegment    — {grade, label, count, percentage}
  OnboardingData       — {grade, gender, age, height, weight, sportGoal, sportBase, discomforts[]}
```

### 8.2 Prisma Schema（6 个数据模型）

```
ClassGroup {
  id        String   @id
  name      String   // "高二(1)班"
  grade     String   // "高二"
  semester  String   // "2025-春季"
  teacherId String
  students  Student[]
  accounts  UserAccount[]
  reports   AIReport[]
}

UserAccount {
  id           String  @id
  role         String  // "student" | "teacher"
  username     String  @unique
  displayName  String
  passwordHash String  // "demo123"
  studentId    String?
  classId      String?
  student      Student?  @relation
  class        ClassGroup? @relation
}

Student {
  id              String   @id         // "S001"
  name            String               // "学生A"
  gender          String               // "male" | "female"
  grade           String               // "高一" | "高二" | "高三"
  age             Int                  // 15-18
  height          Float                // cm
  weight          Float                // kg
  bmi             Float
  sportGoal       String
  sportBase       String
  discomfortsJson String   // JSON array
  classId         String
  class           ClassGroup @relation
  account         UserAccount?
  records         FitnessRecord[]
  reports         AIReport[]
  createdAt       DateTime
  updatedAt       DateTime
}

FitnessRecord {
  id               String   @id
  studentId        String
  date             DateTime
  semester         String
  fatigueLevel     Int
  recoveryStatus   String
  hasSoreness      Boolean
  sorenessAreasJson String  // JSON array
  hasDiscomfort    Boolean
  discomfortNotes  String
  student          Student  @relation
  items            FitnessRecordItem[]
}

FitnessRecordItem {
  id        String @id
  recordId  String
  itemId    String
  value     Float
  score     Int
  grade     String
  record    FitnessRecord @relation
}

AIReport {
  id               String   @id
  reportKind       String   // "student" | "class"
  studentId        String?
  classId          String?
  contentJson      String   // JSON text
  mode             String   // "ai" | "mock"
  status           String   // "draft" | "pending_review" | "approved" | "rejected"
  version          Int
  sourceRecordId   String?
  sourceRecordDate DateTime?
  sourceSummary    String?
  generatedAt      DateTime
  createdAt        DateTime
  student          Student?  @relation
  class            ClassGroup? @relation
  review           TeacherReview?
}

TeacherReview {
  id               String   @id
  reportId         String   @unique
  reportType       String   // "student" | "class"
  reviewerName     String   // "周老师"
  status           String   // "pending" | "approved" | "modified" | "rejected"
  teacherNotes     String
  reviewedAt       DateTime?
  modificationsJson String? // JSON
  report           AIReport @relation
  createdAt        DateTime
}
```

### 8.3 体测项目定义（9 项）

| 项目 ID | 名称 | 单位 | 类别 | 性别 | 方向 |
|---------|------|------|------|------|------|
| height_weight | 身高体重 | cm/kg | body | 通用 | 适中 |
| vital_capacity | 肺活量 | ml | endurance | 通用 | ↑ |
| 50m_run | 50米跑 | 秒 | speed | 通用 | ↓ |
| standing_long_jump | 立定跳远 | cm | strength | 通用 | ↑ |
| sit_and_reach | 坐位体前屈 | cm | flexibility | 通用 | ↑ |
| pull_up | 引体向上 | 次 | strength | 男生 | ↑ |
| sit_up | 仰卧起坐 | 次/分钟 | strength | 女生 | ↑ |
| 800m_run | 800米跑 | 秒 | endurance | 女生 | ↓ |
| 1000m_run | 1000米跑 | 秒 | endurance | 男生 | ↓ |

### 8.4 体测数据合理范围

| 项目 | min | max | 单位 |
|------|-----|-----|------|
| height | 120 | 210 | cm |
| weight | 30 | 120 | kg |
| vital_capacity | 1000 | 10000 | ml |
| 50m_run | 6.0 | 12.0 | 秒 |
| standing_long_jump | 100 | 280 | cm |
| sit_and_reach | -10 | 30 | cm |
| pull_up | 0 | 30 | 次 |
| sit_up | 0 | 60 | 次/分钟 |
| 1000m_run | 180 | 420 | 秒 |
| 800m_run | 180 | 360 | 秒 |

---

## 9. 评分算法（`src/lib/scoring.ts`）

基于**国家学生体质健康标准（高中版）**的三维查表法：

```
SCORING[gender][grade][itemId] = { excellent, good, pass } 阈值

计算逻辑：
  higherIsBetter = true（值越大越好）：
    value >= excellent → 95 分
    value >= good      → 85 分
    value >= pass      → 70 分
    value < pass       → Math.max(30, Math.round(60 * value/pass))

  higherIsBetter = false（值越小越好）：
    value <= excellent → 95 分
    value <= good      → 85 分
    value <= pass      → 70 分
    value > pass       → Math.max(30, Math.round(60 * pass/value))
```

评分标准覆盖：高一、高二、高三，三个年级各有独立阈值。

---

## 10. 组件架构

### 10.1 五层分层

```
src/components/
├── ui/          # shadcn/ui 基础组件（21 个）
│   ├── button.tsx      — 按钮（variant: default/destructive/outline/secondary/ghost/link, size: default/sm/lg/icon）
│   ├── card.tsx        — 卡片（Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter）
│   ├── input.tsx       — 输入框
│   ├── badge.tsx       — 标签（variant: default/secondary/destructive/outline + excellent/good/pass/improve）
│   ├── dialog.tsx      — 对话框（基于 Radix Dialog）
│   ├── select.tsx      — 下拉选择（基于 Radix Select）
│   ├── separator.tsx   — 分割线（基于 Radix Separator）
│   ├── skeleton.tsx    — 骨架屏
│   ├── progress.tsx    — 进度条（基于 Radix Progress）
│   ├── tabs.tsx        — 标签页（基于 Radix Tabs）
│   ├── textarea.tsx    — 文本域
│   ├── label.tsx       — 标签（基于 Radix Label）
│   ├── avatar.tsx      — 头像（基于 Radix Avatar）
│   ├── dropdown-menu.tsx — 下拉菜单
│   ├── sheet.tsx       — 侧边面板
│   ├── tooltip.tsx     — 工具提示
│   ├── alert.tsx       — 警告提示
│   ├── table.tsx       — 表格
│   ├── checkbox.tsx    — 复选框
│   ├── radio-group.tsx — 单选组
│   ├── switch.tsx      — 开关
│   └── slider.tsx      — 滑杆
│
├── layout/      # 布局组件
│   ├── app-shell.tsx        — 响应式外壳：根据 pathname 判断学生端/教师端，桌面端教师显示侧边栏
│   ├── ios-liquid-nav.tsx   — 液态玻璃浮动胶囊导航：5 个等宽项，w-[calc(100vw-24px)]→max-w-[480px]
│   ├── desktop-sidebar.tsx  — 教师端桌面侧边栏：lg:block 显示，5 个导航项
│   └── page-header.tsx      — 页面标题：title + description + 可选 backHref 返回按钮
│
├── forms/       # 表单组件
│   ├── wheel-picker.tsx     — iOS 滚轮选择器：触控拖动 + ±微调按钮 + 快捷选项 + min/max 范围
│   └── feeling-slider.tsx   — 运动体感滑杆：1-10 数值 + Emoji 表情辅助
│
├── charts/      # 图表组件
│   ├── fitness-radar-chart.tsx  — 5 维体质雷达图：RadarChart, 2 条线（个人实线+班级虚线）
│   ├── fitness-trend-chart.tsx  — 成绩趋势：LineChart, X=时间 Y=数值, dot+label
│   ├── class-bar-chart.tsx      — 薄弱项排行：BarChart 横向, X=及格率%, 颜色映射等级
│   ├── level-donut-chart.tsx    — 等级分布：PieChart 环形, innerRadius 60%, 4 色段
│   └── stat-card.tsx            — 统计数字卡：icon + value + unit + trend arrow
│
└── features/    # 业务组件
    ├── landing-page.tsx           — 登录页：角色切换+账号下拉+密码+品牌文案
    ├── auth-guard.tsx             — 登录守卫：骨架屏 loading → 检查登录 → redirect
    ├── logout-button.tsx          — 退出按钮：清除 demo_login → router.push("/")
    ├── onboarding-steps.tsx       — 5 步引导：年级/性别/年龄/身高/体重/目标/基础/健康
    ├── record-project-select.tsx  — 项目选择：9 个卡片网格，性别过滤
    ├── record-score-input.tsx     — 成绩输入：每个已选项目一个滚轮
    ├── record-feeling-step.tsx    — 逐项体感：每个项目独立疲劳/恢复/酸痛卡片
    ├── record-complete.tsx        — 完成页：确认摘要 + 跳转
    ├── ai-student-report.tsx      — AI 学生报告：分析策略+生成状态+历史列表+报告内容
    ├── ai-class-report-view.tsx   — AI 班级报告视图
    ├── ai-generation-status.tsx   — AI 生成状态：3 步进度+进度条+骨架屏+错误/回退状态
    ├── review-workflow.tsx        — 审核工作流：Tab+通过/修改/退回+内联反馈
    ├── student-search-list.tsx    — 学生搜索：筛选+卡片列表+空状态
    ├── student-review-status.tsx  — 学生详情审核状态（Client Component）
    └── empty-state.tsx            — 空状态占位：图标+标题+描述+可选 action
```

### 10.2 Server/Client Component 边界

**Server Components（默认，无 `use client`）**：
- 所有 `page.tsx`（除 `/teacher/profile`）
- 所有 `layout.tsx`
- `app-shell.tsx`、`page-header.tsx`

**Client Components（有 `use client`）**：
- 所有 `features/` 下的业务组件
- 所有 `forms/` 下的交互组件
- 所有 `charts/` 下的图表组件（Recharts 需要浏览器 API）
- `ios-liquid-nav.tsx`（需要 `usePathname()`）
- `desktop-sidebar.tsx`（需要 `usePathname()`）
- `auth-guard.tsx`（需要 `useRouter()`）
- `landing-page.tsx`（需要 `useState` + `useRouter()`）

**关键规则**：
- `use client` 不放在 `page.tsx` 级别
- 数据获取在 Server Component 完成，通过 props 传递给 Client Component

---

## 11. UI/UX 设计规范

### 11.1 设计语言

- **参考**：Apple Health / Fitness App（Web 适配版）
- **原则**：Clarity（清晰）、Deference（克制）、Depth（层次）
- **字体**：系统字体栈 — `-apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", ...`

### 11.2 响应式断点

| 断点 | 宽度 | 布局策略 |
|------|------|---------|
| 基准（Mobile） | 375px | 单列、全宽卡片、浮动底部导航 |
| sm | 640px | 双列网格、卡片并排 |
| md | 768px | 内容居中、max-w 约束 |
| lg | 1024px | 多列 Dashboard、侧边栏展开 |
| xl | 1280px | max-w-6xl 宽内容区 |

### 11.3 关键设计 Token

```
颜色：
  --primary: 217 91% 60%         → 蓝色主色
  --level-excellent: 142 76% 36% → 绿色（优秀）
  --level-good: 217 91% 60%      → 蓝色（良好）
  --level-pass: 38 92% 50%       → 橙色（及格）
  --level-improve: 0 72% 51%     → 红色（待提升）

阴影：
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.04)
  --shadow-md: 0 4px 12px -2px rgb(0 0 0 / 0.06)
  --shadow-lg: 0 12px 32px -4px rgb(0 0 0 / 0.08)

圆角：
  rounded-xl → 12px（卡片）
  rounded-full → 按钮、胶囊导航
  rounded-lg → 内部元素

触控：
  最小触控目标：44×44px
  导航项：min-h-11（44px）
  按钮：h-11（44px）默认
```

### 11.4 移动端导航

**IosLiquidNav**（`src/components/layout/ios-liquid-nav.tsx`）：
- 手机端：`w-[calc(100vw-24px)]`，两侧留 12px 安全边距
- 桌面端：`max-w-[480px]`，居中
- 5 个导航项等宽（flex-1）
- 胶囊外形：`rounded-full`，白色半透明背景 + backdrop-blur
- 所有功能始终展开（不折叠到"更多"菜单）
- 支持 iOS safe-area-inset-bottom

---

## 12. 演示模式状态管理（`src/lib/demo-store.ts`）

### localStorage Key 设计

| Key | 存储内容 | 格式 |
|-----|---------|------|
| `demo_login` | 登录状态 | `{role, username, name, class, grade, gender, studentId, timestamp}` |
| `onboardingData` | 引导数据 | `OnboardingData` JSON |
| `demo_records` | 体测记录（冗余） | `StoredRecord[]` |
| `demo_reviews` | 审核状态 | `StoredReview[]` |
| `ai_analysis_cache` | AI 缓存 | `CachedAnalysis` |
| `demo_mode` | 演示模式标记 | `"true"` |

### 关键函数

```typescript
// 引导数据
getOnboardingData() → OnboardingData | null
saveOnboardingData(data)

// 体测记录
getRecords() → StoredRecord[]
saveRecord(record)      // 写入 + 清除 AI 缓存
getLatestStoredRecord() → StoredRecord | null

// AI 分析缓存
getCachedAnalysis() → CachedAnalysis | null
saveCachedAnalysis(analysis)

// 审核状态
getReviews() → StoredReview[]
updateReview(reviewId, updates)

// 重置
seedDemoData()          // 写入预设演示数据
resetDemoData()         // 清除所有 localStorage
```

---

## 13. 安全红线与合规

### 不可违反的安全规则

1. **不做医学诊断**：所有 AI 输出仅涉及体育锻炼参考。Prompt 和 UI 标注均禁止医学化表达
2. **不贴负面标签**：严格使用反标签化映射表
3. **不暴露隐私**：
   - Mock 数据使用 S001-S020 匿名标识
   - 不得使用真实学生姓名、照片、学号
   - 不在前端暴露 API Key（仅存服务端 `.env.local`）
   - `prisma/dev.db` 不入库
4. **AI 生成标注**：所有 AI 内容必须标注「AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。」
5. **教师主导审核**：AI 建议未经教师审核不得推送给学生

### 代码规范

- TypeScript 严格模式，禁止 `any` 类型
- 组件五层分层：ui / layout / forms / charts / features
- `use client` 仅放在叶子组件
- 颜色使用 CSS variables 语义 token，禁止硬编码
- 命名：组件 PascalCase，Hook `use` 前缀，布尔 `is/has` 前缀
- 移动端优先：先写 375px，再写 md/lg 断点
- 触控目标 ≥ 44px

---

## 14. 已完成/待完成状态

### ✅ 已完成（MVP 0.8.0）

| 模块 | 完成度 | 说明 |
|------|--------|------|
| 项目初始化 + 配置 | 100% | Next.js 14 + shadcn/ui 21 组件 + Tailwind |
| Prisma 数据模型（6 表） | 100% | Schema + migrations + seed 脚本 |
| SQLite 数据持久化 | 100% | 读写正常，dev.db 本地文件 |
| 演示登录系统 | 100% | 角色切换+账号下拉+密码+AuthGuard |
| 学生端 5 页面 | 95% | 功能完整，部分数据硬编码 S001 |
| 教师端 6 页面 | 95% | 功能完整，审核流可用 |
| 14 个 API 端点 | 100% | 全部通过测试 |
| AI API（Mock + DeepSeek） | 100% | 双模式切换+超时回退+报告持久化 |
| AI 分析策略（专项/综合） | 100% | 单项目专项分析 + 多项目综合分析 |
| AI 报告历史 | 100% | 数据库存储+前端列表+切换查看 |
| 逐项体感采集 | 100% | 每个项目独立疲劳/恢复/酸痛反馈 |
| 4 种图表 | 100% | 雷达图+趋势图+柱状图+环形图 |
| iOS 液态玻璃导航 | 100% | 响应式+安全区+桌面端适配 |
| 文档体系 | 100% | README+HANDOFF+SKILLS+AGENTS |

### 🔲 后续优化

| 优先级 | 项目 | 说明 |
|--------|------|------|
| P1 | 学生端动态数据 | 当前硬编码 S001，应从登录态读取 studentId |
| P1 | 自动化测试 | Vitest 单元测试 + Playwright E2E |
| P1 | PWA 支持 | Service Worker + manifest.json |
| P2 | 暗色模式完善 | CSS Variables 已定义，需测试各组件 |
| P2 | 真实学生数据导入 | CSV/Excel 批量导入 |
| P2 | AI 提示词优化 | few-shot 示例 + JSON Schema 约束 |
| P3 | 生产部署 | Vercel/服务器部署 + MySQL 迁移 |
| P3 | 多班级支持 | 当前仅高二(1)班 |
| P3 | 消息推送 | 审核通过后通知学生 |

---

## 15. 开发注意事项

### 环境问题

- **Windows/Node 24 + Prisma**：`migrate dev`/`db push` 可能在 schema-engine 阶段报空错误。解决方案：使用 `prisma/migrate.ts` 通过 better-sqlite3 直接执行 SQL migration。
- **`.next` 缓存损坏**：开发中若出现裸 HTML/CSS 404，停止 dev server → 删除 `.next` → 重启 `npm run dev`。
- **不要同时运行 `npm run build` 和 `npm run dev`**：两者都写入 `.next`，可能导致缓存冲突。

### 数据库操作

```bash
npm run db:generate   # 生成 Prisma Client
npm run db:migrate    # 执行自定义 migration（better-sqlite3）
npm run db:seed       # 写入种子数据（20 学生+1 教师+体测记录+AI 报告）
npm run db:studio     # Prisma Studio GUI（localhost:5555）
npm run db:reset      # 删除 dev.db 并重建
```

### 文件修改同步规则

- 新增路由 → 更新路由表（HANDOFF §4）
- 新增依赖 → 更新技术栈表（HANDOFF §3）
- 新增/修改类型 → 更新数据模型（HANDOFF §8）
- 新增组件 → 更新组件架构（HANDOFF §10）
- 新增页面 → 更新功能模块（HANDOFF §5/§6）

---

## 16. 快速启动检查清单

```bash
# 1. 确认环境
node --version   # >= 18
npm --version    # >= 8

# 2. 安装
cd E:\projects\体育课设
npm install

# 3. 数据库
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. 启动
npm run dev
# → http://localhost:3000

# 5. 验证
npm run typecheck   # 应 0 错误
npm run lint        # 应 0 警告
npm run build       # 应 15/15 路由通过
```

### 浏览器验证清单
- [ ] `/` 登录页 → 角色切换 → 账号下拉 → 登录成功 → 跳转正确
- [ ] `/dashboard` 学生首页 → 雷达图 + 趋势图 + 洞察 + AI 入口
- [ ] `/record` 体测记录 → 4 步流程 → 体感采集 → 保存成功
- [ ] `/ai-guide` AI 指导 → 报告历史列表 → 切换查看不同报告
- [ ] `/profile` 个人中心 → 退出登录 → 回到 `/`
- [ ] `/teacher` 教师总览 → 统计卡 + 图表 + 重点关注
- [ ] `/teacher/students` 学生列表 → 搜索 → 点击进入详情
- [ ] `/teacher/review` 审核中心 → 通过/修改/退回操作
- [ ] 移动端（375px）→ 底部导航正常 → 触控 ≥44px
- [ ] 桌面端（1440px）→ 多列网格 → 侧边栏显示

---

> 📋 **本文档目标**：让 AI Agent 能够在 15 分钟内完整理解项目全貌、当前进度、架构决策、安全红线和开发规范，并知道从哪里继续工作。
>
> **最后更新**：2026-05-31 · 版本 MVP 0.7.0
