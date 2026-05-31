import type {
  AIClassReport,
  AIStudentReport,
  BodyFeeling,
  ClassSummary,
  DiscomfortType,
  FitnessRecord,
  FitnessRecordItem,
  Gender,
  GradeLevel,
  GradeTier,
  SportBase,
  SportGoal,
  StudentProfile,
  TeacherReview,
} from "@/lib/types";
import type { Prisma } from "@prisma/client";

type StudentRow = Prisma.StudentGetPayload<Record<string, never>>;
type FitnessRecordRow = Prisma.FitnessRecordGetPayload<{
  include: { items: true; batch: true };
}>;
type TeacherReviewRow = Prisma.TeacherReviewGetPayload<Record<string, never>>;
type AIReportRow = Prisma.AIReportGetPayload<Record<string, never>>;

export function mapStudent(row: StudentRow): StudentProfile {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender as Gender,
    grade: row.grade as GradeLevel,
    age: row.age,
    height: row.height,
    weight: row.weight,
    bmi: row.bmi,
    sportGoal: row.sportGoal as SportGoal,
    sportBase: row.sportBase as SportBase,
    discomforts: parseJsonArray<DiscomfortType>(row.discomfortsJson, ["none"]),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFitnessRecord(row: FitnessRecordRow): FitnessRecord {
  return {
    id: row.id,
    studentId: row.studentId,
    date: row.date.toISOString(),
    semester: row.semester,
    batchId: row.batchId ?? undefined,
    batchName: (row.batch as { name?: string } | null)?.name ?? undefined,
    recordType: (row.recordType as "official_test" | "daily_training") ?? "official_test",
    items: row.items.map(mapFitnessRecordItem),
    bodyFeeling: {
      fatigueLevel: row.fatigueLevel,
      recoveryStatus: row.recoveryStatus as BodyFeeling["recoveryStatus"],
      hasSoreness: row.hasSoreness,
      sorenessAreas: parseJsonArray<string>(row.sorenessAreasJson, []),
      hasDiscomfort: row.hasDiscomfort,
      discomfortNotes: row.discomfortNotes,
    },
  };
}

// AssessmentBatch mapper
type AssessmentBatchRow = Prisma.AssessmentBatchGetPayload<{
  include: { _count: { select: { records: true } } };
}>;

export function mapAssessmentBatch(row: AssessmentBatchRow): import("@/lib/types").AssessmentBatch {
  return {
    id: row.id,
    name: row.name,
    academicYear: row.academicYear,
    semester: row.semester,
    round: row.round,
    type: row.type as import("@/lib/types").BatchType,
    classId: row.classId,
    status: row.status as import("@/lib/types").BatchStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    recordCount: row._count?.records,
  };
}

export function mapTeacherReview(row: TeacherReviewRow): TeacherReview {
  return {
    id: row.id,
    reportId: row.reportId,
    reportType: row.reportType,
    reviewedAt: row.reviewedAt?.toISOString() ?? "",
    reviewerName: row.reviewerName,
    status: row.status,
    teacherNotes: row.teacherNotes,
    modifications: row.modificationsJson
      ? JSON.parse(row.modificationsJson) as TeacherReview["modifications"]
      : undefined,
  };
}

export function mapAIReport(row: AIReportRow): AIStudentReport | AIClassReport {
  return JSON.parse(row.contentJson) as AIStudentReport | AIClassReport;
}

export function mapFitnessRecordItem(
  row: Prisma.FitnessRecordItemGetPayload<Record<string, never>>
): FitnessRecordItem {
  return {
    itemId: row.itemId as FitnessRecordItem["itemId"],
    value: row.value,
    score: row.score,
    grade: row.grade as GradeTier,
    feedbackJson: (row as Record<string, unknown>).feedbackJson as string ?? undefined,
  };
}

export function parseJsonArray<T>(value: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed as T[] : fallback;
  } catch {
    return fallback;
  }
}

export type StudentListItem = {
  student: StudentProfile;
  latestRecord: FitnessRecord | null;
};

export type ReviewWithReport = {
  review: TeacherReview;
  report: AIStudentReport | AIClassReport | null;
};

export type StudentReportHistoryItem = {
  id: string;
  report: AIStudentReport;
  generatedAt: string;
  mode: string;
  status: string;
  sourceRecordId: string | null;
  sourceRecordDate: string | null;
  sourceSummary: string | null;
};

export type ClassSummaryWithLevels = ClassSummary & {
  levelData: {
    grade: GradeTier;
    label: string;
    count: number;
    percentage: number;
  }[];
  pendingReviewCount: number;
};
