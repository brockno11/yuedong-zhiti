import { fail, handleApiError, ok } from "@/lib/server/api-response";
import { getFitnessRecords, getStudentProfile } from "@/lib/server/data-service";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const student = await getStudentProfile(params.id);
    if (!student) return fail("未找到学生", 404);

    const records = await getFitnessRecords(params.id);
    return ok({ student, records });
  } catch (error) {
    return handleApiError(error);
  }
}
