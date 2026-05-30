// ===== 跃动智体 — Mock AI 报告数据 =====
import type { AIStudentReport, AIClassReport, TeacherReview, ClassSummary } from "../types";

export const mockAIStudentReport: AIStudentReport = {
  id: "AI-S-001",
  studentId: "S001",
  generatedAt: "2025-03-16T08:00:00Z",
  version: 1,
  status: "pending_review",

  fitnessProfile: {
    summary:
      "学生A的整体体质水平处于良好阶段，其中上肢力量表现突出，有氧耐力方面有提升空间。与上学期相比，各项成绩均有进步，展现出积极锻炼的态度和良好的运动潜力。",
    bmiStatus: "19.5，属于正常范围，体重控制良好",
    overallScore: 78,
    overallGrade: "good",
    dimensions: [
      { key: "speed", label: "速度素质", score: 78, grade: "pass", classAverage: 72 },
      { key: "strength", label: "力量素质", score: 80, grade: "good", classAverage: 68 },
      { key: "endurance", label: "耐力素质", score: 72, grade: "pass", classAverage: 66 },
      { key: "flexibility", label: "柔韧素质", score: 78, grade: "pass", classAverage: 72 },
      { key: "body_composition", label: "身体形态", score: 82, grade: "good", classAverage: 74 },
    ],
    strengths: ["引体向上（上肢力量）", "身高体重指标健康"],
    improvements: ["1000米跑（耐力）", "50米跑（速度）"],
  },

  weaknessAnalysis: [
    {
      item: "1000米跑",
      currentLevel: "及格（260秒）",
      possibleCauses: [
        "平时的有氧运动量可能不够充分",
        "跑步节奏和呼吸方法可以进一步优化",
        "学期初体能可能处于恢复期",
      ],
      improvementPotential: "通过规律的中长跑训练，有较大提升空间",
    },
    {
      item: "50米跑",
      currentLevel: "及格（8.1秒）",
      possibleCauses: [
        "起跑反应和爆发力有提升空间",
        "短距离冲刺技术可以优化",
      ],
      improvementPotential: "通过爆发力训练和起跑技巧练习，可以提升0.3-0.5秒",
    },
  ],

  trainingPlan: [
    {
      weekNumber: 1,
      focus: "建立运动习惯，适应训练节奏",
      exercises: [
        {
          name: "慢跑热身",
          description: "以轻松舒适的配速进行慢跑",
          sets: "1组",
          frequency: "每周4次",
          duration: "每次15-20分钟",
          notes: "注意呼吸节奏，感到疲劳可适当放慢",
        },
        {
          name: "跳绳",
          description: "双脚交替或并脚跳，保持中等节奏",
          sets: "3组 × 1分钟",
          frequency: "每周3次",
          duration: "每次约8分钟",
          notes: "穿合适的运动鞋，在平地进行",
        },
        {
          name: "俯卧撑",
          description: "标准俯卧撑或膝盖支撑俯卧撑",
          sets: "3组 × 8-12次",
          frequency: "每周3次",
          duration: "每次约10分钟",
          notes: "保持身体成一直线，避免塌腰",
        },
      ],
      recoveryAdvice: "训练后进行5-10分钟拉伸，保证充足睡眠，运动后适量补充水分",
    },
    {
      weekNumber: 2,
      focus: "逐步增加强度，重点提升耐力",
      exercises: [
        {
          name: "变速跑",
          description: "慢跑2分钟+快跑30秒交替进行",
          sets: "4-5轮",
          frequency: "每周3次",
          duration: "每次约20分钟",
          notes: "快跑不要冲刺，保持比慢跑明显快的速度即可",
        },
        {
          name: "开合跳",
          description: "手脚协调开合跳跃",
          sets: "3组 × 30次",
          frequency: "每周3次",
          duration: "每次约8分钟",
          notes: "注意落地缓冲，保护膝盖",
        },
        {
          name: "仰卧起坐",
          description: "标准仰卧起坐，锻炼核心力量",
          sets: "3组 × 15次",
          frequency: "每周3次",
          duration: "每次约8分钟",
          notes: "不要用手强行拉头部，用腹部发力",
        },
        {
          name: "50米起跑练习",
          description: "练习起跑姿势和加速跑",
          sets: "5组 × 50米",
          frequency: "每周2次",
          duration: "每次约15分钟",
          notes: "在操场跑道上进行，穿运动鞋",
        },
      ],
      recoveryAdvice: "高强度训练后至少休息一天，可以做轻松散步作为主动恢复",
    },
  ],

  safetyReminders: [
    "每次运动前进行5分钟热身（关节活动+轻度有氧）",
    "运动中出现胸痛、严重头晕或呼吸困难，立即停止并告知教师",
    "不要在空腹或刚吃饱时进行剧烈运动",
    "穿着合适的运动鞋和透气服装",
    "训练强度应循序渐进，不要突然大幅增加",
  ],
};

export const mockAIClassReport: AIClassReport = {
  id: "AI-C-001",
  generatedAt: "2025-03-16T10:00:00Z",
  version: 1,
  status: "pending_review",

  overallAnalysis: {
    totalStudents: 20,
    recordedStudents: 20,
    averageScore: 72,
    passRate: 82.5,
    excellentRate: 15,
    summary:
      "初二班级整体体质水平处于良好偏下水平。大部分同学能够达到及格标准，但优秀率偏低。需要在耐力项目和上肢力量方面加强课堂训练。班级内部存在一定分化，约有15%的同学在多个项目上需要重点关注。",
  },

  commonWeaknesses: [
    {
      itemId: "1000m_run",
      itemName: "1000米跑/800米跑",
      passRate: 68,
      affectedStudentCount: 6,
      analysis:
        "耐力项目是班级最突出的薄弱环节。许多同学在日常生活中缺乏持续的有氧运动，导致心肺耐力不足。建议在体育课上增加持续性有氧活动。",
    },
    {
      itemId: "pull_up",
      itemName: "引体向上（男生）",
      passRate: 55,
      affectedStudentCount: 5,
      analysis:
        "上肢力量训练不足是普遍问题。多数男生引体向上成绩偏低，可能与日常缺乏悬垂和拉力训练有关。",
    },
    {
      itemId: "standing_long_jump",
      itemName: "立定跳远",
      passRate: 75,
      affectedStudentCount: 5,
      analysis:
        "下肢爆发力有待加强。起跳技术和落地缓冲动作可以进一步规范。",
    },
  ],

  studentTiers: [
    {
      tier: "A",
      label: "综合优秀",
      count: 3,
      guidance: "这组同学体质基础扎实，可作为课堂小助手带动其他同学。建议给予更具挑战性的训练目标，保持运动积极性。",
    },
    {
      tier: "B",
      label: "良好基础",
      count: 8,
      guidance: "这组同学有一定运动基础，需针对各自弱项进行重点突破。课堂可以安排专项分组练习。",
    },
    {
      tier: "C",
      label: "需要提升",
      count: 6,
      guidance:
        "这组同学在多个项目上处于及格线边缘，需要制定系统的提升计划。建议与家长沟通，鼓励课后增加运动时间。",
    },
    {
      tier: "D",
      label: "重点关注",
      count: 3,
      guidance:
        "这组同学体质基础较弱或存在特殊身体情况，需要个别化指导。建议先降低运动强度，建立信心和习惯，逐步提升。",
    },
  ],

  classTrainingFocus: [
    {
      priority: 1,
      focus: "耐力提升专项",
      suggestedActivities: [
        "每节体育课前10分钟慢跑热身",
        "每周一次中长跑训练课（分组配速）",
        "引入趣味追逐游戏提升跑步积极性",
        "课间操增加跳绳环节",
      ],
      expectedOutcome: "班级耐力项目及格率提升10%以上",
    },
    {
      priority: 2,
      focus: "上肢力量训练",
      suggestedActivities: [
        "利用单杠进行悬垂练习（从静止悬垂开始）",
        "俯卧撑递进训练（从膝盖俯卧撑开始）",
        "弹力带辅助练习",
        "游戏化力量训练（爬行比赛、推小车等）",
      ],
      expectedOutcome: "男生引体向上及格率提升15%",
    },
    {
      priority: 3,
      focus: "柔韧性提升",
      suggestedActivities: [
        "每节课后进行5分钟集体拉伸",
        "坐位体前屈专项练习",
        "引入瑜伽基础动作",
      ],
      expectedOutcome: "班级柔韧性优良率提升",
    },
  ],

  teachingSuggestions: [
    "建议课堂采用分层教学模式，将学生按能力分组进行差异化训练",
    "鼓励学生之间组成锻炼小组，互相监督和激励",
    "每月进行一次班级内部体能小竞赛，提升学生运动积极性",
    "对BMI指标值得关注的学生给予更多鼓励，避免在公开场合对比体重数据",
    "关注学生运动后的恢复情况，对疲劳程度高的学生适当调整强度",
  ],
};

export const mockClassSummary: ClassSummary = {
  totalStudents: 20,
  recordedStudents: 20,
  averageBmi: 20.2,
  passRate: 82.5,
  excellentRate: 15,
  weakItemRanking: [
    { itemName: "引体向上（男）", passRate: 55 },
    { itemName: "1000/800米跑", passRate: 68 },
    { itemName: "立定跳远", passRate: 75 },
    { itemName: "50米跑", passRate: 78 },
    { itemName: "坐位体前屈", passRate: 80 },
    { itemName: "肺活量", passRate: 85 },
  ],
  projectAverages: [
    { itemName: "肺活量", maleAverage: 3200, femaleAverage: 2500, overallAverage: 2800 },
    { itemName: "50米跑", maleAverage: 8.2, femaleAverage: 8.9, overallAverage: 8.5 },
    { itemName: "立定跳远", maleAverage: 190, femaleAverage: 162, overallAverage: 176 },
    { itemName: "坐位体前屈", maleAverage: 10, femaleAverage: 15, overallAverage: 12.5 },
    { itemName: "引体向上/仰卧起坐", maleAverage: 5, femaleAverage: 35, overallAverage: 20 },
    { itemName: "1000/800米跑", maleAverage: 265, femaleAverage: 242, overallAverage: 253 },
  ],
  attentionStudents: [
    { studentId: "S003", name: "学生C", reason: "BMI 指标值得关注，多个项目处于待提升水平，运动后关节不适" },
    { studentId: "S004", name: "学生D", reason: "BMI 指标值得关注，运动基础较弱，运动后偶有头晕" },
    { studentId: "S007", name: "学生G", reason: "有运动性哮喘史，需在运动强度上特殊关注" },
    { studentId: "S009", name: "学生I", reason: "BMI 指标值得关注，引体向上和耐力项目需要重点提升" },
  ],
};

export const mockTeacherReviews: TeacherReview[] = [
  {
    id: "RV-001",
    reportId: "AI-S-001",
    reportType: "student",
    reviewedAt: "",
    reviewerName: "王老师",
    status: "pending",
    teacherNotes: "",
  },
  {
    id: "RV-002",
    reportId: "AI-C-001",
    reportType: "class",
    reviewedAt: "",
    reviewerName: "王老师",
    status: "pending",
    teacherNotes: "",
  },
];
