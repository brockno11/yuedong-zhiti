# 跃动智体 — 项目交接文档

> 生成日期：2026-05-31 | 版本：MVP 0.2.1 | 构建状态：✅ 通过 | 类型检查：✅ 0 错误

---

## 1. 项目身份

| 属性 | 值 |
|------|-----|
| **项目正式名称** | 跃动智体——面向中学生体质健康提升的 AI 智能评价与个性化运动指导系统 |
| **项目代号** | 跃动智体（曾用代号：体测星图） |
| **项目定位** | 面向中学生体质健康测试与体育教学改进场景的 AI 智能信息系统 |
| **申报场景** | 「创AI案例——智能信息系统」 |
| **目标用户** | 中学体育教师（主要）、中学生 12-16 岁（次要） |
| **当前阶段** | MVP 核心功能完成，可演示 |

---

## 2. 项目背景与目标

### 背景
中学体质健康测试是教育部规定的常规工作，但当前面临三大痛点：
1. **数据难理解**：体测数据以表格呈现，学生看不懂自己的体质状况
2. **指导缺个性**：教师难以针对 40+ 名学生逐一给出个性化运动建议
3. **反馈不及时**：体测结果到学生手中往往只有分数，没有分析和改进方案

### 项目目标
1. **数据可视化**：将复杂体测数据转化为直观图表（雷达图、趋势图、分布图）
2. **AI 智能分析**：生成个性化体质画像、薄弱项分析和训练计划
3. **教学辅助**：帮助教师精准了解班级体质状况，分层指导学生
4. **辅助不替代**：AI 生成建议 → 教师审核把关 → 推送学生，全程教师主导

---

## 3. 当前技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Next.js | 14.2 | App Router + Server Components |
| 语言 | TypeScript | 5.7 | 严格模式，`tsc --noEmit` 零错误 |
| UI 组件 | shadcn/ui | latest | 21 个组件（Button, Card, Form, Dialog, Table 等） |
| 样式 | Tailwind CSS | 3.4 | CSS variables 主题系统 + tailwindcss-animate |
| 图表 | Recharts | 2.15 | 雷达图、折线图、柱状图、环形图 |
| 表单 | react-hook-form + zod | 7.54 / 3.24 | 类型安全表单验证 |
| 图标 | lucide-react | 0.468 | 开源 SVG 图标库 |
| AI 引擎 | DeepSeek V4 Flash | — | 已接入真实 API，支持 Mock 回退 |
| 状态管理 | React useState / useForm | — | MVP 阶段本地状态，无全局状态库 |
| 包管理 | npm | 8+ | package-lock.json 锁定 |

---

## 4. 页面结构与路由

### 完整路由表

```
/                          → 学生首页（(student)/page.tsx）
/onboarding                → 5步引导式信息填写
/record                    → 体测记录向导
/dashboard                 → 体质画像仪表盘
/ai-guide                  → AI 智能指导
/profile                   → 个人中心

/teacher                   → 教师端班级总览仪表盘
/teacher/students          → 学生画像列表
/teacher/report            → AI 班级报告
/teacher/review            → 审核中心

/teacher/students/[id]      → 学生详情页（NEW）

/api/ai                    → AI API 路由（POST）
```

### 路由架构决策
- **学生端**使用路由组 `(student)` — URL 不含 `/student` 前缀
- **教师端**使用路径段 `teacher/` — URL 为 `/teacher/*`
- 根 `/` 指向学生首页（路由组内的 `page.tsx`）

---

## 5. 学生端功能

### 5.1 首页 `/`
- 未引导状态：高级“创建体质画像”入口，展示体质画像预览、AI 辅助与教师审核机制
- 已引导状态：个性化问候、综合评分、BMI 状态、本周重点、快捷入口
- 移动端单列优先，桌面端双列增强，充分利用宽屏空间
- 统一提示：AI 生成内容需经体育教师审核，训练计划须经教师授权后实施

### 5.2 引导式信息填写 `/onboarding`
- **5 步卡片式引导**（非传统长表单）：
  1. 基础信息（年级、性别、年龄）
  2. 身体数据（身高 cm、体重 kg，iOS 风格滚轮选择器）
  3. 运动目标（6 个选项卡片）
  4. 运动基础（4 档选择）
  5. 健康状况（多选不适类型）
- 进度指示器 + 步骤验证
- 数据保存到 localStorage

### 5.3 体测记录向导 `/record`
- **动态步骤流程**：
  - 体力运动项目 → 6 步完整流程（选择项目→输入成绩→运动体感→恢复情况→身体不适→完成）
  - 非体力项目 → 3 步简化流程（跳过体感相关步骤）
- 成绩输入：iOS 滚轮选择器（支持拖动、±微调按钮、快捷选项）
- 运动体感：1-10 滑杆 + Emoji 表情反馈
- 恢复状态：3 档选择
- 不适部位：多选标签
- 防重复：同项目同日不可重复记录

### 5.4 体质画像仪表盘 `/dashboard`
- 统计卡片：综合评分、BMI 状态、优势项目数
- 5 维体质雷达图（速度/力量/耐力/柔韧/身体形态）：个人 vs 班级均值
- 本期洞察：优势保持、优先提升、训练建议
- 单项成绩趋势折线图
- 优势项目 + 待提升项目列表
- 响应式布局：移动端单列，桌面端多列数据仪表盘
- 空状态处理：无数据时显示引导入口

### 5.5 AI 智能指导 `/ai-guide`
- AI 体质画像（综合描述 + 维度分析）
- 薄弱项分析（原因 + 提升空间）
- 2 周个性化训练计划（含具体动作、组数、频率、注意事项）
- 运动安全提醒
- 标注「AI 生成，需经体育教师审核后使用」
- 训练计划提示「须经体育教师审核授权后实施」
- 不使用医学诊断化表达（"诊断"、"治疗"、"处方"等）

### 5.6 个人中心 `/profile`
- 基础信息展示（可编辑入口）
- 运动目标和基础
- 健康关注信息
- 历史记录入口
- 隐私说明 + AI 使用说明

---

## 6. 教师端功能

### 6.1 班级总览 `/teacher`
- 统计卡片行：班级人数、已记录人数、平均 BMI、及格率
- 班级薄弱项排行柱状图（及格率从低到高）
- 体测等级分布环形图（优秀/良好/及格/待提升）
- 各项目平均表现表（分男女）
- 重点关注学生列表（多维度标记）
- AI 班级报告快捷入口

### 6.2 学生画像列表 `/teacher/students`
- 学生列表（编号、性别、年级、综合评分、等级）
- 优势/待提升项目标签
- AI 建议状态标记（已生成/待审核/已推送）
- 需要关注标记（低分/无记录/身体不适）
- 搜索功能（按编号/姓名）

### 6.3 AI 班级报告 `/teacher/report`
- 班级整体体质分析
- 共性薄弱项目（含及格率、影响人数）
- 学生分层指导建议（A/B/C/D 四层）
- 课堂训练重点（含建议活动、预期效果）
- 教学改进建议
- 标注「AI 生成，需经体育教师审核后使用」

### 6.4 审核中心 `/teacher/review`
- 待审核 / 已处理 Tab 切换
- AI 报告预览（学生报告 + 班级报告）
- 通过 → 推送给学生
- 修改后通过（教师填写修改说明）
- 退回（暂不推送）
- 明确体现「AI 辅助，教师主导」机制

---

## 7. AI 模块设计

### 7.1 整体架构

```
前端页面 → POST /api/ai → 检查 DEEPSEEK_API_KEY
  ├── 未配置 → Mock 数据（_mode: "mock"）
  ├── 已配置 → DeepSeek API（_mode: "ai"）
  └── 调用失败 → Mock 回退（_mode: "mock", _fallback: true）
```

API Key 仅在服务端 `process.env` 中，前端永不可见。

### 7.2 AI 提示词设计

提示词分为两个文件：

| 文件 | 用途 |
|------|------|
| `src/lib/ai/generate-student-prompt.ts` | 学生个人体质分析提示词 |
| `src/lib/ai/generate-class-prompt.ts` | 班级体质分析提示词 |

#### 学生提示词关键约束
- 角色：中学体育教师助手
- 输入：学生基本信息 + 当前体测成绩 + 历史记录 + 运动体感
- 输出要求：体质画像、薄弱项分析、训练计划、安全提醒
- 动态安全警告：疲劳度 ≥7 自动追加强度提醒；有不适状况自动追加避免动作
- 反标签化："有提升空间"替代"差"

#### 班级提示词关键约束
- 角色：中学体育教研助手
- 输入：班级统计摘要 + 薄弱项排行 + 项目平均 + 重点关注学生
- 输出要求：整体分析、共性薄弱项、分层指导、课堂重点、改进建议
- 隐私保护：不点名具体学生

#### 提示词已知问题与优化建议

| 问题 | 严重程度 | 建议 |
|------|---------|------|
| 输出格式无结构化约束 | 高 | 增加 JSON Schema 约束，要求 AI 返回结构化数据，便于前端解析 |
| 未设置 system prompt 与 user prompt 分离 | 中 | 当前全部内容作为 user prompt 发送；建议将角色和规则作为 system prompt，数据作为 user prompt |
| 温度参数 0.7 偏高 | 中 | 分析类任务建议降至 0.3-0.5，输出更稳定 |
| 模型名称硬编码 | 低 | `deepseek.ts` 中写死 `deepseek-chat`，但 `.env.example` 配置为 `deepseek-v4-flash`，应从环境变量读取 |
| 无输出长度控制 | 低 | 训练计划可能过长，建议增加 `max_tokens` 约束 |
| 缺少 few-shot 示例 | 低 | 建议在 prompt 中提供 1-2 个标准输出示例，引导 AI 输出格式 |

### 7.3 AI 调用层

| 文件 | 作用 |
|------|------|
| `src/lib/ai/deepseek.ts` | DeepSeek API 客户端（服务端调用） |
| `src/lib/ai/mock-ai.ts` | Mock AI 输出（1.5s 模拟延迟） |
| `src/lib/data/mock-ai-reports.ts` | Mock AI 报告数据（学生报告 + 班级报告 + 审核数据） |
| `src/app/api/ai/route.ts` | AI API 路由（双模式切换入口） |

---

## 8. 数据模型

### 8.1 核心类型（`src/lib/types.ts`）

```
StudentProfile       — 学生基础信息（匿名 S001-S020，含 BMI）
FitnessItemDef       — 体测项目定义（9 项，含性别专属项目）
FitnessRecord        — 体测记录（含项目成绩 + 运动后体感）
FitnessRecordItem    — 单项成绩（值 + 得分 + 等级）
BodyFeeling          — 运动后体感（疲劳度 1-10 + 恢复 + 酸痛 + 不适）
FitnessDimension     — 体质维度（速度/力量/耐力/柔韧/身体形态，含班级均值）
AIStudentReport      — AI 学生报告（画像 + 薄弱项 + 训练计划 + 安全提醒）
AIClassReport        — AI 班级报告（整体分析 + 共性薄弱项 + 分层指导）
TeacherReview        — 教师审核（待审核/已通过/已修改/已退回）
ClassSummary         — 班级统计摘要
RadarChartDataPoint  — 雷达图数据点（含满分线）
TrendChartDataPoint  — 趋势图数据点
BarChartDataPoint    — 柱状图数据点
DonutChartSegment    — 环形图分段
OnboardingData       — 引导步骤数据
```

### 8.2 体测项目（9 项）

| 项目 | 类别 | 性别专属 | 方向 |
|------|------|---------|------|
| 身高体重 | body | 否 | 适中为优 |
| 肺活量 | endurance | 否 | 越高越好 |
| 50 米跑 | speed | 否 | 越低越好 |
| 立定跳远 | strength | 否 | 越高越好 |
| 坐位体前屈 | flexibility | 否 | 越高越好 |
| 引体向上 | strength | 男生 | 越高越好 |
| 仰卧起坐 | strength | 女生 | 越高越好 |
| 1000 米跑 | endurance | 男生 | 越低越好 |
| 800 米跑 | endurance | 女生 | 越低越好 |

### 8.3 体测数据合理范围（`src/lib/constants.ts`）

所有体测数据均定义了 `PHYSICAL_RANGES`（min/max），用于前端输入校验和异常值检测。

---

## 9. 体测数据采集与运动体感逻辑

### 9.1 采集流程
1. **基础信息**：通过 `/onboarding` 首次引导采集（身高、体重、年级、性别、年龄、运动目标、运动基础、健康不适）
2. **体测成绩**：通过 `/record` 记录向导采集（项目选择→成绩输入→体感反馈）
3. **数据校验**：`src/lib/validators.ts` 实现四级异常值检测
   - `normal`：在合理范围内
   - `warning`：边缘值
   - `anomaly`：异常值
   - `impossible`：不可能值（如身高 300cm）
4. **评分计算**：`src/lib/scoring.ts` 按性别/年级/项目查表计分（0-100）

### 9.2 运动体感采集（核心创新点）
- **疲劳程度**：1-10 滑杆（Emoji 辅助：😊→😐→😫）
- **恢复情况**：快速/正常/较慢 三档选择
- **酸痛部位**：多选（腿/手臂/腰背/肩膀/无）
- **不适状况**：运动性哮喘/心脏关注/关节不适/腰背不适/易头晕/其他/无
- 体力项目强制采集体感，非体力项目跳过

### 9.3 动态流程适配
- 体力项目（speed/strength/endurance 类别）→ 完整 6 步流程
- 非体力项目 → 简化 3 步流程
- 身高体重不在体测记录中（已移至引导页单独采集）

---

## 10. 可视化设计

### 10.1 图表矩阵

| 图表类型 | 组件 | 使用页面 | 数据字段 |
|---------|------|---------|---------|
| 雷达图 | `FitnessRadarChart` | 学生 Dashboard | 5 维体质（个人 vs 班级均值 vs 满分线） |
| 折线图 | `FitnessTrendChart` | 学生 Dashboard | 单项成绩时间趋势 |
| 柱状图 | `ClassBarChart` | 教师总览 | 班级薄弱项排行（横向柱状图） |
| 环形图 | `LevelDonutChart` | 教师总览 | 等级分布（优秀/良好/及格/待提升） |
| 统计卡 | `StatCard` | 多处 | 单一指标 + 环比变化 |

### 10.2 图表规范
- 所有图表使用 Recharts
- 空状态：无数据时显示 `EmptyState` 组件 + 引导入口
- 颜色映射：优秀=绿色、良好=蓝色、及格=橙色、待提升=红色
- 响应式：图表尺寸随容器自适应

---

## 11. 教师审核机制

### 11.1 审核流程
```
AI 生成报告 → 教师审核中心
  ├── 通过 → 状态变为 approved → 可推送给学生
  ├── 修改后通过 → 教师填写修改说明 → 状态变为 modified
  └── 退回 → 状态变为 rejected → 不推送
```

### 11.2 设计原则
- **AI 辅助 · 教师主导**：所有 AI 内容必须经教师审核后才能使用
- **不替代专业判断**：AI 只提供参考，最终决策权在教师
- **透明标注**：所有 AI 生成内容标注「AI 生成，需经体育教师审核后使用」

---

## 12. 组件架构

### 12.1 五层组件分层

```
src/components/
├── ui/          — shadcn/ui 基础组件（21 个，无业务逻辑）
├── layout/      — 布局组件（app-shell, ios-liquid-nav, desktop-sidebar, page-header）
├── forms/       — 表单组件（wheel-picker, feeling-slider）
├── charts/      — 图表组件（5 个 Recharts 封装）
└── features/    — 业务功能组件（ai-report-card, training-plan-card, review-card 等）
```

### 12.2 Server/Client Component 边界
- **Server Components（默认）**：`page.tsx` 负责数据准备
- **Client Components**（`'use client'`）：`components/` 下的叶子组件
- `use client` 不放在 page 级别

### 12.3 关键布局组件
- **`AppShell`**：响应式外壳，根据路由自动选择布局（学生端/教师端）
- **`IosLiquidNav`**：iOS 26 液态玻璃浮动胶囊导航，自适应可见项目数，溢出自动折叠到「更多」菜单
- **`IosLiquidNav` 当前策略**：手机端填充底部安全宽度，桌面端最大 480px，所有功能始终展开，不折叠
- **`DesktopSidebar`**：教师端桌面侧边栏
- **`mobile-bottom-nav.tsx`**：已废弃，被 `IosLiquidNav` 替代（保留以备参考）

---

## 13. 当前已实现内容

### MVP 完成度：~85%

| 模块 | 完成度 | 备注 |
|------|--------|------|
| 项目初始化 + 配置 | 100% | Next.js 14 + shadcn/ui + Tailwind |
| 数据模型 + 类型定义 | 100% | `types.ts` 完整覆盖所有实体 |
| Mock 数据集 | 100% | 20 名学生 + 体测记录 + AI 报告 |
| shadcn/ui 组件库（21 个） | 100% | 覆盖 button/card/form/dialog/table 等 |
| iOS 26 液态玻璃导航 | 100% | 自适应、溢出菜单、桌面/移动端适配 |
| 学生端 - 首次引导 | 100% | 5 步引导 + 滚轮选择器 |
| 学生端 - 首页 | 95% | 未引导/已引导双状态，高级体质画像入口，宽屏双列 |
| 学生端 - 体测记录 | 95% | 动态步骤 + 滚轮输入 + 体感滑杆 |
| 学生端 - 体质画像 | 95% | 响应式多列 Dashboard、雷达图、趋势图、本期洞察 |
| 学生端 - AI 指导 | 85% | 当前展示 Mock 数据，待对接真实 API |
| 学生端 - 个人中心 | 90% | 信息展示 + 隐私说明 |
| 教师端 - 班级总览 | 90% | 统计卡、柱状图、环形图 |
| 教师端 - 学生列表 | 85% | 列表展示 + 搜索入口 |
| 教师端 - AI 班级报告 | 85% | 当前展示 Mock 数据 |
| 教师端 - 审核中心 | 90% | 通过/修改/退回流程 |
| AI API 路由 | 95% | Mock + DeepSeek 双模式 + 失败回退 |
| 文档体系 | 100% | README + PRD + SKILLS + HANDOFF |

---

## 14. 当前存在的问题

### 功能层面

| 问题 | 严重度 | 说明 |
|------|--------|------|
| AI 指导页未对接真实 API | 中 | `/ai-guide` 静态展示 Mock 数据，需调用 `/api/ai` |
| 班级报告页未对接真实 API | 中 | `/teacher/report` 同样静态展示 |
| 学生首页数据硬编码 | 低 | 展示"学生A"的数据，应从 localStorage 读取引导数据 |
| 学生详情页缺失 | 中 | `/teacher/students/[id]` 路由未创建 |
| 无数据持久化 | 中 | 所有数据在内存中，刷新即丢失 |

### 技术层面

| 问题 | 严重度 | 说明 |
|------|--------|------|
| ESLint 警告 ~15 | 低 | 主要是未使用的 import（已大幅减少，原 ~50+） |
| 暗色模式 | 低 | CSS Variables 已定义但未充分测试 |
| 无测试覆盖 | 中 | 无单元测试、集成测试、E2E 测试 |
| `deepseek.ts` 模型名硬编码 | 低 | 写死 `deepseek-chat`，未从环境变量读取 |

### ✅ 已修复（2026-05-30 体验优化）

| 问题 | 状态 |
|------|------|
| `.env.example` 含真实 API Key | ✅ 已修复 |
| 学生首页信息过密、主动作不突出 | ✅ 已重构 |
| 记录页体力项目 6 步过长 | ✅ 压缩为 4 步 |
| AI 指导页长文本难读 | ✅ 改为结构化卡片 |
| 教师首页缺少教学建议 | ✅ 增加"今日教学建议"和"待审核" |
| AI 标注不统一 | ✅ 统一为"AI生成，需经体育教师审核后使用" |
| Page 级别 `use client` 违规 | ✅ 全部提取到叶子组件 |
| 卡片样式不统一（渐变、阴影、圆角） | ✅ 统一 rounded-xl shadow-sm |
| AIReportCard 渐变左条 | ✅ 替换为纯色 |
| 医学化表达 | ✅ 已扫描确认无违规 |
| 审核中心操作流程 | ✅ 按钮文案简化、状态反馈优化 |
| `.next` 开发缓存损坏导致裸样式/Server Error | ✅ 已通过停止 dev server、清理 `.next`、重启修复 |
| 手机底部导航过窄 | ✅ 改为外层安全边距 + 内部全宽，桌面端 max-w 480px |
| 首页视觉单薄 | ✅ 改为体质画像主视觉 + 价值说明 + 双状态响应式首页 |
| Dashboard 桌面端空间浪费 | ✅ 改为 `max-w-7xl` 多列数据仪表盘 |
| AI 生成慢时缺少反馈 | ✅ 增加分阶段进度、骨架屏、处理中状态 |
| AI 训练计划授权提示不完整 | ✅ 统一补充“训练计划须经体育教师审核授权后实施” |

### 开发运行态注意事项

Next.js dev server 与 `npm run build` 都会写入 `.next`。如果开发服务运行期间又执行生产构建，或热更新过程中缓存文件被中断，可能出现：
- 页面 HTML 正常但 CSS/JS chunk 404，界面变成裸 HTML
- `Cannot find module './xxx.js'`
- `__webpack_modules__[moduleId] is not a function`

处理方式：
1. 停止占用 3000 端口的 dev server
2. 删除 `.next`
3. 重新执行 `npm run dev`
4. 执行生产构建时建议先停止 dev server，构建完成后再启动 dev server

---

## 15. 后续优化计划

### P0 — 已完成 ✅
1. ✅ 修复 `.env.example` API Key 泄露
2. ✅ 统一 AI 标注
3. ✅ 扫描并确认无医学化表达
4. ✅ 重构学生首页（主动作突出）
5. ✅ 压缩记录页流程（6→4步）
6. ✅ AI 指导页结构化卡片
7. ✅ 教师首页增加教学建议 + 待审核
8. ✅ 统一卡片样式
9. ✅ 移除 page.tsx 的 `use client`

### P1 — 完善功能
1. 图表旁增加解释性结论
2. 学生详情页 `/teacher/students/[id]`
3. 学生首页读取 localStorage 动态展示
4. 真实数据库接入（SQLite/PostgreSQL + Prisma）

### P2 — 增强体验
5. AI 指导页对接真实 /api/ai
6. 班级报告页对接真实 /api/ai
7. 用户认证系统
8. 暗色模式切换完善
9. PWA 支持
10. 测试覆盖
12. 单元测试 + E2E 测试（Vitest + Playwright）
13. AI 提示词优化（结构化输出 + few-shot 示例）

---

## 16. 如何启动项目

### 环境要求
- Node.js 18+
- npm 8+

### 安装与运行

```bash
cd E:\projects\体育课设

# 1. 安装依赖
npm install

# 2. 配置环境变量（如使用真实 AI）
cp .env.example .env.local
# 编辑 .env.local 填入 DeepSeek API Key（可选，不填则使用 Mock）

# 3. 启动开发服务器
npm run dev
# 学生端 → http://localhost:3000
# 教师端 → http://localhost:3000/teacher

# 4. 类型检查
npm run typecheck    # tsc --noEmit

# 5. 构建
npm run build

# 6. Lint
npm run lint
```

### 环境变量说明

```env
# .env.local（不入库）
DEEPSEEK_API_KEY=sk-your-key-here      # 必填，否则使用 Mock
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-v4-flash
```

---

## 17. 开发注意事项

### 安全红线（不可违反）

1. **不做医学诊断**：所有 AI 输出仅涉及体育锻炼参考，不使用"诊断"、"治疗"、"处方"等医学化表达
2. **不贴负面标签**：使用"有提升空间"替代"差"、"不及格"；使用"待提升"替代"不及格"
3. **不暴露隐私**：
   - Mock 数据使用 S001-S020 匿名标识
   - 不得使用真实学生姓名、照片、学号
   - 不在前端暴露 API Key
4. **AI 生成标注**：所有 AI 内容必须标注「AI 生成，需经体育教师审核后使用」
5. **教师主导审核**：AI 内容未经教师审核不得推送给学生

### 代码规范

- TypeScript 严格模式，禁止 `any`
- 组件五层分层：ui / layout / forms / charts / features
- `use client` 仅放在叶子组件
- 颜色使用 CSS variables 语义 token，禁止硬编码（如 `#3b82f6`）
- 命名：组件 PascalCase，Hook `use` 前缀，布尔 `is/has` 前缀
- 移动端优先：先写 375px，再写 md/lg 断点
- 触控目标 ≥44px

### 文档同步规则

- 修改代码后需同步更新相关文档（README、HANDOFF、SKILLS）
- 新增页面需更新路由表和页面结构说明
- 新增依赖需更新 `package.json` 和技术栈说明

---

## 18. 文件结构（源码层面）

```
src/
├── app/                                    # Next.js App Router
│   ├── layout.tsx                          # 根布局（字体、metadata、viewport）
│   ├── globals.css                         # CSS Variables 主题系统 + 液态玻璃动画
│   ├── loading.tsx                         # 全局加载骨架屏
│   ├── error.tsx                           # 全局错误边界
│   ├── not-found.tsx                       # 404 页面
│   ├── (student)/                          # 学生端路由组（URL 不含前缀）
│   │   ├── layout.tsx                      # 学生端布局（iOS 液态玻璃导航）
│   │   ├── page.tsx                        # 首页 /
│   │   ├── onboarding/page.tsx             # 引导填写
│   │   ├── record/page.tsx                 # 体测记录
│   │   ├── dashboard/page.tsx              # 体质画像
│   │   ├── ai-guide/page.tsx               # AI 指导
│   │   └── profile/page.tsx                # 个人中心
│   ├── teacher/                            # 教师端路由（URL：/teacher/*）
│   │   ├── layout.tsx                      # 教师端布局（侧边栏 + 导航）
│   │   ├── page.tsx                        # 班级总览
│   │   ├── students/page.tsx               # 学生列表
│   │   ├── report/page.tsx                 # AI 班级报告
│   │   └── review/page.tsx                 # 审核中心
│   └── api/ai/route.ts                     # AI API 路由
├── components/
│   ├── ui/                                 # shadcn/ui 组件（21 个）
│   ├── layout/                             # 布局组件
│   │   ├── app-shell.tsx                   # 响应式外壳
│   │   ├── ios-liquid-nav.tsx              # iOS 26 液态玻璃导航
│   │   ├── desktop-sidebar.tsx             # 教师端桌面侧边栏
│   │   └── page-header.tsx                 # 页面标题栏
│   ├── forms/                              # 表单组件
│   │   ├── wheel-picker.tsx                # iOS 风格滚轮选择器
│   │   └── feeling-slider.tsx              # 运动体感滑杆
│   ├── charts/                             # 图表组件
│   │   ├── fitness-radar-chart.tsx         # 5 维体质雷达图
│   │   ├── fitness-trend-chart.tsx         # 成绩趋势折线图
│   │   ├── class-bar-chart.tsx             # 班级薄弱项柱状图
│   │   ├── level-donut-chart.tsx           # 等级分布环形图
│   │   └── stat-card.tsx                   # 统计数字卡片
│   └── features/                           # 业务功能组件
│       ├── fitness-item-card.tsx           # 体测项目卡片
│       ├── ai-report-card.tsx              # AI 报告卡片（含标注）
│       ├── training-plan-card.tsx          # 训练计划卡片
│       ├── review-card.tsx                 # 审核卡片
│       ├── empty-state.tsx                 # 空状态占位
│       └── loading-skeleton.tsx            # 骨架屏
└── lib/
    ├── types.ts                            # 所有 TypeScript 类型定义
    ├── constants.ts                        # 常量（体测项目、范围、选项）
    ├── validators.ts                       # 数据验证（四级异常值检测）
    ├── scoring.ts                          # 体测评分逻辑
    ├── utils.ts                            # 工具函数（cn）
    ├── data/                               # Mock 数据集
    │   ├── mock-students.ts                # 20 名学生
    │   ├── mock-fitness-records.ts         # 体测记录
    │   └── mock-ai-reports.ts              # AI 报告
    └── ai/                                 # AI 接口层
        ├── generate-student-prompt.ts      # 学生分析提示词
        ├── generate-class-prompt.ts        # 班级分析提示词
        ├── mock-ai.ts                      # Mock AI 输出
        └── deepseek.ts                     # DeepSeek API 客户端
```

---

> 📋 **本文档目标**：让接手本项目的开发者或 AI Agent 能够在 10 分钟内完整理解项目全貌、当前进度、架构决策、安全红线和开发规范，并知道从哪里继续工作。
