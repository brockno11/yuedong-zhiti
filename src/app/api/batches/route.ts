import { NextRequest, NextResponse } from "next/server";
import { createBatch, getBatchesByClass } from "@/lib/server/data-service";

const DEFAULT_CLASS_ID = "class-2025-spring-02-01";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId") ?? DEFAULT_CLASS_ID;
    return NextResponse.json(await getBatchesByClass(classId));
  } catch {
    return NextResponse.json({ error: "获取批次列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.academicYear || !body.semester) {
      return NextResponse.json({ error: "批次名称、学年、学期为必填项" }, { status: 400 });
    }
    const batch = await createBatch({
      name: body.name,
      academicYear: body.academicYear,
      semester: body.semester,
      round: body.round,
      type: body.type,
      classId: body.classId ?? DEFAULT_CLASS_ID,
      status: body.status,
    });
    return NextResponse.json(batch, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建批次失败" }, { status: 500 });
  }
}
