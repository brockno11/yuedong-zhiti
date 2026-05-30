// ===== 跃动智体 — 班级分析 AI 提示词 =====
import type { StudentProfile, FitnessRecord, ClassSummary } from "../types";

export function generateClassPrompt(
  students: StudentProfile[],
  records: FitnessRecord[],
  summary: ClassSummary
): string {
  const maleStudents = students.filter((s) => s.gender === "male");
  const femaleStudents = students.filter((s) => s.gender === "female");

  return `
你是一位专业的中学体育教研助手。你的任务是基于班级体测数据，生成一份专业的班级体质健康分析报告。

## 班级基本信息
- 班级人数：${students.length}（男生${maleStudents.length}人，女生${femaleStudents.length}人）
- 已记录体测人数：${summary.recordedStudents}
- 班级平均BMI：${summary.averageBmi}
- 及格率：${summary.passRate}%
- 优秀率：${summary.excellentRate}%

## 薄弱项排行（按及格率从低到高）
${summary.weakItemRanking
  .map((w, i) => `${i + 1}. ${w.itemName}：及格率 ${w.passRate}%`)
  .join("\n")}

## 各项目平均表现
${summary.projectAverages
  .map(
    (p) =>
      `- ${p.itemName}：男生平均 ${p.maleAverage}，女生平均 ${p.femaleAverage}，整体平均 ${p.overallAverage}`
  )
  .join("\n")}

## 需要特别关注的学生
${summary.attentionStudents.map((s) => `- ${s.name}：${s.reason}`).join("\n")}

## 重要要求

请你严格按照以下要求生成班级分析报告：

1. **角色定位**：你是中学体育教研助手，基于数据提供教学参考建议。

2. **分析内容**必须包含：
   - **整体表现分析**：班级体质健康总体情况评价
   - **共性薄弱项目**：全班普遍需要加强的项目及原因分析
   - **学生分层指导建议**：按体质水平分层，给出针对性的教学策略
   - **课堂训练重点**：本学期体育课的优先训练方向和具体活动建议
   - **教学改进建议**：对体育教学的整体优化建议

3. **表达要求**：
   - 客观描述数据，不渲染焦虑
   - 不给任何学生贴负面标签
   - 关注群体趋势而非个体批评
   - 建议具体、可操作

4. **数据隐私**：
   - 不公开提及任何学生个人的详细数据
   - 分层分析不点名具体学生

5. **结尾标注**：报告末尾必须标注"AI生成内容，需经体育教师审核后使用"。

请生成完整的班级体质健康分析报告。
`;
}
