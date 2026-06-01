// ===== 跃动智体 — 项目科普与评分解读静态配置 =====
// 依据：《国家学生体质健康标准（2014年修订）》
// 评分规则、权重、项目解释均为本地静态配置，不交给 AI 生成

import type { FitnessItemId } from "./types";

// ---- 单项科普配置 ----

export interface FitnessItemEducation {
  itemId: FitnessItemId;
  name: string;
  unit: string;
  category: "body" | "function" | "speed" | "strength" | "flexibility" | "endurance";
  standardWeight: number;
  standardSource: string;
  scoringDirection: "higher_better" | "lower_better" | "range";
  scoringIntro: string;
  whyMeasure: {
    policyReason: string;
    educationReason: string;
    studentReason: string;
  };
  reflects: {
    title: string;
    detail: string;
  }[];
  howToReadResult: {
    scoreMeaning: string;
    dataCaution: string;
    trainingConnection: string;
  };
  scienceNotes: {
    title: string;
    detail: string;
  }[];
  teacherUse: string[];
  references: {
    title: string;
    source: string;
    url?: string;
  }[];
  visualHints: {
    primaryMetricLabel: string;
    benchmarkLabels: string[];
  };
}

export const FITNESS_ITEM_EDUCATION: Record<FitnessItemId, FitnessItemEducation> = {
  // =====================================================================
  // 身高体重（BMI）
  // =====================================================================
  height_weight: {
    itemId: "height_weight",
    name: "身高体重",
    unit: "BMI",
    category: "body",
    standardWeight: 15,
    standardSource: "《国家学生体质健康标准（2014年修订）》",
    scoringDirection: "range",
    scoringIntro: "BMI 18.5–23.9 为正常范围（良好），低于 18.5 为偏瘦，24 及以上需关注。不以数值高低论优劣，重在均衡。",

    whyMeasure: {
      policyReason:
        "《国家学生体质健康标准（2014年修订）》将身高体重列为必测项目，权重 15%，用于评价身体发育和营养状况。" +
        "标准坚持「健康第一」的指导思想，身体形态是体质健康评价的基础维度。",
      educationReason:
        "身体形态数据帮助体育教师了解学生的发育水平，为制定合理的运动强度和训练负荷提供参考。" +
        "学校每年上报体质健康数据时，BMI 是核心指标之一。",
      studentReason:
        "BMI 帮助你了解自己的身体成分是否均衡。它不是「越瘦越好」，而是告诉你体重和身高是否匹配，从而调整运动和饮食习惯。",
    },

    reflects: [
      { title: "身体发育水平", detail: "BMI 反映当前身高与体重的比例关系，是青少年生长发育评价的基础指标。高中阶段正值青春期后期，身体成分变化较大。" },
      { title: "营养状况", detail: "BMI 偏低可能提示营养摄入不足或消耗过大；偏高可能提示能量摄入与消耗不平衡。两者都值得关注。" },
      { title: "体成分均衡度", detail: "BMI 是一个粗略指标，不能区分肌肉和脂肪。运动量大的学生 BMI 可能偏高但身体成分健康，需结合运动习惯综合判断。" },
    ],

    howToReadResult: {
      scoreMeaning: "BMI 在 18.5–23.9 范围内得 85 分（良好），低于或高于该范围得分会下降。本系统采用区间评分，不以数值高低论优劣。",
      dataCaution: "BMI 不能区分肌肉和脂肪，经常锻炼的学生可能因肌肉量大而 BMI 偏高，这不代表不健康。需结合运动习惯和体感综合判断。",
      trainingConnection: "正式体测 BMI 用于阶段性评价；日常训练中关注体重变化趋势比单次数值更有意义。如果 BMI 持续偏离正常范围，建议与体育教师沟通。",
    },

    scienceNotes: [
      { title: "标准依据", detail: "《国家学生体质健康标准（2014年修订）》规定身高体重为各学段必测项目。BMI = 体重(kg) ÷ 身高(m)²，是国际通用的身体成分筛查指标。" },
      { title: "青少年发育特点", detail: "高中阶段（15–18 岁）处于青春期后期，身高增长趋缓但体重可能因肌肉发育而增加。WHO 建议青少年 BMI 参照年龄别标准曲线评价。" },
      { title: "健康管理要求", detail: "教育部《中小学生体质健康管理通知》要求将体质健康指标纳入学生评价体系，BMI 是核心监测指标之一，学校需每年上报数据。" },
    ],

    teacherUse: [
      "BMI 需结合年龄、性别、运动习惯综合判断，不宜单独作为健康评价依据",
      "关注 BMI 偏低学生的营养摄入和运动量平衡，避免过度训练",
      "BMI 偏高学生建议结合有氧运动和饮食指导，避免简单贴标签",
      "运动量大的学生 BMI 可能偏高，需结合体感和运动表现综合评价",
    ],

    references: [
      { title: "《国家学生体质健康标准（2014年修订）》", source: "教育部", url: "https://tyb.shutcm.edu.cn/2020/1208/c2147a129122/page.htm" },
      { title: "中小学生体质健康管理要求", source: "教育部办公厅", url: "https://www.moe.gov.cn/srcsite/A17/moe_943/moe_947/202104/t20210425_528082.html" },
      { title: "青少年身体活动指南", source: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity" },
    ],

    visualHints: {
      primaryMetricLabel: "BMI 指数",
      benchmarkLabels: ["偏瘦 <18.5", "正常 18.5–23.9", "需关注 ≥24"],
    },
  },

  // =====================================================================
  // 肺活量
  // =====================================================================
  vital_capacity: {
    itemId: "vital_capacity",
    name: "肺活量",
    unit: "ml",
    category: "endurance",
    standardWeight: 15,
    standardSource: "《国家学生体质健康标准（2014年修订）》",
    scoringDirection: "higher_better",
    scoringIntro: "数值越大越好。高中男生优秀标准约 3600–4000ml，女生约 2800–3200ml（因年级而异）。",

    whyMeasure: {
      policyReason:
        "《国家学生体质健康标准（2014年修订）》将肺活量列为必测项目，权重 15%。" +
        "肺活量是评价心肺功能的基础指标，与 1000 米/800 米跑共同构成「心肺耐力」维度。",
      educationReason:
        "肺活量测试操作简便、数据客观，是学校体育教学中评价学生呼吸功能和有氧能力的重要工具。长期有氧训练可显著提升肺活量。",
      studentReason:
        "肺活量大说明你的肺能吸入更多空气，跑步、游泳等运动时不容易喘。它是你心肺健康的一个「窗口指标」。",
    },

    reflects: [
      { title: "肺通气功能", detail: "肺活量反映一次最大吸气后能呼出的最大气量，直接体现肺的扩张能力和通气效率。肺活量大意味着每次呼吸能获取更多氧气。" },
      { title: "呼吸肌力量", detail: "肺活量与膈肌、肋间肌等呼吸肌的力量和耐力密切相关。呼吸肌强的学生在运动中呼吸更高效，不容易出现喘不上气的情况。" },
      { title: "心肺耐力基础", detail: "肺活量是心肺耐力的静态指标。虽然它不能完全代表运动中的有氧能力，但长期有氧训练会显著提升肺活量。" },
      { title: "生长发育参考", detail: "肺活量与身高、体重、胸廓发育相关。青春期是肺功能发育的关键期，规律运动有助于肺功能充分发展。" },
    ],

    howToReadResult: {
      scoreMeaning: "肺活量采用「数值越大越好」的评分标准。达到优秀阈值得 95 分，良好 85 分，及格 70 分。分数越高说明肺功能越好。",
      dataCaution: "肺活量受身高、体重影响较大，身材高大的学生通常肺活量也较大。评价时需考虑个体差异，不宜简单横向比较。",
      trainingConnection: "正式体测肺活量反映阶段性肺功能水平；日常训练中跑步、游泳等有氧运动可以持续提升肺活量。建议每周 3 次以上中等强度有氧运动。",
    },

    scienceNotes: [
      { title: "标准依据", detail: "《国家学生体质健康标准（2014年修订）》规定肺活量为各学段必测项目。高中阶段权重 15%，与 1000 米/800 米跑共同评价心肺耐力。" },
      { title: "有氧训练与肺功能", detail: "WHO 建议青少年每天至少 60 分钟中等到高强度身体活动。规律有氧训练可增加肺泡通气量、提升呼吸肌耐力，从而提高肺活量。" },
      { title: "测试注意事项", detail: "测试前需充分热身，避免冷刺激引起气道收缩。测试时深吸一口气后均匀呼出，避免猛吹或漏气。" },
    ],

    teacherUse: [
      "测试前确保学生充分热身，尤其是寒冷天气下需做呼吸热身",
      "肺活量与身高、体重相关，评价时需考虑个体差异，不宜简单排名",
      "长期有氧训练可显著提升肺活量，建议将跑步、游泳等融入日常教学",
      "肺活量偏低的学生不一定是体质差，需结合运动表现综合判断",
    ],

    references: [
      { title: "《国家学生体质健康标准（2014年修订）》", source: "教育部", url: "https://tyb.shutcm.edu.cn/2020/1208/c2147a129122/page.htm" },
      { title: "青少年身体活动指南", source: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity" },
      { title: "儿童与青少年身体活动指南", source: "CDC", url: "https://www.cdc.gov/physical-activity-basics/guidelines/children.html" },
    ],

    visualHints: {
      primaryMetricLabel: "肺活量 (ml)",
      benchmarkLabels: ["及格", "良好", "优秀"],
    },
  },

  // =====================================================================
  // 50米跑
  // =====================================================================
  "50m_run": {
    itemId: "50m_run",
    name: "50米跑",
    unit: "秒",
    category: "speed",
    standardWeight: 20,
    standardSource: "《国家学生体质健康标准（2014年修订）》",
    scoringDirection: "lower_better",
    scoringIntro: "用时越短越好。高中男生优秀标准约 7.3–7.8秒，女生约 8.1–8.4秒（因年级而异）。",

    whyMeasure: {
      policyReason:
        "《国家学生体质健康标准（2014年修订）》将 50 米跑列为必测项目，权重 20%，是高中阶段权重最高的项目之一。" +
        "速度素质是《标准》评价身体素质的核心维度。",
      educationReason:
        "50 米跑测试反应速度、加速能力和神经肌肉协调性，是学校体育教学中评价速度素质最常用的手段。速度是许多运动项目的基础能力。",
      studentReason:
        "50 米跑测的是你的「爆发速度」——从起跑到冲刺的全过程。起跑反应、加速技术和最高速度都会影响成绩，是可以系统训练提升的。",
    },

    reflects: [
      { title: "反应速度", detail: "从听到起跑信号到身体启动的反应时间。反应快的学生在起跑阶段就能建立优势。反应速度可以通过专项练习提升。" },
      { title: "加速能力", detail: "前 20–30 米的加速阶段需要强大的蹬地力量和合理的身体前倾角度。加速能力是短跑成绩的关键因素。" },
      { title: "最高速度", detail: "途中跑阶段的最高速度取决于步频和步幅的最优组合。技术动作的经济性直接影响最高速度的维持。" },
      { title: "神经肌肉协调", detail: "短跑需要大脑快速协调多组肌群的收缩顺序和力度。协调性好的学生动作更流畅、能量利用更高效。" },
    ],

    howToReadResult: {
      scoreMeaning: "50 米跑采用「用时越短越好」的评分标准。达到优秀阈值得 95 分，良好 85 分，及格 70 分。注意：用时越短分数越高，这与肺活量等「越大越好」的项目方向相反。",
      dataCaution: "短跑成绩受场地条件（跑道材质、坡度）、天气（风向、温度）等因素影响。正式体测条件标准化，日常训练数据仅供参考趋势。",
      trainingConnection: "正式体测 50 米跑反映阶段性速度水平；日常训练中可通过起跑练习、加速跑、途中跑技术训练来提升。速度提升周期较长，需持续 6–8 周以上训练。",
    },

    scienceNotes: [
      { title: "标准依据", detail: "《国家学生体质健康标准（2014年修订）》规定 50 米跑为各学段必测项目。高中阶段权重 20%，是评价速度素质的核心指标。" },
      { title: "青少年速度发展", detail: "NSCA 青少年训练指南指出，速度素质在青春期有自然增长趋势，但专项训练可以进一步提升。青少年短跑训练应注重技术动作质量，避免过度强调力量。" },
      { title: "训练建议", detail: "CDC 建议青少年每天至少 60 分钟身体活动，其中包含高强度活动。短跑训练属于高强度无氧运动，需充分热身，训练间歇充分恢复。" },
    ],

    teacherUse: [
      "注意起跑技术教学，建立正确的起跑姿势和加速节奏",
      "短跑训练需充分热身，尤其是动态拉伸和肌肉激活",
      "速度提升周期较长，需持续训练 6–8 周以上才能看到明显进步",
      "避免让学生在未热身状态下全力冲刺，防止肌肉拉伤",
    ],

    references: [
      { title: "《国家学生体质健康标准（2014年修订）》", source: "教育部", url: "https://tyb.shutcm.edu.cn/2020/1208/c2147a129122/page.htm" },
      { title: "青少年长期运动发展模型", source: "NSCA", url: "https://www.nsca.com/globalassets/about/position-statements/position_stand_youth_resistance_training---2009.pdf" },
      { title: "儿童与青少年身体活动指南", source: "CDC", url: "https://www.cdc.gov/physical-activity-basics/guidelines/children.html" },
    ],

    visualHints: {
      primaryMetricLabel: "用时 (秒)",
      benchmarkLabels: ["及格", "良好", "优秀"],
    },
  },

  // =====================================================================
  // 立定跳远
  // =====================================================================
  standing_long_jump: {
    itemId: "standing_long_jump",
    name: "立定跳远",
    unit: "cm",
    category: "strength",
    standardWeight: 10,
    standardSource: "《国家学生体质健康标准（2014年修订）》",
    scoringDirection: "higher_better",
    scoringIntro: "距离越远越好。高中男生优秀标准约 210–235cm，女生约 180–195cm（因年级而异）。",

    whyMeasure: {
      policyReason:
        "《国家学生体质健康标准（2014年修订）》将立定跳远列为必测项目，权重 10%，用于评价下肢爆发力和身体协调能力。它是力量素质维度的核心指标之一。",
      educationReason:
        "立定跳远综合反映下肢力量、核心稳定性和身体协调性，是学校体育教学中评价爆发力最常用的测试手段。测试方法简单、数据客观。",
      studentReason:
        "立定跳远不光看腿的力量——摆臂、蹬地角度、空中收腿、落地缓冲都是关键技术。练好这些动作，成绩会明显提升。",
    },

    reflects: [
      { title: "下肢爆发力", detail: "立定跳远需要在极短时间内产生最大的蹬地力量。股四头肌、臀大肌、小腿三头肌的爆发力直接决定跳远距离。" },
      { title: "核心稳定性", detail: "起跳和空中阶段需要核心肌群（腹肌、背肌）维持身体稳定。核心弱的学生空中身体晃动大，影响落地距离。" },
      { title: "身体协调能力", detail: "摆臂与蹬地的时机配合、空中收腿与落地的衔接，都需要全身多关节协调配合。协调性好的学生动作更流畅。" },
      { title: "技术动作质量", detail: "起跳角度（约 30–45°）、摆臂时机、落地姿势都会显著影响成绩。技术训练对成绩提升的贡献不亚于力量训练。" },
    ],

    howToReadResult: {
      scoreMeaning: "立定跳远采用「距离越远越好」的评分标准。达到优秀阈值得 95 分，良好 85 分，及格 70 分。",
      dataCaution: "立定跳远成绩受场地条件（地面摩擦力、是否防滑）、鞋子等因素影响。正式体测使用标准场地，日常训练数据仅供参考。",
      trainingConnection: "正式体测立定跳远反映阶段性爆发力水平；日常训练中可通过半蹲跳、蛙跳、跳箱等练习提升。技术动作训练同样重要。",
    },

    scienceNotes: [
      { title: "标准依据", detail: "《国家学生体质健康标准（2014年修订）》规定立定跳远为各学段必测项目。高中阶段权重 10%，与引体向上/仰卧起坐共同评价力量素质。" },
      { title: "爆发力训练原则", detail: "NSCA 青少年训练指南指出，青少年爆发力训练应以技术动作为基础，逐步增加负荷。跳跃类练习（如蹲跳、跳箱）是安全有效的训练方式。" },
      { title: "技术动作要点", detail: "起跳时双脚与肩同宽，摆臂带动身体前上方起跳，空中收腿前伸，落地时屈膝缓冲。技术动作的规范性对成绩影响很大。" },
    ],

    teacherUse: [
      "技术动作对成绩影响大，需重点教学摆臂蹬地配合和落地缓冲",
      "落地时注意屈膝缓冲，避免膝关节损伤，尤其是硬地面测试",
      "可结合半蹲跳、蛙跳、跳箱等练习提升下肢爆发力",
      "体重较大的学生需特别注意落地保护，避免关节过度冲击",
    ],

    references: [
      { title: "《国家学生体质健康标准（2014年修订）》", source: "教育部", url: "https://tyb.shutcm.edu.cn/2020/1208/c2147a129122/page.htm" },
      { title: "青少年长期运动发展模型", source: "NSCA", url: "https://www.nsca.com/globalassets/about/position-statements/position_stand_youth_resistance_training---2009.pdf" },
    ],

    visualHints: {
      primaryMetricLabel: "距离 (cm)",
      benchmarkLabels: ["及格", "良好", "优秀"],
    },
  },

  // =====================================================================
  // 坐位体前屈
  // =====================================================================
  sit_and_reach: {
    itemId: "sit_and_reach",
    name: "坐位体前屈",
    unit: "cm",
    category: "flexibility",
    standardWeight: 10,
    standardSource: "《国家学生体质健康标准（2014年修订）》",
    scoringDirection: "higher_better",
    scoringIntro: "数值越大（推得越远）越好。高中男生优秀标准约 16–18cm，女生约 18–20cm（因年级而异）。",

    whyMeasure: {
      policyReason:
        "《国家学生体质健康标准（2014年修订）》将坐位体前屈列为必测项目，权重 10%，用于评价躯干和腰椎的柔韧性。柔韧性是身体素质的基本维度之一。",
      educationReason:
        "柔韧性直接影响运动幅度和动作质量。柔韧性差的学生在体育课中更容易出现动作受限，长期可能导致运动损伤风险增加。",
      studentReason:
        "柔韧性不是天生的，每天坚持拉伸就能看到进步。测试前充分热身很重要——热身后成绩通常会比冷身时好 2–3cm。",
    },

    reflects: [
      { title: "躯干柔韧性", detail: "坐位体前屈主要测试躯干前屈的活动范围，涉及腰椎、骶髂关节的灵活性。躯干柔韧性好的学生弯腰时能推得更远。" },
      { title: "腰椎活动度", detail: "腰椎的屈曲和伸展活动范围直接影响坐位体前屈成绩。久坐学习的学生腰椎活动度可能下降，需要通过拉伸恢复。" },
      { title: "大腿后侧肌群延展性", detail: "腘绳肌（大腿后侧肌群）的延展性是坐位体前屈的关键因素。腘绳肌紧张是学生柔韧性差的最常见原因。" },
      { title: "运动损伤预防", detail: "柔韧性好有助于扩大运动幅度、减少肌肉拉伤风险。跑步、球类等运动都需要良好的下肢和躯干柔韧性。" },
    ],

    howToReadResult: {
      scoreMeaning: "坐位体前屈采用「数值越大越好」的评分标准。达到优秀阈值得 95 分，良好 85 分，及格 70 分。",
      dataCaution: "柔韧性受测试前热身状态影响很大。冷身状态下测试成绩可能比热身后低 2–5cm。正式体测前应充分热身，日常训练数据需注明热身状态。",
      trainingConnection: "正式体测坐位体前屈反映阶段性柔韧性水平；日常训练中应融入静态拉伸，每次保持 15–30 秒，每周 3 次以上。柔韧性提升需要长期坚持。",
    },

    scienceNotes: [
      { title: "标准依据", detail: "《国家学生体质健康标准（2014年修订）》规定坐位体前屈为各学段必测项目。高中阶段权重 10%，是评价柔韧素质的唯一项目。" },
      { title: "柔韧性训练方法", detail: "NSCA 建议青少年柔韧性训练以静态拉伸为主，每个动作保持 15–30 秒，重复 2–4 次。动态拉伸适合作为热身，静态拉伸适合训练后放松。" },
      { title: "久坐与柔韧性", detail: "WHO 指出久坐行为是青少年健康的重要风险因素。长时间久坐学习会导致腘绳肌、髋屈肌紧张，影响柔韧性和体态。课间拉伸活动有助于缓解。" },
    ],

    teacherUse: [
      "测试前必须充分热身，尤其是腰背和腿后侧的动态拉伸",
      "日常训练中应融入静态拉伸，每次保持 15–30 秒，避免弹震式拉伸",
      "柔韧性提升需要长期坚持，短期突击效果有限，建议每周 3 次以上",
      "久坐学习的学生柔韧性可能较差，可通过课间拉伸活动改善",
    ],

    references: [
      { title: "《国家学生体质健康标准（2014年修订）》", source: "教育部", url: "https://tyb.shutcm.edu.cn/2020/1208/c2147a129122/page.htm" },
      { title: "青少年身体活动指南", source: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity" },
      { title: "青少年长期运动发展模型", source: "NSCA", url: "https://www.nsca.com/globalassets/about/position-statements/position_stand_youth_resistance_training---2009.pdf" },
    ],

    visualHints: {
      primaryMetricLabel: "前伸距离 (cm)",
      benchmarkLabels: ["及格", "良好", "优秀"],
    },
  },

  // =====================================================================
  // 引体向上
  // =====================================================================
  pull_up: {
    itemId: "pull_up",
    name: "引体向上",
    unit: "次",
    category: "strength",
    standardWeight: 10,
    standardSource: "《国家学生体质健康标准（2014年修订）》",
    scoringDirection: "higher_better",
    scoringIntro: "次数越多越好。高中男生优秀标准约 10–12次，良好 6–8次，及格 2–4次（因年级而异）。",

    whyMeasure: {
      policyReason:
        "《国家学生体质健康标准（2014年修订）》将引体向上列为高中男生必测项目，权重 10%，用于评价上肢和背部肌群的力量耐力。它是力量素质维度的核心指标之一。",
      educationReason:
        "引体向上是经典的自重力量测试，综合反映上肢拉力、背阔肌力量和握力。它是学校体育教学中评价上肢力量最常用的手段之一。",
      studentReason:
        "引体向上靠的是背部和手臂协调发力。如果还拉不上去，可以从悬挂、弹力带辅助开始练习，逐步增加次数。这是一项可以通过训练明显提升的技能。",
    },

    reflects: [
      { title: "上肢拉力", detail: "引体向上主要测试上肢拉力肌群（背阔肌、肱二头肌、前臂肌群）的力量。拉力强的学生在攀爬、拉拽等动作中更有优势。" },
      { title: "背阔肌力量", detail: "背阔肌是引体向上的主要发力肌群。背阔肌力量不足是拉不上去的最常见原因。通过高位下拉、弹力带辅助等练习可以针对性强化。" },
      { title: "握力", detail: "握力是引体向上的基础。握力不足会导致还没拉到顶就脱杠。握力可以通过悬挂、握力器等练习提升。" },
      { title: "核心稳定性", detail: "引体向上过程中核心肌群需要维持身体稳定，避免摆动借力。核心弱的学生容易出现身体晃动、动作变形。" },
    ],

    howToReadResult: {
      scoreMeaning: "引体向上采用「次数越多越好」的评分标准。达到优秀阈值得 95 分，良好 85 分，及格 70 分。",
      dataCaution: "引体向上成绩受体重影响较大——体重轻的学生相对更容易完成。评价时需结合体重和力量发展情况综合判断。",
      trainingConnection: "正式体测引体向上反映阶段性上肢力量水平；日常训练中可从悬挂、离心控制、弹力带辅助开始，逐步过渡到完整动作。动作质量优先于数量。",
    },

    scienceNotes: [
      { title: "标准依据", detail: "《国家学生体质健康标准（2014年修订）》规定引体向上为高中男生必测项目。高中阶段权重 10%，与仰卧起坐（女生）共同评价力量素质。" },
      { title: "青少年力量训练", detail: "NSCA 青少年训练指南指出，青少年可以安全地进行抗阻训练，前提是掌握正确技术动作。引体向上属于自重训练，安全性高，适合作为力量训练的入门动作。" },
      { title: "零基础进阶路径", detail: "NSCA 建议零基础学生从等长收缩（悬挂）和离心控制（慢放）开始，逐步增加力量后再尝试完整动作。弹力带辅助是有效的过渡方式。" },
    ],

    teacherUse: [
      "零基础学生建议从悬挂和离心控制开始，不要一开始就要求完整动作",
      "握力是常见瓶颈，可通过悬挂、握力器等练习针对性强化",
      "动作质量优先于数量，避免借力摆动，确保每次动作标准",
      "肩部有不适的学生需谨慎，必要时替换为其他拉力练习（如弹力带划船）",
    ],

    references: [
      { title: "《国家学生体质健康标准（2014年修订）》", source: "教育部", url: "https://tyb.shutcm.edu.cn/2020/1208/c2147a129122/page.htm" },
      { title: "青少年抗阻训练立场声明", source: "NSCA", url: "https://www.nsca.com/globalassets/about/position-statements/position_stand_youth_resistance_training---2009.pdf" },
    ],

    visualHints: {
      primaryMetricLabel: "完成次数",
      benchmarkLabels: ["及格", "良好", "优秀"],
    },
  },

  // =====================================================================
  // 仰卧起坐
  // =====================================================================
  sit_up: {
    itemId: "sit_up",
    name: "仰卧起坐",
    unit: "次/分钟",
    category: "strength",
    standardWeight: 10,
    standardSource: "《国家学生体质健康标准（2014年修订）》",
    scoringDirection: "higher_better",
    scoringIntro: "1分钟内完成次数越多越好。高中女生优秀标准约 42–46次/分钟，良好 36–40次，及格 24–28次（因年级而异）。",

    whyMeasure: {
      policyReason:
        "《国家学生体质健康标准（2014年修订）》将仰卧起坐列为高中女生必测项目，权重 10%，用于评价腹部肌群的力量耐力。它是力量素质维度的核心指标之一。",
      educationReason:
        "仰卧起坐是评价核心力量耐力的经典测试，操作简便、数据客观。核心力量是所有运动的基础，也是维持良好体态的关键。",
      studentReason:
        "仰卧起坐比的是1分钟内能做多少个。节奏很重要——前半程可以快一些，后半程保持匀速，不要一开始就冲刺。",
    },

    reflects: [
      { title: "腹部肌群力量耐力", detail: "仰卧起坐主要测试腹直肌、腹外斜肌等腹部肌群的反复收缩能力。力量耐力好的学生能在 1 分钟内维持较高的完成频率。" },
      { title: "核心稳定性", detail: "核心肌群（腹肌、背肌、骨盆底肌）的协调收缩能力直接影响仰卧起坐的效率。核心稳定的学生动作更标准、能量利用更高效。" },
      { title: "髋屈肌协调", detail: "仰卧起坐需要腹部肌群和髋屈肌协调发力。如果腹部力量不足，学生容易过度依赖髋屈肌和颈部发力，导致动作变形。" },
    ],

    howToReadResult: {
      scoreMeaning: "仰卧起坐采用「1 分钟内次数越多越好」的评分标准。达到优秀阈值得 95 分，良好 85 分，及格 70 分。",
      dataCaution: "仰卧起坐成绩受动作规范性影响大——如果动作不标准（如手拉颈部、臀部离地），成绩不能真实反映腹部力量。正式体测有严格的动作规范。",
      trainingConnection: "正式体测仰卧起坐反映阶段性核心力量水平；日常训练中可通过平板支撑、卷腹等练习强化腹部力量。节奏训练也很重要。",
    },

    scienceNotes: [
      { title: "标准依据", detail: "《国家学生体质健康标准（2014年修订）》规定仰卧起坐为高中女生必测项目。高中阶段权重 10%，与引体向上（男生）共同评价力量素质。" },
      { title: "核心训练原则", detail: "NSCA 建议青少年核心训练应包含稳定性训练（如平板支撑）和动态训练（如卷腹）。核心力量是所有运动的基础，也是预防腰背不适的关键。" },
      { title: "动作规范重要性", detail: "CDC 指出青少年身体活动应注重动作质量而非数量。仰卧起坐测试中，动作不标准（如手拉颈部）不仅影响成绩真实性，还可能增加受伤风险。" },
    ],

    teacherUse: [
      "注意动作规范：双手抱头但不发力拉颈部，避免颈椎损伤",
      "节奏分配是关键，建议前 30 秒稍快、后 30 秒匀速",
      "腰背不适的学生需评估后决定是否参加，可替换为平板支撑等核心测试",
      "日常训练中融入平板支撑、卷腹等核心练习，提升腹部力量耐力",
    ],

    references: [
      { title: "《国家学生体质健康标准（2014年修订）》", source: "教育部", url: "https://tyb.shutcm.edu.cn/2020/1208/c2147a129122/page.htm" },
      { title: "儿童与青少年身体活动指南", source: "CDC", url: "https://www.cdc.gov/physical-activity-basics/guidelines/children.html" },
      { title: "青少年长期运动发展模型", source: "NSCA", url: "https://www.nsca.com/globalassets/about/position-statements/position_stand_youth_resistance_training---2009.pdf" },
    ],

    visualHints: {
      primaryMetricLabel: "1分钟完成次数",
      benchmarkLabels: ["及格", "良好", "优秀"],
    },
  },

  // =====================================================================
  // 800米跑
  // =====================================================================
  "800m_run": {
    itemId: "800m_run",
    name: "800米跑",
    unit: "秒",
    category: "endurance",
    standardWeight: 20,
    standardSource: "《国家学生体质健康标准（2014年修订）》",
    scoringDirection: "lower_better",
    scoringIntro: "用时越短越好。高中女生优秀标准约 205–215秒（3分25秒–3分35秒），良好 220–230秒，及格 260–270秒（因年级而异）。",

    whyMeasure: {
      policyReason:
        "《国家学生体质健康标准（2014年修订）》将 800 米跑列为高中女生必测项目，权重 20%，是权重最高的项目之一。中长跑是评价心肺耐力的核心手段。",
      educationReason:
        "800 米跑综合反映有氧代谢能力、速度耐力和意志品质。心肺耐力是体质健康的核心指标，与长期健康密切相关。",
      studentReason:
        "800 米既考验体力也考验策略。前 400 米不要冲太快，保持匀速，最后 200 米再加速冲刺。坚持每周跑步训练，成绩会稳步提升。",
    },

    reflects: [
      { title: "心肺耐力", detail: "800 米跑需要心肺系统持续供氧 3–4 分钟。心肺耐力好的学生能维持较高的运动强度而不出现严重缺氧。" },
      { title: "有氧代谢能力", detail: "有氧代谢是 800 米跑的主要供能方式。有氧能力强的学生能更高效地利用氧气分解糖原和脂肪，延缓疲劳。" },
      { title: "速度耐力", detail: "800 米跑不是纯有氧运动——后半程需要维持速度甚至加速冲刺。速度耐力好的学生后半程不容易掉速。" },
      { title: "意志品质", detail: "中长跑在生理上会经历极点（呼吸困难、肌肉酸痛），坚持度过极点需要意志力和自我调节能力。" },
    ],

    howToReadResult: {
      scoreMeaning: "800 米跑采用「用时越短越好」的评分标准。达到优秀阈值得 95 分，良好 85 分，及格 70 分。注意：用时越短分数越高，与肺活量等「越大越好」的项目方向相反。",
      dataCaution: "中长跑成绩受天气（温度、湿度、风向）、场地（跑道材质、坡度）、身体状态（是否充分休息）等因素影响较大。正式体测条件标准化，日常训练数据仅供参考趋势。",
      trainingConnection: "正式体测 800 米跑反映阶段性心肺耐力水平；日常训练中建议以慢跑打基础，后期加入间歇跑提升速度耐力。配速策略教学比单纯跑量更重要。",
    },

    scienceNotes: [
      { title: "标准依据", detail: "《国家学生体质健康标准（2014年修订）》规定 800 米跑为高中女生必测项目。高中阶段权重 20%，与肺活量共同构成心肺耐力维度。" },
      { title: "有氧训练与健康", detail: "WHO 建议青少年每天至少 60 分钟中等到高强度身体活动。规律有氧运动可以增强心肺功能、改善代谢健康、促进心理健康。CDC 的建议与 WHO 一致。" },
      { title: "配速策略", detail: "中长跑配速策略对成绩影响很大。建议前半程保持匀速（略低于目标配速），后半程逐步加速。前半程冲太快是成绩差的最常见原因。" },
    ],

    teacherUse: [
      "配速策略教学比单纯跑量更重要——教会学生合理分配体力",
      "训练初期以慢跑打基础（每周 3 次以上，每次 20–30 分钟），后期加入间歇跑",
      "关注学生跑后恢复状态，避免运动性晕厥——跑后不要立刻坐下",
      "极点是正常生理反应，教会学生调整呼吸和节奏度过极点",
    ],

    references: [
      { title: "《国家学生体质健康标准（2014年修订）》", source: "教育部", url: "https://tyb.shutcm.edu.cn/2020/1208/c2147a129122/page.htm" },
      { title: "青少年身体活动指南", source: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity" },
      { title: "儿童与青少年身体活动指南", source: "CDC", url: "https://www.cdc.gov/physical-activity-basics/guidelines/children.html" },
    ],

    visualHints: {
      primaryMetricLabel: "用时（分:秒）",
      benchmarkLabels: ["及格", "良好", "优秀"],
    },
  },

  // =====================================================================
  // 1000米跑
  // =====================================================================
  "1000m_run": {
    itemId: "1000m_run",
    name: "1000米跑",
    unit: "秒",
    category: "endurance",
    standardWeight: 20,
    standardSource: "《国家学生体质健康标准（2014年修订）》",
    scoringDirection: "lower_better",
    scoringIntro: "用时越短越好。高中男生优秀标准约 225–235秒（3分45秒–3分55秒），良好 245–255秒，及格 285–295秒（因年级而异）。",

    whyMeasure: {
      policyReason:
        "《国家学生体质健康标准（2014年修订）》将 1000 米跑列为高中男生必测项目，权重 20%，是权重最高的项目之一。中长跑是评价心肺耐力的核心手段。",
      educationReason:
        "1000 米跑综合反映有氧代谢能力、速度耐力和意志品质。心肺耐力是体质健康的核心指标，与长期健康密切相关，是《标准》评价体系中权重最大的维度之一。",
      studentReason:
        "1000 米是最考验耐力的项目。前 600 米保持匀速不要被带快，后 400 米逐步加速，最后 100 米全力冲刺。每周坚持 3 次以上跑步训练。",
    },

    reflects: [
      { title: "心肺耐力", detail: "1000 米跑需要心肺系统持续供氧 3.5–5 分钟。心肺耐力好的学生能维持较高的运动强度，不容易出现跑不动的情况。" },
      { title: "有氧代谢能力", detail: "有氧代谢是 1000 米跑的主要供能方式。有氧能力强的学生能更高效地利用氧气供能，乳酸堆积更少，疲劳来得更晚。" },
      { title: "速度耐力", detail: "1000 米跑后半程需要维持速度甚至加速。速度耐力好的学生后半程不容易掉速，能保持较均匀的配速。" },
      { title: "意志品质", detail: "中长跑在生理上会经历极点——呼吸困难、肌肉酸痛、想放弃。坚持度过极点需要意志力和自我调节能力，这也是体育教育的重要目标。" },
    ],

    howToReadResult: {
      scoreMeaning: "1000 米跑采用「用时越短越好」的评分标准。达到优秀阈值得 95 分，良好 85 分，及格 70 分。注意：用时越短分数越高，与肺活量等「越大越好」的项目方向相反。",
      dataCaution: "中长跑成绩受天气（温度、湿度、风向）、场地（跑道材质、坡度）、身体状态（是否充分休息、是否刚吃完饭）等因素影响较大。正式体测条件标准化，日常训练数据仅供参考趋势。",
      trainingConnection: "正式体测 1000 米跑反映阶段性心肺耐力水平；日常训练中建议以慢跑打基础，后期加入间歇跑提升速度耐力。配速策略教学比单纯跑量更重要。",
    },

    scienceNotes: [
      { title: "标准依据", detail: "《国家学生体质健康标准（2014年修订）》规定 1000 米跑为高中男生必测项目。高中阶段权重 20%，与肺活量共同构成心肺耐力维度。" },
      { title: "有氧训练与长期健康", detail: "WHO 和 CDC 均指出，规律有氧运动可以增强心肺功能、改善代谢健康、促进心理健康、提高认知功能。青少年每天至少 60 分钟中等到高强度身体活动。" },
      { title: "间歇训练法", detail: "NSCA 建议中长跑训练采用「基础期慢跑 + 提高期间歇跑」的周期化方法。间歇训练（如 200 米快跑 + 200 米慢跑交替）可以有效提升速度耐力。" },
    ],

    teacherUse: [
      "配速策略教学比单纯跑量更重要——教会学生合理分配体力",
      "训练初期以慢跑打基础（每周 3 次以上，每次 20–30 分钟），后期加入间歇跑",
      "关注学生跑后恢复状态，避免运动性晕厥——跑后不要立刻坐下，应慢走 2–3 分钟",
      "体重较大的学生需特别关注膝关节保护，建议从快走和慢跑开始",
    ],

    references: [
      { title: "《国家学生体质健康标准（2014年修订）》", source: "教育部", url: "https://tyb.shutcm.edu.cn/2020/1208/c2147a129122/page.htm" },
      { title: "青少年身体活动指南", source: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity" },
      { title: "儿童与青少年身体活动指南", source: "CDC", url: "https://www.cdc.gov/physical-activity-basics/guidelines/children.html" },
      { title: "青少年长期运动发展模型", source: "NSCA", url: "https://www.nsca.com/globalassets/about/position-statements/position_stand_youth_resistance_training---2009.pdf" },
    ],

    visualHints: {
      primaryMetricLabel: "用时（分:秒）",
      benchmarkLabels: ["及格", "良好", "优秀"],
    },
  },
};

// ---- 总体标准科普配置 ----

export interface FitnessStandardEducation {
  title: string;
  sourceName: string;
  sourceUrl: string;
  purpose: string;
  dimensions: { name: string; items: FitnessItemId[]; explanation: string }[];
  highSchoolWeights: { itemId: FitnessItemId; weight: number }[];
  gradeRules: { excellent: string; good: string; pass: string; improve: string };
}

export const FITNESS_STANDARD_EDUCATION: FitnessStandardEducation = {
  title: "国家学生体质健康标准导读",
  sourceName: "《国家学生体质健康标准（2014年修订）》",
  sourceUrl: "https://tyb.shutcm.edu.cn/2020/1208/c2147a129122/page.htm",
  purpose:
    "贯彻落实「健康第一」的指导思想，切实加强学校体育工作，促进学生积极参加体育锻炼，" +
    "养成良好的锻炼习惯，提高体质健康水平。标准从身体形态、身体机能、身体素质等方面综合评定学生的体质健康水平。",
  dimensions: [
    {
      name: "身体形态",
      items: ["height_weight"],
      explanation: "通过身高体重计算 BMI 指数，评价身体发育和营养状况的均衡度。BMI 在正常范围内说明身体成分比例合理。",
    },
    {
      name: "身体机能",
      items: ["vital_capacity"],
      explanation: "肺活量反映肺的通气功能，是心肺系统工作能力的基础指标。肺活量大意味着每次呼吸能获取更多氧气。",
    },
    {
      name: "速度能力",
      items: ["50m_run"],
      explanation: "50米跑测试反应速度、加速能力和神经肌肉协调性。速度是许多运动项目的基础素质。",
    },
    {
      name: "力量能力",
      items: ["standing_long_jump", "pull_up", "sit_up"],
      explanation: "立定跳远测下肢爆发力，引体向上（男）测上肢拉力，仰卧起坐（女）测核心力量。力量是运动表现和日常活动的基础。",
    },
    {
      name: "柔韧能力",
      items: ["sit_and_reach"],
      explanation: "坐位体前屈测躯干和下肢柔韧性。柔韧性好有助于预防运动损伤、改善动作幅度。",
    },
    {
      name: "心肺耐力",
      items: ["vital_capacity", "1000m_run", "800m_run"],
      explanation: "肺活量测静态通气能力，1000米/800米跑测动态有氧耐力。心肺耐力是体质健康的核心指标，与长期健康密切相关。",
    },
  ],
  highSchoolWeights: [
    { itemId: "height_weight", weight: 15 },
    { itemId: "vital_capacity", weight: 15 },
    { itemId: "50m_run", weight: 20 },
    { itemId: "standing_long_jump", weight: 10 },
    { itemId: "sit_and_reach", weight: 10 },
    { itemId: "pull_up", weight: 10 },
    { itemId: "sit_up", weight: 10 },
    { itemId: "1000m_run", weight: 20 },
    { itemId: "800m_run", weight: 20 },
  ],
  gradeRules: {
    excellent: "优秀（90分及以上）—— 表现突出，体质健康水平优秀",
    good: "良好（80–89分）—— 表现较好，体质健康水平良好",
    pass: "及格（60–79分）—— 达到基本标准，仍有提升空间",
    improve: "待提升（60分以下）—— 需要加强锻炼，重点提升薄弱项目",
  },
};
