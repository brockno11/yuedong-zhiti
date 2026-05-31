import { NextRequest, NextResponse } from "next/server";
import { getClassWithStudents } from "@/lib/server/data-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cls = await getClassWithStudents(params.id);
    if (!cls) {
      return NextResponse.json({ error: "班级不存在" }, { status: 404 });
    }
    return NextResponse.json(cls);
  } catch (error) {
    return NextResponse.json({ error: "获取班级信息失败" }, { status: 500 });
  }
}
