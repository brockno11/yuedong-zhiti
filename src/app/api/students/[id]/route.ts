import { fail, handleApiError, ok } from "@/lib/server/api-response";
import { getFitnessRecords, getStudentProfile, updateStudent } from "@/lib/server/data-service";

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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await request.json()) as {
      height?: number;
      weight?: number;
      name?: string;
      age?: number;
    };

    if (!body || Object.keys(body).length === 0) {
      return fail("请求数据不能为空", 400);
    }

    // Validate height
    if (body.height !== undefined) {
      if (typeof body.height !== "number" || Number.isNaN(body.height)) {
        return fail("身高必须是有效数字", 400);
      }
      if (body.height < 120 || body.height > 220) {
        return fail("身高范围应在 120-220 cm 之间", 400);
      }
    }

    // Validate weight
    if (body.weight !== undefined) {
      if (typeof body.weight !== "number" || Number.isNaN(body.weight)) {
        return fail("体重必须是有效数字", 400);
      }
      if (body.weight < 25 || body.weight > 150) {
        return fail("体重范围应在 25-150 kg 之间", 400);
      }
    }

    // Validate age
    if (body.age !== undefined) {
      if (typeof body.age !== "number" || body.age < 15 || body.age > 18) {
        return fail("年龄范围应在 15-18 岁之间", 400);
      }
    }

    // Validate name
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        return fail("姓名不能为空", 400);
      }
      if (body.name.length > 50) {
        return fail("姓名不能超过 50 个字符", 400);
      }
    }

    const updated = await updateStudent(params.id, {
      height: body.height,
      weight: body.weight,
      name: body.name,
      age: body.age,
    });

    if (!updated) return fail("未找到学生", 404);
    return ok(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
