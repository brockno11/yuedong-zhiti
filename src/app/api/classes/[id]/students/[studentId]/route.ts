import { NextRequest, NextResponse } from "next/server";
import { updateStudent, deleteStudent } from "@/lib/server/data-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    const body = await request.json();
    const updated = await updateStudent(params.studentId, body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "更新学生信息失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    await deleteStudent(params.studentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "删除学生失败" }, { status: 500 });
  }
}
