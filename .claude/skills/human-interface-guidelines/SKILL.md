---
name: human-interface-guidelines
description: Apple Human Interface Guidelines 设计规范，强调 Clarity、Deference、Depth、系统字体、语义色、动效、可访问性。用于体测星图的 Apple Health/Fitness 风格 UI 设计。
source: LobeHub - lev-os-agents-human-interface-guidelines
---

# Apple Human Interface Guidelines (Web 适配版)

## 设计原则

### 1. Clarity（清晰）
- **文字清晰**：使用系统字体，确保可读性
- **图标清晰**：使用 SF Symbols 风格的简洁图标
- **布局清晰**：足够的留白，明确的层级

### 2. Deference（克制）
- **内容为王**：UI 不抢内容的风头
- **减少干扰**：避免过多装饰性元素
- **聚焦任务**：一屏一个主要任务

### 3. Depth（层次）
- **视觉层级**：通过大小、颜色、阴影建立层级
- **导航层级**：清晰的返回路径
- **信息层级**：重要内容突出，次要内容弱化

## 字体规范

### 系统字体栈
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
  "Helvetica Neue", "PingFang SC", "Noto Sans CJK SC", sans-serif;
```

### 字号层级
| 用途 | 字号 | 字重 | 行高 |
|------|------|------|------|
| 大标题 | 34px | Bold | 1.2 |
| 标题1 | 28px | Bold | 1.25 |
| 标题2 | 22px | Semibold | 1.3 |
| 标题3 | 20px | Semibold | 1.35 |
| 正文 | 17px | Regular | 1.5 |
| 注释 | 15px | Regular | 1.4 |
| 辅助 | 13px | Regular | 1.4 |

### 数字字体
```css
/* 体测数据数字 */
font-variant-numeric: tabular-nums;
font-feature-settings: "tnum";
```

## 颜色系统

### 语义色
```css
:root {
  /* 系统色 */
  --system-blue: 0 122 255;
  --system-green: 52 199 89;
  --system-orange: 255 149 0;
  --system-red: 255 59 48;
  --system-yellow: 255 204 0;
  --system-purple: 175 82 222;
  --system-teal: 90 200 250;

  /* 语义色 */
  --color-success: var(--system-green);
  --color-warning: var(--system-orange);
  --color-danger: var(--system-red);
  --color-info: var(--system-blue);
}
```

### 体测等级色
```css
--level-excellent: 52 199 89;    /* 优秀 - 绿色 */
--level-good: 0 122 255;         /* 良好 - 蓝色 */
--level-pass: 255 149 0;         /* 及格 - 橙色 */
--level-improve: 255 59 48;      /* 待提升 - 红色 */
```

## 卡片设计

### Apple Health 风格卡片
```tsx
// 体测摘要卡片
<div className="rounded-2xl bg-card p-5 shadow-sm">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-lg font-semibold">体测摘要</h3>
    <span className="text-sm text-muted-foreground">2024年秋季</span>
  </div>
  <div className="text-4xl font-bold text-primary">85</div>
  <div className="text-sm text-muted-foreground">综合评分</div>
  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
    <div className="h-full bg-primary rounded-full" style={{ width: '85%' }} />
  </div>
</div>
```

### 圆环进度（Apple Fitness 风格）
```tsx
// 训练完成度圆环
<svg viewBox="0 0 100 100" className="w-24 h-24">
  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor"
    strokeWidth="8" className="text-muted" />
  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor"
    strokeWidth="8" className="text-primary"
    strokeDasharray={`${progress * 251.2} 251.2`}
    strokeLinecap="round" transform="rotate(-90 50 50)" />
</svg>
```

## 动效规范

### 页面转场
```css
/* 页面进入 */
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-enter {
  animation: pageEnter 0.3s ease-out;
}
```

### 卡片动画
```css
/* 卡片出现 */
@keyframes cardAppear {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.card-appear {
  animation: cardAppear 0.2s ease-out;
}
```

### 数据加载
```css
/* 骨架屏 */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

## 可访问性

### 触控目标
- 最小触控区域：44x44px
- 按钮间距：至少 8px
- 重要按钮：48px 高度

### 对比度
- 文字对比度：至少 4.5:1
- 大文字对比度：至少 3:1
- 交互元素：至少 3:1

### 屏幕阅读器
```tsx
// 语义化 HTML
<article role="article" aria-label="体测报告">
  <h2>我的体测报告</h2>
  <div role="img" aria-label="体质雷达图，各项指标均衡">
    {/* 雷达图 */}
  </div>
</article>
```

## 体测星图应用示例

### 学生端首页布局
```
┌─────────────────────────────┐
│  体测星图           [头像]   │  ← 简洁导航栏
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │  综合评分               ││  ← 大数字卡片
│  │  85                     ││
│  │  良好 ↑3                ││
│  └─────────────────────────┘│
│  ┌──────────┐ ┌──────────┐ │
│  │ 速度 92  │ │ 力量 78  │ │  ← 双列指标卡
│  │ ▓▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓░░ │ │
│  └──────────┘ └──────────┘ │
│  ┌─────────────────────────┐│
│  │  今日训练               ││  ← 任务列表
│  │  🏃 跑步 20分钟 [开始]  ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  [首页]    [报告]    [我的]  │  ← 底部标签栏
└─────────────────────────────┘
```
