# 跃动智体 — 项目 Skills 清单与使用指南

> 本文档说明本项目内所有 Skills 的清单、路径、作用和推荐使用场景。适用于 Claude Code 和 Codex 两个 AI Agent 协作开发。
>
> 项目阶段：MVP 0.9.2 | 路由：22 个 | API：14 个 | 数据库表：7 个（+AssessmentBatch）| 演示脚本 ✅ | 验证清单 ✅ | 部署指南 ✅

---

## 一、项目 Skills 总览

本项目在 `.claude/skills/` 目录下安装了 **12 个项目级 Skills**，按优先级分为三层：

| 优先级 | 数量 | 用途 |
|--------|------|------|
| **P0 核心必装** | 6 个 | 项目架构骨架、移动端适配、数据可视化 |
| **P1 强烈建议** | 4 个 | UI 设计、数据处理、项目管理 |
| **P2 辅助优化** | 2 个 | 文档生成、需求梳理 |

此外，本轮开发中使用了以下**全局 Skills**来辅助 SQLite 后端落地、全栈集成和验证：

| 阶段 | 使用的全局 Skill | 产出 |
|------|-----------------|------|
| 全栈架构 | Fullstack Dev | Next.js API Routes + Prisma 服务层 + 错误处理边界 |
| API 设计 | API Designer | 7 个 REST API 端点 + 请求/响应格式 |
| 质量验证 | Senior QA | typecheck/lint/build 三检 + 浏览器烟测 + API 烟测 |
| 前端架构 | react-nextjs-development | Server/Client Component 边界 + page.tsx 零 use client |
| 计划管理 | create-implementation-plan | 数据库迁移→API→前端整合→文档→验证 六阶段推进 |

---

## 二、Skills 详细清单

### P0 核心必装（6 个）

#### 1. nextjs-shadcn
- **路径**: `.claude/skills/nextjs-shadcn/SKILL.md`
- **来源**: LobeHub
- **主要作用**: 约束 Next.js App Router 目录结构、shadcn/ui 组件组合方式、Tailwind CSS 变量使用、`use client` 边界规则
- **适合场景**:
  - 新建页面或路由
  - 组件拆分与架构决策
  - 审查代码是否符合 App Router 规范
  - 颜色/主题系统的使用
- **Claude Code 使用方式**: 根据上下文自动触发；也可手动指定 `请使用 nextjs-shadcn 规范审查这个组件`
- **Codex 参考方式**: 作为项目架构约束文档阅读，理解路由组织、组件分层和 CSS 变量规则

#### 2. shadcn-ui-official
- **路径**: `.claude/skills/shadcn-ui-official/SKILL.md`
- **来源**: shadcn/ui 官方
- **主要作用**: 确保使用 shadcn/ui 官方组件而非手写低质量 div；读取 `components.json` 理解项目配置；提供跃动智体主题色配置
- **适合场景**:
  - UI 组件开发与选型
  - 新增按钮、卡片、表单、弹窗等交互元素
  - 审查是否违规手写了本应由 shadcn/ui 组件替代的代码
- **Claude Code 使用方式**: 开发 UI 时自动触发
- **Codex 参考方式**: 查阅已安装组件清单和主题配置，确保 UI 一致性

#### 3. senior-frontend
- **路径**: `.claude/skills/senior-frontend/SKILL.md`
- **来源**: LobeHub
- **主要作用**: 前端总工程规范 — 组件分层、命名规范、Hooks 规范、性能优化（`React.memo`、`dynamic()`）、可访问性（a11y）
- **适合场景**:
  - 代码审查
  - 项目架构约束
  - 新增自定义 Hooks
  - 性能瓶颈排查
- **Claude Code 使用方式**: 配合 `/code-review` 或 `/simplify` 使用
- **Codex 参考方式**: 作为代码质量基准，理解组件五层分层（ui/layout/forms/charts/features）

#### 4. react-nextjs-development
- **路径**: `.claude/skills/react-nextjs-development/SKILL.md`
- **来源**: GitHub
- **主要作用**: 分阶段开发工作流（设置→规划→实现→检查）、Server/Client Component 边界、数据获取模式、TypeScript 规范、错误处理
- **适合场景**:
  - 新功能开发
  - 模块重构
  - 数据获取策略设计
  - API Route 开发
- **Claude Code 使用方式**: 开发新功能前手动调用 `请按照 react-nextjs-development 工作流开发此功能`
- **Codex 参考方式**: 理解开发流程和 Server/Client Component 边界规则

#### 5. mobile-app-ui-design
- **路径**: `.claude/skills/mobile-app-ui-design/SKILL.md`
- **来源**: GitHub
- **主要作用**: 移动端优先设计规范 — 触控目标 ≥44px、8px 网格、一屏一任务、375px 基准测试、响应式适配
- **适合场景**:
  - 学生端页面设计
  - 触控交互优化
  - 移动端布局调试
  - 新增表单或交互组件
- **Claude Code 使用方式**: 开发移动端页面时自动触发
- **Codex 参考方式**: 理解移动端优先策略和触控规范

#### 6. chart-visualization
- **路径**: `.claude/skills/chart-visualization/SKILL.md`
- **来源**: GitHub AntV
- **主要作用**: 定义 6 种核心图表类型（雷达图、折线图、柱状图、饼图、面积图、统计卡）、数据字段规范、空状态处理、异常值色标
- **适合场景**:
  - 新增数据可视化图表
  - 体质画像仪表盘
  - 班级统计图表
  - 图表交互设计
- **Claude Code 使用方式**: 涉及图表开发时自动触发
- **Codex 参考方式**: 理解图表选型标准和数据字段定义

---

### P1 强烈建议（4 个）

#### 7. human-interface-guidelines
- **路径**: `.claude/skills/human-interface-guidelines/SKILL.md`
- **来源**: LobeHub
- **主要作用**: Apple Human Interface Guidelines（Web 适配版）— Clarity/Deference/Depth 原则、系统字体栈（含 PingFang SC）、语义色、Apple Health 风格卡片
- **适合场景**:
  - UI 视觉设计
  - 卡片、列表、导航栏设计
  - 字体与排版决策
  - 动效设计
- **Claude Code 使用方式**: 设计 UI 时自动触发
- **Codex 参考方式**: 理解 Apple Health/Fitness 风格的设计理念

#### 8. refactoring-ui
- **路径**: `.claude/skills/refactoring-ui/SKILL.md`
- **来源**: LobeHub
- **主要作用**: UI 视觉打磨 — 设计 Token（间距/圆角/阴影）、视觉层级、Dashboard 12 列网格、暗色模式
- **适合场景**:
  - MVP 完成后的视觉打磨
  - 间距/圆角/阴影统一化
  - Dashboard 布局优化
  - 暗色模式适配
- **Claude Code 使用方式**: 视觉打磨阶段手动调用
- **Codex 参考方式**: 理解设计 Token 系统和视觉层级标准

#### 9. data-analyst
- **路径**: `.claude/skills/data-analyst/SKILL.md`
- **来源**: LobeHub
- **主要作用**: 体测数据清洗与分析 — 缺失值处理、异常值检测（四级：normal/warning/anomaly/impossible）、单位校验、反标签化表达原则
- **适合场景**:
  - 体测数据录入校验
  - Mock 数据质量检查
  - 班级统计摘要生成
  - 数据可视化前的预处理
- **Claude Code 使用方式**: 处理数据时自动触发
- **Codex 参考方式**: 理解数据校验规则和反标签化表达原则

#### 10. create-implementation-plan
- **路径**: `.claude/skills/create-implementation-plan/SKILL.md`
- **来源**: GitHub Awesome Copilot
- **主要作用**: 实现计划模板 — 功能概述→技术设计→任务拆分→测试→风险
- **适合场景**:
  - 新功能开发前的规划
  - 重构方案设计
  - 技术选型决策
- **Claude Code 使用方式**: 规划新功能时手动调用
- **Codex 参考方式**: 理解项目规划模板和审查清单

---

### P2 辅助优化（2 个）

#### 11. prd
- **路径**: `.claude/skills/prd/SKILL.md`
- **来源**: GitHub Awesome Copilot
- **主要作用**: 产品需求文档模板 — 执行摘要、用户故事、功能规格、技术规格、风险分析、里程碑
- **适合场景**:
  - 需求梳理
  - 新模块需求文档编写
  - 比赛申报材料准备
- **Claude Code 使用方式**: 编写需求文档时手动调用
- **Codex 参考方式**: 理解产品需求结构和验收标准

#### 12. create-readme
- **路径**: `.claude/skills/create-readme/SKILL.md`
- **来源**: GitHub Awesome Copilot
- **主要作用**: 专业 README 模板 — 12 个标准章节、数据隐私声明、AI 使用说明、演示截图占位
- **适合场景**:
  - GitHub 仓库首页维护
  - 比赛申报材料
- **Claude Code 使用方式**: 更新 README 时手动调用
- **Codex 参考方式**: 理解 README 标准结构

---

## 三、Skills 分级使用策略

### 核心必读 Skills（所有开发者/AI 必读）

| 序号 | Skill | 为什么必读 |
|------|-------|-----------|
| 1 | nextjs-shadcn | 定义项目架构骨架，违反将导致项目结构混乱 |
| 2 | senior-frontend | 定义代码规范和质量标准 |
| 3 | mobile-app-ui-design | 移动端优先是核心设计原则 |
| 4 | chart-visualization | 数据可视化是项目核心竞争力 |
| 5 | data-analyst | 反标签化表达和隐私保护是安全底线 |

### 辅助优化 Skills（按需阅读）

| 序号 | Skill | 何时阅读 |
|------|-------|---------|
| 6 | shadcn-ui-official | 需要使用新 UI 组件时 |
| 7 | human-interface-guidelines | 设计新页面或调整视觉风格时 |
| 8 | refactoring-ui | MVP 完成后打磨 UI 时 |
| 9 | react-nextjs-development | 开发复杂新功能时 |
| 10 | create-implementation-plan | 开始大型重构前 |
| 11 | prd | 梳理新需求时 |
| 12 | create-readme | 更新项目文档时 |

---

## 四、Claude Code 如何使用本项目 Skills

### 自动触发
Claude Code 会根据当前任务上下文自动加载相关 Skills。例如：
- 编写页面代码 → 自动触发 `nextjs-shadcn`、`mobile-app-ui-design`
- 开发图表 → 自动触发 `chart-visualization`
- 处理数据 → 自动触发 `data-analyst`

### 手动调用
```
请使用 nextjs-shadcn 规范审查这个组件
请按照 chart-visualization 规范生成图表
请按照 data-analyst 规范清洗这批数据
请按照 create-implementation-plan 模板制定重构计划
```

### 组合使用
```
请综合 nextjs-shadcn、mobile-app-ui-design 和 human-interface-guidelines
规范，设计学生端新页面的布局方案。
```

---

## 五、Codex 如何参考本项目 Skills

Codex 应将 Skills 视为**设计规范文档**而非可执行代码：

1. **开发前**: 阅读 P0 核心 Skills，理解项目架构约束
2. **开发中**: 参考对应 Skill 的具体规则（如触控尺寸、图表选型、颜色 Token）
3. **审查时**: 对照 Skills 规则检查代码合规性

### Codex 快速查阅路径

| 需要了解 | 查阅 Skill |
|---------|-----------|
| 路由怎么组织 | `nextjs-shadcn` |
| 组件怎么分层 | `senior-frontend` |
| 移动端有什么要求 | `mobile-app-ui-design` |
| 图表用什么库、怎么配 | `chart-visualization` |
| 数据校验规则 | `data-analyst` |
| 颜色 Token 有哪些 | `refactoring-ui` |
| Apple 风格怎么实现 | `human-interface-guidelines` |

---

## 六、与全局 Skills 的关系

> **重要区分**: 本文档描述的 12 个 Skills 是**项目内 Skills**（位于 `.claude/skills/`），仅对本项目生效。Claude Code 还有**全局 Skills**（内置 + 插件），对所有项目生效。

### 可配合使用的全局 Skills

| 全局 Skill | 用途 | 与本项目的配合 |
|-----------|------|--------------|
| `/code-review` | 代码审查 | 配合 `senior-frontend` 规范 |
| `/simplify` | 代码简化 | 配合 `refactoring-ui` 规范 |
| `/verify` | 验证更改 | 开发完成后验证 |
| `/run` | 启动项目 | `npm run dev` 后预览 |
| `/feature-dev` | 结构化功能开发 | 配合 `create-implementation-plan` |

### 本轮 UI 优化推荐的全局 Skills

| Skill | 用途 | 与本项目的配合 |
|-------|------|----------------|
| Frontend Design | 高级视觉设计、避免模板感 | 用于学生首页、Dashboard、教师工作台的产品级视觉打磨 |
| Frontend UI UX | 用户体验与交互流程 | 用于移动端触控、导航、AI 生成反馈体验 |
| UI Designer | 设计系统提炼 | 用于统一卡片、按钮、导航、图表和文案层级 |
| Data Viz 2025 | 现代数据可视化 | 用于体质雷达图、趋势图、班级统计图高级化 |
| Browser | 本地网页真实预览 | 用于检查 localhost 页面是否加载样式、是否出现裸 HTML |
| Playwright Interactive / Playwright CLI Skill | 响应式与交互验证 | 用于 375px、768px、1440px 等视口验证导航和图表 |
| Screenshot Capture | 截图留档 | 用于记录优化前后页面状态 |
| Frontend Code Review | 前端审查 | 用于检查组件边界、样式反模式、可访问性 |
| Senior QA | 测试策略 | 用于补充多端验证清单、路由烟测、AI 回退验证和 E2E 验收 |
| Security Best Practices | 安全检查 | 用于确认 API Key、学生隐私和 AI 安全标注 |

### 本轮 SQLite 后端落地使用的全局 Skills

| Skill | 用途 | 本项目中的使用方式 |
|-------|------|------------------|
| Fullstack Dev | 全栈架构与前后端集成 | 采用 Next.js 单体 API Routes + Prisma 服务层，明确数据库、API、登录与错误处理边界 |
| API Designer | REST API 资源建模 | 设计 `/api/auth/login`、`/api/students`、`/api/fitness-records`、`/api/class-summary`、`/api/reviews` 等资源接口 |
| Senior QA | 验证策略 | 制定并执行 Prisma、typecheck、lint、build、API 烟测与审核持久化验证 |
| react-nextjs-development | App Router 开发流程 | 保持 `page.tsx` 为 Server Component，交互逻辑下沉到 Client 叶子组件 |
| create-implementation-plan | 实现计划 | 按“存档 → 数据库 → API → 前端整合 → 文档 → 验证”阶段推进 |

如果协作 Agent 没有上述 skills，可先通过 `npx skills find "<关键词>"` 搜索，再按需安装到自己的 skills 环境中。

### 全局 Skills 参考文档

详细的全局 Skills 说明见 `skills-reference.md`。全局 Skills 的安装和管理不在本项目范围内。

---

## 七、Skills 维护

### 更新现有 Skill
编辑对应的 SKILL.md 文件即可：
```bash
code .claude/skills/<skill-name>/SKILL.md
```

### 添加新 Skill
```bash
mkdir .claude/skills/<new-skill-name>
# 按现有 Skill 格式编写 SKILL.md
```

### 注意事项
- Skills 文件内部仍使用旧项目代号「体测星图」，建议逐步统一更新为「跃动智体」
- 修改 Skill 后建议通知协作者同步更新认知
- 不要删除 P0 Skills，它们是项目架构的约束基础

---

> 📋 **本文档目标**：让 Claude Code 和 Codex 两个 Agent 在协作开发时，对项目规范有统一认知。
