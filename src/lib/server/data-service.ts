import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { FITNESS_ITEMS } from "@/lib/constants";
import { calculateItemScore } from "@/lib/scoring";
import type {
  AIClassReport,
  AIStudentReport,
  BodyFeeling,
  FitnessItemId,
  FitnessRecord,
  GradeTier,
  StudentProfile,
  TeacherReview,
} from "@/lib/types";
import {
  mapAIReport,
  mapFitnessRecord,
  mapStudent,
  mapTeacherReview,
  type ClassSummaryWithLevels,
  type ReviewWithReport,
  type StudentListItem,
} from "@/lib/server/db-mappers";

const DEFAULT_CLASS_ID = "class-2025-spring-02-03";
const DEFAULT_SEMESTER = "2025-春季";

type LoginInput = {
  role: "student" | "teacher";
  username: string;
  password: string;
};

export type LoginAccountOption = {
  id: string;
  role: "student" | "teacher";
  username: string;
  name: string;
  display: string;
  class?: string;
  grade?: string;
  gender?: "男" | "女";
};

type CreateFitnessRecordInput = {
  studentId: string;
  date?: string;
  semester?: string;
  items: {
    itemId: FitnessItemId;
    value: number;
  }[];
  bodyFeeling: BodyFeeling;
};

export async function loginWithDemoAccount(input: LoginInput) {
  const account = await prisma.userAccount.findUnique({
    where: { username: input.username },
    include: { student: true, class: true },
  });

  if (!account || account.role !== input.role || account.passwordHash !== input.password) {
    return null;
  }

  return {
    role: account.role,
    username: account.username,
    name: account.displayName,
    class: account.class?.name,
    grade: account.student?.grade ?? account.class?.grade,
    gender: account.student?.gender === "male" ? "男" : account.student?.gender === "female" ? "女" : undefined,
    studentId: account.studentId,
    classId: account.classId,
    timestamp: Date.now(),
  };
}

export async function getLoginAccounts(): Promise<LoginAccountOption[]> {
  const accounts = await prisma.userAccount.findMany({
    include: { student: true, class: true },
    orderBy: [{ role: "asc" }, { username: "asc" }],
  });

  return accounts.map((account) => {
    const gender = account.student?.gender === "male" ? "男" : account.student?.gender === "female" ? "女" : undefined;
    const grade = account.student?.grade ?? account.class?.grade;
    const className = account.class?.name;

    return {
      id: account.id,
      role: account.role,
      username: account.username,
      name: account.displayName,
      display: account.role === "student"
        ? `${account.displayName}（${account.username} · ${grade ?? "未分班"} · ${gender ?? "未填写"}）`
        : `${account.displayName} · ${className ?? "未分班"} · 体育教研组`,
      class: className,
      grade,
      gender,
    };
  });
}

export async function getStudentProfiles(): Promise<StudentProfile[]> {
  const rows = await prisma.student.findMany({ orderBy: { id: "asc" } });
  return rows.map(mapStudent);
}

export async function getStudentProfile(studentId: string): Promise<StudentProfile | null> {
  const row = await prisma.student.findUnique({ where: { id: studentId } });
  return row ? mapStudent(row) : null;
}

export async function getFitnessRecords(studentId: string): Promise<FitnessRecord[]> {
  const rows = await prisma.fitnessRecord.findMany({
    where: { studentId },
    include: { items: true },
    orderBy: { date: "desc" },
  });
  return rows.map(mapFitnessRecord);
}

export async function getLatestFitnessRecord(studentId: string): Promise<FitnessRecord | null> {
  const row = await prisma.fitnessRecord.findFirst({
    where: { studentId },
    include: { items: true },
    orderBy: { date: "desc" },
  });
  return row ? mapFitnessRecord(row) : null;
}

export async function getStudentListItems(): Promise<StudentListItem[]> {
  const students = await getStudentProfiles();
  const records = await prisma.fitnessRecord.findMany({
    include: { items: true },
    orderBy: { date: "desc" },
  });
  const latestByStudent = new Map<string, FitnessRecord>();

  for (const record of records.map(mapFitnessRecord)) {
    if (!latestByStudent.has(record.studentId)) {
      latestByStudent.set(record.studentId, record);
    }
  }

  return students.map((student) => ({
    student,
    latestRecord: latestByStudent.get(student.id) ?? null,
  }));
}

export async function createFitnessRecord(input: CreateFitnessRecordInput): Promise<FitnessRecord> {
  const student = await getStudentProfile(input.studentId);
  if (!student) {
    throw new Error("STUDENT_NOT_FOUND");
  }

  const recordId = `R-${randomUUID()}`;
  const items = input.items.map((item) => {
    const definition = FITNESS_ITEMS.find((def) => def.id === item.itemId);
    const score = calculateItemScore(
      item.itemId,
      item.value,
      student.gender,
      student.grade,
      definition?.higherIsBetter ?? true
    );
    return {
      id: `${recordId}-${item.itemId}`,
      itemId: item.itemId,
      value: item.value,
      score,
      grade: getGradeTier(score),
    };
  });

  const row = await prisma.fitnessRecord.create({
    data: {
      id: recordId,
      studentId: input.studentId,
      date: input.date ? new Date(input.date) : new Date(),
      semester: input.semester ?? DEFAULT_SEMESTER,
      fatigueLevel: input.bodyFeeling.fatigueLevel,
      recoveryStatus: input.bodyFeeling.recoveryStatus,
      hasSoreness: input.bodyFeeling.hasSoreness,
      sorenessAreasJson: JSON.stringify(input.bodyFeeling.sorenessAreas),
      hasDiscomfort: input.bodyFeeling.hasDiscomfort,
      discomfortNotes: input.bodyFeeling.discomfortNotes,
      items: {
        create: items,
      },
    },
    include: { items: true },
  });

  return mapFitnessRecord(row);
}

export async function getClassSummary(): Promise<ClassSummaryWithLevels> {
  const listItems = await getStudentListItems();
  const reviews = await getTeacherReviews();
  const latestRecords = listItems
    .map((item) => item.latestRecord)
    .filter((record): record is FitnessRecord => record !== null);

  const totalStudents = listItems.length;
  const recordedStudents = latestRecords.length;
  const averageBmi = roundAverage(listItems.map((item) => item.student.bmi));
  const overallScores = latestRecords.map(getAverageRecordScore);
  const passRate = percentage(overallScores.filter((score) => score >= 60).length, totalStudents);
  const excellentRate = percentage(overallScores.filter((score) => score >= 90).length, totalStudents);

  const levelCounts = {
    excellent: overallScores.filter((score) => score >= 90).length,
    good: overallScores.filter((score) => score >= 80 && score < 90).length,
    pass: overallScores.filter((score) => score >= 60 && score < 80).length,
    improve: totalStudents - overallScores.filter((score) => score >= 60).length,
  };

  const levelData = [
    { grade: "excellent" as const, label: "优秀", count: levelCounts.excellent },
    { grade: "good" as const, label: "良好", count: levelCounts.good },
    { grade: "pass" as const, label: "及格", count: levelCounts.pass },
    { grade: "improve" as const, label: "待提升", count: levelCounts.improve },
  ].map((item) => ({
    ...item,
    percentage: percentage(item.count, totalStudents),
  }));

  const weakItemRanking = FITNESS_ITEMS.filter((item) => item.id !== "height_weight")
    .map((item) => {
      const itemScores = latestRecords.flatMap((record) =>
        record.items.filter((recordItem) => recordItem.itemId === item.id).map((recordItem) => recordItem.score)
      );
      return {
        itemName: item.name,
        passRate: percentage(itemScores.filter((score) => score >= 60).length, itemScores.length),
      };
    })
    .filter((item) => Number.isFinite(item.passRate))
    .sort((a, b) => a.passRate - b.passRate)
    .slice(0, 6);

  const projectAverages = FITNESS_ITEMS.filter((item) => item.id !== "height_weight").map((item) => {
    const maleValues: number[] = [];
    const femaleValues: number[] = [];

    for (const listItem of listItems) {
      const value = listItem.latestRecord?.items.find((recordItem) => recordItem.itemId === item.id)?.value;
      if (value === undefined) continue;
      if (listItem.student.gender === "male") maleValues.push(value);
      if (listItem.student.gender === "female") femaleValues.push(value);
    }

    return {
      itemName: item.name,
      maleAverage: roundAverage(maleValues),
      femaleAverage: roundAverage(femaleValues),
      overallAverage: roundAverage([...maleValues, ...femaleValues]),
    };
  });

  const attentionStudents = listItems
    .filter((item) => {
      const avgScore = item.latestRecord ? getAverageRecordScore(item.latestRecord) : 0;
      return (
        item.student.discomforts.some((discomfort) => discomfort !== "none") ||
        item.student.bmi >= 24 ||
        avgScore < 60
      );
    })
    .slice(0, 4)
    .map((item) => ({
      studentId: item.student.id,
      name: item.student.name,
      reason: buildAttentionReason(item.student, item.latestRecord),
    }));

  return {
    totalStudents,
    recordedStudents,
    averageBmi,
    passRate,
    excellentRate,
    weakItemRanking,
    projectAverages,
    attentionStudents,
    levelData,
    pendingReviewCount: reviews.filter((review) => review.status === "pending").length,
  };
}

export async function getTeacherReviews(): Promise<TeacherReview[]> {
  const rows = await prisma.teacherReview.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(mapTeacherReview);
}

export async function getReviewsWithReports(): Promise<ReviewWithReport[]> {
  const rows = await prisma.teacherReview.findMany({
    include: { report: true },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => ({
    review: mapTeacherReview(row),
    report: row.report ? mapAIReport(row.report) : null,
  }));
}

export async function updateTeacherReview(
  reviewId: string,
  updates: Pick<TeacherReview, "status" | "teacherNotes"> & {
    modifications?: TeacherReview["modifications"];
  }
): Promise<TeacherReview> {
  const row = await prisma.teacherReview.update({
    where: { id: reviewId },
    data: {
      status: updates.status,
      teacherNotes: updates.teacherNotes,
      reviewedAt: updates.status === "pending" ? null : new Date(),
      modificationsJson: updates.modifications ? JSON.stringify(updates.modifications) : null,
      report: {
        update: {
          status: updates.status,
        },
      },
    },
  });
  return mapTeacherReview(row);
}

export async function getLatestClassReport() {
  const row = await prisma.aIReport.findFirst({
    where: { reportKind: "class", classId: DEFAULT_CLASS_ID },
    orderBy: { generatedAt: "desc" },
  });
  return row ? mapAIReport(row) : null;
}

export async function upsertAIReportForReview(
  reportKind: "student" | "class",
  report: AIStudentReport | AIClassReport,
  mode: "ai" | "mock",
  options?: { studentId?: string; classId?: string }
) {
  const reportId = report.id;
  const classId = options?.classId ?? DEFAULT_CLASS_ID;
  const studentId = reportKind === "student"
    ? options?.studentId ?? (report as AIStudentReport).studentId
    : undefined;

  await prisma.aIReport.upsert({
    where: { id: reportId },
    update: {
      reportKind,
      studentId,
      classId: reportKind === "class" ? classId : undefined,
      contentJson: JSON.stringify(report),
      mode,
      status: "pending",
      version: report.version,
      generatedAt: new Date(report.generatedAt),
    },
    create: {
      id: reportId,
      reportKind,
      studentId,
      classId: reportKind === "class" ? classId : undefined,
      contentJson: JSON.stringify(report),
      mode,
      status: "pending",
      version: report.version,
      generatedAt: new Date(report.generatedAt),
    },
  });

  await prisma.teacherReview.upsert({
    where: { id: `review-${reportId}` },
    update: {
      reportId,
      reportType: reportKind,
      status: "pending",
      reviewerName: "王老师",
      teacherNotes: "",
      reviewedAt: null,
      modificationsJson: null,
    },
    create: {
      id: `review-${reportId}`,
      reportId,
      reportType: reportKind,
      status: "pending",
      reviewerName: "王老师",
      teacherNotes: "",
    },
  });
}

function getGradeTier(score: number): GradeTier {
  if (score >= 90) return "excellent";
  if (score >= 80) return "good";
  if (score >= 60) return "pass";
  return "improve";
}

function getAverageRecordScore(record: FitnessRecord): number {
  return Math.round(record.items.reduce((sum, item) => sum + item.score, 0) / record.items.length);
}

function roundAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function percentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 1000) / 10;
}

function buildAttentionReason(student: StudentProfile, record: FitnessRecord | null): string {
  const reasons: string[] = [];
  if (student.bmi >= 24) reasons.push("BMI 指标值得关注");
  if (student.discomforts.some((discomfort) => discomfort !== "none")) {
    reasons.push("存在需要教师留意的运动关注信息");
  }
  if (record && getAverageRecordScore(record) < 60) {
    reasons.push("多个项目有提升空间");
  }
  if (!record) reasons.push("暂无体测记录");
  return reasons.length > 0 ? reasons.join("，") : "建议持续观察近期训练反馈";
}
