---
name: data-analyst
description: 数据清洗与分析规范，覆盖缺失值处理、异常值检测、重复值处理、单位校验、数据质量检查等。用于体测数据的预处理和质量保障。
source: LobeHub - openclaw-skills-data-analyst
---

# 体测数据清洗与分析规范

## 数据质量检查清单

### 1. 缺失值处理

#### 检测
```typescript
interface MissingValueReport {
  field: string
  totalRows: number
  missingCount: number
  missingRate: number
  action: 'fill' | 'flag' | 'exclude'
}
```

#### 处理策略
| 字段 | 缺失率 | 处理方式 |
|------|--------|---------|
| 姓名 | > 0% | 拒绝导入，必须填写 |
| 性别 | > 0% | 拒绝导入，必须填写 |
| 身高 | < 10% | 标记为异常，教师确认 |
| 身高 | > 10% | 提示数据质量差 |
| 体重 | < 10% | 标记为异常，教师确认 |
| 体测成绩 | < 20% | 标记为未测试 |
| 体测成绩 | > 20% | 提示数据不完整 |

### 2. 异常值检测

#### 身体指标合理范围
```typescript
const PHYSICAL_RANGES = {
  height: { min: 120, max: 210, unit: 'cm' },      // 初中生身高
  weight: { min: 30, max: 120, unit: 'kg' },        // 初中生体重
  vitalCapacity: { min: 1000, max: 6000, unit: 'ml' }, // 肺活量
  fiftyMRun: { min: 6.0, max: 12.0, unit: 's' },    // 50米跑
  standingLongJump: { min: 100, max: 280, unit: 'cm' }, // 立定跳远
  sitAndReach: { min: -10, max: 30, unit: 'cm' },   // 坐位体前屈
  pullUp: { min: 0, max: 30, unit: '次' },          // 引体向上（男）
  sitUp: { min: 0, max: 60, unit: '次' },           // 仰卧起坐（女）
  thousandMRun: { min: 180, max: 420, unit: 's' },  // 1000米跑（男）
  eightHundredMRun: { min: 180, max: 360, unit: 's' }, // 800米跑（女）
}
```

#### 异常值分级
```typescript
enum AnomalyLevel {
  NORMAL = 'normal',      // 正常范围
  WARNING = 'warning',    // 边界值（±10%）
  ANOMALY = 'anomaly',    // 异常值（±20%）
  IMPOSSIBLE = 'impossible' // 不可能值（明显错误）
}

function detectAnomaly(field: string, value: number): AnomalyLevel {
  const range = PHYSICAL_RANGES[field]
  if (!range) return AnomalyLevel.NORMAL

  const { min, max } = range
  const rangeSize = max - min

  if (value < min || value > max) {
    // 超出合理范围
    if (value < min - rangeSize * 0.2 || value > max + rangeSize * 0.2) {
      return AnomalyLevel.IMPOSSIBLE  // 明显错误，如 50米跑 80秒
    }
    return AnomalyLevel.ANOMALY
  }

  // 边界值检查
  if (value < min + rangeSize * 0.1 || value > max - rangeSize * 0.1) {
    return AnomalyLevel.WARNING
  }

  return AnomalyLevel.NORMAL
}
```

#### 常见错误示例
| 错误类型 | 示例 | 检测方式 |
|---------|------|---------|
| 单位错误 | 身高 175 填成 1.75 | 范围检查 |
| 项目混淆 | 50米成绩填成 800 米 | 项目校验 |
| 小数点错误 | 体重 750kg | 范围检查 |
| 数据复制 | 所有学生成绩相同 | 重复值检测 |
| 格式错误 | "8秒5" 而非 8.5 | 格式解析 |

### 3. 重复值处理

#### 检测逻辑
```typescript
interface DuplicateCheck {
  // 同一学生多次测试
  studentId: string
  testDate: string
  testType: string

  // 处理策略
  strategy: 'keep_latest' | 'keep_best' | 'average' | 'flag'
}
```

#### 处理策略
- **同一学期多次测试**：保留最新成绩
- **明显重复记录**：自动去重
- **疑似重复**：标记供教师确认

### 4. 单位校验

#### 单位转换规则
```typescript
const UNIT_CONVERSIONS = {
  height: {
    // 1.75m → 175cm
    from: 'm',
    to: 'cm',
    factor: 100
  },
  weight: {
    // 75kg 保持不变
    standard: 'kg'
  },
  time: {
    // "1分30秒" → 90秒
    parse: (input: string) => {
      const match = input.match(/(\d+)分(\d+)秒/)
      if (match) {
        return parseInt(match[1]) * 60 + parseInt(match[2])
      }
      return parseFloat(input)
    }
  }
}
```

#### 自动校验
```typescript
function validateAndConvert(field: string, value: any, unit?: string): number {
  // 尝试解析
  let numericValue = parseNumber(value)

  // 单位转换
  if (unit && UNIT_CONVERSIONS[field]) {
    numericValue = convertUnit(numericValue, unit, UNIT_CONVERSIONS[field].standard)
  }

  // 范围检查
  const anomaly = detectAnomaly(field, numericValue)
  if (anomaly === AnomalyLevel.IMPOSSIBLE) {
    throw new DataValidationError(`${field} 值 ${value} 不可能正确`)
  }

  return numericValue
}
```

### 5. 数据一致性检查

#### 跨字段校验
```typescript
function crossFieldValidation(record: StudentRecord): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // BMI 校验
  if (record.height && record.weight) {
    const bmi = record.weight / (record.height / 100) ** 2
    if (bmi < 14 || bmi > 40) {
      issues.push({
        field: 'bmi',
        message: `BMI 计算值 ${bmi.toFixed(1)} 异常，请检查身高体重`,
        level: 'warning'
      })
    }
  }

  // 性别与项目匹配
  if (record.gender === 'male' && record.sitUp > 0) {
    issues.push({
      field: 'sitUp',
      message: '男生应测试引体向上，而非仰卧起坐',
      level: 'error'
    })
  }

  if (record.gender === 'female' && record.pullUp > 0) {
    issues.push({
      field: 'pullUp',
      message: '女生应测试仰卧起坐，而非引体向上',
      level: 'error'
    })
  }

  return issues
}
```

## 数据分析规范

### 1. 班级统计摘要

```typescript
interface ClassStatistics {
  className: string
  studentCount: number
  testDate: string

  // 整体指标
  averageScore: number
  passRate: number
  excellentRate: number

  // 分项统计
  metrics: {
    name: string
    average: number
    min: number
    max: number
    stdDev: number
    distribution: {
      excellent: number
      good: number
      pass: number
      improve: number
    }
  }[]

  // 性别对比
  genderComparison: {
    male: { count: number; average: number }
    female: { count: number; average: number }
  }
}
```

### 2. 学生个人画像

```typescript
interface StudentProfile {
  studentId: string
  name: string
  grade: string
  class: string

  // 综合评分
  overallScore: number
  overallGrade: 'excellent' | 'good' | 'pass' | 'improve'

  // 各项得分
  dimensions: {
    speed: number        // 速度（50米）
    strength: number     // 力量（引体向上/仰卧起坐）
    endurance: number    // 耐力（800/1000米）
    flexibility: number  // 柔韧性（坐位体前屈）
    coordination: number // 协调性（跳远）
  }

  // 优势与待提升
  strengths: string[]
  improvements: string[]

  // 趋势
  trend: 'improving' | 'stable' | 'declining'

  // 训练建议
  recommendations: {
    focus: string
    exercises: string[]
    frequency: string
  }
}
```

### 3. 数据输出格式

#### 图表数据格式
```typescript
// 雷达图数据
interface RadarChartData {
  dimensions: string[]
  values: number[]
  comparison?: number[]  // 对比数据（如班级平均）
}

// 趋势图数据
interface TrendChartData {
  dates: string[]
  series: {
    name: string
    values: number[]
  }[]
}

// 分布图数据
interface DistributionChartData {
  categories: string[]
  values: number[]
  colors: string[]
}
```

## 数据质量报告

### 报告模板
```typescript
interface DataQualityReport {
  importTime: string
  totalRecords: number
  validRecords: number

  issues: {
    level: 'error' | 'warning' | 'info'
    count: number
    examples: string[]
  }[]

  summary: {
    missingRate: number
    anomalyRate: number
    duplicateRate: number
    overallQuality: 'excellent' | 'good' | 'acceptable' | 'poor'
  }
}
```

### 质量等级标准
| 等级 | 缺失率 | 异常率 | 重复率 | 处理建议 |
|------|--------|--------|--------|---------|
| 优秀 | < 5% | < 2% | 0% | 直接使用 |
| 良好 | < 10% | < 5% | < 1% | 标记后使用 |
| 可接受 | < 20% | < 10% | < 3% | 教师确认后使用 |
| 差 | > 20% | > 10% | > 3% | 重新导入 |

## 反标签化原则

### 禁止的表达
- ❌ "该学生体能差"
- ❌ "肥胖学生"
- ❌ "不及格学生"
- ❌ "体质弱"

### 推荐的表达
- ✅ "该学生在 XX 项目上有提升空间"
- ✅ "BMI 指标需要关注"
- ✅ "XX 项目成绩低于班级平均水平"
- ✅ "建议加强 XX 方面的训练"

### 设计原则
- 强调进步，而非排名
- 提供建议，而非批评
- 关注趋势，而非单次成绩
- 保护隐私，不公开展示
