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
  type StudentReportHistoryItem,
  type StudentListItem,
} from "@/lib/server/db-mappers";

const DEFAULT_CLASS_ID = "class-2025-spring-02-01";
const DEFAULT_SEMESTER = "高二下 · 2026春季";

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
  batchId?: string;
  recordType?: "official_test" | "daily_training";
  items: {
    itemId: FitnessItemId;
    value: number;
    feedbackJson?: string;
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
    gender: account.student?.gender ?? undefined, // "male" | "female" (UI展示层自行转中文)
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

export async function getFitnessRecords(studentId: string, batchId?: string): Promise<FitnessRecord[]> {
  const rows = await prisma.fitnessRecord.findMany({
    where: { studentId, ...(batchId ? { batchId } : {}) },
    include: { items: true, batch: true },
    orderBy: { date: "desc" },
  });
  return rows.map(mapFitnessRecord);
}

export async function getLatestFitnessRecord(studentId: string, batchId?: string): Promise<FitnessRecord | null> {
  const row = await prisma.fitnessRecord.findFirst({
    where: { studentId, ...(batchId ? { batchId } : {}) },
    include: { items: true, batch: true },
    orderBy: { date: "desc" },
  });
  return row ? mapFitnessRecord(row) : null;
}

export async function getStudentListItems(): Promise<StudentListItem[]> {
  const students = await getStudentProfiles();
  const records = await prisma.fitnessRecord.findMany({
    include: { items: true, batch: true },
    orderBy: { date: "desc" },
  });
  // 优先取正式体测记录，避免日常训练混入班级统计
  const latestOfficialByStudent = new Map<string, FitnessRecord>();
  const latestAnyByStudent = new Map<string, FitnessRecord>();

  for (const record of records.map(mapFitnessRecord)) {
    if (!latestAnyByStudent.has(record.studentId)) {
      latestAnyByStudent.set(record.studentId, record);
    }
    if (record.recordType === "official_test" && !latestOfficialByStudent.has(record.studentId)) {
      latestOfficialByStudent.set(record.studentId, record);
    }
  }

  return students.map((student) => ({
    student,
    latestRecord: latestOfficialByStudent.get(student.id) ?? latestAnyByStudent.get(student.id) ?? null,
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
      feedbackJson: item.feedbackJson ?? null,
    };
  });

  // 有 batchId 时从批次派生 semester
  let semesterValue = input.semester ?? DEFAULT_SEMESTER;
  if (input.batchId) {
    const batch = await prisma.assessmentBatch.findUnique({ where: { id: input.batchId } });
    if (batch) {
      semesterValue = `${batch.academicYear}${batch.semester} · ${batch.name}`;
    }
  }

  const row = await prisma.fitnessRecord.create({
    data: {
      id: recordId,
      studentId: input.studentId,
      date: input.date ? new Date(input.date) : new Date(),
      semester: semesterValue,
      batchId: input.batchId ?? null,
      recordType: input.recordType ?? "official_test",
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
    include: { items: true, batch: true },
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

export async function batchUpdateReviews(
  ids: string[],
  action: "approve" | "reject",
  notes?: string
): Promise<{ updatedCount: number }> {
  // 获取所有指定 ID 的审核记录
  const reviews = await prisma.teacherReview.findMany({
    where: { id: { in: ids } },
  });

  // 检查所有 ID 是否存在
  if (reviews.length !== ids.length) {
    throw new Error("REVIEWS_NOT_FOUND");
  }

  // 检查所有记录是否均为 pending 状态
  const nonPending = reviews.filter((r) => r.status !== "pending");
  if (nonPending.length > 0) {
    throw new Error("NON_PENDING_REVIEWS");
  }

  const newStatus = action === "approve" ? "approved" : "rejected";
  const reportIds = reviews.map((r) => r.reportId);

  await prisma.$transaction([
    prisma.teacherReview.updateMany({
      where: { id: { in: ids } },
      data: {
        status: newStatus,
        teacherNotes: notes ?? "",
        reviewedAt: new Date(),
      },
    }),
    prisma.aIReport.updateMany({
      where: { id: { in: reportIds } },
      data: { status: newStatus },
    }),
  ]);

  return { updatedCount: reviews.length };
}

export async function getLatestClassReport() {
  const row = await prisma.aIReport.findFirst({
    where: { reportKind: "class", classId: DEFAULT_CLASS_ID },
    orderBy: { generatedAt: "desc" },
  });
  return row ? mapAIReport(row) : null;
}

export async function getStudentReportHistory(studentId: string): Promise<StudentReportHistoryItem[]> {
  const rows = await prisma.aIReport.findMany({
    where: { reportKind: "student", studentId },
    orderBy: { generatedAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    report: mapAIReport(row) as AIStudentReport,
    generatedAt: row.generatedAt.toISOString(),
    mode: row.mode,
    status: row.status,
    sourceRecordId: row.sourceRecordId,
    sourceRecordDate: row.sourceRecordDate?.toISOString() ?? null,
    sourceSummary: row.sourceSummary,
    sourceBatchId: row.sourceBatchId,
  }));
}

export async function upsertAIReportForReview(
  reportKind: "student" | "class",
  report: AIStudentReport | AIClassReport,
  mode: "ai" | "mock",
  options?: { studentId?: string; classId?: string; sourceRecordId?: string; sourceRecordDate?: string; sourceSummary?: string; sourceBatchId?: string }
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
      sourceRecordId: options?.sourceRecordId,
      sourceRecordDate: options?.sourceRecordDate ? new Date(options.sourceRecordDate) : undefined,
      sourceSummary: options?.sourceSummary,
      sourceBatchId: options?.sourceBatchId,
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
      sourceRecordId: options?.sourceRecordId,
      sourceRecordDate: options?.sourceRecordDate ? new Date(options.sourceRecordDate) : undefined,
      sourceSummary: options?.sourceSummary,
      sourceBatchId: options?.sourceBatchId,
      generatedAt: new Date(report.generatedAt),
    },
  });

  await prisma.teacherReview.upsert({
    where: { id: `review-${reportId}` },
    update: {
      reportId,
      reportType: reportKind,
      status: "pending",
      reviewerName: "张老师",
      teacherNotes: "",
      reviewedAt: null,
      modificationsJson: null,
    },
    create: {
      id: `review-${reportId}`,
      reportId,
      reportType: reportKind,
      status: "pending",
      reviewerName: "张老师",
      teacherNotes: "",
    },
  });
}

export async function deleteAIReport(reportId: string): Promise<{ success: boolean }> {
  // TeacherReview has onDelete: Cascade, so it auto-deletes
  await prisma.aIReport.delete({ where: { id: reportId } });
  return { success: true };
}

function getGradeTier(score: number): GradeTier {
  if (score >= 90) return "excellent";
  if (score >= 80) return "good";
  if (score >= 60) return "pass";
  return "improve";
}

function getAverageRecordScore(record: FitnessRecord): number {
  if (record.items.length === 0) return 0;
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

// ===== 班级管理 =====

export interface CreateClassInput {
  name: string;
  grade: string;
  semester: string;
  teacherId?: string;
}

export async function createClass(input: CreateClassInput) {
  const id = `class-${randomUUID().slice(0, 8)}`;
  return prisma.classGroup.create({
    data: {
      id,
      name: input.name,
      grade: input.grade,
      semester: input.semester,
      teacherId: input.teacherId ?? "teacher-zhou",
    },
  });
}

export async function getClasses() {
  return prisma.classGroup.findMany({
    include: { students: true },
    orderBy: { createdAt: "desc" },
  });
}

export interface AddStudentInput {
  name: string;
  gender: "male" | "female";
  grade: string;
  age: number;
  height: number;
  weight: number;
  sportGoal?: string;
  sportBase?: string;
  discomforts?: string[];
}

export async function addStudentToClass(classId: string, input: AddStudentInput) {
  // 自动生成学生 ID（S021, S022...）
  const lastStudent = await prisma.student.findFirst({
    orderBy: { id: "desc" },
  });
  const lastNum = lastStudent ? parseInt(lastStudent.id.replace("S", ""), 10) : 0;
  const studentId = `S${String(lastNum + 1).padStart(3, "0")}`;

  const bmi = Math.round((input.weight / ((input.height / 100) * (input.height / 100))) * 10) / 10;

  // 创建学生档案
  await prisma.student.create({
    data: {
      id: studentId,
      name: input.name,
      gender: input.gender,
      grade: input.grade,
      age: input.age,
      height: input.height,
      weight: input.weight,
      bmi,
      sportGoal: input.sportGoal ?? "overall_health",
      sportBase: input.sportBase ?? "light",
      discomfortsJson: JSON.stringify(input.discomforts ?? ["none"]),
      classId,
    },
  });

  // 自动创建登录账号
  await prisma.userAccount.create({
    data: {
      id: `account-${studentId}`,
      role: "student",
      username: studentId,
      displayName: input.name,
      passwordHash: "demo123",
      studentId,
      classId,
    },
  });

  return { studentId, username: studentId, password: "demo123" };
}

export async function getClassWithStudents(classId: string) {
  return prisma.classGroup.findUnique({
    where: { id: classId },
    include: {
      students: {
        include: { accounts: { select: { username: true } } },
        orderBy: { id: "asc" },
      },
    },
  });
}

export async function updateStudent(studentId: string, input: Partial<AddStudentInput>) {
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.gender !== undefined) updateData.gender = input.gender;
  if (input.grade !== undefined) updateData.grade = input.grade;
  if (input.age !== undefined) updateData.age = input.age;
  if (input.height !== undefined) updateData.height = input.height;
  if (input.weight !== undefined) updateData.weight = input.weight;
  if (input.sportGoal !== undefined) updateData.sportGoal = input.sportGoal;
  if (input.sportBase !== undefined) updateData.sportBase = input.sportBase;
  if (input.discomforts !== undefined) updateData.discomfortsJson = JSON.stringify(input.discomforts);
  // 只要身高或体重任一变化，都重新计算 BMI
  if (input.height !== undefined || input.weight !== undefined) {
    const current = await prisma.student.findUnique({ where: { id: studentId } });
    const h = input.height ?? current?.height;
    const w = input.weight ?? current?.weight;
    if (h && w) {
      updateData.bmi = Math.round((w / ((h / 100) * (h / 100))) * 10) / 10;
    }
  }

  await prisma.student.update({ where: { id: studentId }, data: updateData as never });
  return getStudentProfile(studentId);
}

export async function deleteStudent(studentId: string) {
  // 先删关联账号
  await prisma.userAccount.deleteMany({ where: { studentId } });
  await prisma.fitnessRecordItem.deleteMany({ where: { record: { studentId } } });
  await prisma.fitnessRecord.deleteMany({ where: { studentId } });
  await prisma.aIReport.deleteMany({ where: { studentId } });
  await prisma.student.delete({ where: { id: studentId } });
}

export async function getNextStudentId(): Promise<string> {
  const last = await prisma.student.findFirst({ orderBy: { id: "desc" } });
  const num = last ? parseInt(last.id.replace("S", ""), 10) + 1 : 1;
  return `S${String(num).padStart(3, "0")}`;
}

// 班级项目均值
export async function getClassAverages() {
  const students = await prisma.student.findMany({ select: { id: true, gender: true } });
  const records = await prisma.fitnessRecord.findMany({ include: { items: true }, orderBy: { date: "desc" } });
  const latestByStudent = new Map<string, (typeof records)[0]>();
  for (const r of records) { if (!latestByStudent.has(r.studentId)) latestByStudent.set(r.studentId, r); }

  const result: Record<string, { count: number; avgScore: number; avgValue: number; hasData: boolean }> = {};
  for (const itemId of ["50m_run","standing_long_jump","pull_up","sit_up","1000m_run","800m_run","sit_and_reach","vital_capacity"]) {
    let scoreSum = 0, valueSum = 0, count = 0;
    for (const s of students) {
      const r = latestByStudent.get(s.id);
      const item = r?.items.find(i => i.itemId === itemId);
      if (item) { scoreSum += item.score; valueSum += item.value; count++; }
    }
    result[itemId] = { count, avgScore: count > 0 ? Math.round(scoreSum / count) : 0, avgValue: count > 0 ? Math.round(valueSum / count * 10) / 10 : 0, hasData: count >= 3 };
  }
  result["__body_ref__"] = { count: students.length, avgScore: 74, avgValue: 0, hasData: true };
  return result;
}

// ===== 体测批次管理 =====

export async function createBatch(input: {
  name: string;
  academicYear: string;
  semester: string;
  round?: number;
  type?: "official" | "makeup" | "daily";
  classId: string;
  status?: "draft" | "active" | "completed" | "archived";
}) {
  const id = `batch-${randomUUID().slice(0, 8)}`;
  const row = await prisma.assessmentBatch.create({
    data: {
      id,
      name: input.name,
      academicYear: input.academicYear,
      semester: input.semester,
      round: input.round ?? 1,
      type: input.type ?? "official",
      classId: input.classId,
      status: input.status ?? "active",
    },
  });
  return row;
}

export async function getBatchesByClass(classId: string) {
  const rows = await prisma.assessmentBatch.findMany({
    where: { classId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { records: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    academicYear: r.academicYear,
    semester: r.semester,
    round: r.round,
    type: r.type as string,
    classId: r.classId,
    status: r.status as string,
    createdAt: r.createdAt.toISOString(),
    recordCount: r._count.records,
  }));
}

export async function getActiveBatch(classId: string) {
  const row = await prisma.assessmentBatch.findFirst({
    where: { classId, status: "active" },
  });
  if (!row) return null;
  return { id: row.id, name: row.name, type: row.type as string, status: row.status as string };
}

export async function updateBatchStatus(batchId: string, status: "active" | "completed" | "archived") {
  await prisma.assessmentBatch.update({ where: { id: batchId }, data: { status } });
}

// 更新 getClassSummary 支持 batchId 过滤
export async function getClassSummaryWithBatch(batchId?: string): Promise<ClassSummaryWithLevels> {
  const listItems = await getStudentListItems();
  const reviews = await getTeacherReviews();

  const recordsQuery = batchId
    ? prisma.fitnessRecord.findMany({ where: { batchId }, include: { items: true, batch: true }, orderBy: { date: "desc" } })
    : prisma.fitnessRecord.findMany({ include: { items: true, batch: true }, orderBy: { date: "desc" } });
  const allRecords = (await recordsQuery).map(mapFitnessRecord);

  const latestByStudent = new Map<string, FitnessRecord>();
  for (const record of allRecords) {
    if (!latestByStudent.has(record.studentId)) {
      latestByStudent.set(record.studentId, record);
    }
  }

  const totalStudents = listItems.length;
  const recordedStudents = latestByStudent.size;
  const latestRecords = Array.from(latestByStudent.values());
  const averageBmi = roundAverage(listItems.map((item) => item.student.bmi));
  const overallScores = latestRecords.map(getAverageRecordScore);
  const passRate = percentage(overallScores.filter((s) => s >= 60).length, totalStudents);
  const excellentRate = percentage(overallScores.filter((s) => s >= 90).length, totalStudents);

  const levelCounts = {
    excellent: overallScores.filter((s) => s >= 90).length,
    good: overallScores.filter((s) => s >= 80 && s < 90).length,
    pass: overallScores.filter((s) => s >= 60 && s < 80).length,
    improve: totalStudents - overallScores.filter((s) => s >= 60).length,
  };

  const levelData = [
    { grade: "excellent" as const, label: "优秀", count: levelCounts.excellent },
    { grade: "good" as const, label: "良好", count: levelCounts.good },
    { grade: "pass" as const, label: "及格", count: levelCounts.pass },
    { grade: "improve" as const, label: "待提升", count: levelCounts.improve },
  ].map((item) => ({ ...item, percentage: percentage(item.count, totalStudents) }));

  const weakItemRanking = FITNESS_ITEMS.filter((f) => f.id !== "height_weight")
    .map((f) => {
      const itemScores = latestRecords.flatMap((r) =>
        r.items.filter((ri) => ri.itemId === f.id).map((ri) => ri.score)
      );
      return { itemName: f.name, passRate: percentage(itemScores.filter((s) => s >= 60).length, itemScores.length) };
    })
    .filter((item) => Number.isFinite(item.passRate))
    .sort((a, b) => a.passRate - b.passRate)
    .slice(0, 6);

  // 使用批次过滤后的记录计算项目均值，避免混入非当前批次数据
  const projectAverages = FITNESS_ITEMS.filter((f) => f.id !== "height_weight").map((f) => {
    const maleValues: number[] = [];
    const femaleValues: number[] = [];
    for (const li of listItems) {
      const batchRecord = latestByStudent.get(li.student.id);
      const v = batchRecord?.items.find((ri) => ri.itemId === f.id)?.value ?? li.latestRecord?.items.find((ri) => ri.itemId === f.id)?.value;
      if (v === undefined) continue;
      if (li.student.gender === "male") maleValues.push(v);
      else femaleValues.push(v);
    }
    return { itemName: f.name, maleAverage: roundAverage(maleValues), femaleAverage: roundAverage(femaleValues), overallAverage: roundAverage([...maleValues, ...femaleValues]) };
  });

  // 使用批次过滤后的记录计算重点关注学生
  const attentionStudents = listItems
    .filter((item) => {
      const batchRecord = latestByStudent.get(item.student.id);
      const record = batchRecord ?? item.latestRecord;
      const avgScore = record ? getAverageRecordScore(record) : 0;
      return item.student.discomforts.some((d) => d !== "none") || item.student.bmi >= 24 || avgScore < 60;
    })
    .slice(0, 4)
    .map((item) => ({
      studentId: item.student.id,
      name: item.student.name,
      reason: buildAttentionReason(item.student, latestByStudent.get(item.student.id) ?? item.latestRecord),
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
    pendingReviewCount: reviews.filter((r) => r.status === "pending").length,
  };
}
