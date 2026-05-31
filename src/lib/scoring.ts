// ===== 跃动智体 — 体测评分逻辑 =====
import type { FitnessItemId, GradeLevel, Gender } from "./types";

// ---- 评分标准（高中生，参考国家学生体质健康标准）----
// 结构: [性别][年级][项目] = { excellent, good, pass } 阈值

type ScoreThresholds = {
  excellent: number;
  good: number;
  pass: number;
};

type ScoringTable = Record<string, Record<string, Record<string, ScoreThresholds>>>;

const SCORING: ScoringTable = {
  male: {
    高一: {
      vital_capacity: { excellent: 3600, good: 3000, pass: 2000 },
      "50m_run": { excellent: 7.8, good: 8.4, pass: 9.6 },
      standing_long_jump: { excellent: 210, good: 190, pass: 160 },
      sit_and_reach: { excellent: 16, good: 11, pass: 2 },
      pull_up: { excellent: 10, good: 6, pass: 2 },
      "1000m_run": { excellent: 235, good: 255, pass: 295 },
    },
    高二: {
      vital_capacity: { excellent: 3800, good: 3200, pass: 2200 },
      "50m_run": { excellent: 7.5, good: 8.2, pass: 9.4 },
      standing_long_jump: { excellent: 220, good: 200, pass: 170 },
      sit_and_reach: { excellent: 17, good: 12, pass: 3 },
      pull_up: { excellent: 11, good: 7, pass: 3 },
      "1000m_run": { excellent: 230, good: 250, pass: 290 },
    },
    高三: {
      vital_capacity: { excellent: 4000, good: 3400, pass: 2400 },
      "50m_run": { excellent: 7.3, good: 7.9, pass: 9.2 },
      standing_long_jump: { excellent: 235, good: 210, pass: 180 },
      sit_and_reach: { excellent: 18, good: 13, pass: 4 },
      pull_up: { excellent: 12, good: 8, pass: 4 },
      "1000m_run": { excellent: 225, good: 245, pass: 285 },
    },
  },
  female: {
    高一: {
      vital_capacity: { excellent: 2800, good: 2300, pass: 1500 },
      "50m_run": { excellent: 8.4, good: 9.0, pass: 10.2 },
      standing_long_jump: { excellent: 180, good: 160, pass: 135 },
      sit_and_reach: { excellent: 18, good: 13, pass: 4 },
      sit_up: { excellent: 42, good: 36, pass: 24 },
      "800m_run": { excellent: 215, good: 230, pass: 270 },
    },
    高二: {
      vital_capacity: { excellent: 3000, good: 2500, pass: 1700 },
      "50m_run": { excellent: 8.3, good: 8.9, pass: 10.0 },
      standing_long_jump: { excellent: 185, good: 165, pass: 140 },
      sit_and_reach: { excellent: 19, good: 14, pass: 5 },
      sit_up: { excellent: 44, good: 38, pass: 26 },
      "800m_run": { excellent: 210, good: 225, pass: 265 },
    },
    高三: {
      vital_capacity: { excellent: 3200, good: 2700, pass: 1900 },
      "50m_run": { excellent: 8.1, good: 8.7, pass: 9.8 },
      standing_long_jump: { excellent: 195, good: 175, pass: 145 },
      sit_and_reach: { excellent: 20, good: 15, pass: 6 },
      sit_up: { excellent: 46, good: 40, pass: 28 },
      "800m_run": { excellent: 205, good: 220, pass: 260 },
    },
  },
};

// ---- 计算单项得分 (0-100) ----
export function calculateItemScore(
  itemId: FitnessItemId,
  value: number,
  gender: Gender,
  grade: GradeLevel,
  higherIsBetter: boolean
): number {
  const thresholds = SCORING[gender]?.[grade]?.[itemId];
  if (!thresholds) {
    // BMI 等无标准的项目给默认分
    return 75;
  }

  const { excellent, good, pass } = thresholds;

  if (higherIsBetter) {
    // 值越大越好（如跳远、肺活量）
    if (value >= excellent) return 95;
    if (value >= good) return 85;
    if (value >= pass) return 70;
    // 低于及格线
    const ratio = value / pass;
    return Math.max(30, Math.round(60 * ratio));
  } else {
    // 值越小越好（如跑步时间）
    if (value <= excellent) return 95;
    if (value <= good) return 85;
    if (value <= pass) return 70;
    // 超过及格线
    const ratio = pass / value;
    return Math.max(30, Math.round(60 * ratio));
  }
}

// ---- 数据完整度计算 ----

const MALE_ITEMS = ["50m_run", "standing_long_jump", "pull_up", "1000m_run", "sit_and_reach", "vital_capacity"] as const;
const FEMALE_ITEMS = ["50m_run", "standing_long_jump", "sit_up", "800m_run", "sit_and_reach", "vital_capacity"] as const;

export interface RecordCompleteness {
  recordedCount: number;
  expectedCount: number;
  missingItems: string[];
  completionRate: number; // 0-100
  isComplete: boolean;    // 全部项目已记录
  isPartial: boolean;     // 部分项目已记录
  availableDimensions: { dimension: string; itemId: string }[];
  missingDimensions: { dimension: string; itemId: string }[];
}

const DIMENSION_MAP: Record<string, string> = {
  "50m_run": "速度",
  standing_long_jump: "力量",
  pull_up: "力量",
  sit_up: "力量",
  "1000m_run": "耐力",
  "800m_run": "耐力",
  sit_and_reach: "柔韧",
  vital_capacity: "耐力",
};

export function calculateRecordCompleteness(
  recordedItemIds: string[],
  gender: "male" | "female"
): RecordCompleteness {
  const expectedItems = gender === "male" ? [...MALE_ITEMS] : [...FEMALE_ITEMS];
  const recorded = new Set(recordedItemIds);
  const missingItems = expectedItems.filter((id) => !recorded.has(id));
  const recordedCount = recordedItemIds.filter((id) => (expectedItems as readonly string[]).includes(id)).length;

  const availableDimensions = expectedItems
    .filter((id) => recorded.has(id))
    .map((id) => ({ dimension: DIMENSION_MAP[id] ?? "其他", itemId: id }));

  const missingDimensions = expectedItems
    .filter((id) => !recorded.has(id))
    .map((id) => ({ dimension: DIMENSION_MAP[id] ?? "其他", itemId: id }));

  return {
    recordedCount,
    expectedCount: expectedItems.length,
    missingItems,
    completionRate: Math.round((recordedCount / expectedItems.length) * 100),
    isComplete: recordedCount >= expectedItems.length,
    isPartial: recordedCount > 0 && recordedCount < expectedItems.length,
    availableDimensions,
    missingDimensions,
  };
}

// ---- 计算综合评分 ----
export function calculateOverallScore(
  scores: { itemId: FitnessItemId; value: number; grade: string }[]
): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, s) => sum + (getGradeToScore(s.grade)), 0);
  return Math.round(total / scores.length);
}

function getGradeToScore(grade: string): number {
  switch (grade) {
    case "excellent":
      return 95;
    case "good":
      return 85;
    case "pass":
      return 70;
    case "improve":
      return 45;
    default:
      return 70;
  }
}
