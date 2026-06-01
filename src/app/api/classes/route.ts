import { NextRequest, NextResponse } from "next/server";
import { createClass, getClasses } from "@/lib/server/data-service";

export async function GET() {
  try {
    const classes = await getClasses();
    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json({ error: "获取班级列表失败" }, { status: 500 });
  }
}

const ALLOWED_GRADES = ["高一", "高二", "高三"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.grade) {
      return NextResponse.json({ error: "班级名称和年级为必填项" }, { status: 400 });
    }
    if (!ALLOWED_GRADES.includes(body.grade)) {
      return NextResponse.json({ error: "仅支持高一、高二、高三学段" }, { status: 400 });
    }
    const cls = await createClass({
      name: body.name,
      grade: body.grade,
      semester: body.semester ?? "2025-春季",
      teacherId: body.teacherId,
    });
    return NextResponse.json(cls, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "创建班级失败" }, { status: 500 });
  }
}
