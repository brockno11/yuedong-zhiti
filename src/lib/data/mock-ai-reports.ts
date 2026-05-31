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
    reviewerName: "周老师",
    status: "pending",
    teacherNotes: "",
  },
  {
    id: "RV-002",
    reportId: "AI-C-001",
    reportType: "class",
    reviewedAt: "",
    reviewerName: "周老师",
    status: "pending",
    teacherNotes: "",
  },
];

