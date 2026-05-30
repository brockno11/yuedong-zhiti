"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  BarChart3,
  ChevronRight,
  ClipboardCheck,
  Dumbbell,
  LineChart,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Target,
  User,
} from "lucide-react";

interface HomeData {
  greeting: string;
  identity: string;
  overallScore: number;
  overallGrade: "excellent" | "good" | "pass" | "improve";
  bmi: number;
  bmiStatus: string;
  weekFocus: string;
}

interface OnboardingStorage {
  grade?: string;
  gender?: string;
  height?: number;
  weight?: number;
  sportGoal?: string;
}

const gradeInfo: Record<HomeData["overallGrade"], { label: string; className: string }> = {
  excellent: { label: "优秀", className: "text-level-excellent" },
  good: { label: "良好", className: "text-level-good" },
  pass: { label: "及格", className: "text-level-pass" },
  improve: { label: "待提升", className: "text-level-improve" },
};

const valueItems = [
  {
    icon: BarChart3,
    title: "可视化体质数据",
    description: "雷达图与趋势图帮助你理解体测变化",
  },
  {
    icon: Sparkles,
    title: "AI 个性化建议",
    description: "根据体测记录生成训练参考",
  },
  {
    icon: ShieldCheck,
    title: "教师审核把关",
    description: "训练计划经体育教师授权后实施",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function getHomeData(): HomeData | null {
  try {
    const raw = localStorage.getItem("onboardingData");
    if (!raw) return null;

    const data = JSON.parse(raw) as OnboardingStorage;
    if (!data.grade) return null;

    const height = data.height || 165;
    const weight = data.weight || 55;
    const bmi = Math.round((weight / ((height / 100) * (height / 100))) * 10) / 10;
    const genderLabel =
      data.gender === "male" ? "男生" : data.gender === "female" ? "女生" : "同学";

    return {
      greeting: getGreeting(),
      identity: `${data.grade}${genderLabel}`,
      overallScore: 78,
      overallGrade: "good",
      bmi,
      bmiStatus: bmi >= 18.5 && bmi < 24 ? "正常范围" : "BMI 指标值得关注",
      weekFocus: data.sportGoal || "完成本周体测记录",
    };
  } catch {
    return null;
  }
}

export function StudentHomeClient() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);

  useEffect(() => {
    setHomeData(getHomeData());
  }, []);

  if (!homeData) {
    return <OnboardingHero />;
  }

  return <StudentHome data={homeData} />;
}

function OnboardingHero() {
  return (
    <div className="content-breathing-room grid min-h-[calc(100vh-9rem)] items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="space-y-6">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
          AI 辅助 · 教师主导
        </Badge>
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            创建你的体质画像
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            填写基础信息后，系统会把体测数据转化为清晰的画像、趋势和训练参考。所有 AI 建议都需要体育教师审核后使用。
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/onboarding" className="w-full sm:w-auto">
            <Button className="h-12 w-full gap-2 px-6 text-base sm:w-auto" size="lg">
              开始信息填写
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/teacher" className="w-full sm:w-auto">
            <Button variant="outline" className="h-12 w-full gap-2 px-6 sm:w-auto">
              教师工作台
              <ClipboardCheck className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <Card className="app-card-elevated overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">体质画像预览</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-bold tabular-nums">78</span>
                  <span className="pb-1 text-sm text-muted-foreground">分</span>
                </div>
              </div>
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-[10px] border-primary/15 bg-primary/10">
                <Activity className="h-9 w-9 text-primary" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {["速度", "力量", "耐力"].map((item, index) => (
                <div key={item} className="rounded-2xl bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">{item}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums">{[82, 74, 68][index]}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {valueItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="app-card flex items-start gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StudentHome({ data }: { data: HomeData }) {
  const info = gradeInfo[data.overallGrade];

  return (
    <div className="content-breathing-room space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">{data.greeting}</p>
            <h1 className="mt-1 text-3xl font-bold leading-tight">{data.identity}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              本周重点：{data.weekFocus}
            </p>
          </div>

          <Card className="app-card-elevated">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">综合评分</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-5xl font-bold tabular-nums">{data.overallScore}</span>
                    <span className="pb-1 text-sm text-muted-foreground">分</span>
                  </div>
                  <p className={`mt-2 text-sm font-semibold ${info.className}`}>{info.label}</p>
                </div>
                <div className="rounded-2xl bg-muted/70 p-4 text-right">
                  <p className="text-xs text-muted-foreground">BMI</p>
                  <p className="mt-1 text-3xl font-bold tabular-nums">{data.bmi}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{data.bmiStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/record" className="block">
            <Button className="h-12 min-h-[52px] w-full gap-2 text-base" size="lg">
              <PlusCircle className="h-5 w-5" />
              开始记录今日体测
            </Button>
          </Link>
        </section>

        <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
          <HomeActionCard
            href="/dashboard"
            icon={BarChart3}
            title="体质画像"
            description="查看雷达图、趋势和优势项目"
          />
          <HomeActionCard
            href="/ai-guide"
            icon={Sparkles}
            title="AI 指导"
            description="生成个性化训练参考"
            badge="AI"
          />
          <HomeActionCard
            href="/profile"
            icon={User}
            title="个人中心"
            description="管理基础信息与隐私说明"
          />
          <div className="app-card flex flex-col justify-between p-4 sm:col-span-3 lg:col-span-1">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-level-excellent/10">
                <ShieldCheck className="h-5 w-5 text-level-excellent" />
              </div>
              <p className="mt-3 text-sm font-semibold">教师审核后实施</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                AI 生成内容仅作体育锻炼参考，训练计划需经体育教师审核授权后使用。
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <MiniInsight icon={LineChart} label="最近记录" value="2025 春季" />
        <MiniInsight icon={Target} label="待提升方向" value="耐力与柔韧" />
        <MiniInsight icon={Dumbbell} label="建议频率" value="每周 2-3 次" />
      </div>
    </div>
  );
}

function HomeActionCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: typeof BarChart3;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="app-card h-full p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {badge && <Badge variant="secondary" className="text-[10px]">{badge}</Badge>}
        </div>
        <p className="mt-4 text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        <ChevronRight className="mt-3 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function MiniInsight({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof LineChart;
  label: string;
  value: string;
}) {
  return (
    <div className="app-card flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
