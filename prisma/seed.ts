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
    update: { name: "2025春季学期首测", academicYear: "2024-2025", semester: "春季", round: 1, type: "official", classId: CLASS_ID, status: "archived" },
    create: { id: OFFICIAL_BATCH_ID, name: "2025春季学期首测", academicYear: "2024-2025", semester: "春季", round: 1, type: "official", classId: CLASS_ID, status: "archived" },
  });

  await prisma.assessmentBatch.upsert({
    where: { id: ACTIVE_BATCH_ID },
    update: { name: "2025春季日常训练", academicYear: "2024-2025", semester: "春季", round: 1, type: "daily", classId: CLASS_ID, status: "active" },
    create: { id: ACTIVE_BATCH_ID, name: "2025春季日常训练", academicYear: "2024-2025", semester: "春季", round: 1, type: "daily", classId: CLASS_ID, status: "active" },
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
      sourceRecordDate: new Date("2025-03-15T10:00:00Z"),
      sourceSummary: "高二下 · 2025春季综合体测记录",
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
      sourceRecordDate: new Date("2025-03-15T10:00:00Z"),
      sourceSummary: "高二下 · 2025春季综合体测记录",
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
    semester: `${grade}下 · 2025春季`,
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
