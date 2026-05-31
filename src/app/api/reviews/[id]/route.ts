import { z } from "zod";
import { handleApiError, ok } from "@/lib/server/api-response";
import { updateTeacherReview } from "@/lib/server/data-service";

const updateReviewSchema = z.object({
  status: z.enum(["pending", "approved", "modified", "rejected"]),
  teacherNotes: z.string().default(""),
  modifications: z.array(
    z.object({
      section: z.string(),
      original: z.string(),
      modified: z.string(),
      reason: z.string(),
    })
  ).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const input = updateReviewSchema.parse(await request.json());
    return ok(await updateTeacherReview(params.id, input));
  } catch (error) {
    return handleApiError(error);
  }
}
