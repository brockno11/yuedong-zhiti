"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/features/empty-state";
import { mockStudents } from "@/lib/data/mock-students";
import { getLatestRecord } from "@/lib/data/mock-fitness-records";
import { GRADE_STANDARDS, FITNESS_ITEMS } from "@/lib/constants";
import {
  Search,
  ChevronRight,
  User,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";

export function StudentSearchList() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return mockStudents;

    return mockStudents.filter((s) => {
      const record = getLatestRecord(s.id);
      const avgScore = record
        ? Math.round(record.items.reduce((sum, i) => sum + i.score, 0) / record.items.length)
        : null;
      const gradeLabel = avgScore
        ? Object.values(GRADE_STANDARDS).find((g) => avgScore >= g.minScore)?.label ?? ""
        : "";

      return (
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.grade.includes(q) ||
        (s.gender === "male" && q.includes("男")) ||
        (s.gender === "female" && q.includes("女")) ||
        (avgScore !== null && avgScore < 60 && q.includes("关注")) ||
        (gradeLabel && gradeLabel.includes(q))
      );
    });
  }, [searchQuery]);

  return (
    <>
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索学生编号、年级、性别，或输入「关注」查看需关注学生..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10"
        />
        {searchQuery && (
          <p className="text-xs text-muted-foreground mt-1.5 ml-1">
            找到 {filteredStudents.length} 名学生
          </p>
        )}
      </div>

      {/* 列表 */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="未找到匹配的学生"
          description="尝试其他关键词"
        />
      ) : (
        <div className="grid gap-3">
          {filteredStudents.map((student) => {
            const record = getLatestRecord(student.id);
            const avgScore = record
              ? Math.round(
                  record.items.reduce((sum, i) => sum + i.score, 0) /
                    record.items.length
                )
              : null;

            const gradeInfo = avgScore
              ? Object.values(GRADE_STANDARDS).find(
                  (g) => avgScore >= g.minScore
                )
              : null;

            const strengths = record
              ? record.items
                  .filter((i) => i.grade === "excellent" || i.grade === "good")
                  .slice(0, 2)
                  .map((i) => {
                    const def = FITNESS_ITEMS.find((d) => d.id === i.itemId);
                    return def?.name ?? i.itemId;
                  })
              : [];

            const improvements = record
              ? record.items
                  .filter((i) => i.grade === "improve")
                  .slice(0, 2)
                  .map((i) => {
                    const def = FITNESS_ITEMS.find((d) => d.id === i.itemId);
                    return def?.name ?? i.itemId;
                  })
              : [];

            const needsAttention =
              student.discomforts.filter((d) => d !== "none").length > 0 ||
              (avgScore !== null && avgScore < 60);

            return (
              <Link key={student.id} href={`/teacher/students/${student.id}`}>
                <Card className="cursor-pointer transition-all hover:shadow-md active:scale-[0.99] rounded-xl shadow-sm">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                        needsAttention
                          ? "bg-level-improve/10"
                          : "bg-muted"
                      }`}
                    >
                      <User
                        className={`h-6 w-6 ${
                          needsAttention
                            ? "text-level-improve"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{student.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {student.gender === "male" ? "男" : "女"} · {student.grade} · {student.age}岁
                        </span>
                        {needsAttention && (
                          <Badge variant="improve" className="text-[11px]">需关注</Badge>
                        )}
                      </div>

                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                        {avgScore !== null && (
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-sm tabular-nums text-foreground">{avgScore}</span>
                            分
                            {gradeInfo && (
                              <Badge
                                variant={
                                  gradeInfo.label === "优秀" ? "excellent"
                                  : gradeInfo.label === "良好" ? "good"
                                  : gradeInfo.label === "及格" ? "pass"
                                  : "improve"
                                }
                                className="text-[11px]"
                              >
                                {gradeInfo.label}
                              </Badge>
                            )}
                          </span>
                        )}
                        {record && <span>最近：{record.semester}</span>}
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {strengths.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[11px] bg-level-excellent/10 text-level-excellent border-0">
                            <TrendingUp className="mr-0.5 h-3 w-3" />
                            {s}
                          </Badge>
                        ))}
                        {improvements.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[11px] bg-level-improve/10 text-level-improve border-0">
                            <TrendingDown className="mr-0.5 h-3 w-3" />
                            {s}
                          </Badge>
                        ))}
                        {!record && (
                          <span className="text-xs text-muted-foreground">暂无体测记录</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="outline" className="text-[11px] gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI 建议
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">待审核</span>
                    </div>

                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
