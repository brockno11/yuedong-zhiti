import { NextRequest, NextResponse } from "next/server";
import { deleteAIReport } from "@/lib/server/data-service";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: "缺少报告 ID" }, { status: 400 });
    }
    const result = await deleteAIReport(params.id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
