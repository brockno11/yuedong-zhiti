# Code Audit Skill

> 本 Skill 用于指导 Claude Code 对跃动智体项目进行系统性代码审查。

## 触发条件

当用户要求以下任务时触发：
- "代码审查"、"code review"、"找 bug"、"检查代码"
- "全面检测"、"质量审查"、"安全审计"
- "检查类型安全"、"检查边界情况"

## 审查维度

### 1. 类型安全

检查所有 `.ts` / `.tsx` 文件：
- `any` 类型使用（禁止）
- `as` 不安全类型断言
- `as never` 绕过类型检查
- 缺失 null/undefined 检查
- 泛型类型参数缺失

```bash
# 快速定位 any 使用
grep -rn ": any" src/ --include="*.ts" --include="*.tsx"
grep -rn "as any" src/ --include="*.ts" --include="*.tsx"
grep -rn "as never" src/ --include="*.ts" --include="*.tsx"
```

### 2. 除零/NaN 风险

检查所有 `.reduce()` 调用：
```bash
grep -rn "\.reduce(" src/ --include="*.ts" --include="*.tsx"
```

对每个 `.reduce()` 检查：
- 分母是否可能为 0（`.length` 为 0）
- 是否有 `length > 0` guard
- 结果是否可能为 NaN/Infinity

### 3. React 状态管理

检查所有 `useState` / `useEffect` / `useRef`：
- useEffect 依赖数组是否完整
- 是否有 eslint-disable 注释隐藏问题
- mountedRef 是否正确清理
- 闭包是否可能过时

```bash
grep -rn "eslint-disable.*react-hooks" src/ --include="*.tsx"
grep -rn "mountedRef" src/ --include="*.tsx"
```

### 4. 输入校验

检查所有 API 路由：
- Zod schema 是否存在
- 数值是否有 `.finite()` 约束
- 字符串是否有 `.min()/.max()` 约束
- 枚举是否使用 `z.enum()`

```bash
grep -rn "request.json()" src/app/api/ --include="*.ts"
grep -rn "as {" src/app/api/ --include="*.ts"  # 不安全的类型断言
```

### 5. 权限检查

检查所有 PATCH/DELETE 路由：
- 是否从请求体读取角色（安全漏洞）
- 正式体测是否仅限教师操作
- 学生是否只能操作自己的数据

### 6. 数据一致性

检查评分/统计相关代码：
- 正式体测和日常训练是否混用
- 缺失项目是否被补全/推测
- BMI 是否被当作正式体测项目

### 7. UI/UX 检查

- `||` vs `??`（0 是否被当 falsy）
- 文本溢出风险（长字符串）
- 触控目标 ≥ 44px
- 底部导航不遮挡内容

### 8. 安全检查

```bash
# 硬编码密钥
grep -rn "sk-" src/ --include="*.ts" --include="*.tsx"
grep -rn "api_key\|apikey\|secret" src/ --include="*.ts" --include="*.tsx" -i

# 环境变量泄露
grep -rn "process\.env\." src/ --include="*.ts" --include="*.tsx" | grep -v "server"
```

## 审查流程

1. **静态分析**：运行 `tsc --noEmit` + `next lint`
2. **模式搜索**：用 grep 定位风险模式
3. **逐文件审查**：按优先级审查关键文件
4. **交叉验证**：检查数据流是否一致
5. **Playwright 验证**：用真实浏览器验证 UI

## 优先级定义

| 级别 | 定义 | 示例 |
|------|------|------|
| **P0** | 运行时崩溃/数据错误 | 除零 NaN、权限绕过、错误数据提交 |
| **P1** | 功能降级/体验受损 | 输入校验缺失、N+1 查询、旧闭包 |
| **P2** | 代码质量/可维护性 | a11y、硬编码、重复代码 |

## 审查报告格式

```markdown
## 审查报告

### 发现问题清单

| # | 优先级 | 文件:行 | 问题 | 根因 | 修复方式 | 验证 |
|---|--------|---------|------|------|----------|------|
| 1 | P0 | file.ts:42 | 描述 | 原因 | 修复 | ✅/❌ |

### 执行命令
- typecheck: ✅ 0 错误
- lint: ✅ 0 warning
- Playwright: ✅ 全部通过
```

## 常用审查命令

```bash
# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 构建检查（需要先停 dev server）
npm run build

# 查看修改文件
git diff --stat

# 检查未提交文件
git status --short
```
