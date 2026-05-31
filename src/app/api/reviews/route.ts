import { handleApiError, ok } from "@/lib/server/api-response";
import { getReviewsWithReports } from "@/lib/server/data-service";

export async function GET() {
  try {
    return ok(await getReviewsWithReports());
  } catch (error) {
    return handleApiError(error);
  }
}

export const dynamic = "force-dynamic";
