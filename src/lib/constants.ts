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

// ---- 项目级反馈模板（专项观察表 v2）----
// 所有运动类项目共享"通用运动体感"问题组 + 各项目专项技术问题
export interface FeedbackQuestion {
  key: string;
  label: string;
  type: "slider" | "choice" | "boolean";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  /** 问题分组，前端按组折叠展示 */
  group?: "通用体感" | "专项技术" | "测试配合";
}

// 通用运动体感（所有需跑/跳/力量的体力项目共享）
const COMMON_PHYSICAL_FEEDBACK: FeedbackQuestion[] = [
  {
    key: "trainingPurpose", group: "通用体感",
    label: "本次训练目的",
    type: "choice",
    options: [
      { value: "official_test", label: "正式测试" },
      { value: "technique", label: "技术练习" },
      { value: "speed", label: "速度练习" },
      { value: "strength", label: "力量练习" },
      { value: "endurance", label: "耐力练习" },
      { value: "recovery", label: "恢复性练习" },
    ],
  },
  {
    key: "rpe", group: "通用体感",
    label: "主观用力程度（1=很轻松，10=竭尽全力）",
    type: "slider", min: 1, max: 10,
  },
  {
    key: "recoverySpeed", group: "通用体感",
    label: "运动后恢复速度",
    type: "choice",
    options: [
      { value: "quick", label: "恢复很快" },
      { value: "normal", label: "恢复正常" },
      { value: "slow", label: "恢复较慢" },
    ],
  },
  {
    key: "hasSoreness", group: "通用体感",
    label: "运动后是否出现肌肉酸痛？",
    type: "choice",
    options: [
      { value: "none", label: "无酸痛" },
      { value: "slight", label: "轻微酸痛" },
      { value: "moderate", label: "明显酸痛" },
    ],
  },
  {
    key: "hasDiscomfort", group: "通用体感",
    label: "运动中或运动后是否有身体不适？",
    type: "boolean",
  },
];

export const ITEM_FEEDBACK_CONFIG: Record<string, FeedbackQuestion[]> = {
  // ===== 非运动类：肺活量（测试配合问题）=====
  vital_capacity: [
    {
      key: "trainingPurpose", group: "测试配合",
      label: "本次测试目的",
      type: "choice",
      options: [
        { value: "official_test", label: "正式测试" },
        { value: "technique", label: "吹气技术练习" },
        { value: "endurance", label: "呼吸耐力练习" },
      ],
    },
    { key: "breathTechnique", group: "测试配合", label: "是否连续完成吹气？", type: "choice", options: [{ value: "continuous", label: "连续完成" }, { value: "interrupted", label: "中途换气或中断" }, { value: "retry", label: "多次重试" }] },
    { key: "recentExercise", group: "测试配合", label: "测试前是否刚进行剧烈运动？", type: "boolean" },
    { key: "breathDifficulty", group: "测试配合", label: "吹气过程中是否感觉呼吸不顺？", type: "boolean" },
    { key: "understandTechnique", group: "测试配合", label: "是否理解测试动作要领？", type: "boolean" },
  ],

  // ===== 非运动类：坐位体前屈（专项技术问题）=====
  sit_and_reach: [
    {
      key: "trainingPurpose", group: "通用体感",
      label: "本次测试/训练目的",
      type: "choice",
      options: [
        { value: "official_test", label: "正式测试" },
        { value: "technique", label: "柔韧练习" },
        { value: "recovery", label: "恢复拉伸" },
      ],
    },
    { key: "warmedUp", group: "专项技术", label: "测试前是否进行了热身？", type: "boolean" },
    { key: "hamstringTight", group: "专项技术", label: "腿后侧紧张程度", type: "choice", options: [{ value: "none", label: "不紧张" }, { value: "slight", label: "轻微紧张" }, { value: "tight", label: "明显紧张" }] },
    { key: "backDiscomfort", group: "专项技术", label: "腰背是否有不适？", type: "boolean" },
    { key: "pushSmooth", group: "专项技术", label: "动作是否能平稳前伸（非突然发力）？", type: "boolean" },
    { key: "breathHold", group: "专项技术", label: "是否出现憋气或突然用力？", type: "boolean" },
  ],

  // ===== 50米跑 =====
  "50m_run": [
    ...COMMON_PHYSICAL_FEEDBACK,
    { key: "startQuality", group: "专项技术", label: "起跑是否顺畅？", type: "choice", options: [{ value: "smooth", label: "顺畅" }, { value: "ok", label: "一般" }, { value: "slow", label: "反应偏慢" }] },
    { key: "first20m", group: "专项技术", label: "前20米加速是否有力？", type: "choice", options: [{ value: "strong", label: "有力" }, { value: "ok", label: "一般" }, { value: "weak", label: "不够有力" }] },
    { key: "midPace", group: "专项技术", label: "途中跑节奏是否稳定？", type: "choice", options: [{ value: "stable", label: "稳定" }, { value: "ok", label: "一般" }, { value: "unstable", label: "不太稳" }] },
    { key: "last10m", group: "专项技术", label: "最后10米是否能保持速度？", type: "boolean" },
    { key: "legSoreness", group: "专项技术", label: "腿部是否有酸痛或紧张？", type: "boolean" },
  ],

  // ===== 立定跳远 =====
  standing_long_jump: [
    ...COMMON_PHYSICAL_FEEDBACK,
    { key: "armCoordination", group: "专项技术", label: "摆臂是否协调？", type: "boolean" },
    { key: "takeoffExtend", group: "专项技术", label: "起跳是否充分蹬伸？", type: "choice", options: [{ value: "full", label: "充分蹬伸" }, { value: "ok", label: "一般" }, { value: "insufficient", label: "蹬伸不足" }] },
    { key: "legTuck", group: "专项技术", label: "空中收腿是否自然？", type: "choice", options: [{ value: "natural", label: "自然" }, { value: "ok", label: "一般" }, { value: "stiff", label: "不太自然" }] },
    { key: "landingStable", group: "专项技术", label: "落地是否稳定？", type: "boolean" },
    { key: "kneeDiscomfort", group: "专项技术", label: "膝盖或脚踝是否不适？", type: "boolean" },
  ],

  // ===== 引体向上（男生）=====
  pull_up: [
    ...COMMON_PHYSICAL_FEEDBACK,
    { key: "hardestPhase", group: "专项技术", label: "最吃力阶段？", type: "choice", options: [{ value: "start", label: "启动阶段" }, { value: "middle", label: "中段" }, { value: "lockout", label: "下巴过杠" }] },
    { key: "formBreakdown", group: "专项技术", label: "动作后半程是否明显变形？", type: "boolean" },
    { key: "controlDescent", group: "专项技术", label: "是否能控制下降过程？", type: "boolean" },
    { key: "shoulderDiscomfort", group: "专项技术", label: "肩背是否不适？", type: "boolean" },
    { key: "gripInsufficient", group: "专项技术", label: "握力是否明显不足？", type: "boolean" },
  ],

  // ===== 仰卧起坐（女生）=====
  sit_up: [
    ...COMMON_PHYSICAL_FEEDBACK,
    { key: "paceStable", group: "专项技术", label: "前半程和后半程节奏是否稳定？", type: "choice", options: [{ value: "stable", label: "稳定" }, { value: "someDrop", label: "后程略慢" }, { value: "bigDrop", label: "明显掉速" }] },
    { key: "backDiscomfort", group: "专项技术", label: "是否出现腰背不适？", type: "boolean" },
    { key: "coreStrength", group: "专项技术", label: "是否感觉核心力量不足？", type: "boolean" },
    { key: "momentumHelp", group: "专项技术", label: "是否靠摆动借力明显？", type: "boolean" },
    { key: "last15sDrop", group: "专项技术", label: "最后15秒是否明显掉速？", type: "boolean" },
  ],

  // ===== 1000米跑（男生）=====
  "1000m_run": [
    ...COMMON_PHYSICAL_FEEDBACK,
    { key: "paceStable", group: "专项技术", label: "配速是否稳定？", type: "choice", options: [{ value: "stable", label: "稳定" }, { value: "someDrop", label: "后半程略慢" }, { value: "bigDrop", label: "明显降速" }] },
    { key: "secondHalfDrop", group: "专项技术", label: "后半程是否明显下降？", type: "boolean" },
    { key: "breathRhythm", group: "专项技术", label: "呼吸节奏是否顺畅？", type: "choice", options: [{ value: "smooth", label: "顺畅" }, { value: "ok", label: "一般" }, { value: "labored", label: "吃力" }] },
    { key: "legSoreness", group: "专项技术", label: "腿部酸痛程度", type: "choice", options: [{ value: "none", label: "无" }, { value: "slight", label: "轻微" }, { value: "moderate", label: "明显" }] },
    { key: "chestDiscomfort", group: "专项技术", label: "是否出现胸闷、头晕等明显不适？", type: "boolean" },
  ],

  // ===== 800米跑（女生）=====
  "800m_run": [
    ...COMMON_PHYSICAL_FEEDBACK,
    { key: "paceStable", group: "专项技术", label: "配速是否稳定？", type: "choice", options: [{ value: "stable", label: "稳定" }, { value: "someDrop", label: "后半程略慢" }, { value: "bigDrop", label: "明显降速" }] },
    { key: "secondHalfDrop", group: "专项技术", label: "后半程是否明显下降？", type: "boolean" },
    { key: "breathRhythm", group: "专项技术", label: "呼吸节奏是否顺畅？", type: "choice", options: [{ value: "smooth", label: "顺畅" }, { value: "ok", label: "一般" }, { value: "labored", label: "吃力" }] },
    { key: "legSoreness", group: "专项技术", label: "腿部酸痛程度", type: "choice", options: [{ value: "none", label: "无" }, { value: "slight", label: "轻微" }, { value: "moderate", label: "明显" }] },
    { key: "chestDiscomfort", group: "专项技术", label: "是否出现胸闷、头晕等明显不适？", type: "boolean" },
  ],
};

export const TEACHER_NAV_ITEMS = [
  { href: "/teacher", label: "总览", icon: "LayoutDashboard" },
  { href: "/teacher/class", label: "班级", icon: "Users" },
  { href: "/teacher/report", label: "报告", icon: "FileText" },
  { href: "/teacher/review", label: "审核", icon: "CheckSquare" },
  { href: "/teacher/profile", label: "我的", icon: "User" },
] as const;
