import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 演示级权限：从 cookie 读取角色
function getDemoRole(request: NextRequest): "student" | "teacher" | null {
  const cookie = request.cookies.get("demo_student_id");
  if (cookie) return "student";
  // teacher detection: check if logged-in user is teacher via header
  const role = request.headers.get("x-demo-role");
  if (role === "teacher") return "teacher";
  return null;
}

const patchSchema = z.object({
  items: z.array(z.object({ itemId: z.string(), value: z.number() })).min(1).optional(),
  bodyFeeling: z.object({
    fatigueLevel: z.number().min(1).max(10).optional(),
    recoveryStatus: z.enum(["quick", "normal", "slow"]).optional(),
    hasSoreness: z.boolean().optional(),
    sorenessAreas: z.array(z.string()).optional(),
    hasDiscomfort: z.boolean().optional(),
    discomfortNotes: z.string().optional(),
  }).optional(),
  role: z.enum(["student", "teacher"]).optional(), // demo auth
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const record = await prisma.fitnessRecord.findUnique({ where: { id: params.id } });
    if (!record) return NextResponse.json({ error: "记录不存在" }, { status: 404 });

    const body = patchSchema.parse(await request.json());
    const role = body.role ?? getDemoRole(request) ?? "student";

    // 正式体测只允许教师修改
    if (record.recordType === "official_test" && role !== "teacher") {
      return NextResponse.json({ error: "正式体测由教师修改，请练习体育教师" }, { status: 403 });
    }

    // 更新逻辑
    if (body.items) {
      // 删除旧 item，重建
      await prisma.fitnessRecordItem.deleteMany({ where: { recordId: record.id } });
      const newItems = await Promise.all(body.items.map(async (item) => {
        const { calculateItemScore } = await import("@/lib/scoring");
        const student = await prisma.student.findUnique({ where: { id: record.studentId } });
        const score = calculateItemScore(item.itemId as never, item.value, (student?.gender ?? "male") as never, (student?.grade ?? "高二") as never, true);
        return {
          id: `${record.id}-${item.itemId}`,
          recordId: record.id,
          itemId: item.itemId,
          value: item.value,
          score,
          grade: score >= 90 ? "excellent" : score >= 80 ? "good" : score >= 60 ? "pass" : "improve",
        };
      }));
      for (const it of newItems) {
        await prisma.fitnessRecordItem.create({ data: it });
      }
    }

    // 更新体感
    if (body.bodyFeeling) {
      await prisma.fitnessRecord.update({
        where: { id: record.id },
        data: {
          fatigueLevel: body.bodyFeeling.fatigueLevel ?? record.fatigueLevel,
          recoveryStatus: body.bodyFeeling.recoveryStatus ?? record.recoveryStatus,
          hasSoreness: body.bodyFeeling.hasSoreness ?? record.hasSoreness,
          sorenessAreasJson: body.bodyFeeling.sorenessAreas ? JSON.stringify(body.bodyFeeling.sorenessAreas) : record.sorenessAreasJson,
          hasDiscomfort: body.bodyFeeling.hasDiscomfort ?? record.hasDiscomfort,
          discomfortNotes: body.bodyFeeling.discomfortNotes ?? record.discomfortNotes,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const record = await prisma.fitnessRecord.findUnique({ where: { id: params.id } });
    if (!record) return NextResponse.json({ error: "记录不存在" }, { status: 404 });

    const body = await request.json().catch(() => ({ role: "student" }));
    const role = body?.role ?? getDemoRole(request) ?? "student";

    // 正式体测只允许教师删除
    if (record.recordType === "official_test" && role !== "teacher") {
      return NextResponse.json({ error: "正式体测由教师管理，你无权删除" }, { status: 403 });
    }

    await prisma.fitnessRecordItem.deleteMany({ where: { recordId: record.id } });
    await prisma.fitnessRecord.delete({ where: { id: record.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
