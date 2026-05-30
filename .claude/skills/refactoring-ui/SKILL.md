---
name: refactoring-ui
description: UI 视觉重构规范，专注于间距、颜色、字体、设计 token、响应式、ARIA、dark mode、表单优化、Dashboard 布局。用于 MVP 完成后的视觉打磨。
source: LobeHub - opkod-france-opkod-claude-code-plugins-refactoring-ui
---

# UI 视觉重构规范

## 设计 Token 系统

### 间距系统（8px 基准）
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
```

### 圆角系统
```css
--radius-sm: 0.375rem;  /* 6px - 按钮、输入框 */
--radius-md: 0.5rem;    /* 8px - 小卡片 */
--radius-lg: 0.75rem;   /* 12px - 大卡片 */
--radius-xl: 1rem;      /* 16px - 弹窗 */
--radius-full: 9999px;  /* 头像、徽章 */
```

### 阴影系统
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

## 视觉层级重构

### 1. 标题层级
```tsx
// ❌ 错误：层级混乱
<h1>体测报告</h1>
<h3>详细数据</h3>
<h2>成绩分析</h2>

// ✅ 正确：清晰层级
<h1 className="text-2xl font-bold">体测报告</h1>
<h2 className="text-xl font-semibold mt-6">成绩分析</h2>
<h3 className="text-lg font-medium mt-4">详细数据</h3>
```

### 2. 卡片层级
```tsx
// ❌ 错误：所有卡片一样
<Card>...</Card>
<Card>...</Card>
<Card>...</Card>

// ✅ 正确：主次分明
<Card className="shadow-md">  {/* 主卡片 - 有阴影 */}
  <CardHeader>
    <CardTitle>综合评分</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>

<div className="grid grid-cols-2 gap-4">
  <Card className="shadow-sm">  {/* 次卡片 - 轻阴影 */}
    <CardContent>...</CardContent>
  </Card>
  <Card className="shadow-sm">
    <CardContent>...</CardContent>
  </Card>
</div>
```

### 3. 按钮层级
```tsx
// 主要操作
<Button size="lg">提交体测数据</Button>

// 次要操作
<Button variant="outline">取消</Button>

// 三级操作
<Button variant="ghost" size="sm">查看更多</Button>
```

## 颜色重构

### 语义化颜色
```css
:root {
  /* 背景色 */
  --bg-primary: hsl(0 0% 100%);
  --bg-secondary: hsl(210 40% 98%);
  --bg-tertiary: hsl(210 40% 96%);

  /* 文字色 */
  --text-primary: hsl(222 47% 11%);
  --text-secondary: hsl(215 16% 47%);
  --text-tertiary: hsl(215 16% 67%);

  /* 边框色 */
  --border-primary: hsl(214 32% 91%);
  --border-secondary: hsl(214 32% 95%);
}
```

### 体测数据颜色
```css
/* 等级色 */
--grade-excellent: hsl(142 76% 36%);  /* 优秀 - 绿 */
--grade-good: hsl(210 100% 50%);      /* 良好 - 蓝 */
--grade-pass: hsl(38 92% 50%);        /* 及格 - 橙 */
--grade-improve: hsl(0 84% 60%);      /* 待提升 - 红 */

/* 趋势色 */
--trend-up: hsl(142 76% 36%);         /* 上升 - 绿 */
--trend-down: hsl(0 84% 60%);         /* 下降 - 红 */
--trend-stable: hsl(215 16% 47%);     /* 持平 - 灰 */
```

## 间距重构

### 内容间距
```tsx
// ❌ 错误：间距不一致
<div className="p-4">
  <h1>标题</h1>
  <p className="mt-1">内容</p>
</div>

// ✅ 正确：使用设计 token
<div className="p-6">
  <h1>标题</h1>
  <p className="mt-2">内容</p>
</div>
```

### 卡片内部间距
```tsx
<Card>
  <CardHeader className="pb-2">  {/* 标题和内容间距小 */}
    <CardTitle>体测成绩</CardTitle>
  </CardHeader>
  <CardContent className="pt-0">  {/* 内容区上边距为 0 */}
    <div className="space-y-4">  {/* 内容项间距 */}
      {/* 内容 */}
    </div>
  </CardContent>
</Card>
```

## 表单重构

### 输入框样式
```tsx
// ❌ 错误：默认样式
<Input placeholder="请输入身高" />

// ✅ 正确：优化样式
<div className="space-y-2">
  <Label htmlFor="height">身高</Label>
  <Input
    id="height"
    type="number"
    placeholder="请输入身高"
    className="h-11"  {/* 增加高度 */}
  />
  <p className="text-sm text-muted-foreground">单位：厘米</p>
</div>
```

### 表单布局
```tsx
// ❌ 错误：所有字段堆叠
<div>
  <Input label="身高" />
  <Input label="体重" />
  <Input label="50米跑" />
  <Input label="跳远" />
</div>

// ✅ 正确：分组布局
<fieldset className="space-y-4">
  <legend className="text-lg font-semibold">基本指标</legend>
  <div className="grid grid-cols-2 gap-4">
    <Input label="身高" />
    <Input label="体重" />
  </div>
</fieldset>

<fieldset className="space-y-4">
  <legend className="text-lg font-semibold">运动指标</legend>
  <div className="grid grid-cols-2 gap-4">
    <Input label="50米跑" />
    <Input label="跳远" />
  </div>
</fieldset>
```

## Dashboard 布局重构

### 教师端 Dashboard
```tsx
<div className="grid grid-cols-12 gap-6">
  {/* 核心指标 - 占满一行 */}
  <div className="col-span-12">
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="学生总数" value="1,234" />
      <StatCard title="平均分" value="82.5" />
      <StatCard title="及格率" value="95.2%" />
      <StatCard title="优秀率" value="32.8%" />
    </div>
  </div>

  {/* 图表区 - 两列 */}
  <div className="col-span-8">
    <Card>
      <CardHeader>
        <CardTitle>班级成绩趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart data={trendData} />
      </CardContent>
    </Card>
  </div>

  {/* 侧边栏 - 一列 */}
  <div className="col-span-4 space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>待处理</CardTitle>
      </CardHeader>
      <CardContent>
        <TaskList tasks={pendingTasks} />
      </CardContent>
    </Card>
  </div>
</div>
```

## 暗色模式

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: hsl(222 47% 11%);
    --bg-secondary: hsl(222 47% 15%);
    --bg-tertiary: hsl(222 47% 20%);

    --text-primary: hsl(210 40% 98%);
    --text-secondary: hsl(215 16% 67%);
    --text-tertiary: hsl(215 16% 47%);

    --border-primary: hsl(217 33% 25%);
    --border-secondary: hsl(217 33% 20%);
  }
}
```

## 重构检查清单

- [ ] 标题层级清晰（h1 > h2 > h3）
- [ ] 卡片有主次之分（阴影、大小）
- [ ] 按钮有层级（主要、次要、三级）
- [ ] 颜色语义化（不只是好看）
- [ ] 间距使用设计 token
- [ ] 表单有分组和说明
- [ ] Dashboard 布局合理（12列网格）
- [ ] 支持暗色模式
- [ ] 对比度符合标准
- [ ] 触控区域足够大
