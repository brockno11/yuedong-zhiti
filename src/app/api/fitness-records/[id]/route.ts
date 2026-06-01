import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FITNESS_ITEMS } from "@/lib/constants";
import { calculateItemScore } from "@/lib/scoring";
import { z } from "zod";

// 演示级权限：仅从 cookie/header 读取角色，不信任请求体
function getDemoRole(request: NextRequest): "student" | "teacher" {
  const cookie = request.cookies.get("demo_student_id");
  if (cookie) return "student";
  const role = request.headers.get("x-demo-role");
  if (role === "teacher") return "teacher";
  return "student";
}

const patchSchema = z.object({
  items: z.array(z.object({ itemId: z.string(), value: z.number().finite() })).min(1).optional(),
  bodyFeeling: z.object({
    fatigueLevel: z.number().min(1).max(10).optional(),
    recoveryStatus: z.enum(["quick", "normal", "slow"]).optional(),
    hasSoreness: z.boolean().optional(),
    sorenessAreas: z.array(z.string()).optional(),
    hasDiscomfort: z.boolean().optional(),
    discomfortNotes: z.string().optional(),
  }).optional(),
});

function getGradeTier(score: number): string {
  if (score >= 90) return "excellent";
  if (score >= 80) return "good";
  if (score >= 60) return "pass";
  return "improve";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const record = await prisma.fitnessRecord.findUnique({ where: { id: params.id } });
    if (!record) return NextResponse.json({ error: "记录不存在" }, { status: 404 });

    const role = getDemoRole(request);

    // 正式体测只允许教师修改
    if (record.recordType === "official_test" && role !== "teacher") {
      return NextResponse.json({ error: "正式体测由教师修改，请联系体育教师" }, { status: 403 });
    }

    const body = patchSchema.parse(await request.json());

    // 更新逻辑
    if (body.items) {
      // 获取学生信息（只查一次）
      const student = await prisma.student.findUnique({ where: { id: record.studentId } });
      if (!student) return NextResponse.json({ error: "学生不存在" }, { status: 404 });

      // 性别校验
      const maleOnlyItems = ["pull_up", "1000m_run"];
      const femaleOnlyItems = ["sit_up", "800m_run"];
      for (const item of body.items) {
        if (student.gender === "male" && femaleOnlyItems.includes(item.itemId)) {
          return NextResponse.json({ error: `男生不允许录入 ${item.itemId}` }, { status: 400 });
        }
        if (student.gender === "female" && maleOnlyItems.includes(item.itemId)) {
          return NextResponse.json({ error: `女生不允许录入 ${item.itemId}` }, { status: 400 });
        }
      }

      // 删除旧 item，批量重建
      await prisma.fitnessRecordItem.deleteMany({ where: { recordId: record.id } });
      const newItems = body.items.map((item) => {
        const definition = FITNESS_ITEMS.find((def) => def.id === item.itemId);
        const score = calculateItemScore(
          item.itemId as never,
          item.value,
          student.gender as never,
          student.grade as never,
          definition?.higherIsBetter ?? true
        );
        return {
          id: `${record.id}-${item.itemId}`,
          recordId: record.id,
          itemId: item.itemId,
          value: item.value,
          score,
          grade: getGradeTier(score),
        };
      });
      await prisma.fitnessRecordItem.createMany({ data: newItems });
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
    console.error("[PATCH /api/fitness-records/[id]]", error);
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

    const role = getDemoRole(request);

    // 正式体测只允许教师删除
    if (record.recordType === "official_test" && role !== "teacher") {
      return NextResponse.json({ error: "正式体测由教师管理，你无权删除" }, { status: 403 });
    }

    await prisma.fitnessRecordItem.deleteMany({ where: { recordId: record.id } });
    await prisma.fitnessRecord.delete({ where: { id: record.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/fitness-records/[id]]", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
