# 开发 Skills 参考文档

> 生成日期: 2026-05-29
> 最后更新: 2026-05-29（添加项目专属 Skills）

本文档列出了项目中所有可用的 skills，按类别组织。

---

## 目录

- [项目专属 Skills（体测星图）](#项目专属-skills体测星图)
- [内置/系统 Skills](#第一部分内置系统-skills)
- [插件 Skills](#第二部分插件-skills通过-marketplace-安装)

---

## 项目专属 Skills（体测星图）

> 详细文档：[.claude/skills/README.md](.claude/skills/README.md)

这些 Skills 安装在项目的 `.claude/skills/` 目录下，仅对本项目生效。

### P0 必装（5个）

| Skill | 功能 | 适用场景 |
|-------|------|---------|
| **nextjs-shadcn** | Next.js + shadcn/ui 开发规范 | 所有前端页面开发 |
| **shadcn-ui-official** | shadcn/ui 官方组件最佳实践 | UI 组件开发 |
| **senior-frontend** | 前端总工程规范 | 项目架构约束、代码审查 |
| **mobile-app-ui-design** | 移动端 UI/UX 设计规范 | 学生端移动端页面设计 |
| **chart-visualization** | 图表可视化规范 | 所有数据可视化场景 |

### P1 强烈建议（4个）

| Skill | 功能 | 适用场景 |
|-------|------|---------|
| **human-interface-guidelines** | Apple HIG（Web 适配版） | Apple Health/Fitness 风格 UI |
| **refactoring-ui** | UI 视觉重构规范 | MVP 完成后的视觉打磨 |
| **data-analyst** | 数据清洗与分析规范 | 体测数据预处理 |
| **create-implementation-plan** | 创建实现计划规范 | 新功能开发前的规划 |

### P2 可选（3个）

| Skill | 功能 | 适用场景 |
|-------|------|---------|
| **react-nextjs-development** | React/Next.js 开发工作流 | 新功能开发、模块重构 |
| **create-readme** | 创建专业 README | GitHub 仓库展示、比赛材料 |
| **prd** | 生成产品需求文档 | 需求梳理、项目规划 |

---

## 第一部分：内置/系统 Skills

这些 skills 在每个开发会话中默认可用。

### 1. update-config
- **名称**: `update-config`
- **功能**: 通过 `settings.json` 配置开发环境
- **用途**:
  - 设置自动化行为（当 X 发生时执行 Y 的 hooks）
  - 配置权限（"allow X", "add permission to"）
  - 设置环境变量（`set X=Y`）
  - 排查 hook 问题
  - 修改 `settings.json` 或 `settings.local.json` 文件
- **示例**: "allow npm commands", "set DEBUG=true"

### 2. keybindings-help
- **名称**: `keybindings-help`
- **功能**: 自定义键盘快捷键
- **用途**:
  - 重新绑定按键（如 `ctrl+s`）
  - 添加组合快捷键
  - 修改提交键
  - 修改 `~/.claude/keybindings.json`

### 3. verify
- **名称**: `verify`
- **功能**: 验证代码更改是否按预期工作
- **用途**:
  - 验证 PR
  - 确认修复有效
  - 手动测试更改
  - 检查功能是否正常
  - 推送前验证本地更改

### 4. code-review
- **名称**: `code-review`
- **功能**: 审查当前 diff 的正确性 bug 和优化点
- **选项**:
  - `--comment`: 将发现作为内联 PR 评论发布
  - `--fix`: 将修复应用到工作目录
- **努力级别**: low/medium（较少、高置信度发现），high（更广泛覆盖）

### 5. simplify
- **名称**: `simplify`
- **功能**: 审查 diff 并应用修复
- **说明**: 等同于 `/code-review --fix`

### 6. fewer-permission-prompts
- **名称**: `fewer-permission-prompts`
- **功能**: 通过添加允许列表减少权限提示
- **方式**: 扫描常见只读 Bash/MCP 工具调用的记录，然后将优先级允许列表添加到 `.claude/settings.json`

### 7. loop
- **名称**: `loop`
- **功能**: 按定时间隔运行提示或斜杠命令
- **语法**: `/loop 5m /foo` 或 `/loop 5m <prompt>`
- **用途**:
  - 轮询状态
  - 运行定期任务
  - 监控部署（"每 5 分钟检查一次部署"）

### 8. claude-api
- **名称**: `claude-api`
- **功能**: 构建、调试和优化 Claude API / Anthropic SDK 应用
- **触发条件**:
  - 代码导入 `anthropic` 或 `@anthropic-ai/sdk`
  - 关于 Claude API、Anthropic SDK、Managed Agents 的问题
  - 添加/修改 Claude 功能（缓存、思考、压缩、工具使用）
- **说明**: 包含 prompt caching 指导

### 9. run
- **名称**: `run`
- **功能**: 启动并驱动项目应用
- **用途**:
  - 运行/启动应用
  - 截图应用
  - 确认更改在实际应用中有效
- **行为**: 先查找项目 skill，然后回退到内置模式

### 10. init
- **名称**: `init`
- **功能**: 初始化新的 `CLAUDE.md` 文件并生成代码库文档

### 11. review
- **名称**: `review`
- **功能**: 审查拉取请求（Pull Request）

### 12. security-review
- **名称**: `security-review`
- **功能**: 对当前分支上的待处理更改进行安全审查

---

## 第二部分：插件 Skills（通过 Marketplace 安装）

这些 skills 通过插件市场安装。

### 2.1 claude-code-setup 插件

#### claude-automation-recommender
- **名称**: `claude-automation-recommender`
- **功能**: 分析代码库并推荐自动化方案
- **推荐内容**: Hooks、子代理、skills、插件、MCP 服务器
- **只读**: 仅分析，不修改文件
- **触发条件**: "automation recommendations", "optimize development setup", "improve workflows"

### 2.2 claude-md-management 插件

#### claude-md-improver
- **名称**: `claude-md-improver`
- **功能**: 审计和改进 `CLAUDE.md` 文件
- **工作流程**: 发现 → 质量评估 → 定向更新
- **可写**: 是，需用户批准后
- **触发条件**: "check CLAUDE.md", "audit CLAUDE.md", "project memory optimization"

### 2.3 frontend-design 插件

#### frontend-design
- **名称**: `frontend-design`
- **功能**: 创建独特、生产级的前端界面
- **重点领域**:
  - 大胆的美学选择（排版、色彩、动效）
  - 避免通用 AI 美学
  - 生产就绪代码
- **触发条件**: "build web components", "create a dashboard", "design a landing page"

### 2.4 math-olympiad 插件

#### math-olympiad
- **名称**: `math-olympiad`
- **功能**: 解决竞赛数学问题（IMO、Putnam、USAMO、AIME）
- **特点**:
  - 对抗性验证
  - 校准置信度输出
  - LaTeX PDF 生成
- **触发条件**: "solve this IMO problem", "prove this olympiad inequality"

### 2.5 mcp-server-dev 插件

#### build-mcp-server
- **名称**: `build-mcp-server`
- **功能**: MCP 服务器开发入口点
- **工作流程**: 询问用例 → 确定部署模型 → 路由到专门 skill
- **部署模型**: Remote HTTP、MCPB、Local stdio
- **触发条件**: "build an MCP server", "create an MCP", "wrap an API for Claude"

#### build-mcp-app
- **名称**: `build-mcp-app`
- **功能**: 为 MCP 服务器添加交互式 UI 组件
- **组件**: 表单、选择器、确认对话框（在聊天中内联渲染）
- **触发条件**: "MCP app", "interactive UI", "widgets", "MCP UI resources"

#### build-mcpb
- **名称**: `build-mcpb`
- **功能**: 打包本地 MCP 服务器及其运行时
- **输出**: `.mcpb` 文件（无需 Node/Python 即可安装）
- **触发条件**: "package an MCP server", "bundle an MCP", "make an MCPB"

### 2.6 playground 插件

#### playground
- **名称**: `playground`
- **功能**: 创建交互式 HTML playground
- **模板**:
  - `design-playground` — 视觉设计决策
  - `data-explorer` — 数据和查询构建
  - `concept-map` — 学习和探索
  - `document-critique` — 文档审查
  - `diff-review` — 代码审查
  - `code-map` — 代码库架构
- **触发条件**: "make a playground", "create an explorer"

### 2.7 session-report 插件

#### session-report
- **名称**: `session-report`
- **功能**: 生成开发会话使用情况的 HTML 报告
- **指标**: Token 使用量、缓存、子代理、skills、高消耗提示
- **数据来源**: `~/.claude/projects` 会话记录

### 2.8 skill-creator 插件

#### skill-creator
- **名称**: `skill-creator`
- **功能**: 创建、修改和测量 skill 性能
- **特点**:
  - 从零创建 skills
  - 运行评估测试 skills
  - 使用方差分析进行基准测试
  - 优化 skill 描述以提高触发准确性

### 2.9 hookify 插件

#### writing-hookify-rules
- **名称**: `writing-hookify-rules`
- **功能**: 创建 hookify 规则以防止不期望的行为
- **格式**: 带 YAML frontmatter 的 Markdown 文件
- **事件**: bash、file、stop、prompt、all
- **触发条件**: "create a hookify rule", "write a hook rule"

### 2.10 code-modernization 插件

命令（非 skills，但相关）：
- `/modernize-assess` — 评估遗留代码库
- `/modernize-map` — 映射代码库结构
- `/modernize-extract-rules` — 提取业务规则
- `/modernize-brief` — 生成简报以供批准
- `/modernize-reimagine` — 重新构想架构
- `/modernize-transform` — 转换代码
- `/modernize-harden` — 加固和审计

### 2.11 commit-commands 插件

命令：
- `/commit` — 自动生成提交信息并提交
- `/commit-push-pr` — 提交、推送并创建 PR
- `/clean_gone` — 清理已消失的分支

### 2.12 feature-dev 插件

#### feature-dev
- **名称**: `feature-dev`
- **功能**: 结构化 7 阶段功能开发工作流程
- **阶段**: 代码库探索 → 需求澄清 → 架构设计 → 实现 → 质量审查
- **触发条件**: `/feature-dev Add user authentication`

### 2.13 agent-sdk-dev 插件

命令：
- `/new-sdk-app` — 创建新的 Claude Agent SDK 应用
- **支持**: Python 和 TypeScript

### 2.14 pr-review-toolkit 插件

代理（6 个专门审查器）：
- `comment-analyzer` — 代码注释准确性
- `pr-test-analyzer` — 测试覆盖率分析
- `code-reviewer` — 通用代码审查
- `code-simplifier` — 代码简化
- `silent-failure-hunter` — 查找静默失败
- `type-design-analyzer` — 类型设计分析

### 2.15 plugin-dev 插件

用于插件开发的 skills：
- `plugin-structure` — 插件目录布局和清单
- `skill-development` — 创建有效的 skills
- `hook-development` — 创建 hooks
- `command-development` — 创建命令
- `agent-development` — 创建代理
- `mcp-integration` — MCP 服务器集成
- `plugin-settings` — 插件配置

### 2.16 外部插件 Skills

#### Discord 插件
- `access` — Discord 访问配置
- `configure` — Discord 插件配置

#### iMessage 插件
- `access` — iMessage 访问配置
- `configure` — iMessage 插件配置

#### Telegram 插件
- `access` — Telegram 访问配置
- `configure` — Telegram 插件配置

### 2.17 cwc-makers 插件

#### cardputer-buddy
- **名称**: `cardputer-buddy`
- **功能**: 迭代 Cardputer-Adv MicroPython 应用包
- **触发条件**: "add an app", "push to the cardputer", "tail the device"

#### m5-onboard
- **名称**: `m5-onboard`
- **功能**: 配置 M5Stack Cardputer 设备

---

## 汇总表

| 类别 | 数量 | 核心 Skills |
|------|------|------------|
| **内置/系统** | 12 | update-config, verify, code-review, simplify, run, review |
| **开发环境设置** | 1 | claude-automation-recommender |
| **项目文档管理** | 1 | claude-md-improver |
| **前端设计** | 1 | frontend-design |
| **数学** | 1 | math-olympiad |
| **MCP 开发** | 3 | build-mcp-server, build-mcp-app, build-mcpb |
| **Playground** | 1 | playground |
| **会话报告** | 1 | session-report |
| **Skill 开发** | 1 | skill-creator |
| **Hookify** | 1 | writing-hookify-rules |
| **代码现代化** | 7 命令 | modernize-* |
| **提交命令** | 3 命令 | commit, commit-push-pr, clean_gone |
| **功能开发** | 1 | feature-dev |
| **Agent SDK** | 1 命令 | new-sdk-app |
| **PR 审查** | 6 代理 | comment-analyzer, code-reviewer 等 |
| **插件开发** | 7 skills | plugin-structure, skill-development 等 |
| **外部（Discord/iMsg/TG）** | 6 | access, configure 各 2 个 |

---

## 如何使用 Skills

### 调用 Skill
在开发环境中输入 `/<skill-name>`。例如：
- `/verify` — 验证更改
- `/code-review` — 审查代码
- `/feature-dev Add feature X` — 开始功能开发

### 查看可用 Skills
Skills 在会话期间的 system-reminder 消息中列出。

### 安装新 Skills
使用插件市场发现和安装新 skills。

---

*文档生成于 2026-05-29*
