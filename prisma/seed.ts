import { PrismaClient } from "@prisma/client";
import { mockStudents } from "../src/lib/data/mock-students";
import { mockFitnessRecords } from "../src/lib/data/mock-fitness-records";
import {
  mockAIClassReport,
  mockAIStudentReport,
  mockTeacherReviews,
} from "../src/lib/data/mock-ai-reports";
import type { FitnessRecord, FitnessRecordItem, Gender, GradeLevel } from "../src/lib/types";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo123";
const CLASS_ID = "class-2025-spring-02-01";

async function main() {
  await prisma.classGroup.upsert({
    where: { id: CLASS_ID },
    update: {
      name: "高二(1)班",
      grade: "高二",
      semester: "2025-春季",
      teacherId: "teacher-zhou",
    },
    create: {
      id: CLASS_ID,
      name: "高二(1)班",
      grade: "高二",
      semester: "2025-春季",
      teacherId: "teacher-zhou",
    },
  });

  // 创建体测批次
  const OFFICIAL_BATCH_ID = "batch-2025-spring-official";
  const ACTIVE_BATCH_ID = "batch-2025-spring-active";

  await prisma.assessmentBatch.upsert({
    where: { id: OFFICIAL_BATCH_ID },
    update: { name: "2026春季学期首测", academicYear: "2025-2026", semester: "春季", round: 1, type: "official", classId: CLASS_ID, status: "archived" },
    create: { id: OFFICIAL_BATCH_ID, name: "2026春季学期首测", academicYear: "2025-2026", semester: "春季", round: 1, type: "official", classId: CLASS_ID, status: "archived" },
  });

  await prisma.assessmentBatch.upsert({
    where: { id: ACTIVE_BATCH_ID },
    update: { name: "2026春季日常训练", academicYear: "2025-2026", semester: "春季", round: 1, type: "daily", classId: CLASS_ID, status: "active" },
    create: { id: ACTIVE_BATCH_ID, name: "2026春季日常训练", academicYear: "2025-2026", semester: "春季", round: 1, type: "daily", classId: CLASS_ID, status: "active" },
  });

  await prisma.userAccount.deleteMany({
    where: { role: "teacher", username: { not: "zhoulaoshi" } },
  });

  for (const student of mockStudents) {
    await prisma.student.upsert({
      where: { id: student.id },
      update: {
        name: student.name,
        gender: student.gender,
        grade: student.grade,
        age: student.age,
        height: student.height,
        weight: student.weight,
        bmi: student.bmi,
        sportGoal: student.sportGoal,
        sportBase: student.sportBase,
        discomfortsJson: JSON.stringify(student.discomforts),
        classId: CLASS_ID,
      },
      create: {
        id: student.id,
        name: student.name,
        gender: student.gender,
        grade: student.grade,
        age: student.age,
        height: student.height,
        weight: student.weight,
        bmi: student.bmi,
        sportGoal: student.sportGoal,
        sportBase: student.sportBase,
        discomfortsJson: JSON.stringify(student.discomforts),
        classId: CLASS_ID,
        createdAt: new Date(student.createdAt),
        updatedAt: new Date(student.updatedAt),
      },
    });

    await prisma.userAccount.upsert({
      where: { username: student.id },
      update: {
        role: "student",
        displayName: student.name,
        passwordHash: DEMO_PASSWORD,
        studentId: student.id,
        classId: CLASS_ID,
      },
      create: {
        id: `account-${student.id.toLowerCase()}`,
        role: "student",
        username: student.id,
        displayName: student.name,
        passwordHash: DEMO_PASSWORD,
        studentId: student.id,
        classId: CLASS_ID,
      },
    });
  }

  await prisma.userAccount.upsert({
    where: { username: "zhoulaoshi" },
    update: {
      role: "teacher",
      displayName: "周老师",
      passwordHash: DEMO_PASSWORD,
      classId: CLASS_ID,
    },
    create: {
      id: "teacher-zhou",
      role: "teacher",
      username: "zhoulaoshi",
      displayName: "周老师",
      passwordHash: DEMO_PASSWORD,
      classId: CLASS_ID,
    },
  });

  const seededRecords = buildSeedRecords();

  for (const record of seededRecords) {
    await prisma.fitnessRecord.upsert({
      where: { id: record.id },
      update: {
        studentId: record.studentId,
        date: new Date(record.date),
        semester: record.semester,
        batchId: OFFICIAL_BATCH_ID,
        recordType: "official_test",
        fatigueLevel: record.bodyFeeling.fatigueLevel,
        recoveryStatus: record.bodyFeeling.recoveryStatus,
        hasSoreness: record.bodyFeeling.hasSoreness,
        sorenessAreasJson: JSON.stringify(record.bodyFeeling.sorenessAreas),
        hasDiscomfort: record.bodyFeeling.hasDiscomfort,
        discomfortNotes: record.bodyFeeling.discomfortNotes,
        items: {
          deleteMany: {},
          create: record.items.map((item) => ({
            id: `${record.id}-${item.itemId}`,
            itemId: item.itemId,
            value: item.value,
            score: item.score,
            grade: item.grade,
          })),
        },
      },
      create: {
        id: record.id,
        studentId: record.studentId,
        date: new Date(record.date),
        semester: record.semester,
        batchId: OFFICIAL_BATCH_ID,
        recordType: "official_test",
        fatigueLevel: record.bodyFeeling.fatigueLevel,
        recoveryStatus: record.bodyFeeling.recoveryStatus,
        hasSoreness: record.bodyFeeling.hasSoreness,
        sorenessAreasJson: JSON.stringify(record.bodyFeeling.sorenessAreas),
        hasDiscomfort: record.bodyFeeling.hasDiscomfort,
        discomfortNotes: record.bodyFeeling.discomfortNotes,
        items: {
          create: record.items.map((item) => ({
            id: `${record.id}-${item.itemId}`,
            itemId: item.itemId,
            value: item.value,
            score: item.score,
            grade: item.grade,
          })),
        },
      },
    });
  }

  // 部分记录学生示例 — S018: 仅肺活量+坐位体前屈（2/6项）
  const PARTIAL_RECORD_ID_1 = "R018";
  await prisma.fitnessRecord.upsert({
    where: { id: PARTIAL_RECORD_ID_1 },
    update: {
      studentId: "S018", date: new Date("2026-03-15T10:00:00Z"), semester: "高二下 · 2026春季",
      batchId: OFFICIAL_BATCH_ID, recordType: "official_test",
      fatigueLevel: 4, recoveryStatus: "normal", hasSoreness: false, sorenessAreasJson: "[]", hasDiscomfort: false, discomfortNotes: "",
      items: {
        deleteMany: {},
        create: [
          { id: "R018-vital_capacity", itemId: "vital_capacity", value: 2600, score: 70, grade: "pass" },
          { id: "R018-sit_and_reach", itemId: "sit_and_reach", value: 9, score: 68, grade: "pass" },
        ],
      },
    },
    create: {
      id: PARTIAL_RECORD_ID_1, studentId: "S018", date: new Date("2026-03-15T10:00:00Z"), semester: "高二下 · 2026春季",
      batchId: OFFICIAL_BATCH_ID, recordType: "official_test",
      fatigueLevel: 4, recoveryStatus: "normal", hasSoreness: false, sorenessAreasJson: "[]", hasDiscomfort: false, discomfortNotes: "",
      items: {
        create: [
          { id: "R018-vital_capacity", itemId: "vital_capacity", value: 2600, score: 70, grade: "pass" },
          { id: "R018-sit_and_reach", itemId: "sit_and_reach", value: 9, score: 68, grade: "pass" },
        ],
      },
    },
  });

  // 部分记录学生示例 — S019: 仅跑步项目（50m+1000m，2/6项）
  const PARTIAL_RECORD_ID_2 = "R019";
  await prisma.fitnessRecord.upsert({
    where: { id: PARTIAL_RECORD_ID_2 },
    update: {
      studentId: "S019", date: new Date("2026-03-15T10:00:00Z"), semester: "高二下 · 2026春季",
      batchId: OFFICIAL_BATCH_ID, recordType: "official_test",
      fatigueLevel: 6, recoveryStatus: "quick", hasSoreness: true, sorenessAreasJson: JSON.stringify(["腿部"]), hasDiscomfort: false, discomfortNotes: "",
      items: {
        deleteMany: {},
        create: [
          { id: "R019-50m_run", itemId: "50m_run", value: 7.8, score: 85, grade: "good" },
          { id: "R019-1000m_run", itemId: "1000m_run", value: 255, score: 72, grade: "pass" },
        ],
      },
    },
    create: {
      id: PARTIAL_RECORD_ID_2, studentId: "S019", date: new Date("2026-03-15T10:00:00Z"), semester: "高二下 · 2026春季",
      batchId: OFFICIAL_BATCH_ID, recordType: "official_test",
      fatigueLevel: 6, recoveryStatus: "quick", hasSoreness: true, sorenessAreasJson: JSON.stringify(["腿部"]), hasDiscomfort: false, discomfortNotes: "",
      items: {
        create: [
          { id: "R019-50m_run", itemId: "50m_run", value: 7.8, score: 85, grade: "good" },
          { id: "R019-1000m_run", itemId: "1000m_run", value: 255, score: 72, grade: "pass" },
        ],
      },
    },
  });

  // S001 日常训练记录（2026年数据）
  for (const dr of [
    { id: "R-D01", date: "2026-05-15T08:00:00Z", fatigue: 7, recovery: "normal" as const, soreness: true, items: [{ id: "R-D01-50m_run", itemId: "50m_run" as const, value: 7.6, score: 88, grade: "good" as const }, { id: "R-D01-1000m_run", itemId: "1000m_run" as const, value: 242, score: 78, grade: "good" as const }] },
    { id: "R-D02", date: "2026-05-22T07:30:00Z", fatigue: 5, recovery: "quick" as const, soreness: false, items: [{ id: "R-D02-50m_run", itemId: "50m_run" as const, value: 7.4, score: 90, grade: "excellent" as const }] },
    { id: "R-D03", date: "2026-06-01T08:15:00Z", fatigue: 4, recovery: "quick" as const, soreness: false, items: [{ id: "R-D03-pull_up", itemId: "pull_up" as const, value: 8, score: 82, grade: "good" as const }, { id: "R-D03-sit_and_reach", itemId: "sit_and_reach" as const, value: 14, score: 78, grade: "good" as const }] },
  ]) {
    await prisma.fitnessRecord.upsert({
      where: { id: dr.id },
      update: { studentId: "S001", date: new Date(dr.date), semester: "高二下 · 2026春季", batchId: ACTIVE_BATCH_ID, recordType: "daily_training", fatigueLevel: dr.fatigue, recoveryStatus: dr.recovery, hasSoreness: dr.soreness, sorenessAreasJson: "[]", hasDiscomfort: false, discomfortNotes: "", items: { deleteMany: {}, create: dr.items } },
      create: { id: dr.id, studentId: "S001", date: new Date(dr.date), semester: "高二下 · 2026春季", batchId: ACTIVE_BATCH_ID, recordType: "daily_training", fatigueLevel: dr.fatigue, recoveryStatus: dr.recovery, hasSoreness: dr.soreness, sorenessAreasJson: "[]", hasDiscomfort: false, discomfortNotes: "", items: { create: dr.items } },
    });
  }

  await prisma.aIReport.upsert({
    where: { id: mockAIStudentReport.id },
    update: {
      reportKind: "student",
      studentId: mockAIStudentReport.studentId,
      contentJson: JSON.stringify(mockAIStudentReport),
      mode: "mock",
      status: "pending",
      version: mockAIStudentReport.version,
      sourceRecordId: "R001",
      sourceRecordDate: new Date("2026-03-15T10:00:00Z"),
      sourceSummary: "高二下 · 2026春季综合体测记录",
      generatedAt: new Date(mockAIStudentReport.generatedAt),
    },
    create: {
      id: mockAIStudentReport.id,
      reportKind: "student",
      studentId: mockAIStudentReport.studentId,
      contentJson: JSON.stringify(mockAIStudentReport),
      mode: "mock",
      status: "pending",
      version: mockAIStudentReport.version,
      sourceRecordId: "R001",
      sourceRecordDate: new Date("2026-03-15T10:00:00Z"),
      sourceSummary: "高二下 · 2026春季综合体测记录",
      generatedAt: new Date(mockAIStudentReport.generatedAt),
    },
  });

  await prisma.aIReport.upsert({
    where: { id: mockAIClassReport.id },
    update: {
      reportKind: "class",
      classId: CLASS_ID,
      contentJson: JSON.stringify(mockAIClassReport),
      mode: "mock",
      status: "pending",
      version: mockAIClassReport.version,
      generatedAt: new Date(mockAIClassReport.generatedAt),
    },
    create: {
      id: mockAIClassReport.id,
      reportKind: "class",
      classId: CLASS_ID,
      contentJson: JSON.stringify(mockAIClassReport),
      mode: "mock",
      status: "pending",
      version: mockAIClassReport.version,
      generatedAt: new Date(mockAIClassReport.generatedAt),
    },
  });

  for (const review of mockTeacherReviews) {
    await prisma.teacherReview.upsert({
      where: { id: review.id },
      update: {
        reportId: review.reportId,
        reportType: review.reportType,
      reviewerName: "周老师",
        status: review.status,
        teacherNotes: review.teacherNotes,
        reviewedAt: review.reviewedAt ? new Date(review.reviewedAt) : null,
        modificationsJson: review.modifications ? JSON.stringify(review.modifications) : null,
      },
      create: {
        id: review.id,
        reportId: review.reportId,
        reportType: review.reportType,
        reviewerName: "周老师",
        status: review.status,
        teacherNotes: review.teacherNotes,
        reviewedAt: review.reviewedAt ? new Date(review.reviewedAt) : null,
        modificationsJson: review.modifications ? JSON.stringify(review.modifications) : null,
      },
    });
  }
}

function buildSeedRecords(): FitnessRecord[] {
  const existing = [...mockFitnessRecords];
  const existingStudentIds = new Set(existing.map((record) => record.studentId));
  const generated = mockStudents
    .filter((student) => !existingStudentIds.has(student.id))
    .map((student, index) => createRecordForStudent(student.id, student.gender, student.grade, index));

  return [...existing, ...generated];
}

function createRecordForStudent(
  studentId: string,
  gender: Gender,
  grade: GradeLevel,
  index: number
): FitnessRecord {
  const base = index + 1;
  const isMale = gender === "male";
  const items: FitnessRecordItem[] = [
    { itemId: "vital_capacity", value: isMale ? 3050 + base * 75 : 2400 + base * 55, score: 76 + (base % 5) * 3, grade: base % 4 === 0 ? "pass" : "good" },
    { itemId: "50m_run", value: isMale ? 8.7 - (base % 4) * 0.2 : 9.2 - (base % 4) * 0.18, score: 70 + (base % 5) * 4, grade: base % 5 === 0 ? "pass" : "good" },
    { itemId: "standing_long_jump", value: isMale ? 182 + base * 4 : 150 + base * 3, score: 68 + (base % 6) * 4, grade: base % 6 === 0 ? "pass" : "good" },
    { itemId: "sit_and_reach", value: isMale ? 8 + (base % 8) : 12 + (base % 8), score: 72 + (base % 5) * 3, grade: "pass" },
    isMale
      ? { itemId: "pull_up", value: 3 + (base % 8), score: 62 + (base % 6) * 5, grade: base % 3 === 0 ? "pass" : "good" }
      : { itemId: "sit_up", value: 28 + (base % 14), score: 66 + (base % 6) * 4, grade: base % 3 === 0 ? "pass" : "good" },
    isMale
      ? { itemId: "1000m_run", value: 286 - (base % 6) * 7, score: 62 + (base % 6) * 5, grade: base % 4 === 0 ? "pass" : "good" }
      : { itemId: "800m_run", value: 266 - (base % 6) * 6, score: 62 + (base % 6) * 5, grade: base % 4 === 0 ? "pass" : "good" },
  ];

  return {
    id: `R${String(100 + index).padStart(3, "0")}`,
    studentId,
    date: new Date(Date.UTC(2025, 2, 16, 8, index * 6)).toISOString(),
    semester: `${grade}下 · 2026春季`,
    batchId: undefined,
    recordType: "official_test" as const,
    items,
    bodyFeeling: {
      fatigueLevel: 3 + (base % 6),
      recoveryStatus: base % 5 === 0 ? "slow" : base % 2 === 0 ? "normal" : "quick",
      hasSoreness: base % 3 === 0,
      sorenessAreas: base % 3 === 0 ? ["腿部"] : [],
      hasDiscomfort: false,
      discomfortNotes: "",
    },
  };
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
