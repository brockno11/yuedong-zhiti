---
name: create-readme
description: 创建专业 README 文档，包含项目背景、功能架构、技术栈、启动方式、数据隐私说明、AI 使用说明、演示截图等。用于 GitHub 仓库展示。
source: GitHub Awesome Copilot - create-readme
---

# README 创建规范

## README 结构

### 1. 项目标题与简介
```markdown
# 体测星图

> 中学生体质健康测试 AI 分析平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)

体测星图是一个面向中学体育教学的智能分析平台，通过 AI 技术将体测数据转化为可视化报告和个性化训练建议，帮助教师精准教学、学生科学锻炼。
```

### 2. 功能特性
```markdown
## ✨ 功能特性

### 教师端
- 📊 **班级管理**：创建班级、导入学生名单
- 📝 **数据录入**：批量导入体测数据
- 📈 **数据分析**：班级统计、薄弱项分析
- 📋 **报告审核**：审核 AI 生成的分析报告
- 👥 **学生管理**：查看学生个人报告

### 学生端
- 🏠 **个人首页**：体测摘要、今日任务
- 📊 **体测报告**：雷达图、成绩趋势
- 🤖 **AI 画像**：体质分析、训练建议
- 🏃 **训练计划**：个性化训练方案
- 📱 **移动适配**：手机端优先设计
```

### 3. 技术栈
```markdown
## 🛠️ 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 14 | App Router, Server Components |
| 语言 | TypeScript | 类型安全 |
| UI | shadcn/ui + Tailwind CSS | 组件库 + 样式方案 |
| 图表 | Recharts | 数据可视化 |
| 数据库 | PostgreSQL | 主数据库 |
| ORM | Prisma | 数据库操作 |
| AI | 国产大模型 API | 智能分析 |
| 部署 | Vercel | 托管平台 |
```

### 4. 快速开始
```markdown
## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+
- PostgreSQL 14+

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/your-username/physical-test-star-map.git
cd physical-test-star-map
```

2. 安装依赖
```bash
pnpm install
```

3. 环境配置
```bash
cp .env.example .env.local
# 编辑 .env.local 填入配置
```

4. 数据库迁移
```bash
pnpm db:migrate
pnpm db:seed
```

5. 启动开发服务器
```bash
pnpm dev
```

6. 访问应用
- 教师端：http://localhost:3000/teacher
- 学生端：http://localhost:3000/student
```

### 5. 项目结构
```markdown
## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── (routes)/          # 路由组
│   ├── api/               # API Routes
│   └── layout.tsx         # 根布局
├── components/            # React 组件
│   ├── ui/                # shadcn/ui 组件
│   ├── layout/            # 布局组件
│   └── charts/            # 图表组件
├── hooks/                 # 自定义 Hooks
├── lib/                   # 工具函数
├── prisma/                # 数据库 Schema
├── public/                # 静态资源
└── styles/                # 样式文件
```
```

### 6. 功能截图
```markdown
## 📸 功能截图

### 教师端 Dashboard
![教师端 Dashboard](./screenshots/teacher-dashboard.png)

### 学生端体测报告
![学生端报告](./screenshots/student-report.png)

### 数据可视化
![数据可视化](./screenshots/data-visualization.png)
```

### 7. 数据隐私说明
```markdown
## 🔒 数据隐私

### 数据处理原则
- **最小化收集**：仅收集必要的体测数据
- **本地存储**：数据存储在用户选择的数据库
- **脱敏处理**：敏感信息脱敏展示
- **权限控制**：教师只能查看自己班级数据

### AI 使用说明
- AI 分析仅用于生成训练建议
- 不存储学生个人信息到 AI 服务
- 所有 AI 生成内容需教师审核
- 不使用 AI 进行成绩评定

### 合规声明
- 符合《个人信息保护法》要求
- 符合《未成年人保护法》要求
- 符合教育部数据安全管理规定
```

### 8. 开发指南
```markdown
## 🧑‍💻 开发指南

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint + Prettier 配置
- 组件使用 PascalCase 命名
- 工具函数使用 camelCase 命名

### 提交规范
```bash
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链更新
```

### 测试
```bash
# 单元测试
pnpm test

# E2E 测试
pnpm test:e2e

# 测试覆盖率
pnpm test:coverage
```
```

### 9. 部署
```markdown
## 🚢 部署

### Vercel 部署
1. Fork 本仓库
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

### Docker 部署
```bash
docker-compose up -d
```

### 环境变量
```env
DATABASE_URL=postgresql://...
AI_API_KEY=your-api-key
NEXTAUTH_SECRET=your-secret
```
```

### 10. 贡献指南
```markdown
## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request
```

### 11. 许可证
```markdown
## 📄 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE) 文件
```

### 12. 致谢
```markdown
## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
```

## README 审查清单

### 内容完整性
- [ ] 项目简介清晰
- [ ] 功能特性列出
- [ ] 技术栈说明
- [ ] 快速开始指南
- [ ] 项目结构说明
- [ ] 截图展示
- [ ] 数据隐私说明
- [ ] 开发指南
- [ ] 部署说明
- [ ] 许可证

### 格式规范
- [ ] Markdown 格式正确
- [ ] 链接可访问
- [ ] 图片可显示
- [ ] 代码块语法高亮

### 展示效果
- [ ] 标题醒目
- [ ] 徽章清晰
- [ ] 截图美观
- [ ] 排版舒适
```
