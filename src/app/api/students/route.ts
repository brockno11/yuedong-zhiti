import { handleApiError, ok } from "@/lib/server/api-response";
import { getStudentListItems } from "@/lib/server/data-service";

export async function GET() {
  try {
    return ok(await getStudentListItems());
  } catch (error) {
    return handleApiError(error);
  }
}

export const dynamic = "force-dynamic";
