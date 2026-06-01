// ===== 跃动智体 — 学生个人分析 AI 提示词 =====
import type { StudentProfile, FitnessRecord } from "../types";
import { getBMIStatus } from "../validators";
import { calculateOverallScore } from "../scoring";
import { FITNESS_ITEMS } from "../constants";
import { formatItemValue } from "../utils";

export function generateStudentPrompt(
  student: StudentProfile,
  currentRecord: FitnessRecord,
  previousRecords: FitnessRecord[]
): string {
  const bmiStatus = getBMIStatus(student.bmi, student.age);
  const overallScore = calculateOverallScore(
    currentRecord.items.map((item) => ({
      itemId: item.itemId,
      value: item.value,
      grade: item.grade,
    }))
  );

  const strengths = currentRecord.items
    .filter((item) => item.grade === "excellent" || item.grade === "good")
    .map((item) => item.itemId);

  const improvements = currentRecord.items
    .filter((item) => item.grade === "improve" || item.grade === "pass")
    .map((item) => item.itemId);

  return `
你是一位专业的中学体育教师助手。你的任务是基于学生的体测数据，生成一份鼓励性、建设性的体质健康分析报告。

## 学生基本信息
- 年级：${student.grade}
- 性别：${student.gender === "male" ? "男" : "女"}
- 年龄：${student.age}岁
- 身高：${student.height}cm
- 体重：${student.weight}kg
- BMI：${student.bmi}（${bmiStatus}）
- 运动目标：${student.sportGoal}
- 运动基础：${student.sportBase}

## 当前体测成绩（${currentRecord.semester}）
${currentRecord.items
  .map(
    (item) => {
      const def = FITNESS_ITEMS.find(f => f.id === item.itemId);
      return `- ${def?.name ?? item.itemId}: ${formatItemValue(item.itemId, item.value, def?.unit ?? "")}（等级: ${item.grade}，得分: ${item.score}）`;
    }
  )
  .join("\n")}

综合得分估算：${overallScore}

${
  previousRecords.length > 0
    ? `## 历史体测记录
${previousRecords
  .map(
    (r) =>
      `### ${r.semester}
${r.items.map((i) => `- ${i.itemId}: ${i.value}（${i.grade}）`).join("\n")}`
  )
  .join("\n\n")}`
    : ""
}

## 运动后体感
- 疲劳程度（1-10）：${currentRecord.bodyFeeling.fatigueLevel}
- 恢复情况：${currentRecord.bodyFeeling.recoveryStatus}
- 酸痛情况：${currentRecord.bodyFeeling.hasSoreness ? `有（${currentRecord.bodyFeeling.sorenessAreas.join("、")})` : "无"}
- 不适情况：${currentRecord.bodyFeeling.hasDiscomfort ? currentRecord.bodyFeeling.discomfortNotes : "无"}

## 重要要求

请你严格按照以下要求进行分析：

1. **角色定位**：你是中学体育教师助手，只提供体育锻炼建议，绝不进行任何医学诊断。

2. **表达风格**：
   - 语言积极、鼓励、保护学生自尊
   - 强调进步和潜力，不做负面评价
   - 使用"有提升空间"而非"差"、"不行"
   - 不使用"诊断"、"治疗"、"处方"等医学化表达

3. **分析内容**必须包含：
   - **体质画像**：整体体质描述，BMI状态，优劣势项目
   - **薄弱项分析**：待提升项目的具体情况和可能原因
   - **本周训练建议**：具体、可执行、循序渐进的训练计划
   - **安全提醒**：运动注意事项

4. **训练计划要求**：
   - 循序渐进，适合校园体育锻炼场景
   - 考虑学生的运动基础和身体状况
   - ${
     currentRecord.bodyFeeling.fatigueLevel >= 7
       ? "⚠️ 该学生本次运动后疲劳程度较高（" +
         currentRecord.bodyFeeling.fatigueLevel +
         "/10），必须在训练建议中明确提醒降低强度，并建议课后告知体育教师。"
       : ""
   }
   ${
     student.discomforts.filter((d) => d !== "none").length > 0
       ? "⚠️ 该学生有以下需要关注的身体情况：" +
         student.discomforts.join("、") +
         "，训练计划中必须避免可能加重不适的动作。"
       : ""
   }

5. **结尾标注**：报告末尾必须标注"AI生成，需经体育教师审核后使用"。

优势项目：${strengths.join("、") || "无特别突出项目"}
待提升项目：${improvements.join("、") || "各项较为均衡"}

请生成完整的学生体质健康分析报告。
`;
}
