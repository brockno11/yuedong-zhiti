// ===== 跃动智体 — 教师个人中心 =====
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  Building2,
  Users,
  LogOut,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  School,
} from "lucide-react";
import Link from "next/link";

interface LoginData {
  role: string;
  username: string;
  name: string;
  class?: string;
  timestamp: number;
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const [loginData, setLoginData] = useState<LoginData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("demo_login");
      if (raw) {
        const data = JSON.parse(raw) as LoginData;
        if (data.role === "teacher") setLoginData(data);
      }
    } catch { /* ignore */ }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("demo_login");
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="个人中心" description="教师工作台账号信息" backHref="/teacher" />

      {/* 教师信息 */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                {loginData?.name || "教师"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {loginData?.class || ""} · 体育教研组
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <School className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{loginData?.class?.replace(/[^0-9]/g, "") || "-"}</p>
              <p className="text-[11px] text-muted-foreground">任教班级</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <Users className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
              <p className="text-lg font-bold">20</p>
              <p className="text-[11px] text-muted-foreground">班级学生</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快捷入口 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/teacher">
          <Card className="cursor-pointer rounded-xl border shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">班级总览</p>
                <p className="text-xs text-muted-foreground">查看体测数据概况</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/teacher/review">
          <Card className="cursor-pointer rounded-xl border shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">审核中心</p>
                <p className="text-xs text-muted-foreground">AI 报告待审核</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <Separator />

      {/* AI 说明 */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            AI 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <p className="text-xs text-muted-foreground">• AI 生成内容需经体育教师审核后使用</p>
          <p className="text-xs text-muted-foreground">• 训练计划须经教师审核授权后实施</p>
          <p className="text-xs text-muted-foreground">• 所有分析仅供参考，最终决策由教师确定</p>
        </CardContent>
      </Card>

      {/* 退出登录 */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full h-11 gap-2 text-muted-foreground"
      >
        <LogOut className="h-4 w-4" />
        退出登录
      </Button>
    </div>
  );
}
