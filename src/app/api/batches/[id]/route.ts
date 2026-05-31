import { NextRequest, NextResponse } from "next/server";
import { updateBatchStatus } from "@/lib/server/data-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    if (!body.status || !["active", "completed", "archived"].includes(body.status)) {
      return NextResponse.json({ error: "状态值无效" }, { status: 400 });
    }
    await updateBatchStatus(params.id, body.status);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "更新批次失败" }, { status: 500 });
  }
}
