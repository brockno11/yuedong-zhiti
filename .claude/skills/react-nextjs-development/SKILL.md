---
name: react-nextjs-development
description: React/Next.js 14+ App Router 开发工作流，覆盖 Server Components、TypeScript、Tailwind，将项目设置、实现、测试、质量检查拆成阶段流程。
source: GitHub - react-nextjs-development
---

# React/Next.js 开发工作流

## 开发流程

### 阶段 1：项目设置
1. 确认技术栈和版本
2. 检查项目结构
3. 验证依赖完整性

### 阶段 2：实现规划
1. 分析需求
2. 设计组件结构
3. 定义数据流
4. 规划 API 接口

### 阶段 3：编码实现
1. 创建类型定义
2. 实现 API 层
3. 构建组件
4. 组装页面

### 阶段 4：质量检查
1. TypeScript 类型检查
2. ESLint 规则检查
3. 单元测试
4. E2E 测试

## App Router 规范

### 路由组织
```
app/
├── (auth)/                 # 认证相关路由组
│   ├── login/
│   └── register/
├── (dashboard)/            # 仪表盘路由组
│   ├── teacher/
│   └── student/
├── api/                    # API Routes
│   ├── students/
│   └── classes/
├── layout.tsx              # 根布局
├── page.tsx                # 首页
└── loading.tsx             # 全局加载
```

### 路由组使用
```tsx
// app/(dashboard)/teacher/layout.tsx
export default function TeacherLayout({ children }) {
  return (
    <div className="flex">
      <TeacherSidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

### 动态路由
```tsx
// app/(dashboard)/teacher/students/[id]/page.tsx
export default async function StudentDetailPage({
  params
}: {
  params: { id: string }
}) {
  const student = await getStudent(params.id)
  return <StudentDetail student={student} />
}
```

## Server Components 规范

### 何时使用 Server Components
- 数据获取
- 访问后端资源
- 敏感信息处理（API keys）

### 何时使用 Client Components
- 交互逻辑（useState, useEffect）
- 浏览器 API
- 事件处理

### 边界划分
```tsx
// app/teacher/students/page.tsx - Server Component
export default async function StudentsPage() {
  const students = await getStudents()  // 服务端获取

  return (
    <StudentList
      initialStudents={students}  // 传递初始数据
    />
  )
}

// components/student-list.tsx - Client Component
'use client'

export function StudentList({ initialStudents }) {
  const [students, setStudents] = useState(initialStudents)
  // 客户端交互逻辑...
}
```

## 数据获取模式

### Server Actions
```tsx
// app/actions/student.ts
'use server'

export async function createStudent(formData: FormData) {
  // 验证
  const validatedFields = studentSchema.safeParse({
    name: formData.get('name'),
    gender: formData.get('gender'),
  })

  if (!validatedFields.success) {
    return { error: '数据验证失败' }
  }

  // 保存
  await db.student.create({ data: validatedFields.data })

  // 刷新缓存
  revalidatePath('/teacher/students')

  return { success: true }
}
```

### API Routes
```tsx
// app/api/students/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('classId')

  const students = await db.student.findMany({
    where: { classId }
  })

  return NextResponse.json(students)
}
```

### 数据缓存
```tsx
// 使用 React Cache
import { cache } from 'react'

export const getStudents = cache(async (classId: string) => {
  return db.student.findMany({ where: { classId } })
})
```

## TypeScript 规范

### 类型定义
```tsx
// types/student.ts
export interface Student {
  id: string
  name: string
  gender: 'male' | 'female'
  classId: string
  createdAt: Date
  updatedAt: Date
}

export type CreateStudentInput = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateStudentInput = Partial<CreateStudentInput>
```

### Props 类型
```tsx
// 组件 Props
interface StudentCardProps {
  student: Student
  onSelect?: (id: string) => void
  variant?: 'default' | 'compact'
}

export function StudentCard({ student, onSelect, variant = 'default' }: StudentCardProps) {
  // ...
}
```

## 状态管理

### 本地状态
```tsx
// 使用 useState
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<Error | null>(null)
```

### 表单状态
```tsx
// 使用 React Hook Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<CreateStudentInput>({
  resolver: zodResolver(studentSchema),
  defaultValues: {
    name: '',
    gender: 'male',
  }
})
```

### URL 状态
```tsx
// 使用 useSearchParams
import { useSearchParams, useRouter } from 'next/navigation'

const searchParams = useSearchParams()
const router = useRouter()

const page = searchParams.get('page') || '1'
const setPage = (p: string) => {
  router.push(`?page=${p}`)
}
```

## 错误处理

### 错误边界
```tsx
// app/error.tsx
'use client'

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>出错了！</h2>
      <button onClick={() => reset()}>重试</button>
    </div>
  )
}
```

### 表单错误
```tsx
// 表单提交错误处理
const onSubmit = async (data: CreateStudentInput) => {
  try {
    await createStudent(data)
    toast.success('创建成功')
    router.push('/teacher/students')
  } catch (error) {
    if (error instanceof ValidationError) {
      // 设置表单错误
      form.setError('name', { message: error.message })
    } else {
      toast.error('创建失败')
    }
  }
}
```

## 性能优化

### 图片优化
```tsx
import Image from 'next/image'

<Image
  src="/student-avatar.jpg"
  alt="学生头像"
  width={40}
  height={40}
  placeholder="blur"
/>
```

### 字体优化
```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

### 代码分割
```tsx
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <Skeleton />,
})
```

## 开发检查清单

### 功能完成
- [ ] 需求实现完整
- [ ] 边界情况处理
- [ ] 错误状态处理
- [ ] 加载状态显示

### 代码质量
- [ ] TypeScript 无错误
- [ ] ESLint 无警告
- [ ] 组件可复用
- [ ] 命名规范统一

### 性能
- [ ] 无不必要重渲染
- [ ] 图片已优化
- [ ] 代码已分割
- [ ] 缓存策略合理

### 测试
- [ ] 单元测试通过
- [ ] E2E 测试通过
- [ ] 边界情况覆盖
- [ ] 错误场景测试
```
