// ===== 跃动智体 — Mock 体测记录 =====
import type { FitnessRecord } from "../types";

export const mockFitnessRecords: FitnessRecord[] = [
  {
    id: "R001",
    studentId: "S001",
    date: "2026-03-15T10:00:00Z",
    semester: "高二下 · 2026春季",
    batchId: undefined,
    recordType: "official_test" as const,
    items: [
      { itemId: "vital_capacity", value: 3200, score: 82, grade: "good" },
      { itemId: "50m_run", value: 8.1, score: 78, grade: "pass" },
      { itemId: "standing_long_jump", value: 195, score: 80, grade: "good" },
      { itemId: "sit_and_reach", value: 12, score: 78, grade: "pass" },
      { itemId: "pull_up", value: 6, score: 80, grade: "good" },
      { itemId: "1000m_run", value: 260, score: 72, grade: "pass" },
    ],
    bodyFeeling: {
      fatigueLevel: 5,
      recoveryStatus: "normal",
      hasSoreness: true,
      sorenessAreas: ["腿部"],
      hasDiscomfort: false,
      discomfortNotes: "",
    },
  },
  {
    id: "R002",
    studentId: "S002",
    date: "2026-03-15T10:15:00Z",
    semester: "高二下 · 2026春季",
    batchId: undefined,
    recordType: "official_test" as const,
    items: [
      { itemId: "vital_capacity", value: 2600, score: 78, grade: "pass" },
      { itemId: "50m_run", value: 8.7, score: 82, grade: "good" },
      { itemId: "standing_long_jump", value: 168, score: 78, grade: "pass" },
      { itemId: "sit_and_reach", value: 16, score: 85, grade: "good" },
      { itemId: "sit_up", value: 38, score: 82, grade: "good" },
      { itemId: "800m_run", value: 235, score: 76, grade: "pass" },
    ],
    bodyFeeling: {
      fatigueLevel: 4,
      recoveryStatus: "normal",
      hasSoreness: false,
      sorenessAreas: [],
      hasDiscomfort: false,
      discomfortNotes: "",
    },
  },
  {
    id: "R003",
    studentId: "S003",
    date: "2026-03-15T10:30:00Z",
    semester: "高二下 · 2026春季",
    batchId: undefined,
    recordType: "official_test" as const,
    items: [
      { itemId: "vital_capacity", value: 3400, score: 85, grade: "good" },
      { itemId: "50m_run", value: 8.8, score: 70, grade: "pass" },
      { itemId: "standing_long_jump", value: 180, score: 70, grade: "pass" },
      { itemId: "sit_and_reach", value: 5, score: 55, grade: "improve" },
      { itemId: "pull_up", value: 1, score: 35, grade: "improve" },
      { itemId: "1000m_run", value: 285, score: 60, grade: "pass" },
    ],
    bodyFeeling: {
      fatigueLevel: 8,
      recoveryStatus: "slow",
      hasSoreness: true,
      sorenessAreas: ["腿部", "膝盖"],
      hasDiscomfort: true,
      discomfortNotes: "跑步后膝盖轻微不适，休息后缓解",
    },
  },
  {
    id: "R004",
    studentId: "S004",
    date: "2026-03-15T10:45:00Z",
    semester: "高二下 · 2026春季",
    batchId: undefined,
    recordType: "official_test" as const,
    items: [
      { itemId: "vital_capacity", value: 2100, score: 62, grade: "pass" },
      { itemId: "50m_run", value: 9.5, score: 65, grade: "pass" },
      { itemId: "standing_long_jump", value: 145, score: 62, grade: "pass" },
      { itemId: "sit_and_reach", value: 14, score: 80, grade: "good" },
      { itemId: "sit_up", value: 28, score: 65, grade: "pass" },
      { itemId: "800m_run", value: 260, score: 60, grade: "pass" },
    ],
    bodyFeeling: {
      fatigueLevel: 7,
      recoveryStatus: "slow",
      hasSoreness: true,
      sorenessAreas: ["腿部", "腹部"],
      hasDiscomfort: true,
      discomfortNotes: "运动后轻微头晕，休息后好转",
    },
  },
  {
    id: "R005",
    studentId: "S005",
    date: "2026-03-15T11:00:00Z",
    semester: "高二下 · 2026春季",
    batchId: undefined,
    recordType: "official_test" as const,
    items: [
      { itemId: "vital_capacity", value: 4000, score: 95, grade: "excellent" },
      { itemId: "50m_run", value: 7.4, score: 92, grade: "excellent" },
      { itemId: "standing_long_jump", value: 225, score: 92, grade: "excellent" },
      { itemId: "sit_and_reach", value: 16, score: 88, grade: "good" },
      { itemId: "pull_up", value: 10, score: 90, grade: "excellent" },
      { itemId: "1000m_run", value: 235, score: 88, grade: "good" },
    ],
    bodyFeeling: {
      fatigueLevel: 3,
      recoveryStatus: "quick",
      hasSoreness: false,
      sorenessAreas: [],
      hasDiscomfort: false,
      discomfortNotes: "",
    },
  },
  {
    id: "R006",
    studentId: "S001",
    date: "2024-10-10T10:00:00Z",
    semester: "高二上 · 2025秋季",
    batchId: undefined,
    recordType: "official_test" as const,
    items: [
      { itemId: "vital_capacity", value: 3000, score: 76, grade: "pass" },
      { itemId: "50m_run", value: 8.5, score: 72, grade: "pass" },
      { itemId: "standing_long_jump", value: 185, score: 74, grade: "pass" },
      { itemId: "sit_and_reach", value: 10, score: 72, grade: "pass" },
      { itemId: "pull_up", value: 4, score: 65, grade: "pass" },
      { itemId: "1000m_run", value: 275, score: 62, grade: "pass" },
    ],
    bodyFeeling: {
      fatigueLevel: 6,
      recoveryStatus: "normal",
      hasSoreness: true,
      sorenessAreas: ["手臂", "腿部"],
      hasDiscomfort: false,
      discomfortNotes: "",
    },
  },
  {
    id: "R007",
    studentId: "S002",
    date: "2024-10-10T10:15:00Z",
    semester: "高二上 · 2025秋季",
    batchId: undefined,
    recordType: "official_test" as const,
    items: [
      { itemId: "vital_capacity", value: 2500, score: 74, grade: "pass" },
      { itemId: "50m_run", value: 9.0, score: 76, grade: "pass" },
      { itemId: "standing_long_jump", value: 160, score: 72, grade: "pass" },
      { itemId: "sit_and_reach", value: 14, score: 80, grade: "good" },
      { itemId: "sit_up", value: 35, score: 76, grade: "pass" },
      { itemId: "800m_run", value: 245, score: 72, grade: "pass" },
    ],
    bodyFeeling: {
      fatigueLevel: 5,
      recoveryStatus: "normal",
      hasSoreness: false,
      sorenessAreas: [],
      hasDiscomfort: false,
      discomfortNotes: "",
    },
  },
];

export function getRecordsByStudentId(studentId: string): FitnessRecord[] {
  return mockFitnessRecords.filter((r) => r.studentId === studentId);
}

export function getLatestRecord(studentId: string): FitnessRecord | undefined {
  const records = getRecordsByStudentId(studentId);
  if (records.length === 0) return undefined;
  return records.reduce((latest, r) =>
    new Date(r.date) > new Date(latest.date) ? r : latest
  );
}

export function getAllLatestRecords(): FitnessRecord[] {
  const studentIds = Array.from(new Set(mockFitnessRecords.map((r) => r.studentId)));
  return studentIds
    .map((id) => getLatestRecord(id))
    .filter((r): r is FitnessRecord => r !== undefined);
}

