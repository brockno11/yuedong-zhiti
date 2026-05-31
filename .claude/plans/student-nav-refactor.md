## 学生端导航与页面职责重构

### 目标
- [ ] 底部导航从 5 项（含重复路由bug）改为 4 项：首页/画像/AI指导/我的
- [ ] /dashboard 轻量化：会话式首页，不展示完整数据仪表盘
- [ ] 新建 /portrait：完整体质画像页（雷达图 + 趋势图 + 优势/待提升）
- [ ] /record 降级：从导航 Tab 改为动作流程页
- [ ] 主 Tab 页（/dashboard, /portrait, /ai-guide, /profile）不显示返回按钮
- [ ] 底部导航高亮修正：仅当前路由对应项高亮
- [ ] 移动端 375px 适配

### 范围
- 包含：学生端路由结构、导航配置、页面组件重构、记录完成页跳转
- 不包含：教师端任何页面、API 路由、数据库 schema、AI 引擎逻辑

### 当前架构（v0.4.1 现状）
```
STUDENT_NAV_ITEMS（有 bug）:
  /dashboard → "首页" (Home icon)
  /record    → "记录" (PlusCircle icon)
  /dashboard → "画像" (BarChart3 icon)  ← BUG: 和首页同一路由
  /ai-guide  → "AI指导" (Sparkles icon)
  /profile   → "我的" (User icon)

/dashboard 页面职责混乱:
  PageHeader (backHref="/")  ← 主Tab不该有返回
  DashboardHero (问候 + CTA)
  综合评分卡 + 本期洞察
  雷达图 + 趋势图 + 优势/待提升  ← 应该是画像页内容
```

### 目标架构
```
STUDENT_NAV_ITEMS（4 项，无重复）:
  /dashboard → "首页" (Home icon)
  /portrait  → "画像" (BarChart3 icon)  ← 新路由
  /ai-guide  → "AI指导" (Sparkles icon)
  /profile   → "我的" (User icon)

/dashboard（首页，轻量）:
  问候："早上好/下午好/晚上好，学生A"
  一句话状态："今天可以记录一次体测"
  主按钮："开始记录" → /record
  状态简卡：78分 · BMI正常 · 2项待提升
  最近记录摘要：项目 + 成绩 + 时间
  快捷入口：查看体质画像 → /portrait | 查看AI指导 → /ai-guide

/portrait（画像页，完整数据）:
  PageHeader: "体质画像" · 学生A · 高二下 · 2025春季
  综合评分卡 + BMi状态
  本期洞察 + 优势/待提升标签
  体质雷达图（5维）
  50米跑趋势图
  优势项目列表
  待提升项目列表
  小型"记录新数据"按钮 → /record
```

### 技术设计

#### 路由结构
```
app/(student)/
├── layout.tsx              # AuthGuard + AppShell (不变)
├── dashboard/page.tsx      # 首页 (重写轻量化)
├── portrait/page.tsx       # 画像页 (新建)
├── ai-guide/page.tsx       # AI指导 (微修: 去backHref)
├── profile/page.tsx        # 个人中心 (微修: 去backHref)
└── record/page.tsx         # 记录向导 (return URL调整)
```

#### 组件复用
- `FitnessRadarChart` — 从 dashboard 迁移到 portrait
- `FitnessTrendChart` — 从 dashboard 迁移到 portrait
- `DashboardHero` — 保留在 dashboard，简化
- `EmptyState` — 两页共用
- 综合评分卡、洞察卡、优势/待提升 — 在 portrait 中重建

#### 数据获取
- dashboard: `getStudentProfile` + `getLatestFitnessRecord`（2次查询）
- portrait: `getStudentProfile` + `getLatestFitnessRecord` + `getFitnessRecords`（3次查询）
- 复用现有 data-service，不新增 DB 调用

### 任务拆分

#### Phase 1: 导航修复
- [ ] 修改 STUDENT_NAV_ITEMS：4 项正确路由
- [ ] 确认 IosLiquidNav 高亮逻辑正确（isActive 基于 pathname.startsWith）

#### Phase 2: 首页轻量化
- [ ] 重写 dashboard/page.tsx：去雷达图/趋势图/优势详表
- [ ] 新增状态简卡组件（评分/BMI/待提升数）
- [ ] 新增最近记录摘要
- [ ] 新增快捷入口卡片（画像/AI指导）
- [ ] 移除 PageHeader 的 backHref

#### Phase 3: 新建画像页
- [ ] 创建 portrait/page.tsx
- [ ] 迁移雷达图 + 趋势图 + 综合评分 + 洞察 + 优势/待提升
- [ ] 添加小型"记录新数据"入口
- [ ] 无 backHref

#### Phase 4: 记录流程适配
- [ ] record-wizard.tsx: back 链接 → /dashboard
- [ ] record-complete.tsx: 三个动作 → /portrait, /ai-guide, /record

#### Phase 5: 验证
- [ ] typecheck + lint + build
- [ ] 手动检查 5 个路由 + 移动端 + 多学生切换

### 风险评估

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| portrait 新建路由与其他路由冲突 | 低 | 中 | 使用 (student) 路由组，文件夹命名无冲突 |
| 首页数据量减少影响评委印象 | 低 | 低 | 已有演示流程说明；CTAs 引导到完整功能 |
| 导航高亮逻辑 edge case | 中 | 低 | IosLiquidNav 用 startsWith 比较，/portrait 不与其他路由前缀重叠 |
