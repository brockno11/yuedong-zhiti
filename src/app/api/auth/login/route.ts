import { z } from "zod";
import { fail, handleApiError, ok } from "@/lib/server/api-response";
import { loginWithDemoAccount } from "@/lib/server/data-service";

const loginSchema = z.object({
  role: z.enum(["student", "teacher"]),
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const session = await loginWithDemoAccount(input);

    if (!session) {
      return fail("账号或密码不正确", 401);
    }

    return ok(session);
  } catch (error) {
    return handleApiError(error);
  }
}
