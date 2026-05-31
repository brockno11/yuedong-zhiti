"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Users,
  GraduationCap,
  Trash2,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Check,
} from "lucide-react";

interface ClassData {
  id: string;
  name: string;
  grade: string;
  semester: string;
  students: StudentData[];
}

interface StudentData {
  id: string;
  name: string;
  gender: string;
  grade: string;
  age: number;
  height: number;
  weight: number;
  bmi: number;
  sportGoal: string;
  sportBase: string;
  discomforts: string[];
  classId: string;
  accounts?: { username: string }[];
}

interface ClassManagerProps {
  initialClasses: ClassData[];
}

const GRADE_OPTIONS = ["高一", "高二", "高三"];
const SPORT_GOAL_OPTIONS = [
  { value: "endurance", label: "提升耐力" },
  { value: "strength", label: "增强力量" },
  { value: "weight_control", label: "控制体重" },
  { value: "flexibility", label: "提高柔韧性" },
  { value: "overall_health", label: "全面健康提升" },
  { value: "exam_prep", label: "体测考试准备" },
];
const SPORT_BASE_OPTIONS = [
  { value: "none", label: "较少运动" },
  { value: "light", label: "轻度运动" },
  { value: "moderate", label: "中等运动" },
  { value: "active", label: "经常运动" },
];

const emptyForm = {
  name: "",
  gender: "male" as "male" | "female",
  grade: "高二",
  age: 16,
  height: 170,
  weight: 60,
  sportGoal: "overall_health",
  sportBase: "light",
};

export function ClassManager({ initialClasses }: ClassManagerProps) {
  const [classes, setClasses] = useState<ClassData[]>(initialClasses);
  const [expandedClass, setExpandedClass] = useState<string | null>(initialClasses[0]?.id ?? null);
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [createdAccount, setCreatedAccount] = useState<{ username: string; password: string } | null>(null);

  const activeClass = classes.find((c) => c.id === expandedClass);

  const handleAddStudent = async (classId: string) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/classes/${classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "添加失败");
      }
      const result = await res.json();
      setCreatedAccount({ username: result.username, password: result.password });

      // 刷新 class 数据
      const clsRes = await fetch(`/api/classes/${classId}`);
      if (clsRes.ok) {
        const updatedClass = await clsRes.json();
        setClasses((prev) =>
          prev.map((c) => (c.id === classId ? updatedClass : c))
        );
      }
      setForm(emptyForm);
      setShowAddForm(null);
      setMessage({ type: "success", text: `已添加 ${form.name}，账号 ${result.username}` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "添加失败" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (classId: string, studentId: string, studentName: string) => {
    if (!confirm(`确定删除 ${studentName}（${studentId}）？\n\n此操作将删除该学生所有体测记录、AI报告和登录账号，不可恢复。`)) return;
    try {
      const res = await fetch(`/api/classes/${classId}/students/${studentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      const clsRes = await fetch(`/api/classes/${classId}`);
      if (clsRes.ok) {
        const updatedClass = await clsRes.json();
        setClasses((prev) => prev.map((c) => (c.id === classId ? updatedClass : c)));
      }
      setMessage({ type: "success", text: `已删除 ${studentName}` });
    } catch {
      setMessage({ type: "error", text: "删除失败" });
    }
  };

  return (
    <div className="space-y-5">
      {/* 消息提示 */}
      {message && (
        <div
          className={`rounded-xl border p-3 text-sm ${
            message.type === "success"
              ? "border-level-excellent/30 bg-level-excellent/5 text-level-excellent"
              : "border-level-improve/30 bg-level-improve/5 text-level-improve"
          }`}
        >
          {message.text}
          {createdAccount && message.type === "success" && (
            <span className="ml-2">
              · 密码：<code className="rounded bg-muted px-1 font-mono text-xs">{createdAccount.password}</code>
            </span>
          )}
        </div>
      )}

      {/* 班级列表 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {classes.map((cls) => (
          <Card
            key={cls.id}
            className={`cursor-pointer transition-all ${
              expandedClass === cls.id ? "ring-2 ring-primary border-primary" : "hover:shadow-md"
            }`}
            onClick={() => setExpandedClass(cls.id === expandedClass ? null : cls.id)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{cls.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {cls.grade} · {cls.semester} · {cls.students?.length ?? 0} 名学生
                  </p>
                </div>
              </div>
              {expandedClass === cls.id ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 展开的班级详情 */}
      {activeClass && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-primary" />
                  {activeClass.name} — 学生列表
                </CardTitle>
                <CardDescription>
                  共 {activeClass.students?.length ?? 0} 名学生 · 账号均为 S 开头编号
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="gap-1 h-9"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddForm(activeClass.id);
                  setCreatedAccount(null);
                }}
              >
                <Plus className="h-4 w-4" />
                添加学生
              </Button>
            </div>
          </CardHeader>

          {/* 添加学生表单 */}
          {showAddForm === activeClass.id && (
            <CardContent className="border-b pb-5">
              <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-semibold">新学生信息</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">姓名 *</Label>
                    <Input
                      className="h-9"
                      placeholder="例如：张三"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">性别 *</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={form.gender === "male" ? "default" : "outline"}
                        onClick={() => setForm({ ...form, gender: "male" })}
                      >
                        男
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={form.gender === "female" ? "default" : "outline"}
                        onClick={() => setForm({ ...form, gender: "female" })}
                      >
                        女
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">年级 *</Label>
                    <div className="flex gap-1.5">
                      {GRADE_OPTIONS.map((g) => (
                        <Button
                          key={g}
                          type="button"
                          size="sm"
                          variant={form.grade === g ? "default" : "outline"}
                          onClick={() => setForm({ ...form, grade: g })}
                          className="text-xs"
                        >
                          {g}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">年龄 *</Label>
                    <Input
                      className="h-9"
                      type="number"
                      min={12}
                      max={20}
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">身高 (cm) *</Label>
                    <Input
                      className="h-9"
                      type="number"
                      min={140}
                      max={200}
                      value={form.height}
                      onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">体重 (kg) *</Label>
                    <Input
                      className="h-9"
                      type="number"
                      min={35}
                      max={120}
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">运动目标</Label>
                    <select
                      className="h-9 w-full rounded-lg border bg-background px-2.5 text-xs"
                      value={form.sportGoal}
                      onChange={(e) => setForm({ ...form, sportGoal: e.target.value })}
                    >
                      {SPORT_GOAL_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">运动基础</Label>
                    <select
                      className="h-9 w-full rounded-lg border bg-background px-2.5 text-xs"
                      value={form.sportBase}
                      onChange={(e) => setForm({ ...form, sportBase: e.target.value })}
                    >
                      {SPORT_BASE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    className="gap-1 h-9"
                    disabled={!form.name || saving}
                    onClick={() => handleAddStudent(activeClass.id)}
                  >
                    {saving ? "保存中..." : "确认添加"}
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9"
                    onClick={() => setShowAddForm(null)}
                  >
                    取消
                  </Button>
                </div>
              </div>
            </CardContent>
          )}

          {/* 学生列表 */}
          <CardContent className="pt-4">
            {activeClass.students && activeClass.students.length > 0 ? (
              <div className="space-y-2">
                {activeClass.students.map((student) => {
                  const account = student.accounts?.[0];
                  return (
                    <div
                      key={student.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border p-3 transition-colors hover:bg-accent/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{student.name}</span>
                          <Badge variant="secondary" className="text-[10px]">{student.id}</Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              student.gender === "male" ? "text-blue-600" : "text-pink-600"
                            }`}
                          >
                            {student.gender === "male" ? "男" : "女"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {student.grade} · {student.age}岁 · {student.height}cm / {student.weight}kg · BMI {student.bmi}
                        </p>
                        {account && (
                          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                            <KeyRound className="h-3 w-3" />
                            登录账号：<code className="rounded bg-muted px-1 font-mono text-xs">{account.username}</code>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`/teacher/students/${student.id}`}
                          className="inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs hover:bg-accent"
                        >
                          详情
                        </a>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteStudent(activeClass.id, student.id, student.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">暂无学生</p>
                <p className="text-xs text-muted-foreground">点击上方"添加学生"按钮开始</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
