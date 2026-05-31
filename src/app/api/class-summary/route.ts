import { handleApiError, ok } from "@/lib/server/api-response";
import { getClassSummary } from "@/lib/server/data-service";

export async function GET() {
  try {
    return ok(await getClassSummary());
  } catch (error) {
    return handleApiError(error);
  }
}

export const dynamic = "force-dynamic";
