import { PrismaClient } from "@prisma/client";
import { mockStudents } from "../src/lib/data/mock-students";
import { mockFitnessRecords } from "../src/lib/data/mock-fitness-records";
import {
  mockAIClassReport,
  mockAIStudentReport,
  mockTeacherReviews,
} from "../src/lib/data/mock-ai-reports";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo123";
const CLASS_ID = "class-2025-spring-02-03";

async function main() {
  await prisma.classGroup.upsert({
    where: { id: CLASS_ID },
    update: {
      name: "初二(3)班",
      grade: "初二",
      semester: "2025-春季",
      teacherId: "teacher-wang",
    },
    create: {
      id: CLASS_ID,
      name: "初二(3)班",
      grade: "初二",
      semester: "2025-春季",
      teacherId: "teacher-wang",
    },
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

  const teachers = [
    { id: "teacher-zhang", username: "zhanglaoshi", displayName: "张老师", classId: CLASS_ID },
    { id: "teacher-li", username: "lilaoshi", displayName: "李老师", classId: CLASS_ID },
    { id: "teacher-wang", username: "wanglaoshi", displayName: "王老师", classId: CLASS_ID },
  ];

  for (const teacher of teachers) {
    await prisma.userAccount.upsert({
      where: { username: teacher.username },
      update: {
        role: "teacher",
        displayName: teacher.displayName,
        passwordHash: DEMO_PASSWORD,
        classId: teacher.classId,
      },
      create: {
        id: teacher.id,
        role: "teacher",
        username: teacher.username,
        displayName: teacher.displayName,
        passwordHash: DEMO_PASSWORD,
        classId: teacher.classId,
      },
    });
  }

  for (const record of mockFitnessRecords) {
    await prisma.fitnessRecord.upsert({
      where: { id: record.id },
      update: {
        studentId: record.studentId,
        date: new Date(record.date),
        semester: record.semester,
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
        reviewerName: review.reviewerName,
        status: review.status,
        teacherNotes: review.teacherNotes,
        reviewedAt: review.reviewedAt ? new Date(review.reviewedAt) : null,
        modificationsJson: review.modifications ? JSON.stringify(review.modifications) : null,
      },
      create: {
        id: review.id,
        reportId: review.reportId,
        reportType: review.reportType,
        reviewerName: review.reviewerName,
        status: review.status,
        teacherNotes: review.teacherNotes,
        reviewedAt: review.reviewedAt ? new Date(review.reviewedAt) : null,
        modificationsJson: review.modifications ? JSON.stringify(review.modifications) : null,
      },
    });
  }
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
