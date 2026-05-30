---
name: shadcn-ui-official
description: shadcn/ui 官方 skill，理解项目的 components.json 配置、framework、Tailwind 版本、aliases、icon library、已安装组件等信息，提供官方组件最佳实践。
source: shadcn/ui Official - pnpm dlx skills add shadcn/ui
---

# shadcn/ui 官方规范

## 项目配置读取

安装后会自动读取 `components.json`，理解：
- **framework**：Next.js / Vite / Remix 等
- **Tailwind 版本**：v3 / v4
- **aliases**：`@/components`、`@/lib/utils` 等
- **icon library**：Lucide / 其他
- **已安装组件**：Button、Card、Form 等

## 组件使用原则

### 1. 优先使用官方组件
```tsx
// ✅ 正确：使用 shadcn/ui Button
import { Button } from "@/components/ui/button"
<Button variant="outline" size="sm">提交</Button>

// ❌ 错误：手写按钮
<button className="px-4 py-2 border rounded">提交</button>
```

### 2. 组件组合模式
```tsx
// ✅ 正确：使用 Card 组合
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
<Card>
  <CardHeader>
    <CardTitle>体测成绩</CardTitle>
  </CardHeader>
  <CardContent>
    {/* 内容 */}
  </CardContent>
</Card>
```

### 3. 表单组件
```tsx
// ✅ 正确：使用 Form 组件
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
<Form {...form}>
  <FormField
    control={form.control}
    name="height"
    render={({ field }) => (
      <FormItem>
        <FormLabel>身高 (cm)</FormLabel>
        <FormControl>
          <Input type="number" {...field} />
        </FormControl>
      </FormItem>
    )}
  />
</Form>
```

## 体测星图组件清单

### 已安装/需要安装的组件
- **布局**：Card, Separator, Sheet, Sidebar
- **表单**：Form, Input, Select, Checkbox, RadioGroup, Switch
- **数据展示**：Table, Badge, Avatar, Progress
- **反馈**：Dialog, AlertDialog, Toast, Tooltip
- **导航**：Tabs, Breadcrumb, NavigationMenu
- **图表**：配合 Recharts 使用

### 主题配置
```css
/* globals.css - 体测星图主题色 */
:root {
  --primary: 210 100% 50%;      /* 蓝色 - 主色调 */
  --secondary: 142 76% 36%;     /* 绿色 - 健康/成长 */
  --accent: 38 92% 50%;         /* 橙色 - 警示/重点 */
  --destructive: 0 84% 60%;     /* 红色 - 危险 */
  --muted: 210 40% 96%;         /* 浅灰 - 背景 */
}
```
