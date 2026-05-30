---
name: senior-frontend
description: 前端总工程规范，覆盖 React/Next.js 项目脚手架、组件生成、bundle 分析、React Patterns、Next.js 优化、Accessibility 和 Testing。作为项目架构约束。
source: LobeHub - duclm1x1-dive-ai-senior-frontend
---

# Senior Frontend 工程规范

## 项目结构规范

### 目录结构
```
src/
├── app/                    # Next.js App Router
│   ├── (routes)/          # 路由组
│   ├── api/               # API Routes
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/
│   ├── ui/                # shadcn/ui 组件
│   ├── layout/            # 布局组件
│   ├── forms/             # 表单组件
│   └── charts/            # 图表组件
├── hooks/                 # 自定义 Hooks
├── lib/                   # 工具函数
│   ├── utils.ts           # 通用工具
│   ├── validators.ts      # 验证逻辑
│   └── constants.ts       # 常量定义
├── services/              # API 服务
│   ├── api.ts             # API 客户端
│   └── endpoints.ts       # 接口定义
├── types/                 # TypeScript 类型
│   ├── models.ts          # 数据模型
│   └── api.ts             # API 类型
└── styles/                # 样式文件
    └── theme.ts           # 主题配置
```

### 命名规范

#### 文件命名
- **组件文件**：`kebab-case.tsx`（如 `student-card.tsx`）
- **工具文件**：`kebab-case.ts`（如 `format-date.ts`）
- **类型文件**：`kebab-case.ts`（如 `student-model.ts`）
- **测试文件**：`*.test.tsx` 或 `*.spec.tsx`

#### 组件命名
- **组件名**：`PascalCase`（如 `StudentCard`）
- **Hook 名**：`use` 前缀（如 `useStudentData`）
- **工具函数**：`camelCase`（如 `formatDate`）

#### 变量命名
- **布尔值**：`is`/`has`/`can` 前缀（如 `isLoading`、`hasError`）
- **数组**：复数形式（如 `students`、`records`）
- **回调函数**：`on`/`handle` 前缀（如 `onSubmit`、`handleClick`）

## React 最佳实践

### 1. 组件设计原则

#### 单一职责
```tsx
// ❌ 错误：组件做太多事
function StudentPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  // ... 获取数据、处理表单、渲染列表都在一起
}

// ✅ 正确：拆分职责
function StudentPage() {
  return (
    <div>
      <StudentList />
      <StudentForm />
    </div>
  )
}
```

#### Props 设计
```tsx
// ❌ 错误：Props 不明确
interface StudentCardProps {
  data: any
  onClick: any
}

// ✅ 正确：Props 类型清晰
interface StudentCardProps {
  student: Student
  onSelect: (studentId: string) => void
  variant?: 'default' | 'compact'
}
```

### 2. Hooks 使用规范

#### 自定义 Hook
```tsx
// hooks/use-students.ts
export function useStudents(classId: string) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchStudents(classId)
      .then(setStudents)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [classId])

  return { students, loading, error, refetch: () => fetchStudents(classId) }
}
```

#### Hook 依赖
```tsx
// ❌ 错误：依赖缺失
useEffect(() => {
  fetchData(studentId)
}, [])  // studentId 变化时不会重新获取

// ✅ 正确：依赖完整
useEffect(() => {
  fetchData(studentId)
}, [studentId])
```

### 3. 性能优化

#### React.memo
```tsx
// 频繁渲染的组件使用 memo
const StudentCard = React.memo(function StudentCard({ student }: StudentCardProps) {
  return <div>{student.name}</div>
})
```

#### useMemo / useCallback
```tsx
// 昂贵的计算使用 useMemo
const sortedStudents = useMemo(() => {
  return students.sort((a, b) => b.score - a.score)
}, [students])

// 传递给子组件的回调使用 useCallback
const handleSelect = useCallback((id: string) => {
  setSelectedId(id)
}, [])
```

#### 代码分割
```tsx
// 动态导入重型组件
const Chart = dynamic(() => import('@/components/charts/chart'), {
  loading: () => <Skeleton className="h-[300px]" />,
  ssr: false
})
```

## Next.js 最佳实践

### 1. Server Components vs Client Components

#### 默认使用 Server Components
```tsx
// app/teacher/students/page.tsx - Server Component
export default async function StudentsPage() {
  const students = await getStudents()  // 直接获取数据

  return <StudentList initialStudents={students} />
}
```

#### Client Components 放到叶子节点
```tsx
// components/student-list.tsx - Client Component
'use client'

export function StudentList({ initialStudents }: StudentListProps) {
  const [students, setStudents] = useState(initialStudents)
  // 交互逻辑...
}
```

### 2. 数据获取

#### Server Actions
```tsx
// app/actions/student.ts
'use server'

export async function createStudent(formData: FormData) {
  const data = Object.fromEntries(formData)
  // 验证、保存...
  revalidatePath('/teacher/students')
}
```

#### API Routes
```tsx
// app/api/students/route.ts
export async function GET() {
  const students = await db.student.findMany()
  return Response.json(students)
}
```

### 3. Metadata 优化
```tsx
// app/teacher/students/page.tsx
export const metadata: Metadata = {
  title: '学生管理 | 体测星图',
  description: '管理班级学生信息'
}
```

## 可访问性规范

### 1. 语义化 HTML
```tsx
// ❌ 错误：使用 div
<div onClick={handleClick}>点击</div>

// ✅ 正确：使用语义化标签
<button onClick={handleClick}>点击</button>
```

### 2. ARIA 属性
```tsx
// 为交互元素添加 ARIA
<button aria-label="关闭对话框" onClick={onClose}>
  <XIcon />
</button>

<div role="alert" aria-live="polite">
  {error && <p>{error.message}</p>}
</div>
```

### 3. 键盘导航
```tsx
// 支持键盘操作
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  可点击元素
</div>
```

## 测试规范

### 1. 单元测试
```tsx
// components/student-card.test.tsx
import { render, screen } from '@testing-library/react'
import { StudentCard } from './student-card'

describe('StudentCard', () => {
  it('renders student name', () => {
    render(<StudentCard student={{ name: '张三', score: 85 }} />)
    expect(screen.getByText('张三')).toBeInTheDocument()
  })

  it('shows grade badge', () => {
    render(<StudentCard student={{ name: '张三', score: 85 }} />)
    expect(screen.getByText('良好')).toBeInTheDocument()
  })
})
```

### 2. E2E 测试
```tsx
// e2e/student-flow.spec.ts
import { test, expect } from '@playwright/test'

test('teacher can create student', async ({ page }) => {
  await page.goto('/teacher/students')
  await page.click('text=添加学生')
  await page.fill('input[name="name"]', '张三')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=张三')).toBeVisible()
})
```

## 代码审查清单

### 功能检查
- [ ] 功能实现完整
- [ ] 边界情况处理
- [ ] 错误处理完善
- [ ] 加载状态显示

### 代码质量
- [ ] TypeScript 类型完整
- [ ] 组件职责单一
- [ ] 命名规范统一
- [ ] 无 `any` 类型

### 性能检查
- [ ] 无不必要的重渲染
- [ ] 大型组件已拆分
- [ ] 图片已优化
- [ ] 代码已分割

### 可访问性
- [ ] 语义化 HTML
- [ ] 键盘可操作
- [ ] 对比度足够
- [ ] 屏幕阅读器友好
```
