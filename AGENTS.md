# 跃动智体 — AI Agent 协作规则

> 本文档约束 Claude Code 和 Codex 两个 AI Agent 在本项目中的协作行为。所有 Agent 在开始工作前必须阅读并遵守。
>
> 项目阶段：MVP 0.3.2 | 技术栈：Next.js 14 + TypeScript + shadcn/ui + Prisma + SQLite + DeepSeek

---

## 一、开发前必读（按顺序）

在开始任何开发任务前，Agent 必须阅读以下文档：

| 顺序 | 文档 | 阅读目的 | 预计时间 |
|------|------|---------|---------|
| 1 | `PROJECT_HANDOFF.md` | 理解项目全貌、架构决策、当前进度、安全红线、每个功能细节 | 15 分钟 |
| 2 | `SKILLS.md` | 理解项目 Skills 规范和代码约束 | 5 分钟 |
| 3 | `README.md` | 理解项目对外展示信息、技术栈概览、演示账号 | 5 分钟 |

> ⚠️ 不阅读上述文档就开始写代码，等同于不了解项目背景就做决策。**严格禁止**。

---

## 二、项目核心数据口径

| 属性 | 值 |
|------|-----|
| 目标学段 | 高中（高一/高二/高三），15-18 岁 |
| 演示班级 | 高二(1)班 |
| 学生数量 | 20 名（S001-S020，匿名） |
| 教师数量 | 1 名（周老师，`zhoulaoshi`） |
| 演示密码 | `demo123`（明文，仅演示） |
| 数据源 | SQLite（`prisma/dev.db`，不入库） |
| AI 引擎 | DeepSeek V4 Flash（支持 Mock 回退） |
| 登录方式 | 角色选择 + 账号下拉 + 密码 + localStorage 存储 |

---

## 三、代码修改规则

### 修改前（必须）
1. 先阅读相关页面/组件的现有代码，理解上下文
2. 确认修改不违反 `SKILLS.md` 中 P0 核心 Skills 的约束
3. 涉及架构变更时，使用 `create-implementation-plan` 规范制定计划
4. 确认修改不会破坏现有的类型安全（`tsc --noEmit`）

### 修改后（必须）
1. 运行 `npm run typecheck` 确保类型检查通过（零错误）
2. 运行 `npm run build` 确保构建通过（15 路由全部编译成功）
3. 同步更新以下相关文档：
   - 新增路由 → 更新 `PROJECT_HANDOFF.md` §4 路由表
   - 新增依赖 → 更新 `README.md` 技术栈和 `PROJECT_HANDOFF.md` §3
   - 新增/修改类型 → 更新 `PROJECT_HANDOFF.md` §8 数据模型
   - 新增组件 → 更新 `PROJECT_HANDOFF.md` §10 组件架构
   - 新增 API → 更新 `PROJECT_HANDOFF.md` §4 API 端点表
   - 新增页面功能 → 更新 `PROJECT_HANDOFF.md` §5/§6 功能详解 + §14 完成度
4. 提交前运行 `npm run lint`（零警告）

### 禁止操作（硬性红线）
- ❌ 不得删除文件后不更新文档
- ❌ 不得修改 `.env.local` 中的 API Key
- ❌ 不得在代码中硬编码颜色值（必须使用 CSS Variables 语义 Token）
- ❌ 不得在 `page.tsx` 级别添加 `'use client'` 指令
- ❌ 不得使用 `any` 类型（TypeScript 严格模式）
- ❌ 不得在 AI prompt 或 UI 中使用医学化表达（"诊断""治疗""处方""肥胖""差"）
- ❌ 不得同时运行 `npm run build` 和 `npm run dev`（会损坏 `.next` 缓存）
- ❌ 不得删除 `.claude/skills/` 下的任何 Skill 文件

---

## 四、文件删除规则

1. **删除前必须先列出清单**，说明删除理由
2. **获得确认后才能执行删除**
3. 不确定的文件先移动到 `archive/` 或 `deprecated/` 目录
4. 以下文件类型可以直接删除（无需确认）：
   - `.next/` 目录（构建产物，可重新生成）
   - `node_modules/` 目录（依赖，可 `npm install` 重新安装）
   - `tsconfig.tsbuildinfo`（构建缓存）
5. 以下文件类型禁止直接删除：
   - `.claude/skills/` 下的任何 Skill
   - `src/` 下的任何源代码
   - 任何 `.md` 文档文件（README、HANDOFF、SKILLS、AGENTS）
   - 任何配置文件（`.json`、`.mjs`、`.ts` 配置）
   - `prisma/schema.prisma` 和 `prisma/migrations/`

---

## 五、设计原则

### 移动端优先
- 所有页面先设计 375px 基准布局
- 触控目标最小 44×44px（`min-h-11`）
- 使用 8px 网格系统
- 桌面端作为增强（lg 断点 1024px+），不作为替代
- iOS safe-area 适配（`env(safe-area-inset-*)`）

### AI 辅助 · 教师主导
- AI 生成的所有内容必须可被教师审核
- AI 不做最终决策，只提供参考建议
- 审核机制不可绕过
- 所有 AI 内容标注「AI 生成，需经体育教师审核后使用」

### AI 分析策略（已决策）
- **单项目记录**：专项分析模式 ⚡（针对该项目深入技术分析）
- **多项目记录（2+）**：综合分析模式 📈（全面体质画像 + 跨维度建议）
- **报告历史**：每次分析保存到数据库，学生可随时回看
- **超时回退**：AI API ≥12s 无响应自动回退 Mock 数据，不卡住 UI

### 隐私保护
- 学生使用 S001-S020 匿名编号，不包含真实身份信息
- 不得在前端暴露 API Key（仅存 `.env.local`）
- 不在 UI 中进行学生排名展示
- 不在 AI prompt 中要求诊断性结论
- 健康关注信息标注"仅你与体育教师可见"

### 反标签化表达映射表

| ❌ 禁止使用 | ✅ 应使用 |
|------------|----------|
| 差、很差、不及格 | 待提升、有提升空间 |
| 肥胖、超重 | BMI 指标值得关注 |
| 体能差、体质弱 | 在某方面有提升空间 |
| 诊断、治疗、处方 | 建议、参考、锻炼方案 |
| 排名第 X、倒数第 X | 不进行排名展示 |
| 初中、初中生 | 高中、高中生（目标学段） |

---

## 六、协作流程

### Claude Code 职责
- 项目开发主 Agent
- 代码编写、重构、调试
- Skills 自动触发和规范执行
- 使用 `/code-review` 和 `/simplify` 进行质量检查
- 使用 `/verify` 验证修改后的完整性
- 负责架构决策和最终的代码审查

### Codex 职责
- 辅助开发 Agent
- 阅读 `PROJECT_HANDOFF.md` 和 `SKILLS.md` 理解项目规范
- 在 Claude Code 指导下完成指定模块开发
- 遵守相同的代码规范和安全红线

### 协作约定
1. Claude Code 负责架构决策和代码审查
2. Codex 负责功能实现和文档同步
3. 两个 Agent 共享项目文档作为统一认知基础
4. 如有分歧，以 `PROJECT_HANDOFF.md` 和 `SKILLS.md` 为准
5. 修改代码后必须同步更新文档

---

## 七、环境变量安全

1. `.env.local` 包含真实 API Key，**已加入 `.gitignore`，严禁提交**
2. `.env.example` 作为模板，**不应包含真实 API Key**（仅占位符）
3. 代码中读取环境变量使用 `process.env.XXX`，仅限服务端（`route.ts`、`data-service.ts`）
4. 前端不得直接访问 `DEEPSEEK_API_KEY`
5. SQLite 数据库文件 `prisma/dev.db` 已加入 `.gitignore`

### 环境变量清单
```env
DEEPSEEK_API_KEY=sk-your-key-here        # 必填（否则 Mock 模式）
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1   # 可选
DEEPSEEK_MODEL=deepseek-v4-flash                # 可选
AI_REQUEST_TIMEOUT_MS=12000                      # 可选
DATABASE_URL=file:./dev.db                       # SQLite 路径
```

---

## 八、开发环境问题处理

### 已知问题与解决方案

| 问题 | 现象 | 解决 |
|------|------|------|
| `.next` 缓存损坏 | 页面裸 HTML、CSS/JS 404、webpack module 错误 | 停止 dev server → 删 `.next` → `npm run dev` |
| Prisma schema-engine 空错误 | Windows/Node 24 下 `migrate dev`/`db push` 失败 | 使用 `prisma/migrate.ts` 通过 better-sqlite3 执行 SQL |
| build + dev 冲突 | 两者同时写入 `.next` 导致缓存冲突 | 先停 dev server → build → 删 `.next` → 重启 dev server |

### 标准重建流程
```bash
# 1. 停止 dev server
# 2. 清理
rm -rf .next
# 3. 重建
npm run db:generate
npm run db:migrate
npm run db:seed
# 4. 启动
npm run dev
```

---

## 九、项目文件结构速查

```
关键目录：
src/app/                      # 15 个路由页面 + API（见 HANDOFF §4）
src/components/ui/            # 21 个 shadcn/ui 组件
src/components/layout/        # 4 个布局组件（app-shell, ios-liquid-nav, desktop-sidebar, page-header）
src/components/forms/         # 2 个表单组件（wheel-picker, feeling-slider）
src/components/charts/        # 5 个图表组件（radar, trend, bar, donut, stat-card）
src/components/features/      # 15 个业务功能组件
src/hooks/                    # use-auth（登录守卫）
src/lib/
  ├── types.ts                # 20+ 类型定义
  ├── constants.ts            # 体测项目/评分/导航/选项常量
  ├── validators.ts           # 四级异常值检测
  ├── scoring.ts              # 评分算法（高中生标准）
  ├── demo-store.ts           # localStorage 状态管理
  ├── db.ts                   # Prisma 单例
  ├── data/                   # 3 个 Mock 数据文件
  └── server/                 # 服务端数据服务层（data-service + db-mappers）
prisma/
  ├── schema.prisma           # 6 表数据模型
  ├── seed.ts                 # 种子数据脚本
  ├── migrate.ts              # 自定义 migration 脚本
  └── migrations/             # SQL migration 文件
```

---

> 📋 **本文档目标**：让 Claude Code 和 Codex 在协作开发中保持一致的规范认知，避免各自为政。
>
> **最后更新**：2026-05-31 · 项目版本 MVP 0.3.2
