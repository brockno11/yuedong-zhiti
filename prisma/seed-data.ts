// ===== 跃动智体 — 种子数据 =====
// 仅由 prisma/seed.ts 使用，不导入到应用运行时

export interface SeedStudent {
  id: string;
  name: string;
  gender: "male" | "female";
  grade: "高一" | "高二" | "高三";
  age: number;
  height: number;
  weight: number;
  bmi: number;
  sportGoal: string;
  sportBase: string;
  discomforts: string[];
  createdAt: string;
  updatedAt: string;
}

export const SEED_STUDENTS: SeedStudent[] = [
  { id: "S001", name: "学生A", gender: "male", grade: "高二", age: 17, height: 175, weight: 65, bmi: 21.2, sportGoal: "improve_endurance", sportBase: "moderate", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S002", name: "学生B", gender: "female", grade: "高二", age: 16, height: 162, weight: 52, bmi: 19.8, sportGoal: "overall_health", sportBase: "active", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S003", name: "学生C", gender: "male", grade: "高二", age: 17, height: 180, weight: 85, bmi: 26.2, sportGoal: "lose_weight", sportBase: "light", discomforts: ["joint_pain"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S004", name: "学生D", gender: "female", grade: "高二", age: 16, height: 158, weight: 60, bmi: 24.0, sportGoal: "lose_weight", sportBase: "none", discomforts: ["dizziness"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S005", name: "学生E", gender: "male", grade: "高二", age: 17, height: 172, weight: 58, bmi: 19.6, sportGoal: "build_strength", sportBase: "active", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S006", name: "学生F", gender: "female", grade: "高二", age: 16, height: 165, weight: 55, bmi: 20.2, sportGoal: "improve_flexibility", sportBase: "moderate", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S007", name: "学生G", gender: "male", grade: "高二", age: 17, height: 178, weight: 70, bmi: 22.1, sportGoal: "overall_health", sportBase: "moderate", discomforts: ["asthma"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S008", name: "学生H", gender: "female", grade: "高二", age: 16, height: 160, weight: 48, bmi: 18.8, sportGoal: "improve_endurance", sportBase: "light", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S009", name: "学生I", gender: "male", grade: "高二", age: 17, height: 182, weight: 90, bmi: 27.2, sportGoal: "lose_weight", sportBase: "none", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S010", name: "学生J", gender: "female", grade: "高二", age: 16, height: 163, weight: 53, bmi: 20.0, sportGoal: "exam_preparation", sportBase: "active", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S011", name: "学生K", gender: "male", grade: "高二", age: 17, height: 176, weight: 68, bmi: 22.0, sportGoal: "overall_health", sportBase: "moderate", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S012", name: "学生L", gender: "female", grade: "高二", age: 16, height: 161, weight: 50, bmi: 19.3, sportGoal: "improve_flexibility", sportBase: "light", discomforts: ["back_pain"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S013", name: "学生M", gender: "male", grade: "高二", age: 17, height: 174, weight: 62, bmi: 20.5, sportGoal: "build_strength", sportBase: "active", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S014", name: "学生N", gender: "female", grade: "高二", age: 16, height: 159, weight: 47, bmi: 18.6, sportGoal: "overall_health", sportBase: "moderate", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S015", name: "学生O", gender: "male", grade: "高二", age: 17, height: 177, weight: 72, bmi: 23.0, sportGoal: "improve_endurance", sportBase: "moderate", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S016", name: "学生P", gender: "female", grade: "高二", age: 16, height: 164, weight: 54, bmi: 20.1, sportGoal: "exam_preparation", sportBase: "active", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S017", name: "学生Q", gender: "male", grade: "高二", age: 17, height: 179, weight: 75, bmi: 23.4, sportGoal: "build_strength", sportBase: "active", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S018", name: "学生R", gender: "female", grade: "高二", age: 16, height: 157, weight: 46, bmi: 18.7, sportGoal: "overall_health", sportBase: "light", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S019", name: "学生S", gender: "male", grade: "高二", age: 17, height: 181, weight: 78, bmi: 23.8, sportGoal: "improve_endurance", sportBase: "moderate", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
  { id: "S020", name: "学生T", gender: "female", grade: "高二", age: 16, height: 166, weight: 56, bmi: 20.3, sportGoal: "exam_preparation", sportBase: "moderate", discomforts: ["none"], createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-10T08:00:00Z" },
];
