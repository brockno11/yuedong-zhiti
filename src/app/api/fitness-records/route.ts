import { z } from "zod";
import { fail, handleApiError, ok } from "@/lib/server/api-response";
import { createFitnessRecord, getFitnessRecords, getStudentProfile } from "@/lib/server/data-service";

const bodyFeelingSchema = z.object({
  fatigueLevel: z.number().int().min(1).max(10),
  recoveryStatus: z.enum(["quick", "normal", "slow"]),
  hasSoreness: z.boolean(),
  sorenessAreas: z.array(z.string()),
  hasDiscomfort: z.boolean(),
  discomfortNotes: z.string(),
});

const createRecordSchema = z.object({
  studentId: z.string().min(1),
  date: z.string().optional(),
  semester: z.string().optional(),
  batchId: z.string().optional(),
  recordType: z.enum(["official_test", "daily_training"]).optional(),
  items: z.array(
    z.object({
      itemId: z.enum([
        "height_weight", "vital_capacity", "50m_run", "standing_long_jump",
        "sit_and_reach", "pull_up", "sit_up", "800m_run", "1000m_run",
      ]),
      value: z.number(),
    })
  ).min(1),
  bodyFeeling: bodyFeelingSchema,
});

// 性别不允许的项目映射
const MALE_ONLY_ITEMS = new Set(["pull_up", "1000m_run"]);
const FEMALE_ONLY_ITEMS = new Set(["sit_up", "800m_run"]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    if (!studentId) return fail("缺少 studentId", 400);
    return ok(await getFitnessRecords(studentId));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = createRecordSchema.parse(await request.json());

    // 后端性别校验
    const student = await getStudentProfile(input.studentId);
    if (student) {
      const isMale = student.gender === "male";
      for (const item of input.items) {
        if (isMale && FEMALE_ONLY_ITEMS.has(item.itemId)) {
          return fail(`男生不可录入该项目: ${item.itemId}`, 400);
        }
        if (!isMale && MALE_ONLY_ITEMS.has(item.itemId)) {
          return fail(`女生不可录入该项目: ${item.itemId}`, 400);
        }
      }
    }

    return ok(await createFitnessRecord(input));
  } catch (error) {
    return handleApiError(error);
  }
}
