import { z } from "zod";
import { fail, handleApiError, ok } from "@/lib/server/api-response";
import { createFitnessRecord, getFitnessRecords } from "@/lib/server/data-service";

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
        "height_weight",
        "vital_capacity",
        "50m_run",
        "standing_long_jump",
        "sit_and_reach",
        "pull_up",
        "sit_up",
        "800m_run",
        "1000m_run",
      ]),
      value: z.number(),
    })
  ).min(1),
  bodyFeeling: bodyFeelingSchema,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return fail("缺少 studentId", 400);
    }

    return ok(await getFitnessRecords(studentId));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = createRecordSchema.parse(await request.json());
    return ok(await createFitnessRecord(input));
  } catch (error) {
    return handleApiError(error);
  }
}
