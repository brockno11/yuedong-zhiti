"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LoginAccountOption } from "@/lib/server/data-service";
import {
  Sparkles,
  Activity,
  BarChart3,
  ShieldCheck,
  GraduationCap,
  TrendingUp,
  Heart,
  Target,
  User,
  Users,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";
import { DemoBanner } from "@/components/features/demo-banner";

type Role = "student" | "teacher";

const DEMO_PASSWORD = "demo123";

interface LandingPageProps {
  accounts: LoginAccountOption[];
}

export function LandingPage({ accounts }: LandingPageProps) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const currentAccounts = accounts.filter((account) => account.role === role);

  const handleSelectAccount = (accountId: string) => {
    const account = currentAccounts.find((a) => a.id === accountId);
    if (account) {
      setUsername(account.username);
      setPassword(DEMO_PASSWORD);
      setError("");
    }
  };

  const handleLogin = async () => {
    setError("");

    if (!username.trim()) {
      setError("请输入账号");
      return;
    }
    if (!password.trim()) {
      setError("请输入密码");
      return;
    }

    const account = currentAccounts.find((a) => a.username === username);
    if (!account) {
      setError("账号不存在，请从下拉列表中选择");
      return;
    }
    if (password !== DEMO_PASSWORD) {
      setError("密码错误，演示模式密码为 demo123");
      return;
    }

    setIsLoading(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, username: account.username, password }),
    });

    if (!response.ok) {
      setError("账号或密码不正确");
      setIsLoading(false);
      return;
    }

    const payload = await response.json() as {
      data: {
        role: Role;
        username: string;
        name: string;
        class?: string;
        grade?: string;
        gender?: string;
        studentId?: string;
        classId?: string;
        timestamp: number;
      };
    };

    localStorage.setItem("demo_login", JSON.stringify(payload.data));
    // 同步写 cookie，供 Server Component 读取当前学生 ID
    const studentId = payload.data.studentId ?? payload.data.username;
    document.cookie = `demo_student_id=${studentId};path=/;max-age=86400;SameSite=Lax`;
    router.push(role === "student" ? "/dashboard" : "/teacher");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold">跃动智体</span>
          </div>

          {/* 角色切换 */}
          <div className="flex rounded-full border bg-muted/50 p-0.5">
            <button
              onClick={() => { setRole("student"); setUsername(""); setPassword(""); setError(""); }}
              className={cn(
                "relative flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                role === "student"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="h-4 w-4" />
              我是学生
            </button>
            <button
              onClick={() => { setRole("teacher"); setUsername(""); setPassword(""); setError(""); }}
              className={cn(
                "relative flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                role === "teacher"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              我是教师
            </button>
          </div>
        </div>
      </header>

      {/* 演示模式提示条 */}
      <div className="mx-auto max-w-5xl px-4 pt-3">
        <DemoBanner />
      </div>

      {/* 主体 */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* ==== 左侧：品牌文案 ==== */}
            <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-500">
              {role === "student" ? <StudentHero /> : <TeacherHero />}
            </div>

            {/* ==== 右侧：登录卡片 ==== */}
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="rounded-2xl border bg-card p-8 shadow-sm space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 ring-1 ring-primary/10">
                    {role === "student" ? (
                      <User className="h-8 w-8 text-primary/60" />
                    ) : (
                      <GraduationCap className="h-8 w-8 text-primary/60" />
                    )}
                  </div>
                  <h2 className="text-lg font-semibold">
                    {role === "student" ? "学生登录" : "教师登录"}
                  </h2>
                  <p className="text-sm text-muted-foreground">演示模式 · 从下拉列表选择账号</p>
                </div>

                {/* 账号下拉选择 */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    选择已有账号
                  </label>
                  <select
                    value={currentAccounts.find((a) => a.username === username)?.id || ""}
                    onChange={(e) => handleSelectAccount(e.target.value)}
                    className="w-full h-12 rounded-xl border bg-background px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  >
                    <option value="" disabled>请选择一个账号...</option>
                    {currentAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.display}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 账号 */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">账号</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={role === "student" ? "学生编号，如 S001" : "教师账号"}
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* 密码 */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">密码</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="演示密码：demo123"
                      className="h-12 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? "隐藏密码" : "显示密码"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* 错误提示 */}
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}

                {/* 登录按钮 */}
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full h-12 gap-2 text-base"
                  size="lg"
                >
                  {isLoading ? (
                    <>正在进入...</>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      进入系统
                    </>
                  )}
                </Button>

                <p className="text-center text-[11px] text-muted-foreground">
                  演示模式 · AI辅助 · 教师主导 · 数据匿名
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ===== 学生端品牌文案 =====
function StudentHero() {
  return (
    <div className="space-y-5">
      <Badge variant="secondary" className="text-xs gap-1.5">
        <Activity className="h-3 w-3" /> 学生端
      </Badge>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          了解你的<span className="text-primary">体质</span>
          <br />
          发现你的<span className="text-primary">潜能</span>
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-md">
          记录体测数据，AI 生成个性化体质画像和训练建议。教师审核后推送，科学、安全。
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-start gap-2.5 rounded-xl border bg-card p-3.5">
          <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div><p className="font-semibold">可视化数据</p><p className="text-xs text-muted-foreground">雷达图、趋势图</p></div>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border bg-card p-3.5">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div><p className="font-semibold">AI 训练计划</p><p className="text-xs text-muted-foreground">教师审核把关</p></div>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border bg-card p-3.5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-level-good" />
          <div><p className="font-semibold">隐私保护</p><p className="text-xs text-muted-foreground">匿名编号，不排名</p></div>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border bg-card p-3.5">
          <Heart className="mt-0.5 h-5 w-5 shrink-0 text-level-improve" />
          <div><p className="font-semibold">科学锻炼</p><p className="text-xs text-muted-foreground">仅作锻炼参考</p></div>
        </div>
      </div>
    </div>
  );
}

// ===== 教师端品牌文案 =====
function TeacherHero() {
  return (
    <div className="space-y-5">
      <Badge className="text-xs gap-1.5">
        <GraduationCap className="h-3 w-3" /> 教师端
      </Badge>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          AI 辅助<span className="text-primary">教学决策</span>
          <br />
          精准掌握<span className="text-primary">班级体质</span>
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-md">
          班级体测数据智能分析，生成分层指导方案。教师始终是最终决策者。
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-start gap-2.5 rounded-xl border bg-card p-3.5">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div><p className="font-semibold">班级总览</p><p className="text-xs text-muted-foreground">薄弱项排行、等级分布</p></div>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border bg-card p-3.5">
          <Target className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div><p className="font-semibold">分层指导</p><p className="text-xs text-muted-foreground">差异化教学方案</p></div>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border bg-card p-3.5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-level-good" />
          <div><p className="font-semibold">教师审核</p><p className="text-xs text-muted-foreground">AI 建议需审核后推送</p></div>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border bg-card p-3.5">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-level-excellent" />
          <div><p className="font-semibold">教学提效</p><p className="text-xs text-muted-foreground">AI 分析节省备课时间</p></div>
        </div>
      </div>
    </div>
  );
}
