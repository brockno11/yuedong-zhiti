// ===== 跃动智体 — 核心类型定义 =====

// ---- 基础枚举 ----
export type Gender = "male" | "female";

export type GradeLevel = "高一" | "高二" | "高三";

export type FitnessItemId =
  | "height_weight"
  | "vital_capacity"
  | "50m_run"
  | "standing_long_jump"
  | "sit_and_reach"
  | "pull_up" // 男生
  | "sit_up" // 女生
  | "800m_run" // 女生
  | "1000m_run"; // 男生

export type GradeTier = "excellent" | "good" | "pass" | "improve";

export type SportGoal =
  | "improve_endurance"
  | "build_strength"
  | "lose_weight"
  | "improve_flexibility"
  | "overall_health"
  | "exam_preparation";

export type SportBase = "none" | "light" | "moderate" | "active";

export type DiscomfortType =
  | "none"
  | "asthma"
  | "heart_concern"
  | "joint_pain"
  | "back_pain"
  | "dizziness"
  | "other";

// ---- 学生信息 ----
export interface StudentProfile {
  id: string; // S001, S002...
  name: string; // "学生A", "学生B"...
  gender: Gender;
  grade: GradeLevel;
  age: number; // 15-18（高中年龄段）
  height: number; // cm
  weight: number; // kg
  bmi: number; // 计算字段
  sportGoal: SportGoal;
  sportBase: SportBase;
  discomforts: DiscomfortType[];
  createdAt: string;
  updatedAt: string;
}

// ---- 体测项目定义 ----
export interface FitnessItemDef {
  id: FitnessItemId;
  name: string;
  unit: string;
  category: "body" | "speed" | "strength" | "endurance" | "flexibility";
  genderSpecific: boolean;
  applicableGender?: Gender;
  higherIsBetter: boolean;
  icon: string; // emoji icon
  description: string;
}

// ---- 体测批次 ----
export type BatchType = "official" | "makeup" | "daily";
export type BatchStatus = "draft" | "active" | "completed" | "archived";
export type RecordType = "official_test" | "daily_training";

export interface AssessmentBatch {
  id: string;
  name: string;
  academicYear: string;
  semester: string;
  round: number;
  type: BatchType;
  classId: string;
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
  recordCount?: number;
}

// ---- 体测记录 ----
export interface FitnessRecord {
  id: string;
  studentId: string;
  date: string;
  semester: string;
  batchId?: string;
  batchName?: string;
  batchType?: BatchType;
  recordType: RecordType;
  items: FitnessRecordItem[];
  bodyFeeling: BodyFeeling;
}

export interface FitnessRecordItem {
  itemId: FitnessItemId;
  value: number;
  score: number; // 0-100
  grade: GradeTier;
  feedbackJson?: string; // JSON: Record<string, string | number | boolean>
}

// ---- 项目级反馈 ----
export interface ItemFeedback {
  itemId: string;
  answers: Record<string, string | number | boolean>;
}

// ---- 运动后体感 ----
export interface BodyFeeling {
  fatigueLevel: number; // 1-10
  recoveryStatus: "quick" | "normal" | "slow";
  hasSoreness: boolean;
  sorenessAreas: string[];
  hasDiscomfort: boolean;
  discomfortNotes: string;
}

// ---- 体质画像维度 ----
export interface FitnessDimension {
  key: string;  // "speed" | "strength" | "endurance" | "flexibility" | "body_composition" | "explosive_power" | "muscle_strength" | "cardiorespiratory"
  label: string;
  score: number; // 0-100
  grade: GradeTier;
  classAverage: number;
  // 扩展字段（batch_report 全维度报告使用）
  relatedItems?: string[];   // 关联项目中文名
  analysis?: string;         // 维度分析说明
  suggestion?: string;       // 提升方向
}

// ---- AI 学生报告 ----
export interface AIStudentReport {
  id: string;
  studentId: string;
  generatedAt: string;
  version: number;
  status: "draft" | "pending_review" | "approved" | "rejected";
  reportType?: "item_report" | "record_report" | "batch_report";

  fitnessProfile: {
    summary: string;
    bmiStatus: string;
    overallScore: number;
    overallGrade: GradeTier;
    dimensions: FitnessDimension[];
    strengths: string[];
    improvements: string[];
  };

  weaknessAnalysis: {
    item: string;
    currentLevel: string;
    possibleCauses: string[];
    improvementPotential: string;
    priority?: "high" | "medium";
    relatedDimensions?: string[];
  }[];

  trainingPlan: {
    weekNumber: number;
    focus: string;
    exercises: {
      name: string;
      description: string;
      sets: string;
      frequency: string;
      duration: string;
      notes: string;
    }[];
    recoveryAdvice: string;
  }[];

  safetyReminders: string[];

  // ---- 扩展字段（batch_report 全维度报告）----
  // 逐项分析：每个正式体测项目的成绩详情
  itemScores?: {
    itemId: FitnessItemId;
    itemName: string;
    valueText: string;       // "6.0秒" / "185cm"
    score: number;
    grade: GradeTier;
    statusLabel: string;     // "优势项" | "稳定项" | "需关注项"
    analysis: string;
    suggestion: string;
  }[];

  // 项目关系分析
  relationshipAnalysis?: {
    title: string;
    relatedItems: string[];  // 中文项目名
    analysis: string;
    suggestion: string;
  }[];

  // 优势项目深度分析
  strengthsAnalysis?: {
    item: string;
    reason: string;
    foundationFor: string;
  }[];

  // 阶段训练方案（替代简单周结构）
  stageTrainingPlan?: {
    stage: string;           // "第1阶段：适应与动作质量"
    goal: string;
    duration: string;        // "2-3周"
    focus: string;
    exercises: {
      name: string;
      description: string;
      sets: string;
      frequency: string;
      duration: string;
      notes: string;
    }[];
    recoveryAdvice: string;
  }[];

  // 教学参考
  teachingSuggestions?: {
    scenario: string;        // "课堂教学" / "分层指导" / "练习形式"
    suggestion: string;
    observationPoint?: string;
  }[];
}

// ---- AI 班级报告 ----
export interface AIClassReport {
  id: string;
  generatedAt: string;
  version: number;
  status: "draft" | "pending_review" | "approved" | "rejected";

  overallAnalysis: {
    totalStudents: number;
    recordedStudents: number;
    averageScore: number;
    passRate: number;
    excellentRate: number;
    summary: string;
  };

  commonWeaknesses: {
    itemId: FitnessItemId;
    itemName: string;
    passRate: number;
    affectedStudentCount: number;
    analysis: string;
  }[];

  studentTiers: {
    tier: "A" | "B" | "C" | "D";
    label: string;
    count: number;
    guidance: string;
  }[];

  classTrainingFocus: {
    priority: number;
    focus: string;
    suggestedActivities: string[];
    expectedOutcome: string;
  }[];

  teachingSuggestions: string[];
}

// ---- 教师审核 ----
export interface TeacherReview {
  id: string;
  reportId: string;
  reportType: "student" | "class";
  reviewedAt: string;
  reviewerName: string;
  status: "pending" | "approved" | "modified" | "rejected";
  teacherNotes: string;
  modifications?: {
    section: string;
    original: string;
    modified: string;
    reason: string;
  }[];
}

// ---- 班级概述 ----
export interface ClassSummary {
  totalStudents: number;
  recordedStudents: number;
  averageBmi: number;
  passRate: number;
  excellentRate: number;
  weakItemRanking: {
    itemName: string;
    passRate: number;
  }[];
  projectAverages: {
    itemName: string;
    maleAverage: number;
    femaleAverage: number;
    overallAverage: number;
  }[];
  attentionStudents: {
    studentId: string;
    name: string;
    reason: string;
  }[];
}

// ---- 图表数据类型 ----
export interface RadarChartDataPoint {
  dimension: string;
  score: number | null;  // null = 暂无数据
  classAverage: number;
  fullMark: number;
}

export interface TrendChartDataPoint {
  date: string;
  value: number;
  grade: string;
}

export interface BarChartDataPoint {
  itemName: string;
  passRate: number;
  excellentRate: number;
}

export interface DonutChartSegment {
  grade: GradeTier;
  label: string;
  count: number;
  percentage: number;
}

// ---- 引导步骤数据 ----
export interface OnboardingData {
  grade: GradeLevel | null;
  gender: Gender | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  sportGoal: SportGoal | null;
  sportBase: SportBase | null;
  discomforts: DiscomfortType[];
}
