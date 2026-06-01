import { NextResponse } from "next/server";
import { z } from "zod";

export function ok<T>(data: T) {
  return NextResponse.json({ data });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "请求数据格式不正确", details: error.flatten() },
      { status: 422 }
    );
  }

  if (error instanceof Error && error.message === "STUDENT_NOT_FOUND") {
    return fail("未找到学生", 404);
  }

  if (error instanceof Error && error.message === "NON_PENDING_REVIEWS") {
    return fail("只能审核待处理的记录", 400);
  }

  if (error instanceof Error && error.message === "REVIEWS_NOT_FOUND") {
    return fail("部分审核记录未找到", 404);
  }

  return fail("服务暂时不可用，请稍后重试", 500);
}
