-- CreateTable
CREATE TABLE "AssessmentBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "type" TEXT NOT NULL DEFAULT 'official',
    "classId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssessmentBatch_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassGroup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FitnessRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "semester" TEXT NOT NULL,
    "batchId" TEXT,
    "recordType" TEXT NOT NULL DEFAULT 'official_test',
    "fatigueLevel" INTEGER NOT NULL,
    "recoveryStatus" TEXT NOT NULL,
    "hasSoreness" BOOLEAN NOT NULL,
    "sorenessAreasJson" TEXT NOT NULL,
    "hasDiscomfort" BOOLEAN NOT NULL,
    "discomfortNotes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FitnessRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FitnessRecord_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "AssessmentBatch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FitnessRecord" ("createdAt", "date", "discomfortNotes", "fatigueLevel", "hasDiscomfort", "hasSoreness", "id", "recoveryStatus", "semester", "sorenessAreasJson", "studentId", "updatedAt") SELECT "createdAt", "date", "discomfortNotes", "fatigueLevel", "hasDiscomfort", "hasSoreness", "id", "recoveryStatus", "semester", "sorenessAreasJson", "studentId", "updatedAt" FROM "FitnessRecord";
DROP TABLE "FitnessRecord";
ALTER TABLE "new_FitnessRecord" RENAME TO "FitnessRecord";
CREATE INDEX "FitnessRecord_studentId_date_idx" ON "FitnessRecord"("studentId", "date");
CREATE INDEX "FitnessRecord_batchId_idx" ON "FitnessRecord"("batchId");
CREATE INDEX "FitnessRecord_studentId_batchId_idx" ON "FitnessRecord"("studentId", "batchId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "AssessmentBatch_classId_idx" ON "AssessmentBatch"("classId");

-- CreateIndex
CREATE INDEX "AssessmentBatch_classId_status_idx" ON "AssessmentBatch"("classId", "status");
