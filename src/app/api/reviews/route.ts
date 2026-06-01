import { fail, handleApiError, ok } from "@/lib/server/api-response";
import { batchUpdateReviews, getReviewsWithReports } from "@/lib/server/data-service";

export async function GET() {
  try {
    return ok(await getReviewsWithReports());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("batch" in body) ||
      (body as Record<string, unknown>).batch !== true
    ) {
      return fail("仅支持批量操作，请求体需包含 { batch: true }", 400);
    }

    const { ids, action, notes } = body as {
      batch: true;
      ids: unknown;
      action: unknown;
      notes?: string;
    };

    if (!Array.isArray(ids) || ids.length === 0) {
      return fail("ids 必须是非空数组", 400);
    }

    if (!ids.every((id: unknown): id is string => typeof id === "string")) {
      return fail("ids 数组中每个元素必须是字符串", 400);
    }

    if (action !== "approve" && action !== "reject") {
      return fail("action 必须是 approve 或 reject", 400);
    }

    const result = await batchUpdateReviews(ids, action, notes);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export const dynamic = "force-dynamic";
