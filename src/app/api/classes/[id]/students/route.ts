import { NextRequest, NextResponse } from "next/server";
import { addStudentToClass } from "@/lib/server/data-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const required = ["name", "gender", "grade", "age", "height", "weight"];
    const missing = required.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `缺少必填项: ${missing.join("、")}` },
        { status: 400 }
      );
    }
    if (!["male", "female"].includes(body.gender)) {
      return NextResponse.json({ error: "性别必须为 male 或 female" }, { status: 400 });
    }

    const result = await addStudentToClass(params.id, {
      name: body.name,
      gender: body.gender,
      grade: body.grade,
      age: Number(body.age),
      height: Number(body.height),
      weight: Number(body.weight),
      sportGoal: body.sportGoal,
      sportBase: body.sportBase,
      discomforts: body.discomforts,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "添加学生失败" }, { status: 500 });
  }
}
