// ===== 跃动智体 — Mock AI 输出 =====
import { mockAIStudentReport, mockAIClassReport } from "../data/mock-ai-reports";
import type { AIStudentReport, AIClassReport } from "../types";

export async function mockGenerateStudentReport(
  _studentId: string
): Promise<AIStudentReport> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { ...mockAIStudentReport, generatedAt: new Date().toISOString() };
}

export async function mockGenerateClassReport(): Promise<AIClassReport> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return { ...mockAIClassReport, generatedAt: new Date().toISOString() };
}
