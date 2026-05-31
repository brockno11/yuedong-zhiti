// ===== 跃动智体 — 常量定义 =====
import type { FitnessItemDef, GradeTier, SportGoal, SportBase, DiscomfortType } from "./types";

// ---- 体测项目定义 ----
export const FITNESS_ITEMS: FitnessItemDef[] = [
  {
    id: "height_weight",
    name: "身高体重",
    unit: "cm / kg",
    category: "body",
    genderSpecific: false,
    higherIsBetter: false,
    icon: "📏",
    description: "基础身体测量指标，用于计算 BMI",
  },
  {
    id: "vital_capacity",
    name: "肺活量",
    unit: "ml",
    category: "endurance",
    genderSpecific: false,
    higherIsBetter: true,
    icon: "🫁",
    description: "反映肺部功能和有氧耐力基础",
  },
  {
    id: "50m_run",
    name: "50米跑",
    unit: "秒",
    category: "speed",
    genderSpecific: false,
    higherIsBetter: false,
    icon: "⚡",
    description: "反映短距离速度和爆发力",
  },
  {
    id: "standing_long_jump",
    name: "立定跳远",
    unit: "cm",
    category: "strength",
    genderSpecific: false,
    higherIsBetter: true,
    icon: "🦘",
    description: "反映下肢爆发力和协调性",
  },
  {
    id: "sit_and_reach",
    name: "坐位体前屈",
    unit: "cm",
    category: "flexibility",
    genderSpecific: false,
    higherIsBetter: true,
    icon: "🧘",
    description: "反映身体柔韧性",
  },
  {
    id: "pull_up",
    name: "引体向上",
    unit: "次",
    category: "strength",
    genderSpecific: true,
    applicableGender: "male",
    higherIsBetter: true,
    icon: "💪",
    description: "反映上肢力量（男生项目）",
  },
  {
    id: "sit_up",
    name: "仰卧起坐",
    unit: "次/分钟",
    category: "strength",
    genderSpecific: true,
    applicableGender: "female",
    higherIsBetter: true,
    icon: "🔄",
    description: "反映核心力量（女生项目）",
  },
  {
    id: "800m_run",
    name: "800米跑",
    unit: "秒",
    category: "endurance",
    genderSpecific: true,
    applicableGender: "female",
    higherIsBetter: false,
    icon: "🏃‍♀️",
    description: "反映心肺耐力（女生项目）",
  },
  {
    id: "1000m_run",
    name: "1000米跑",
    unit: "秒",
    category: "endurance",
    genderSpecific: true,
    applicableGender: "male",
    higherIsBetter: false,
    icon: "🏃",
    description: "反映心肺耐力（男生项目）",
  },
];

// ---- 体测数据合理范围（参考 data-analyst skill）----
export const PHYSICAL_RANGES: Record<string, { min: number; max: number; unit: string }> = {
  height: { min: 120, max: 210, unit: "cm" },
  weight: { min: 30, max: 120, unit: "kg" },
  vital_capacity: { min: 1000, max: 10000, unit: "ml" },
  "50m_run": { min: 6.0, max: 12.0, unit: "秒" },
  standing_long_jump: { min: 100, max: 280, unit: "cm" },
  sit_and_reach: { min: -10, max: 30, unit: "cm" },
  pull_up: { min: 0, max: 30, unit: "次" },
  sit_up: { min: 0, max: 60, unit: "次/分钟" },
  "1000m_run": { min: 180, max: 420, unit: "秒" },
  "800m_run": { min: 180, max: 360, unit: "秒" },
};

// ---- 等级标准（参考 data-analyst skill）----
export const GRADE_STANDARDS: Record<
  GradeTier,
  { label: string; color: string; minScore: number }
> = {
  excellent: { label: "优秀", color: "hsl(var(--level-excellent))", minScore: 90 },
  good: { label: "良好", color: "hsl(var(--level-good))", minScore: 80 },
  pass: { label: "及格", color: "hsl(var(--level-pass))", minScore: 60 },
  improve: { label: "待提升", color: "hsl(var(--level-improve))", minScore: 0 },
};

// ---- 运动目标选项 ----
export const SPORT_GOAL_OPTIONS: { value: SportGoal; label: string; icon: string }[] = [
  { value: "improve_endurance", label: "提升耐力", icon: "🏃" },
  { value: "build_strength", label: "增强力量", icon: "💪" },
  { value: "lose_weight", label: "控制体重", icon: "⚖️" },
  { value: "improve_flexibility", label: "提高柔韧性", icon: "🧘" },
  { value: "overall_health", label: "全面健康提升", icon: "🌟" },
  { value: "exam_preparation", label: "体测考试准备", icon: "📝" },
];

// ---- 运动基础选项 ----
export const SPORT_BASE_OPTIONS: { value: SportBase; label: string; description: string }[] = [
  { value: "none", label: "较少运动", description: "平时基本不运动" },
  { value: "light", label: "轻度运动", description: "偶尔散步或轻度活动" },
  { value: "moderate", label: "中等运动", description: "每周有2-3次运动习惯" },
  { value: "active", label: "经常运动", description: "每天都有运动习惯" },
];

// ---- 不适选项 ----
export const DISCOMFORT_OPTIONS: { value: DiscomfortType; label: string }[] = [
  { value: "none", label: "无不适" },
  { value: "asthma", label: "运动性哮喘" },
  { value: "heart_concern", label: "心脏方面需注意" },
  { value: "joint_pain", label: "关节不适" },
  { value: "back_pain", label: "腰背不适" },
  { value: "dizziness", label: "易头晕" },
  { value: "other", label: "其他需要说明的情况" },
];

// ---- 恢复状态选项 ----
export const RECOVERY_OPTIONS = [
  { value: "quick" as const, label: "恢复很快", description: "很快就不累了" },
  { value: "normal" as const, label: "恢复正常", description: "休息一会就好了" },
  { value: "slow" as const, label: "恢复较慢", description: "感觉需要较长时间恢复" },
];

// ---- 导航配置 ----
export const STUDENT_NAV_ITEMS = [
  { href: "/dashboard", label: "首页", icon: "Home" },
  { href: "/portrait", label: "画像", icon: "BarChart3" },
  { href: "/ai-guide", label: "AI指导", icon: "Sparkles" },
  { href: "/profile", label: "我的", icon: "User" },
] as const;

// ---- 项目级反馈模板 ----
export interface FeedbackQuestion {
  key: string;
  label: string;
  type: "slider" | "choice" | "boolean";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

export const ITEM_FEEDBACK_CONFIG: Record<string, FeedbackQuestion[]> = {
  // 非运动类：不问疲劳
  vital_capacity: [
    { key: "breathTechnique", label: "本次是否连续完成吹气？", type: "choice", options: [{ value: "continuous", label: "连续完成" }, { value: "interrupted", label: "中断过" }, { value: "retry", label: "多次重试" }] },
    { key: "recentExercise", label: "测试前是否刚进行剧烈运动？", type: "boolean" },
    { key: "breathDifficulty", label: "吹气过程是否感觉憋气或呼吸不顺？", type: "boolean" },
  ],
  sit_and_reach: [
    { key: "warmedUp", label: "测试前是否进行了热身？", type: "boolean" },
    { key: "hamstringTight", label: "腿后侧是否感觉紧张？", type: "choice", options: [{ value: "none", label: "没有" }, { value: "slight", label: "轻微" }, { value: "tight", label: "明显紧张" }] },
    { key: "backDiscomfort", label: "腰背是否有不适？", type: "boolean" },
  ],
  // 运动类：问运动体感
  "50m_run": [
    { key: "startQuality", label: "起跑是否顺畅？", type: "choice", options: [{ value: "smooth", label: "顺畅" }, { value: "ok", label: "一般" }, { value: "slow", label: "反应偏慢" }] },
    { key: "fatigueLevel", label: "冲刺后疲劳程度", type: "slider", min: 1, max: 10 },
    { key: "recoverySpeed", label: "呼吸恢复速度", type: "choice", options: [{ value: "quick", label: "快速恢复" }, { value: "normal", label: "正常" }, { value: "slow", label: "恢复较慢" }] },
    { key: "legSoreness", label: "腿部是否酸胀？", type: "boolean" },
  ],
  standing_long_jump: [
    { key: "takeoffStable", label: "起跳是否稳定？", type: "choice", options: [{ value: "stable", label: "稳定" }, { value: "ok", label: "一般" }, { value: "unstable", label: "不太稳" }] },
    { key: "armCoordination", label: "摆臂配合是否顺畅？", type: "boolean" },
    { key: "landingStable", label: "落地是否稳定？", type: "boolean" },
    { key: "kneeDiscomfort", label: "膝盖或脚踝是否不适？", type: "boolean" },
  ],
  pull_up: [
    { key: "hardestPhase", label: "哪个阶段最吃力？", type: "choice", options: [{ value: "start", label: "启动阶段" }, { value: "middle", label: "中段" }, { value: "lockout", label: "下巴过杠" }] },
    { key: "formBreakdown", label: "动作后半程是否明显变形？", type: "boolean" },
    { key: "shoulderDiscomfort", label: "肩部、腰背是否不适？", type: "boolean" },
    { key: "fatigueLevel", label: "训练后酸痛程度", type: "slider", min: 1, max: 10 },
  ],
  sit_up: [
    { key: "hardestPhase", label: "哪个阶段最吃力？", type: "choice", options: [{ value: "start", label: "前期" }, { value: "middle", label: "中段" }, { value: "end", label: "后期力竭" }] },
    { key: "coreStrength", label: "是否感觉核心力量不足？", type: "boolean" },
    { key: "backDiscomfort", label: "腰背是否不适？", type: "boolean" },
    { key: "fatigueLevel", label: "训练后酸痛程度", type: "slider", min: 1, max: 10 },
  ],
  "1000m_run": [
    { key: "fatigueLevel", label: "跑后疲劳程度", type: "slider", min: 1, max: 10 },
    { key: "recoverySpeed", label: "呼吸恢复速度", type: "choice", options: [{ value: "quick", label: "快速恢复" }, { value: "normal", label: "正常" }, { value: "slow", label: "恢复较慢" }] },
    { key: "paceStable", label: "配速是否稳定？", type: "choice", options: [{ value: "stable", label: "稳定" }, { value: "someDrop", label: "后半程略慢" }, { value: "bigDrop", label: "明显降速" }] },
    { key: "legSoreness", label: "腿部酸痛情况", type: "choice", options: [{ value: "none", label: "无" }, { value: "slight", label: "轻微" }, { value: "moderate", label: "明显" }] },
    { key: "discomfort", label: "是否有胸闷或严重不适？", type: "boolean" },
  ],
  "800m_run": [
    { key: "fatigueLevel", label: "跑后疲劳程度", type: "slider", min: 1, max: 10 },
    { key: "recoverySpeed", label: "呼吸恢复速度", type: "choice", options: [{ value: "quick", label: "快速恢复" }, { value: "normal", label: "正常" }, { value: "slow", label: "恢复较慢" }] },
    { key: "paceStable", label: "配速是否稳定？", type: "choice", options: [{ value: "stable", label: "稳定" }, { value: "someDrop", label: "后半程略慢" }, { value: "bigDrop", label: "明显降速" }] },
    { key: "legSoreness", label: "腿部酸痛情况", type: "choice", options: [{ value: "none", label: "无" }, { value: "slight", label: "轻微" }, { value: "moderate", label: "明显" }] },
    { key: "discomfort", label: "是否有胸闷或严重不适？", type: "boolean" },
  ],
};

export const TEACHER_NAV_ITEMS = [
  { href: "/teacher", label: "总览", icon: "LayoutDashboard" },
  { href: "/teacher/class", label: "班级", icon: "Users" },
  { href: "/teacher/report", label: "报告", icon: "FileText" },
  { href: "/teacher/review", label: "审核", icon: "CheckSquare" },
  { href: "/teacher/profile", label: "我的", icon: "User" },
] as const;
