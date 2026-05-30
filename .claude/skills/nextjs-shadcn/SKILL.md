---
name: nextjs-shadcn
description: Next.js + shadcn/ui 专项开发规范。约束 App Router 目录结构、shadcn/ui 组件组合、Tailwind + CSS variables、use client 边界、可序列化 props 等最佳实践。
source: LobeHub - laguagu-claude-code-nextjs-skills-nextjs-shadcn
---

# Next.js + shadcn/ui 开发规范

## 核心规则

### 1. App Router 目录结构
```
app/
├── (routes)/           # 路由组，不影响 URL
│   ├── teacher/        # 教师端
│   └── student/        # 学生端
├── api/                # API Routes
├── layout.tsx          # 根布局
└── page.tsx            # 首页
```

### 2. 组件放置规则
- **页面组件**：只放内容组合，不放复杂逻辑
- **布局组件**：管理共享结构（侧边栏、导航）
- **`use client`**：只放到叶子组件，不要放到页面级别
- **复杂逻辑**：抽到 `hooks/`、`lib/`、`services/`

### 3. shadcn/ui 使用规范
- 优先使用 shadcn/ui 官方组件，不要手写低质量 div 组件
- 组件路径使用 `@/components/ui/` 别名
- 已安装组件列表参考 `components.json`

### 4. Tailwind + CSS Variables
- **禁止硬编码颜色**：使用 CSS variables（如 `bg-primary`、`text-muted-foreground`）
- 主题色通过 `globals.css` 的 CSS variables 定义
- 支持暗色模式：使用 `dark:` 前缀

### 5. Props 规范
- Props 必须可序列化（用于 Server Components 传递）
- 不要在 Props 中传递函数（除非明确标记 `use client`）
- 使用 TypeScript 类型定义 Props 接口

## 体测星图项目应用

### 教师端页面结构
```
app/(routes)/teacher/
├── layout.tsx          # 教师端布局（Sidebar + Header）
├── dashboard/          # 仪表盘
├── classes/            # 班级管理
├── students/           # 学生管理
├── tests/              # 体测管理
└── reports/            # 报告查看
```

### 学生端页面结构
```
app/(routes)/student/
├── layout.tsx          # 学生端布局（底部导航）
├── home/               # 首页摘要
├── report/             # 体测报告
├── training/           # 训练计划
└── profile/            # 个人中心
```

### 推荐组件组合
- **卡片**：`Card` + `CardContent` + `CardHeader`
- **表单**：`Form` + `FormField` + `Input` + `Select`
- **表格**：`Table` + `TableBody` + `TableRow`
- **图表**：配合 Recharts 或 AntV 使用
- **弹窗**：`Dialog` + `DialogContent`
- **侧边栏**：`Sidebar` + `SidebarContent` + `SidebarGroup`
