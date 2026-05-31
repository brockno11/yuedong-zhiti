-- CreateTable
CREATE TABLE "ClassGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "teacherId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "studentId" TEXT,
    "classId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserAccount_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserAccount_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "height" REAL NOT NULL,
    "weight" REAL NOT NULL,
    "bmi" REAL NOT NULL,
    "sportGoal" TEXT NOT NULL,
    "sportBase" TEXT NOT NULL,
    "discomfortsJson" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassGroup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FitnessRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "semester" TEXT NOT NULL,
    "fatigueLevel" INTEGER NOT NULL,
    "recoveryStatus" TEXT NOT NULL,
    "hasSoreness" BOOLEAN NOT NULL,
    "sorenessAreasJson" TEXT NOT NULL,
    "hasDiscomfort" BOOLEAN NOT NULL,
    "discomfortNotes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FitnessRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FitnessRecordItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "score" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    CONSTRAINT "FitnessRecordItem_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "FitnessRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportKind" TEXT NOT NULL,
    "studentId" TEXT,
    "classId" TEXT,
    "contentJson" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "version" INTEGER NOT NULL DEFAULT 1,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIReport_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeacherReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "teacherNotes" TEXT NOT NULL DEFAULT '',
    "modificationsJson" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeacherReview_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "AIReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_username_key" ON "UserAccount"("username");

-- CreateIndex
CREATE INDEX "FitnessRecord_studentId_date_idx" ON "FitnessRecord"("studentId", "date");

-- CreateIndex
CREATE INDEX "FitnessRecordItem_recordId_idx" ON "FitnessRecordItem"("recordId");

-- CreateIndex
CREATE INDEX "FitnessRecordItem_itemId_idx" ON "FitnessRecordItem"("itemId");

-- CreateIndex
CREATE INDEX "AIReport_reportKind_studentId_idx" ON "AIReport"("reportKind", "studentId");

-- CreateIndex
CREATE INDEX "AIReport_classId_idx" ON "AIReport"("classId");

-- CreateIndex
CREATE INDEX "TeacherReview_status_idx" ON "TeacherReview"("status");

-- CreateIndex
CREATE INDEX "TeacherReview_reportId_idx" ON "TeacherReview"("reportId");
