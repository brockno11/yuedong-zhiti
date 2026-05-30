// ===== 跃动智体 — 数据验证（参考 data-analyst skill）=====
import { PHYSICAL_RANGES } from "./constants";

// ---- 异常值分级 ----
export const AnomalyLevel = {
  NORMAL: "normal",
  WARNING: "warning",
  ANOMALY: "anomaly",
  IMPOSSIBLE: "impossible",
} as const;

export type AnomalyLevel = (typeof AnomalyLevel)[keyof typeof AnomalyLevel];

export interface ValidationResult {
  isValid: boolean;
  anomalyLevel: AnomalyLevel;
  message?: string;
}

// ---- 异常值检测 ----
export function detectAnomaly(field: string, value: number): ValidationResult {
  const range = PHYSICAL_RANGES[field];
  if (!range) {
    return { isValid: true, anomalyLevel: AnomalyLevel.NORMAL };
  }

  const { min, max } = range;
  const rangeSize = max - min;

  // 明显错误
  if (value < min - rangeSize * 0.2 || value > max + rangeSize * 0.2) {
    return {
      isValid: false,
      anomalyLevel: AnomalyLevel.IMPOSSIBLE,
      message: `${field} 的值 ${value}${range.unit} 明显超出合理范围，请检查是否正确`,
    };
  }

  // 异常值
  if (value < min || value > max) {
    return {
      isValid: false,
      anomalyLevel: AnomalyLevel.ANOMALY,
      message: `${field} 的值 ${value}${range.unit} 超出常见范围，请确认是否正确`,
    };
  }

  // 边界值
  if (value < min + rangeSize * 0.1 || value > max - rangeSize * 0.1) {
    return {
      isValid: true,
      anomalyLevel: AnomalyLevel.WARNING,
      message: `${field} 的值 ${value}${range.unit} 接近边界范围`,
    };
  }

  return { isValid: true, anomalyLevel: AnomalyLevel.NORMAL };
}

// ---- BMI 计算 ----
export function calculateBMI(height: number, weight: number): number {
  const heightInM = height / 100;
  return Math.round((weight / (heightInM * heightInM)) * 10) / 10;
}

// ---- BMI 状态评估 ----
export function getBMIStatus(bmi: number, _age: number): string {
  // 中学生 BMI 参考范围（简化版）
  if (bmi < 16.5) return "BMI 指标值得关注，建议在教师指导下调整运动与营养安排";
  if (bmi < 18.5) return "BMI 指标值得关注，建议保持均衡饮食和适当运动";
  if (bmi < 24.0) return "正常范围，继续保持良好的饮食和运动习惯";
  if (bmi < 28.0) return "BMI 指标值得关注，建议增加有氧运动，注意饮食均衡";
  return "BMI 指标值得关注，建议在教师指导下制定运动计划";
}

// ---- 根据分数获取等级 ----
export function getGrade(score: number): "excellent" | "good" | "pass" | "improve" {
  if (score >= 90) return "excellent";
  if (score >= 80) return "good";
  if (score >= 60) return "pass";
  return "improve";
}

// ---- 性别与项目匹配校验 ----
export function validateGenderItem(
  gender: "male" | "female",
  itemId: string
): boolean {
  if (itemId === "pull_up" && gender === "female") return false;
  if (itemId === "sit_up" && gender === "male") return false;
  if (itemId === "800m_run" && gender === "male") return false;
  if (itemId === "1000m_run" && gender === "female") return false;
  return true;
}

// ---- 获取学生应测试的项目 ----
export function getApplicableItems(
  gender: "male" | "female"
): string[] {
  const commonItems = [
    "height_weight",
    "vital_capacity",
    "50m_run",
    "standing_long_jump",
    "sit_and_reach",
  ];

  const genderItems =
    gender === "male"
      ? ["pull_up", "1000m_run"]
      : ["sit_up", "800m_run"];

  return [...commonItems, ...genderItems];
}
