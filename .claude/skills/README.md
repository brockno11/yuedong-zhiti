# 体测星图项目 Skills 文档

> 最后更新：2026-05-29

本文档记录体测星图项目的所有 Skills，包括项目专属 Skills 和全局 Skills。

---

## 目录

- [项目专属 Skills](#项目专属-skills)
  - [P0 必装：前端工程骨架类](#p0-必装前端工程骨架类)
  - [P0 必装：移动端适配类](#p0-必装移动端适配类)
  - [P0 必装：数据分析与可视化类](#p0-必装数据分析与可视化类)
  - [P1 强烈建议：UI 设计类](#p1-强烈建议ui-设计类)
  - [P1 强烈建议：数据处理类](#p1-强烈建议数据处理类)
  - [P1 强烈建议：项目管理类](#p1-强烈建议项目管理类)
  - [P2 可选：辅助类](#p2-可选辅助类)
- [全局 Skills](#全局-skills)
  - [内置系统 Skills](#内置系统-skills)
  - [全局插件 Skills](#全局插件-skills)
- [使用指南](#使用指南)

---

## 项目专属 Skills

这些 Skills 安装在 `.claude/skills/` 目录下，仅对本项目生效。

### P0 必装：前端工程骨架类

#### 1. nextjs-shadcn
- **路径**: `.claude/skills/nextjs-shadcn/SKILL.md`
- **来源**: LobeHub
- **功能**: Next.js + shadcn/ui 专项开发规范
- **核心规则**:
  - App Router 目录结构约束
  - `use client` 只放到叶子组件
  - 禁止硬编码颜色，使用 CSS variables
  - Props 必须可序列化
  - 页面只放内容组合，复杂逻辑抽到 hooks/lib/services
- **适用场景**: 所有前端页面开发

#### 2. shadcn-ui-official
- **路径**: `.claude/skills/shadcn-ui-official/SKILL.md`
- **来源**: shadcn/ui 官方
- **功能**: shadcn/ui 官方组件最佳实践
- **核心规则**:
  - 优先使用官方组件，不手写低质量 div
  - 读取 `components.json` 理解项目配置
  - 组件路径使用 `@/components/ui/` 别名
  - 提供体测星图主题色配置
- **适用场景**: UI 组件开发

#### 3. senior-frontend
- **路径**: `.claude/skills/senior-frontend/SKILL.md`
- **来源**: LobeHub
- **功能**: 前端总工程规范
- **核心规则**:
  - 项目目录结构规范
  - 命名规范（文件、组件、变量）
  - React 最佳实践（单一职责、Props 设计）
  - Hooks 使用规范
  - 性能优化（memo、useMemo、useCallback）
  - 可访问性规范
  - 测试规范
- **适用场景**: 项目架构约束、代码审查

#### 4. react-nextjs-development
- **路径**: `.claude/skills/react-nextjs-development/SKILL.md`
- **来源**: GitHub
- **功能**: React/Next.js 14+ App Router 开发工作流
- **核心规则**:
  - 分阶段开发流程（设置→规划→实现→检查）
  - Server Components vs Client Components 边界划分
  - 数据获取模式（Server Actions、API Routes）
  - TypeScript 规范
  - 状态管理规范
  - 错误处理规范
- **适用场景**: 新功能开发、模块重构

---

### P0 必装：移动端适配类

#### 5. mobile-app-ui-design
- **路径**: `.claude/skills/mobile-app-ui-design/SKILL.md`
- **来源**: GitHub
- **功能**: 移动端 UI/UX 设计规范
- **核心规则**:
  - 移动端优先设计原则
  - 触控目标最小 44x44px
  - 5 步设计流程
  - 信息架构规范
  - 响应式适配（手机/平板/桌面）
  - 动效规范
- **适用场景**: 学生端移动端页面设计

---

### P0 必装：数据分析与可视化类

#### 6. chart-visualization
- **路径**: `.claude/skills/chart-visualization/SKILL.md`
- **来源**: GitHub AntV
- **功能**: 图表可视化规范
- **核心规则**:
  - 6 种核心图表类型定义（雷达图、折线图、柱状图、饼图、面积图、统计卡）
  - 每种图表的数据字段、交互方式、空状态、异常值处理
  - 图表样式规范（颜色、字体、响应式）
  - 推荐库：Recharts
- **适用场景**: 所有数据可视化场景

---

### P1 强烈建议：UI 设计类

#### 7. human-interface-guidelines
- **路径**: `.claude/skills/human-interface-guidelines/SKILL.md`
- **来源**: LobeHub
- **功能**: Apple Human Interface Guidelines（Web 适配版）
- **核心规则**:
  - Clarity、Deference、Depth 三大原则
  - 系统字体栈
  - 语义色系统
  - Apple Health 风格卡片设计
  - 圆环进度（Apple Fitness 风格）
  - 动效规范
  - 可访问性规范
- **适用场景**: Apple Health/Fitness 风格 UI 设计

#### 8. refactoring-ui
- **路径**: `.claude/skills/refactoring-ui/SKILL.md`
- **来源**: LobeHub
- **功能**: UI 视觉重构规范
- **核心规则**:
  - 设计 Token 系统（间距、圆角、阴影）
  - 视觉层级重构（标题、卡片、按钮）
  - 颜色重构（语义化颜色）
  - 间距重构
  - 表单重构
  - Dashboard 布局重构
  - 暗色模式支持
- **适用场景**: MVP 完成后的视觉打磨

---

### P1 强烈建议：数据处理类

#### 9. data-analyst
- **路径**: `.claude/skills/data-analyst/SKILL.md`
- **来源**: LobeHub
- **功能**: 数据清洗与分析规范
- **核心规则**:
  - 缺失值处理策略
  - 异常值检测（身体指标合理范围）
  - 重复值处理
  - 单位校验与转换
  - 数据一致性检查
  - 班级统计摘要
  - 学生个人画像
  - 反标签化原则
- **适用场景**: 体测数据预处理、质量保障

---

### P1 强烈建议：项目管理类

#### 10. create-implementation-plan
- **路径**: `.claude/skills/create-implementation-plan/SKILL.md`
- **来源**: GitHub Awesome Copilot
- **功能**: 创建实现计划规范
- **核心规则**:
  - 功能概述模板
  - 技术设计模板
  - 任务拆分模板
  - 测试计划模板
  - 风险评估模板
  - 计划审查清单
- **适用场景**: 新功能开发前的规划

---

### P2 可选：辅助类

#### 11. create-readme
- **路径**: `.claude/skills/create-readme/SKILL.md`
- **来源**: GitHub Awesome Copilot
- **功能**: 创建专业 README 文档
- **核心规则**:
  - 12 个标准章节
  - 项目背景、功能特性、技术栈
  - 快速开始指南
  - 数据隐私说明
  - AI 使用说明
  - 开发指南、部署说明
- **适用场景**: GitHub 仓库展示、比赛材料

#### 12. prd
- **路径**: `.claude/skills/prd/SKILL.md`
- **来源**: GitHub Awesome Copilot
- **功能**: 生成产品需求文档（PRD）
- **核心规则**:
  - 执行摘要
  - 用户故事（含验收标准）
  - 功能规格（优先级、数据模型、API、UI）
  - 技术规格（架构、性能、安全、兼容性）
  - 风险分析
  - 里程碑规划
- **适用场景**: 需求梳理、项目规划

---

## 全局 Skills

这些 Skills 安装在全局目录，对所有项目生效。

### 内置系统 Skills

这些 Skills 是 Claude Code 自带的，无需安装，每个会话都可用。

| 名称 | 功能 | 使用方式 |
|------|------|---------|
| **update-config** | 配置 Claude Code（settings.json、hooks、权限、环境变量） | 自动触发 |
| **keybindings-help** | 自定义键盘快捷键 | 自动触发 |
| **verify** | 验证代码更改是否按预期工作 | `/verify` |
| **code-review** | 审查当前 diff 的正确性 bug 和优化点 | `/code-review` |
| **simplify** | 审查 diff 并应用修复（等同于 `/code-review --fix`） | `/simplify` |
| **fewer-permission-prompts** | 通过添加允许列表减少权限提示 | 自动触发 |
| **loop** | 按定时间隔运行提示或斜杠命令 | `/loop 5m /foo` |
| **claude-api** | 构建、调试和优化 Claude API / Anthropic SDK 应用 | 自动触发 |
| **run** | 启动并驱动项目应用 | `/run` |
| **init** | 初始化新的 CLAUDE.md 文件 | `/init` |
| **review** | 审查拉取请求 | `/review` |
| **security-review** | 对当前分支进行安全审查 | `/security-review` |

### 全局插件 Skills

这些 Skills 通过 Claude Code 插件市场安装，位于 `~/.claude/plugins/` 目录。

#### 核心开发插件

| 插件名称 | 功能 | 包含的 Skills/Commands |
|---------|------|----------------------|
| **claude-code-setup** | 分析代码库并推荐自动化方案 | claude-automation-recommender |
| **claude-md-management** | 审计和改进 CLAUDE.md 文件 | claude-md-improver |
| **code-review** | 代码审查 | code-review 命令 |
| **code-simplifier** | 代码简化 | code-simplifier 代理 |
| **commit-commands** | Git 提交自动化 | /commit, /commit-push-pr, /clean_gone |
| **feature-dev** | 结构化功能开发工作流 | /feature-dev |
| **pr-review-toolkit** | PR 审查工具包 | 6 个专业审查代理 |
| **hookify** | 创建 hookify 规则 | writing-hookify-rules |
| **skill-creator** | 创建和优化 Skills | skill-creator |

#### 代码现代化插件

| 插件名称 | 功能 | 包含的 Commands |
|---------|------|----------------|
| **code-modernization** | 遗留代码现代化 | /modernize-assess, /modernize-map, /modernize-extract-rules, /modernize-brief, /modernize-reimagine, /modernize-transform, /modernize-harden |

#### 开发工具插件

| 插件名称 | 功能 | 包含的 Skills |
|---------|------|--------------|
| **agent-sdk-dev** | Agent SDK 开发 | /new-sdk-app |
| **mcp-server-dev** | MCP 服务器开发 | build-mcp-server, build-mcp-app, build-mcpb |
| **plugin-dev** | 插件开发 | 7 个开发 Skills |
| **playground** | 交互式 HTML playground | playground |
| **session-report** | 会话使用报告 | session-report |

#### LSP 语言插件

| 插件名称 | 功能 |
|---------|------|
| **typescript-lsp** | TypeScript 语言服务 |
| **pyright-lsp** | Python 语言服务 |
| **gopls-lsp** | Go 语言服务 |
| **rust-analyzer-lsp** | Rust 语言服务 |
| **clangd-lsp** | C/C++ 语言服务 |
| **ruby-lsp** | Ruby 语言服务 |
| **php-lsp** | PHP 语言服务 |
| **lua-lsp** | Lua 语言服务 |
| **kotlin-lsp** | Kotlin 语言服务 |
| **jdtls-lsp** | Java 语言服务 |
| **csharp-lsp** | C# 语言服务 |
| **swift-lsp** | Swift 语言服务 |

#### 外部集成插件

| 插件名称 | 功能 |
|---------|------|
| **discord** | Discord 集成 |
| **telegram** | Telegram 集成 |
| **imessage** | iMessage 集成 |
| **github** | GitHub 集成 |
| **gitlab** | GitLab 集成 |
| **linear** | Linear 集成 |
| **asana** | Asana 集成 |
| **firebase** | Firebase 集成 |
| **playwright** | Playwright 浏览器自动化 |
| **terraform** | Terraform 集成 |
| **greptile** | Greptile 代码搜索 |
| **context7** | Context7 集成 |
| **serena** | Serena 集成 |
| **laravel-boost** | Laravel 增强 |
| **fakechat** | 模拟聊天 |

#### 其他插件

| 插件名称 | 功能 |
|---------|------|
| **frontend-design** | 创建独特的前端界面（避免 AI 模板感） |
| **math-olympiad** | 解决竞赛数学问题 |
| **security-guidance** | 安全指导 |
| **cwc-makers** | Cardputer/M5Stack 设备开发 |
| **ralph-loop** | Ralph 循环 |
| **mcp-tunnels** | MCP 隧道 |
| **explanatory-output-style** | 解释性输出风格 |
| **learning-output-style** | 学习性输出风格 |
| **example-plugin** | 示例插件 |

---

## 使用指南

### 调用项目 Skills

项目 Skills 会根据上下文自动触发，也可以手动调用：

```
# 手动调用
请使用 nextjs-shadcn 规范审查这个组件
请按照 chart-visualization 规范生成图表
请按照 data-analyst 规范清洗这批数据
```

### 调用全局 Skills

全局 Skills 使用斜杠命令调用：

```
/verify          # 验证更改
/code-review     # 代码审查
/simplify        # 简化代码
/review          # 审查 PR
/security-review # 安全审查
```

### Skills 优先级

当多个 Skills 适用时，优先级如下：

1. **项目 Skills** > 全局 Skills
2. **P0 Skills** > P1 Skills > P2 Skills
3. **专项 Skills** > 通用 Skills

### 查看可用 Skills

```
# 查看项目 Skills
ls .claude/skills/

# 查看全局 Skills
ls ~/.claude/plugins/
```

---

## Skills 维护

### 更新项目 Skills

编辑对应的 SKILL.md 文件即可：

```bash
# 编辑某个 Skill
code .claude/skills/nextjs-shadcn/SKILL.md
```

### 添加新 Skill

1. 创建目录：`mkdir .claude/skills/new-skill`
2. 创建文件：`touch .claude/skills/new-skill/SKILL.md`
3. 编写内容：按照现有 Skill 格式编写

### 删除 Skill

```bash
rm -rf .claude/skills/skill-name
```

---

*文档由 Claude Code 自动生成*
