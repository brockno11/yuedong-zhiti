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
    "每次训练后进行5-10分钟拉伸放松",
  ],

  // ---- 扩展字段（batch_report 全维度报告）----
  itemScores: [
    { itemId: "vital_capacity", itemName: "肺活量", valueText: "3200ml", score: 78, grade: "pass", statusLabel: "稳定项", analysis: "肺活量处于及格偏上水平，有一定提升空间。与心肺耐力直接相关，建议通过有氧训练逐步提升。", suggestion: "每周安排2-3次有氧训练，如慢跑、游泳等" },
    { itemId: "50m_run", itemName: "50米跑", valueText: "8.1秒", score: 70, grade: "pass", statusLabel: "需关注项", analysis: "短距离速度表现偏弱，起跑反应和爆发力有待提高。与下肢力量、核心稳定性均有关系。", suggestion: "增加起跑练习和下肢爆发力训练，每周2次短距离冲刺" },
    { itemId: "standing_long_jump", itemName: "立定跳远", valueText: "210cm", score: 82, grade: "good", statusLabel: "优势项", analysis: "下肢爆发力表现良好，起跳技术和落地稳定性较好。这是速度类项目的重要基础。", suggestion: "继续保持，可结合深蹲和跳跃练习进一步提升" },
    { itemId: "sit_and_reach", itemName: "坐位体前屈", valueText: "12cm", score: 78, grade: "pass", statusLabel: "稳定项", analysis: "柔韧性处于中等水平。良好的柔韧性有助于跑步步幅、动作舒展和损伤预防。", suggestion: "每次训练后增加5-10分钟拉伸，特别是腿后侧和腰背" },
    { itemId: "pull_up", itemName: "引体向上", valueText: "8次", score: 85, grade: "good", statusLabel: "优势项", analysis: "上肢力量表现良好，肩背力量基础扎实。可作为其他力量训练的基础支撑。", suggestion: "保持引体向上练习，可尝试增加负重或变式训练" },
    { itemId: "1000m_run", itemName: "1000米跑", valueText: "260秒", score: 68, grade: "pass", statusLabel: "需关注项", analysis: "中长跑成绩偏低，心肺耐力是目前的主要短板。配速在后半程明显下降，说明有氧基础需要加强。", suggestion: "重点突破：每周3次有氧训练，从慢跑开始逐步增加距离和强度" },
  ],

  relationshipAnalysis: [
    { title: "速度与爆发力的协同关系", relatedItems: ["50米跑", "立定跳远"], analysis: "50米跑和立定跳远都依赖下肢爆发力和核心稳定性。立定跳远的良好基础（82分）说明下肢力量较好，但50米跑（70分）没有充分体现这一优势，可能与起跑技术和协调性有关。", suggestion: "在爆发力训练中融入起跑反应练习，将力量优势转化为速度表现" },
    { title: "心肺耐力的综合支撑", relatedItems: ["肺活量", "1000米跑"], analysis: "肺活量（78分）和1000米跑（68分）都处于及格水平，表明心肺耐力整体偏弱。肺活量是耐力表现的基础，两者之间存在直接关联。", suggestion: "优先建立有氧基础，从低强度长时间慢跑开始，逐步过渡到间歇训练" },
    { title: "柔韧性与跑步效率", relatedItems: ["坐位体前屈", "50米跑", "1000米跑"], analysis: "坐位体前屈（78分）处于中等水平。柔韧性不足可能影响跑步时的步幅和动作效率，特别是中长跑后半程动作容易变形。", suggestion: "将柔韧训练融入每次训练的热身和放松环节，重点拉伸腿后侧和髋部" },
  ],

  strengthsAnalysis: [
    { item: "立定跳远（82分）", reason: "下肢爆发力和协调性表现良好，是整体体能的一个亮点项目", foundationFor: "可作为50米跑和1000米跑训练的基础，良好的下肢力量有助于提升速度耐力" },
    { item: "引体向上（85分）", reason: "上肢和背部力量扎实，核心稳定性较好", foundationFor: "可在综合训练中发挥上肢力量优势，带动其他力量类项目" },
  ],

  stageTrainingPlan: [
    {
      stage: "第1阶段：适应与动作质量",
      goal: "建立规律训练习惯，提升动作质量，打好有氧基础",
      duration: "2-3周",
      focus: "低强度、高频率，以动作学习和心肺适应为主",
      exercises: [
        { name: "慢跑热身", description: "以轻松配速慢跑，关注呼吸节奏", sets: "1组", frequency: "每周4次", duration: "每次15-20分钟", notes: "心率控制在轻松对话的水平" },
        { name: "基础力量训练", description: "俯卧撑+深蹲+平板支撑", sets: "3组 × 10-12次", frequency: "每周3次", duration: "每次约15分钟", notes: "动作标准优先于数量" },
        { name: "柔韧训练", description: "全身静态拉伸+腿后侧动态拉伸", sets: "1组", frequency: "每次训练后", duration: "5-10分钟", notes: "不要弹振，保持每个拉伸15-30秒" },
      ],
      recoveryAdvice: "训练后充分拉伸，保证充足睡眠，可进行轻度散步作为主动恢复",
    },
    {
      stage: "第2阶段：能力强化",
      goal: "提升心肺耐力和专项能力，逐步增加训练强度和量",
      duration: "3-4周",
      focus: "以中长跑耐力提升为主，兼顾速度和力量",
      exercises: [
        { name: "变速跑", description: "慢跑2分钟+快跑30秒交替", sets: "5-6轮", frequency: "每周3次", duration: "每次约25分钟", notes: "快跑阶段保持80%用力，不要全力冲刺" },
        { name: "起跑与冲刺练习", description: "练习起跑姿势、加速跑、途中跑技术", sets: "5组 × 50米", frequency: "每周2次", duration: "每次约15分钟", notes: "在跑道上进行，穿运动鞋" },
        { name: "引体向上训练", description: "标准引体向上+弹力带辅助", sets: "4组 × 6-8次", frequency: "每周2次", duration: "每次约10分钟", notes: "每组做到力竭前1-2次停止" },
        { name: "核心力量", description: "仰卧起坐+平板支撑+侧平板", sets: "3组 × 15次/30秒", frequency: "每周3次", duration: "每次约10分钟", notes: "核心收紧，呼吸均匀" },
      ],
      recoveryAdvice: "高强度训练日之间至少间隔一天，可用散步或轻度拉伸作为主动恢复",
    },
    {
      stage: "第3阶段：综合巩固",
      goal: "综合提升各项能力，模拟体测场景，巩固训练成果",
      duration: "2-3周",
      focus: "全面巩固，关注弱项突破和整体协调",
      exercises: [
        { name: "间歇跑", description: "400米×4组，组间慢走2分钟", sets: "4组", frequency: "每周2次", duration: "每次约25分钟", notes: "每组保持稳定配速，目标是逐步缩短用时" },
        { name: "循环力量训练", description: "俯卧撑→深蹲跳→引体向上→仰卧起坐→平板支撑", sets: "3轮", frequency: "每周2次", duration: "每次约20分钟", notes: "动作间休息30秒，轮间休息2分钟" },
        { name: "完整拉伸", description: "全身柔韧训练，重点腿后侧、髋部、肩背", sets: "1组", frequency: "每次训练后", duration: "10-15分钟", notes: "结合呼吸，深度拉伸" },
      ],
      recoveryAdvice: "本阶段训练强度较高，务必保证充足睡眠和营养，感觉疲劳可适当降低强度",
    },
  ],

  teachingSuggestions: [
    { scenario: "课堂教学", suggestion: "该生在有氧耐力方面需要重点关注。体育课上可安排中长跑训练时的分组配速，让该生从较慢组开始逐步建立信心和节奏感。", observationPoint: "观察跑步后半程动作是否明显变形，呼吸节奏是否稳定" },
    { scenario: "分层指导", suggestion: "该生上肢力量（引体向上85分）是班级中的优势项，可作为小组力量训练的示范者，带动其他同学训练积极性。", observationPoint: "关注动作规范性，避免追求数量导致代偿" },
    { scenario: "练习形式", suggestion: "建议在课堂中引入间歇跑和趣味追逐游戏，提高该生对耐力训练的兴趣。可结合跳绳、障碍跑等形式增加趣味性。", observationPoint: "注意强度递进，不要一次性增加过多训练量" },
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
      "高二(1)班整体体质水平处于良好偏下水平。大部分同学能够达到及格标准，但优秀率偏低。需要在耐力项目和上肢力量方面加强课堂训练。班级内部存在一定分化，约有15%的同学在多个项目上需要重点关注。",
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
    reviewerName: "张老师",
    status: "pending",
    teacherNotes: "",
  },
  {
    id: "RV-002",
    reportId: "AI-C-001",
    reportType: "class",
    reviewedAt: "",
    reviewerName: "张老师",
    status: "pending",
    teacherNotes: "",
  },
];

// ===== Female Student Mock =====

export const mockFemaleAIStudentReport: AIStudentReport = {
  id: "AI-S-002-female",
  studentId: "S002",
  generatedAt: "2025-03-16T08:30:00Z",
  version: 1,
  status: "pending_review",
  reportType: "batch_report",

  fitnessProfile: {
    summary:
      "学生B的整体体质水平处于良好阶段，柔韧性和核心力量表现突出，心肺耐力方面有提升空间。与上学期相比，各项成绩均有进步，展现出坚持锻炼的良好习惯和运动潜力。",
    bmiStatus: "20.8，属于正常范围，体重控制良好",
    overallScore: 80,
    overallGrade: "good",
    dimensions: [
      { key: "speed", label: "速度素质", score: 82, grade: "good", classAverage: 72 },
      { key: "strength", label: "力量素质", score: 80, grade: "good", classAverage: 68 },
      { key: "endurance", label: "耐力素质", score: 70, grade: "pass", classAverage: 66 },
      { key: "flexibility", label: "柔韧素质", score: 88, grade: "excellent", classAverage: 72 },
      { key: "body_composition", label: "身体形态", score: 85, grade: "good", classAverage: 74 },
    ],
    strengths: ["坐位体前屈（柔韧性）", "仰卧起坐（核心力量）"],
    improvements: ["800米跑（耐力）", "50米跑（速度）"],
  },

  weaknessAnalysis: [
    {
      item: "800米跑",
      currentLevel: "及格（252秒）",
      possibleCauses: [
        "有氧运动量可能不够充分",
        "配速策略和呼吸节奏可以优化",
        "后半程容易出现动作变形",
      ],
      improvementPotential: "通过规律的中长跑训练和配速练习，有较大提升空间",
      priority: "high",
      relatedDimensions: ["心肺耐力"],
    },
    {
      item: "50米跑",
      currentLevel: "良好（8.6秒）",
      possibleCauses: [
        "起跑反应可以进一步提升",
        "步频和步幅有优化空间",
      ],
      improvementPotential: "通过爆发力训练和起跑技术练习，可以提升0.2-0.4秒",
      priority: "medium",
      relatedDimensions: ["速度能力", "爆发力"],
    },
  ],

  trainingPlan: [
    {
      weekNumber: 1,
      focus: "建立运动节奏，提升有氧基础",
      exercises: [
        {
          name: "慢跑热身",
          description: "以轻松舒适的配速进行慢跑",
          sets: "1组",
          frequency: "每周4次",
          duration: "每次15-20分钟",
          notes: "保持呼吸均匀，可边跑边简单对话",
        },
        {
          name: "跳绳",
          description: "双脚交替或并脚跳",
          sets: "3组 × 1分钟",
          frequency: "每周3次",
          duration: "每次约8分钟",
          notes: "穿合适的运动鞋，在平地进行",
        },
        {
          name: "仰卧起坐",
          description: "标准仰卧起坐，锻炼核心力量",
          sets: "3组 × 20次",
          frequency: "每周3次",
          duration: "每次约10分钟",
          notes: "不要用手拉头部，用腹部发力",
        },
      ],
      recoveryAdvice: "训练后进行5-10分钟拉伸，保证充足睡眠",
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
          notes: "快跑阶段保持80%用力，不要全力冲刺",
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
          name: "50米起跑练习",
          description: "练习起跑姿势和加速跑",
          sets: "5组 × 50米",
          frequency: "每周2次",
          duration: "每次约15分钟",
          notes: "在操场跑道上进行，穿运动鞋",
        },
      ],
      recoveryAdvice: "高强度训练后至少休息一天，可做轻松散步",
    },
  ],

  safetyReminders: [
    "每次运动前进行5分钟热身（关节活动+轻度有氧）",
    "运动中出现胸痛、严重头晕或呼吸困难，立即停止并告知教师",
    "不要在空腹或刚吃饱时进行剧烈运动",
    "穿着合适的运动鞋和透气服装",
    "训练强度应循序渐进，不要突然大幅增加",
    "每次训练后进行5-10分钟拉伸放松",
  ],

  // batch_report 全维度扩展
  itemScores: [
    { itemId: "vital_capacity", itemName: "肺活量", valueText: "2600ml", score: 75, grade: "pass", statusLabel: "稳定项", analysis: "肺活量处于中等水平，与同龄女生相比有一定提升空间。与心肺耐力直接相关。", suggestion: "每周安排2-3次有氧训练，如慢跑、跳绳等" },
    { itemId: "50m_run", itemName: "50米跑", valueText: "8.6秒", score: 82, grade: "good", statusLabel: "稳定项", analysis: "短距离速度表现良好，起跑反应和加速能力较好。", suggestion: "继续保持并尝试起跑技术优化，争取突破8.3秒" },
    { itemId: "standing_long_jump", itemName: "立定跳远", valueText: "170cm", score: 80, grade: "good", statusLabel: "稳定项", analysis: "下肢爆发力表现良好，起跳技术和落地稳定性较好。", suggestion: "结合深蹲和跳跃练习进一步提升" },
    { itemId: "sit_and_reach", itemName: "坐位体前屈", valueText: "19cm", score: 88, grade: "excellent", statusLabel: "优势项", analysis: "柔韧性表现优秀，这有助于跑步步幅、动作舒展和损伤预防。", suggestion: "保持柔韧训练，可在训练后增加动态拉伸" },
    { itemId: "sit_up", itemName: "仰卧起坐", valueText: "42次", score: 85, grade: "good", statusLabel: "优势项", analysis: "核心力量扎实，仰卧起坐表现稳定。核心稳定对其他跑跳项目有重要支撑作用。", suggestion: "保持仰卧起坐练习，可尝试增加变式训练如交替卷腹" },
    { itemId: "800m_run", itemName: "800米跑", valueText: "252秒", score: 65, grade: "pass", statusLabel: "需关注项", analysis: "中长跑成绩偏低，心肺耐力是目前的主要短板。后半程配速下降明显。", suggestion: "重点突破：每周3次有氧训练，从慢跑开始逐步增加距离和强度" },
  ],

  relationshipAnalysis: [
    { title: "核心力量与跑跳项目的关系", relatedItems: ["仰卧起坐", "50米跑", "立定跳远"], analysis: "仰卧起坐（85分）体现的良好核心力量为跑跳项目提供了稳定的力量基础。核心稳定有助于跑步时的身体控制和跳跃时的空中姿态。", suggestion: "将核心训练与跑跳训练结合，在疲劳状态下关注核心是否仍能保持稳定" },
    { title: "柔韧性与运动效率", relatedItems: ["坐位体前屈", "50米跑", "800米跑"], analysis: "坐位体前屈（88分）的优秀柔韧性是跑步项目的重要优势。良好的腿后侧柔韧有助于增大步幅、减少能量损耗和预防拉伤。", suggestion: "在速度训练和耐力训练中发挥柔韧优势，注意跑步时充分送髋" },
    { title: "心肺耐力的短板效应", relatedItems: ["肺活量", "800米跑"], analysis: "肺活量（75分）和800米跑（65分）说明心肺耐力是整体体质的短板。虽然有氧基础尚可，但中长跑的配速和耐力表现明显不足。", suggestion: "建立系统有氧训练计划，从低强度长时间开始逐步过渡到间歇训练" },
  ],

  strengthsAnalysis: [
    { item: "坐位体前屈（88分）", reason: "柔韧性基础扎实，髋关节和脊柱活动度好", foundationFor: "可作为跑步训练的技术优势，帮助增大步幅和优化跑姿" },
    { item: "仰卧起坐（85分）", reason: "核心肌群力量和耐力表现稳定", foundationFor: "可在综合训练中发挥核心优势，辅助提升跑跳项目表现" },
  ],

  stageTrainingPlan: [
    {
      stage: "第1阶段：适应与动作质量",
      goal: "建立规律训练习惯，提升有氧基础，优化跑步技术",
      duration: "2-3周",
      focus: "低强度有氧为主，动作学习和心肺适应",
      exercises: [
        { name: "慢跑热身", description: "以轻松配速慢跑，关注呼吸节奏和跑姿", sets: "1组", frequency: "每周4次", duration: "每次15-20分钟", notes: "心率控制在轻松对话的水平" },
        { name: "核心力量训练", description: "仰卧起坐+平板支撑+臀桥", sets: "3组 × 15-20次", frequency: "每周3次", duration: "每次约15分钟", notes: "动作标准优先于数量和速度" },
        { name: "柔韧训练", description: "全身静态拉伸+腿后侧动态拉伸", sets: "1组", frequency: "每次训练后", duration: "5-10分钟", notes: "发挥柔韧优势，保持每个拉伸15-30秒" },
      ],
      recoveryAdvice: "训练后充分拉伸，保证充足睡眠，可进行轻度散步作为主动恢复",
    },
    {
      stage: "第2阶段：能力强化",
      goal: "提升心肺耐力和速度能力，逐步增加训练强度",
      duration: "3-4周",
      focus: "以中长跑耐力提升为主，兼顾速度和核心力量",
      exercises: [
        { name: "变速跑", description: "慢跑2分钟+快跑30秒交替", sets: "5-6轮", frequency: "每周3次", duration: "每次约25分钟", notes: "快跑阶段保持80%用力" },
        { name: "间歇跳绳", description: "快跳1分钟+慢跳30秒交替", sets: "5组", frequency: "每周2次", duration: "每次约10分钟", notes: "保持稳定节奏，关注呼吸" },
        { name: "起跑与加速练习", description: "练习起跑姿势、加速跑、途中跑", sets: "5组 × 50米", frequency: "每周2次", duration: "每次约15分钟", notes: "在跑道上进行，穿运动鞋" },
        { name: "核心强化", description: "仰卧起坐变式+平板支撑+侧平板+俄罗斯转体", sets: "3组 × 20次/30秒", frequency: "每周3次", duration: "每次约12分钟", notes: "核心收紧，呼吸均匀" },
      ],
      recoveryAdvice: "高强度训练日之间至少间隔一天，可用散步或轻度拉伸作为主动恢复",
    },
    {
      stage: "第3阶段：综合巩固",
      goal: "综合提升各项能力，模拟体测场景，巩固训练成果",
      duration: "2-3周",
      focus: "全面巩固，关注耐力突破和整体协调",
      exercises: [
        { name: "间歇跑", description: "400米×4组，组间慢走2分钟", sets: "4组", frequency: "每周2次", duration: "每次约25分钟", notes: "每组保持稳定配速，目标是逐步缩短用时" },
        { name: "循环训练", description: "仰卧起坐→深蹲跳→平板支撑→开合跳→拉伸", sets: "3轮", frequency: "每周2次", duration: "每次约20分钟", notes: "动作间休息30秒，轮间休息2分钟" },
        { name: "完整拉伸", description: "全身柔韧训练，重点腿后侧、髋部、核心", sets: "1组", frequency: "每次训练后", duration: "10-15分钟", notes: "结合呼吸，深度拉伸" },
      ],
      recoveryAdvice: "本阶段训练强度较高，务必保证充足睡眠和营养",
    },
  ],

  teachingSuggestions: [
    { scenario: "课堂教学", suggestion: "该生柔韧性优秀，可在课堂拉伸环节担任示范者。耐力训练时可以较慢配速组开始，逐步建立信心。", observationPoint: "观察跑步后半程动作是否变形，呼吸节奏是否稳定" },
    { scenario: "分层指导", suggestion: "该生核心力量（仰卧起坐）和柔韧性（坐位体前屈）是班级中的优势项，可作为小组训练的小助手。", observationPoint: "关注动作规范性，避免因柔韧好而过度拉伸" },
    { scenario: "练习形式", suggestion: "建议引入趣味追逐游戏和间歇跳绳，提高该生对耐力训练的兴趣和坚持度。", observationPoint: "注意强度递进，不要一次性增加过多训练量" },
  ],
};

// ===== Deep Item Report Mock (50米跑专项) =====

export const mockDeepItemReport: AIStudentReport = {
  id: "AI-S-001-item-50m",
  studentId: "S001",
  generatedAt: "2025-03-16T09:00:00Z",
  version: 1,
  status: "pending_review",
  reportType: "item_report",

  fitnessProfile: {
    summary:
      "学生A的50米跑成绩为8.1秒，处于及格偏上水平。正式体测数据显示起跑反应和途中跑加速能力有提升空间。日常训练方面，近30天有4次50米相关训练记录，训练频率适中但强度偏保守。综合来看，短距离速度是可提升的重点项目，下肢爆发力和起跑技术是两个关键突破口。",
    bmiStatus: "",
    overallScore: 70,
    overallGrade: "pass",
    dimensions: [],
    strengths: ["日常训练保持一定频率"],
    improvements: ["起跑反应", "加速能力", "步频步幅"],
  },

  weaknessAnalysis: [
    {
      item: "正式体测表现",
      currentLevel: "8.1秒 / 70分 / 及格",
      possibleCauses: [
        "本次50米跑成绩处于及格偏上水平，与国家标准相比还有较大提升空间",
        "与上学期相比有0.2秒的进步，说明持续训练已产生正面效果",
        "起跑阶段反应时间偏长，前10米加速不够迅猛",
      ],
      improvementPotential: "通过针对性起跑训练和下肢爆发力练习，有望在下次体测中提升至7.8秒以内",
      priority: "high",
    },
    {
      item: "日常训练观察",
      currentLevel: "近30天4次训练 / 最近训练：2025-03-14",
      possibleCauses: [
        "训练频率稳定（每周约1次），但单次训练量偏少",
        "最近训练后体感疲劳评分4/10，恢复良好，可适当增加强度",
        "近3次训练成绩有轻微波动（8.3→8.1→8.2），说明仍处于动作调整期",
      ],
      improvementPotential: "建议将训练频率提升至每周2次，每次增加2-3组起跑专项练习",
      priority: "medium",
    },
  ],

  // Deep item analysis
  itemDeepAnalysis: {
    abilityBreakdown: [
      { ability: "起跑反应", description: "听到信号到开始发力的神经肌肉反应速度，决定前10米的领先优势", currentLevel: "中等偏下，反应时间约0.25-0.30秒", improvement: "练习起跑姿势和反应训练，使用口令或声音信号进行模拟起跑" },
      { ability: "加速能力", description: "从静止到最大速度的过渡阶段，依赖下肢爆发力和步频提升", currentLevel: "中等，前20米用时偏长", improvement: "进行10-30米短距离加速跑，着重前几步的发力效率" },
      { ability: "步频步幅", description: "步频（每秒步数）和步幅（每步距离）的乘积决定速度", currentLevel: "步频偏慢，步幅尚可", improvement: "通过高抬腿、小步跑等练习提升步频，同时保持步幅" },
      { ability: "下肢爆发力", description: "腿部肌肉快速产生力量的能力，是短跑的核心动力来源", currentLevel: "中等（立定跳远210cm可作为参考）", improvement: "增加深蹲跳、箱式跳跃、箭步蹲跳等爆发力训练" },
      { ability: "核心稳定", description: "跑步时躯干的稳定性影响力量传递效率和动作经济性", currentLevel: "良好（引体向上85分反映一定核心基础）", improvement: "保持核心训练，特别注意跑步时的躯干姿态控制" },
      { ability: "冲刺技术", description: "包括摆臂、身体前倾角度、落地方式等跑步技术要素", currentLevel: "有待改善，摆臂幅度偏小", improvement: "进行摆臂专项练习和跑步技术录像分析" },
    ],
    influencingFactors: [
      { factor: "动作质量", status: "起跑姿势和摆臂技术有待规范，跑步时上肢和下肢的协调性有提升空间", suggestion: "每次训练前进行10分钟跑步技术分解练习（摆臂、高抬腿、后蹬跑）" },
      { factor: "力量", status: "下肢基础力量尚可（立定跳远82分），但快速力量（爆发力）与速度的转化效率不足", suggestion: "在力量训练中加入更多爆发性动作，如跳箱、药球抛掷、快速深蹲" },
      { factor: "柔韧", status: "腿后侧柔韧性（坐位体前屈78分）处于中等水平，可能限制步幅的进一步提升", suggestion: "每次训练后重点拉伸腿后侧、髋屈肌和小腿，改善关节活动范围" },
      { factor: "恢复", status: "近期训练后疲劳感适中（4-5/10），恢复良好，说明当前负荷可适度增加", suggestion: "在现有基础上每周增加1次速度训练，但两次高强度训练之间至少间隔48小时" },
    ],
    relatedItems: [
      { itemName: "立定跳远", relationship: "立定跳远（82分）反映的下肢爆发力是50米跑起跑和加速阶段的直接动力来源，两者共享下肢爆发力基础" },
      { itemName: "坐位体前屈", relationship: "良好的柔韧性有助于增大短跑时的步幅和减少肌肉拉伤风险，柔韧性的提升可能直接改善短跑表现" },
      { itemName: "引体向上", relationship: "引体向上（85分）体现的上肢和背部力量有助于跑步时有力的摆臂，摆臂效率直接影响步频和速度" },
    ],
    progressiveGoals: [
      { stage: "短期保持", target: "巩固现有8.1秒的水平，改善起跑姿势和摆臂技术，将训练频率稳定在每周2次", timeline: "1-2周", actions: ["每周2次50米专项训练", "每次训练包含5组起跑练习+3组加速跑", "每次训练后进行腿后侧拉伸"] },
      { stage: "中期提升", target: "提升至7.8-7.9秒，进入良好等级，重点突破起跑反应和加速能力", timeline: "3-6周", actions: ["增加爆发力训练（跳箱、深蹲跳）每周1-2次", "进行计时50米跑，记录分段用时", "与同学进行趣味竞速提高训练积极性"] },
      { stage: "长期巩固", target: "稳定在7.5秒以内，进入优秀等级，建立全面的速度素质基础", timeline: "6-12周", actions: ["参与更多速度类运动（篮球、足球等）", "保持每周1次速度维持训练", "定期录像分析跑姿并持续优化"] },
    ],
  },

  trainingPlan: [
    {
      weekNumber: 1,
      focus: "起跑技术与爆发力基础",
      exercises: [
        {
          name: "起跑姿势练习",
          description: "练习蹲踞式起跑姿势和反应启动",
          sets: "5组 × 10米",
          frequency: "每周2次",
          duration: "每次约10分钟",
          notes: "关注前几步的发力效率，用口令或拍手信号训练反应",
        },
        {
          name: "加速跑",
          description: "从静止加速到最大速度的短距离冲刺",
          sets: "4组 × 30米",
          frequency: "每周2次",
          duration: "每次约12分钟",
          notes: "每组之间充分休息（2-3分钟），保证每组质量",
        },
        {
          name: "深蹲跳",
          description: "双腿深蹲后快速向上跳起，落地缓冲后立即下一次",
          sets: "3组 × 10次",
          frequency: "每周2次",
          duration: "每次约8分钟",
          notes: "注意落地缓冲，保护膝盖",
        },
      ],
      recoveryAdvice: "速度训练后必须充分休息，两次速度训练之间至少间隔48小时",
    },
    {
      weekNumber: 2,
      focus: "步频提升与加速衔接",
      exercises: [
        {
          name: "高抬腿跑",
          description: "原地或行进间快速高抬腿，强调频率而非高度",
          sets: "4组 × 15秒",
          frequency: "每周2次",
          duration: "每次约8分钟",
          notes: "保持上身稳定，大腿抬至水平即可",
        },
        {
          name: "50米计时跑",
          description: "完整50米计时跑，记录分段用时",
          sets: "3组",
          frequency: "每周1次",
          duration: "每次约15分钟",
          notes: "第1组80%用力热身，后2组全力冲刺",
        },
        {
          name: "摆臂练习",
          description: "坐姿或站姿快速摆臂，关注幅度和节奏",
          sets: "3组 × 20秒",
          frequency: "每周2次",
          duration: "每次约5分钟",
          notes: "摆臂方向为前后而非左右，肘关节角度约90度",
        },
      ],
      recoveryAdvice: "训练后拉伸腿后侧和髋部，可用泡沫轴放松小腿",
    },
  ],

  safetyReminders: [
    "短跑训练前必须充分热身，特别是下肢关节和腰背",
    "速度训练应在跑道或平坦地面进行，避免湿滑路面",
    "冲刺前检查跑道前方无障碍物",
    "起跑练习时注意不要过度用力导致肌肉拉伤",
    "若感觉大腿后侧或小腿紧张疼痛，立即停止并告知教师",
    "高强度速度训练后至少休息48小时再进行下一次速度训练",
  ],
};

