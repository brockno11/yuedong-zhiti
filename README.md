# 跃动智体（YueDong ZhiTi）

> 面向中学生体质健康提升的 AI 智能评价与个性化运动指导系统。当前演示场景以高二(1)班为例。

> 2026-06-02 更新（v0.9.4）：800m/1000m 跑步成绩改为「M:SS」分秒格式显示（如 3:50），内部仍以秒数存储；6 处自定义弹窗替换为 shadcn/ui Dialog 组件，支持 Escape 关闭、焦点陷阱、aria-modal 无障碍；API 安全加固——PATCH/DELETE 路由不再信任客户端 role 字段、新增性别校验与输入范围验证；数据一致性修复——日常训练不再混入班级正式统计、BMI 在单独修改身高或体重时自动重算、批次筛选使用过滤后的数据；修复多处除零 NaN 问题；新增 favicon；教师端版本号统一为 v0.9.4；新增 3 个测试/审查 Skills。

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

当前演示数据聚焦 **高二(1)班**：20 名匿名学生（S001-S020）与 1 位体育教师（张老师，账号 `zhoulaoshi`），便于比赛演示时保持数据口径统一、场景真实。

---

## ✨ 核心功能

### 🔐 登录系统（统一入口 `/`）

- **角色切换**：登录页顶部"我是学生"/"我是教师"切换，带动画过渡
- **账号下拉选择**：学生端列出 S001-S020（含姓名、年级、性别），教师端列出张老师账号
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
- **状态简卡**：综合评分（≥70%完整度）/ 已录项目均分 / BMI 状态 / 待补充项数
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
- **逐项体感采集（核心创新点 v2）**：
  - **通用体感组**（所有体力项目共享）：训练目的（正式测试/技术练习/速度/力量/耐力/恢复）、RPE 主观用力程度（1-10 带中文标注）、恢复速度（快/正常/较慢）、肌肉酸痛（无/轻微/明显）、身体不适（是/否，含温和警告提示）
  - **专项技术组**（各项目专用）：50米跑（起跑/加速/途中跑/最后10米/腿部酸痛）、立定跳远（摆臂/蹬伸/收腿/落地/膝踝不适）、引体向上（吃力阶段/动作变形/下降控制/肩背不适/握力）、仰卧起坐（节奏稳定/腰背不适/核心不足/借力/后程掉速）、中长跑（配速稳定/后半程下降/呼吸节奏/腿部酸痛/胸闷不适）、肺活量（吹气技术/运动前状态/呼吸顺畅/动作理解）、坐位体前屈（热身/腿后侧紧张/腰背不适/前伸平稳/憋气用力）
  - 问题按组折叠显示，高风险反馈自动弹出温和警告提示
  - 触控目标 ≥ 44px，移动端友好
- **数据保存**：POST `/api/fitness-records` + 同时保存到 localStorage `demo_records`
- **防重复**：同项目同日不可重复记录

#### 4. 🤖 AI 智能指导 `/ai-guide`（v0.9.4 AI 分析体系重构）

AI 指导页已升级为**「AI 报告中心」**，自动检测分析策略（专项/综合），正式体测报告为 13 模块全维度画像报告：

- **四大区域**：正式体测分析 → 单项分析（6 项目卡片）→ 训练情况 → 历史报告（折叠/展开）
- **正式体测全维度报告**（batch_report，13 个模块）：
  1. 报告头部（类型/批次/生成时间/审核状态/数据完整度/数据来源说明）
  2. 数据来源与完整度卡片（完整度百分比 + 一句话结论）
  3. 总体画像摘要（≥5 句，含整体表现/优势/关注维度/与上次对比/训练方向/审核提醒）
  4. 各项目成绩表（逐项分析，缺失显示"暂无数据"）
  5. 六维度体质画像（6 维度必然完整，含关联项目/分析/建议，AI 未返回时前端兜底计算）
  6. 项目关系分析（≥3 条：速度+爆发力、心肺+耐力、柔韧+跑步等）
  7. 优势能力分析（为什么好 + 可支撑哪些能力 + 如何保持）
  8. 重点关注项目（按优先级排序，含可能原因/改进潜力/关联维度）
  9. 与上一批次对比（趋势箭头 + 逐项变化 + 总结）
  10. 阶段训练参考（3 阶段可折叠：适应→强化→巩固，每阶段含目标/训练动作/恢复建议）
  11. 体育教师教学参考（≥3 条：课堂观察点/分层教学/练习形式/家校协同）
  12. 教师审核须知（≥3 条 AI 标注需教师重点审核的内容）
  13. 恢复与安全提醒（≥6 条：热身/强度递进/不适处理/恢复/睡眠/装备/教师沟通）
- **单项深度分析报告**（item_report，14 个模块）：
  1. 报告头部（项目名称/生成时间/审核状态/数据来源）
  2. 一句话结论（当前水平 + 最近趋势 + 下一步重点）
  3. 数据来源摘要（正式体测 + 同项目日常训练 + 问答反馈）
  4. 正式体测基线分析（成绩/得分/等级/基线解读）
  5. 日常训练趋势分析（次数/趋势/稳定性/疲劳/酸痛/总结）
  6. 专项能力拆解（4-6 项能力，含当前观察/依据/提升建议）
  7. 问答反馈洞察（基于 RPE/恢复/动作质量/酸痛等反馈的 AI 洞察）
  8. 影响因素分析（动作质量/节奏/力量/柔韧/耐力/恢复/训练频率/体感）
  9. 与其他项目关系（该项目与其他体测项目的能力关联）
  10. 专项动作训练指导（动作教学库，只讲动作本身：训练目的、步骤、训练量、时长、强度、要点、常见错误、进阶/降阶、自测标准）
  11. 阶段训练规划指导（按阶段/周次组合上方动作，含每周频率、时长、时间不足版本、正常版本、恢复版本、进入下一阶段条件）
  12. 短中长进阶目标（旧报告兼容；新版优先使用阶段训练规划）
  13. 项目专项安全提醒（不同项目不同提醒，前端统一编号）
  14. 教师审核须知（前端统一编号）
- **reportType 自动检测**：单项目 → item_report，多项目 → 综合分析，正式体测批次 → batch_report
- **不自动生成**：所有报告必须用户主动点击，旧报告永不覆盖
- **新数据检测**：基于 sourceMeta.includedRecordIds 精确判断，有新数据时显示角标
- **更新按钮**：有新数据时启用，无新数据时禁用
- **底部导航返回**：Tab re-click 可重置报告详情回到报告中心
- **项目科普与评分解读**（静态模块）：
  - 专项报告（item_report）：显示 `ItemEducationCard`，含项目权重、能力标签、可视化评分尺（四段色带 + 成绩定位点）、"为什么测/体现什么/怎么看结果"三列说明
  - 总体报告（batch_report）：显示 `StandardEducationOverview`，含六维能力说明（身体形态为 BMI 参考维度，身体机能/速度/力量/柔韧/心肺耐力按正式项目判断）、权重构成条形图（按性别过滤）、缺失项目"暂无数据"列表
  - 所有评分规则、权重、项目意义来自 `src/lib/fitness-education.ts` 本地静态配置，依据《国家学生体质健康标准（2014年修订）》，不交给 AI 生成

#### 5. 👤 个人中心 `/profile`
- **基础信息**：头像占位、姓名、年级、性别、年龄
- **可编辑身体数据**：身高（120-220cm）/ 体重（25-150kg）可编辑，自动计算 BMI，温和表达提示，标注「用于训练建议参考，不替代正式体测数据」
- **体测与训练概况**：正式体测/日常训练次数 + 最近日期 + AI 报告数量
- **运动目标与基础**：双列卡片
- **健康关注信息**：标签展示 + 隐私说明
- **历史记录入口**：显示记录次数，链接到 `/records`
- **隐私说明** + **AI 使用说明**：4 条说明
- **退出登录按钮**：清除 localStorage，跳转 `/`

### 📋 体测批次系统（v0.5.0 新增）

- **AssessmentBatch 模型**：学年 + 学期 + 轮次 + 类型（正式体测/补测/日常训练）
- **记录前选批次**：学生点击"开始记录"→ 第一步选择体测批次，默认选中活跃批次
- **日常训练记录**：独立入口，不绑定正式体测批次，用于训练过程追踪
- **数据完整度**：画像页显示 "已记录 n/6 项"，雷达图仅展示有数据维度
- **AI 数据严谨性**：6 条硬规则禁止推断缺失项目，"综合评分"在数据不足时显示为"已记录项目平均分"
- **教师端批次筛选**：顶部批次下拉 → 统计/图表/学生列表全部按批次过滤
- **学生状态标签**：完整录入 / 部分录入 n/6 / 未录入
- **种子示例**：S018（2项）、S019（2项）、S020（0项）三组典型场景

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
- **批量审批**：checkbox 多选 + 批量通过/退回 + 二次确认弹窗 + 操作后自动刷新
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

### 环境准备

| 软件 | 最低版本 | 说明 | 下载地址 |
|------|---------|------|---------|
| **Node.js** | 18.0+ | JavaScript 运行时（npm 随其自动安装） | https://nodejs.org/ |
| **Git** | 2.0+ | 版本控制工具 | https://git-scm.com/ |

打开终端，验证环境是否就绪：

```bash
node --version    # 预期输出：v18.x.x 或更高
npm --version     # 预期输出：8.x.x 或更高
git --version     # 预期输出：git version 2.x.x
```

> 💡 **未安装 Node.js？** Windows/macOS 用户访问 https://nodejs.org/ 下载 LTS 版本安装包，双击运行即可。Linux 用户参考下方命令：
> ```bash
> # Ubuntu / Debian
> curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
> sudo apt-get install -y nodejs
> ```

### 获取代码

```bash
git clone https://github.com/brockno11/yuedong-zhiti.git
cd yuedong-zhiti
```

### 安装依赖

```bash
npm install
```

> 📦 首次安装需下载约 200-300MB 依赖包，耗时 1-5 分钟。如遇网络超时，可切换镜像源：
> ```bash
> npm config set registry https://registry.npmmirror.com
> npm install
> ```

### 初始化数据库

依次执行以下三条命令（每条命令的预期输出见注释）：

```bash
# 1. 生成 Prisma Client
npm run db:generate
# 预期：✔ Generated Prisma Client

# 2. 执行数据库迁移（创建表结构，生成 prisma/dev.db）
npm run db:migrate
# 预期：Applied migration 20260531000000_init_sqlite_persistence
#       Applied migration 20260531001000_add_ai_report_source_metadata
#       Applied migration 20260531111450_add_assessment_batch
#       Applied migration 20260531135539_add_item_feedback

# 3. 写入演示种子数据（20 学生 + 1 教师 + 体测记录 + AI 报告）
npm run db:seed
# 预期：Seeding complete.
```

> 💡 可选：执行 `npm run db:studio` 打开数据库可视化工具（http://localhost:5555），确认数据已写入。

### 启动项目

```bash
npm run dev
```

预期输出：
```
  ▲ Next.js 14.2.x
  - Local:    http://localhost:3000
  - Network:  http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

🎉 **启动成功！** 在浏览器中访问 **http://localhost:3000** 即可看到登录页面。

> ⚠️ 首次访问时 Next.js 需要编译页面，可能需要 3-5 秒，后续访问会明显加快。

### 演示账号

| 角色 | 账号 | 密码 | 人数 |
|------|------|------|------|
| 学生 | `S001` ~ `S020` | `demo123` | 20人 |
| 教师 | `zhoulaoshi` | `demo123` | 1人 |

### 可选：接入真实 AI

项目默认使用内置 Mock 数据（模拟 AI 分析结果），无需配置 API Key 即可体验全部功能。如需接入真实 AI 服务：

```bash
# 1. 在项目根目录创建环境变量文件
cp .env.example .env.local

# 2. 编辑 .env.local，填入 DeepSeek API Key
#    DEEPSEEK_API_KEY=sk-your-key-here
#    其他配置项通常无需修改

# 3. 重启开发服务器（Ctrl+C 停止 → npm run dev）
```

DeepSeek API Key 获取地址：https://platform.deepseek.com/

> 💡 即使配置了 API Key，如果 AI 请求超时（默认 12 秒），系统会自动回退到 Mock 数据，确保演示不中断。

### 常用命令

| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动开发服务器（http://localhost:3000） |
| `npm run build` | 生产构建（检查代码是否有错误） |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run lint` | ESLint 代码检查 |
| `npm run db:studio` | 打开数据库可视化工具 |
| `npm run db:seed` | 重新写入种子数据 |
| `npm run db:reset` | 重置数据库（删除并重建） |

---

## 🎬 使用指南

### 学生端体验路径

#### 1. 登录

1. 打开 http://localhost:3000
2. 点击右上角 **「我是学生」** 切换到学生登录
3. 账号下拉选择 **S001**，密码自动填充为 `demo123`
4. 点击 **「进入系统」**

#### 2. 学生首页（Dashboard）

登录后自动进入，可以看到：
- 问候语 + 综合评分 + BMI 状态
- 最近体测记录摘要
- 快捷入口（体质画像 / AI 指导）

#### 3. 体质画像

点击底部导航 **「画像」**：
- 综合评分 + 本期洞察
- **五维体质雷达图**（速度 / 力量 / 耐力 / 柔韧 / 身体形态）
- 历史成绩趋势图
- 优势项目与待提升项目

#### 4. AI 智能指导

点击底部导航 **「AI指导」**：
- **正式体测分析**：点击「查看报告」查看 13 模块全维度画像报告
- **单项深度分析**：点击任意项目卡片，查看 14 模块专项分析报告
- **训练情况**：近 7/30 天训练统计
- **历史报告**：底部可回看所有历史报告

#### 5. 记录体测数据

点击首页 **「开始记录」** → 选择批次 → 勾选项目 → 输入成绩 → 填写体感反馈（RPE / 恢复速度 / 酸痛等）→ 保存

#### 6. 个人中心

点击底部导航 **「我的」**：查看/编辑身高体重、查看统计、退出登录

### 教师端体验路径

#### 1. 切换到教师登录

退出当前登录 → 回到登录页 → 点击 **「我是教师」** → 选择 **张老师** → 登录

#### 2. 班级总览

自动进入，可以看到：
- 今日教学建议 + 4 个统计卡片（人数 / 已记录 / 平均 BMI / 及格率）
- 待审核提醒（红色脉冲圆点）
- 班级薄弱项排行柱状图 + 等级分布环形图
- 重点关注学生列表

#### 3. 学生列表与详情

侧边栏 **「学生列表」** → 搜索/浏览 → 点击进入详情（基础信息 + 成绩表 + 雷达图 + AI 报告状态）

#### 4. AI 班级报告

侧边栏 **「AI 班级报告」** → 班级整体分析 + 共性薄弱项 + 分层指导（A/B/C/D）+ 训练重点 + 教学建议

#### 5. 审核中心

侧边栏 **「审核中心」** → 查看 AI 生成的报告 → **通过** / **修改后通过** / **退回**，支持批量审批

### 移动端体验

项目采用移动端优先设计，推荐使用浏览器开发者工具模拟手机访问：

1. 按 **F12** 打开开发者工具
2. 点击 **设备切换图标**（或按 **Ctrl+Shift+M**）
3. 选择 **iPhone 14 Pro** 或其他手机型号
4. 刷新页面，即可看到移动端布局（底部液态玻璃导航、单列卡片、触控友好交互）

### 核心亮点

- **逐项体感采集**（`/record`）：每项运动后采集疲劳程度、恢复速度、肌肉酸痛 —— 区别于传统体测系统的创新点
- **专项/综合分析**（`/ai-guide`）：单项目深度分析 vs 多项目综合评估，AI 自动选择策略
- **教师审核闭环**：AI 生成 → 教师审核（通过/退回/修改）→ 学生查看，完整「AI 辅助 · 教师主导」
- **数据口径透明**：登录页顶部演示模式提示条，明确标注匿名模拟数据

### 常见问题

| 问题 | 解决方法 |
|------|---------|
| 页面显示"裸 HTML 样式"，没有 CSS | 停止 dev server → 删除 `.next` 目录 → 重新 `npm run dev` |
| `npm install` 网络超时 | `npm config set registry https://registry.npmmirror.com` 后重试 |
| `npm run db:seed` 报错 "column does not exist" | 执行 `npm run db:reset` → `npm run db:migrate` → `npm run db:seed` |
| 端口 3000 被占用 | 关闭占用进程，或修改 `package.json` 中 dev 脚本为 `next dev -p 3001` |
| AI 报告一直显示"生成中" | 按 F12 查看 Console 报错；未配置 API Key 时系统使用 Mock 数据，通常几秒内完成 |

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
│   ├── app/                       # Next.js App Router（23 个路由）
│   │   ├── icon.svg               # 网站图标（favicon）
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
│   │   │   ├── floating-back-bar.tsx # 悬浮返回栏（sticky，二级页面复用）
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
│   │       ├── ai-student-report.tsx    # AI 报告中心主控（生成/查看/重新生成/项目基线兜底）
│   │       ├── ai-class-report-view.tsx # AI 班级报告视图
│   │       ├── ai-generation-status.tsx # AI 生成状态指示器
│   │       ├── ai-guide-page-shell.tsx  # AI 指导页面外壳（标题显隐管理）
│   │       ├── ai-report-detail.tsx     # AI 报告详情（科普评分+动作库+阶段规划）
│   │       ├── item-education-card.tsx  # 项目科普与评分解读卡片（专项报告）
│   │       ├── standard-education-overview.tsx # 国家标准导读板块（总体报告）
│   │       ├── training-focus-hint.tsx  # AI 指导首页轻量本阶段训练重点
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
│       ├── fitness-education.ts   # 项目科普与评分解读静态配置（国家标准）
│       ├── utils.ts               # 工具函数（cn 类名合并 + 时间格式化 formatRunTime/parseRunTime/formatItemValue）
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
FitnessRecord       — 体测记录（id, studentId, date, semester, batchId, recordType, fatigueLevel, recoveryStatus, hasSoreness, sorenessAreasJson, hasDiscomfort, discomfortNotes）
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
