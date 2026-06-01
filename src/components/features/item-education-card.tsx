// ===== 跃动智体 — 项目科普与评分解读卡片 =====
// item_report 详情页中展示的单项科普板块
// 评分规则、权重、项目意义来自本地静态配置，不依赖 AI 生成
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Target,
  Lightbulb,
  GraduationCap,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { FITNESS_ITEM_EDUCATION, type FitnessItemEducation } from "@/lib/fitness-education";
import type { FitnessItemId, GradeTier } from "@/lib/types";

interface ItemEducationCardProps {
  itemId: FitnessItemId;
  /** 学生本次成绩的数值文本，如 "3200ml" / "8.5秒" */
  valueText?: string;
  /** 学生本次成绩的数值（纯数字） */
  value?: number;
  /** 学生本次成绩的等级 */
  grade?: GradeTier | null;
  /** 学生本次成绩的分数（0-100 标准化分数） */
  score?: number;
  /** 正式体测基线，作为本项目评分解读的权威数据锚点 */
  formalBaseline?: {
    valueText: string;
    score: number;
    grade: string;
    date: string;
    analysis: string;
  } | null;
  className?: string;
}

const CATEGORY_LABELS: Record<FitnessItemEducation["category"], string> = {
  body: "身体形态",
  function: "身体机能",
  speed: "速度素质",
  strength: "力量素质",
  flexibility: "柔韧素质",
  endurance: "心肺耐力",
};

const GRADE_COLORS: Record<string, string> = {
  excellent: "bg-level-excellent/15 text-level-excellent border-level-excellent/30",
  good: "bg-level-good/15 text-level-good border-level-good/30",
  pass: "bg-level-pass/15 text-level-pass border-level-pass/30",
  improve: "bg-level-improve/15 text-level-improve border-level-improve/30",
};

const GRADE_LABELS: Record<string, string> = {
  excellent: "优秀",
  good: "良好",
  pass: "及格",
  improve: "待提升",
};

/**
 * 标准化分数评分尺（NormalizedScoreScale）
 *
 * 定位轴使用 0-100 标准化分数，方向固定为：
 *   左侧 = 待提升 | 中段 = 及格/良好 | 右侧 = 优秀
 *
 * 无论项目原始成绩是"越大越好"还是"越小越好"，
 * 分数轴方向始终一致——高分在右、低分在左。
 * 如需展示原始成绩阈值轴，应单独实现组件。
 */
function NormalizedScoreScale({ score }: { score?: number }) {
  const position = score != null ? Math.min(100, Math.max(0, score)) : null;

  return (
    <div className="space-y-1.5">
      {/* 刻度条 */}
      <div className="relative h-3 rounded-full overflow-hidden bg-muted/60">
        {/* 四段色带：待提升 | 及格 | 良好 | 优秀 */}
        <div className="absolute inset-0 flex">
          <div className="flex-[3] bg-level-improve/25" />
          <div className="flex-[2] bg-level-pass/25" />
          <div className="flex-[2] bg-level-good/25" />
          <div className="flex-[3] bg-level-excellent/25" />
        </div>
        {/* 定位点 */}
        {position != null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-background bg-foreground shadow-md transition-all duration-500 z-10"
            style={{ left: `${position}%` }}
          />
        )}
      </div>
      {/* 刻度标签：固定方向，不翻转 */}
      <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
        <span>待提升</span>
        <span>及格</span>
        <span>良好</span>
        <span>优秀</span>
      </div>
    </div>
  );
}

/** 可折叠的信息块 */
function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t pt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 text-left"
      >
        <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-xs font-semibold flex-1">{title}</span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  );
}

export function ItemEducationCard({
  itemId,
  valueText,
  grade,
  score,
  formalBaseline,
  className,
}: ItemEducationCardProps) {
  const edu = FITNESS_ITEM_EDUCATION[itemId];
  if (!edu) return null;

  const baselineValueText = formalBaseline?.valueText ?? valueText;
  const baselineScore = formalBaseline?.score ?? score;
  const baselineGrade = formalBaseline?.grade ?? grade ?? undefined;

  return (
    <Card className={cn("rounded-xl shadow-sm border-primary/10", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-primary" />
          项目科普与评分解读
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 顶部：项目名 + 权重 + 能力标签 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{edu.name}</span>
          <Badge variant="secondary" className="text-[10px]">
            权重 {edu.standardWeight}%
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {CATEGORY_LABELS[edu.category]}
          </Badge>
          <span className="text-[10px] text-muted-foreground ml-auto">
            单位：{edu.unit}
          </span>
        </div>

        {/* 正式体测基线 + 评分尺 */}
        {(baselineValueText || baselineGrade || baselineScore != null) && (
          <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/5 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="text-xs font-semibold">正式体测基线</span>
              </div>
              {formalBaseline?.date && (
                <span className="text-[10px] text-muted-foreground">{formalBaseline.date}</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-background/70 px-2.5 py-2">
                <p className="text-[10px] text-muted-foreground">本次成绩</p>
                <p className="mt-1 font-semibold tabular-nums">{baselineValueText ?? "暂无"}</p>
              </div>
              <div className="rounded-lg bg-background/70 px-2.5 py-2">
                <p className="text-[10px] text-muted-foreground">标准分</p>
                <p className="mt-1 font-semibold tabular-nums">
                  {baselineScore != null ? `${baselineScore}分` : "暂无"}
                </p>
              </div>
              <div className="rounded-lg bg-background/70 px-2.5 py-2">
                <p className="text-[10px] text-muted-foreground">等级</p>
                {baselineGrade ? (
                  <span
                    className={cn(
                      "mt-1 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                      GRADE_COLORS[baselineGrade] ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    {GRADE_LABELS[baselineGrade] ?? baselineGrade}
                  </span>
                ) : (
                  <p className="mt-1 font-semibold">暂无</p>
                )}
              </div>
            </div>

            <NormalizedScoreScale score={baselineScore} />
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              {edu.scoringDirection === "lower_better"
                ? `该项目用时越短分数越高。${edu.scoringIntro}`
                : edu.scoringDirection === "higher_better"
                  ? `该项目数值越大分数越高。${edu.scoringIntro}`
                  : edu.scoringIntro}
            </p>
            {formalBaseline?.analysis && (
              <p className="border-t pt-2 text-[11px] leading-relaxed text-muted-foreground">
                {formalBaseline.analysis}
              </p>
            )}
            <p className="text-[10px] leading-relaxed text-muted-foreground/80">
              这里以正式体测作为本项目评分基线；日常训练记录用于观察过程变化，不参与正式评分。
            </p>
          </div>
        )}

        {/* ====== 为什么测 ====== */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold">为什么测</span>
          </div>
          <div className="space-y-2 pl-5">
            <div>
              <p className="text-[11px] font-medium text-foreground/80">政策依据</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {edu.whyMeasure.policyReason}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-foreground/80">教育意义</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {edu.whyMeasure.educationReason}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-foreground/80">对你的价值</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {edu.whyMeasure.studentReason}
              </p>
            </div>
          </div>
        </div>

        {/* ====== 体现什么 ====== */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold">体现什么能力</span>
          </div>
          <div className="space-y-2 pl-5">
            {edu.reflects.map((r, i) => (
              <div key={i}>
                <p className="text-[11px] font-medium text-foreground/80">{r.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ====== 怎么看结果 ====== */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold">怎么看结果</span>
          </div>
          <div className="space-y-2 pl-5">
            <div>
              <p className="text-[11px] font-medium text-foreground/80">分数与等级</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {edu.howToReadResult.scoreMeaning}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-foreground/80">数据解读</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {edu.howToReadResult.dataCaution}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-foreground/80">与日常训练的关系</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {edu.howToReadResult.trainingConnection}
              </p>
            </div>
          </div>
        </div>

        {/* ====== 运动科学科普（折叠） ====== */}
        <CollapsibleSection title="运动科学科普" icon={FlaskConical}>
          {edu.scienceNotes.map((note, i) => (
            <div key={i} className="rounded-lg bg-muted/30 px-3 py-2">
              <p className="text-[11px] font-medium text-foreground/80">{note.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                {note.detail}
              </p>
            </div>
          ))}
          {edu.references.length > 0 && (
            <div className="space-y-1 pt-1">
              <p className="text-[10px] font-medium text-muted-foreground">参考来源</p>
              {edu.references.map((ref, i) => (
                <div key={i} className="flex items-start gap-1">
                  <span className="text-[10px] text-muted-foreground">·</span>
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      {ref.title}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{ref.title}</span>
                  )}
                  <span className="text-[10px] text-muted-foreground/60">（{ref.source}）</span>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* 来源标注 */}
        <p className="text-[10px] text-muted-foreground/70 border-t pt-2">
          依据现行{edu.standardSource}进行项目解读；AI 仅提供体育锻炼参考，具体训练安排需结合体育教师指导。
        </p>
      </CardContent>
    </Card>
  );
}
