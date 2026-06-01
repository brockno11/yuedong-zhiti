"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/features/empty-state";
import {
  FileText,
  Target,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import type { StudentReportHistoryItem } from "@/lib/server/db-mappers";

type CategoryTab = "all" | "batch_report" | "item_report" | "record_report";

interface ReportListProps {
  reports: StudentReportHistoryItem[];
}

function reportTypeLabel(type?: string): string {
  if (type === "batch_report") return "正式体测分析";
  if (type === "item_report") return "专项分析";
  if (type === "record_report") return "本次反馈";
  return "AI 分析";
}

function reportTypeVariant(type?: string): "excellent" | "pass" | "secondary" {
  if (type === "batch_report") return "excellent";
  if (type === "item_report") return "pass";
  return "secondary";
}

function reviewBadge(status: string) {
  if (status === "approved") return { label: "已审核", variant: "excellent" as const };
  if (status === "rejected") return { label: "已退回", variant: "improve" as const };
  return { label: "待审核", variant: "pass" as const };
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AIReportList({ reports }: ReportListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);

  const filtered = useMemo(() => {
    if (activeTab === "all") return reports;
    return reports.filter((r) => r.report.reportType === activeTab);
  }, [reports, activeTab]);

  const counts = useMemo(() => {
    const result = { all: reports.length, batch_report: 0, item_report: 0, record_report: 0 };
    for (const r of reports) {
      const t = r.report.reportType;
      if (t === "batch_report") result.batch_report++;
      else if (t === "item_report") result.item_report++;
      else result.record_report++;
    }
    return result;
  }, [reports]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDelete = useCallback(async (reportId: string) => {
    setDeletingId(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmDeleteId(null);
        setExpandedId(null);
        setSelectedIds((prev) => { const n = new Set(prev); n.delete(reportId); return n; });
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }, [router]);

  const handleBatchDelete = useCallback(async () => {
    setBatchDeleting(true);
    const ids = Array.from(selectedIds);
    try {
      let allOk = true;
      for (const id of ids) {
        const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
        if (!res.ok) allOk = false;
      }
      if (allOk) {
        setSelectedIds(new Set());
        setConfirmBatchDelete(false);
        setExpandedId(null);
        router.refresh();
      }
    } finally {
      setBatchDeleting(false);
    }
  }, [selectedIds, router]);

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as CategoryTab); setExpandedId(null); setSelectedIds(new Set()); }}>
        <TabsList className="w-full grid grid-cols-4 h-auto">
          <TabsTrigger value="all" className="text-xs py-2">
            全部<span className="ml-1 text-[10px] text-muted-foreground">({counts.all})</span>
          </TabsTrigger>
          <TabsTrigger value="batch_report" className="text-xs py-2">
            正式分析<span className="ml-1 text-[10px] text-muted-foreground">({counts.batch_report})</span>
          </TabsTrigger>
          <TabsTrigger value="item_report" className="text-xs py-2">
            专项<span className="ml-1 text-[10px] text-muted-foreground">({counts.item_report})</span>
          </TabsTrigger>
          <TabsTrigger value="record_report" className="text-xs py-2">
            反馈<span className="ml-1 text-[10px] text-muted-foreground">({counts.record_report})</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Batch delete bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2">
          <span className="text-sm font-medium text-destructive">
            已选 <span className="tabular-nums">{selectedIds.size}</span> 份
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={() => setSelectedIds(new Set())}>
              <X className="h-3.5 w-3.5" />取消
            </Button>
            <Button size="sm" variant="destructive" className="h-8 gap-1 text-xs" onClick={() => setConfirmBatchDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" />批量删除
            </Button>
          </div>
        </div>
      )}

      {/* Select all */}
      {filtered.length > 0 && (
        <label className="flex items-center gap-2 cursor-pointer select-none px-1">
          <Checkbox checked={allFilteredSelected} onCheckedChange={toggleSelectAll} aria-label="全选" />
          <span className="text-xs text-muted-foreground">全选</span>
        </label>
      )}

      {/* Report list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8 text-muted-foreground" />}
          title={activeTab === "all" ? "暂无 AI 报告" : "该分类暂无报告"}
          description={activeTab === "all" ? "前往 AI 指导页面生成你的第一份分析报告" : "切换分类查看更多"}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const review = reviewBadge(item.status);
            const isExpanded = expandedId === item.id;
            const isSelected = selectedIds.has(item.id);
            const summary = item.report.fitnessProfile.summary;

            return (
              <Card key={item.id} className={`rounded-xl shadow-sm ${isSelected ? "ring-2 ring-primary/30" : ""}`}>
                <CardContent className="flex items-center gap-2 p-3">
                  {/* Checkbox */}
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(item.id)}
                    aria-label={`选择 ${item.sourceSummary ?? "报告"}`}
                  />

                  {/* Clickable content */}
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-3 min-w-0 text-left"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {item.report.reportType === "batch_report" ? (
                        <Target className="h-4.5 w-4.5 text-primary" />
                      ) : item.report.reportType === "item_report" ? (
                        <Sparkles className="h-4.5 w-4.5 text-primary" />
                      ) : (
                        <FileText className="h-4.5 w-4.5 text-primary" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={reportTypeVariant(item.report.reportType)} className="text-[9px] shrink-0">
                          {reportTypeLabel(item.report.reportType)}
                        </Badge>
                        <Badge variant={review.variant} className="text-[9px] shrink-0">{review.label}</Badge>
                      </div>
                      <p className="mt-1 truncate text-xs font-medium">
                        {item.sourceSummary ?? reportTypeLabel(item.report.reportType)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {formatTime(item.generatedAt)}
                      </p>
                    </div>

                    <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>

                  {/* Delete button — always visible on card surface */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 w-9 shrink-0 p-0 text-muted-foreground/40 hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }}
                    aria-label="删除报告"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t px-3.5 pb-3.5 pt-3 space-y-3">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">分析摘要</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {summary.length > 200 ? summary.slice(0, 200) + "…" : summary}
                      </p>
                    </div>

                    {item.report.reportType === "batch_report" && item.report.fitnessProfile.overallScore > 0 && (
                      <div className="flex items-center gap-3 text-xs">
                        <div className="rounded-lg bg-muted/30 px-2.5 py-1.5">
                          <span className="text-muted-foreground">综合评分 </span>
                          <span className="font-bold tabular-nums">{item.report.fitnessProfile.overallScore}</span>
                          <span className="text-muted-foreground"> 分</span>
                        </div>
                        <Badge variant="outline" className="text-[9px]">
                          {item.report.fitnessProfile.overallGrade === "excellent" ? "优秀"
                            : item.report.fitnessProfile.overallGrade === "good" ? "良好"
                            : item.report.fitnessProfile.overallGrade === "pass" ? "及格"
                            : "有提升空间"}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {item.status === "approved" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-level-excellent" />
                      ) : item.status === "rejected" ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-level-improve" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span>
                        {item.status === "approved" ? "体育教师已审核通过"
                          : item.status === "rejected" ? "该报告暂未通过教师审核"
                          : "等待体育教师审核"}
                      </span>
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                      AI 生成，需经体育教师审核后使用。
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Single delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmDeleteId(null)}>
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold">确定删除这份 AI 报告吗？</p>
            <p className="mt-2 text-sm text-muted-foreground">
              此操作不会删除原始体测或训练记录，但删除后无法从历史报告中查看。
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="h-11 flex-1" onClick={() => setConfirmDeleteId(null)} disabled={deletingId === confirmDeleteId}>取消</Button>
              <Button variant="destructive" className="h-11 flex-1" onClick={() => handleDelete(confirmDeleteId)} disabled={deletingId === confirmDeleteId}>
                {deletingId === confirmDeleteId ? <><Loader2 className="h-4 w-4 animate-spin" />删除中...</> : "确认删除"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Batch delete confirmation dialog */}
      {confirmBatchDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmBatchDelete(false)}>
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold">确定批量删除 {selectedIds.size} 份 AI 报告吗？</p>
            <p className="mt-2 text-sm text-muted-foreground">
              此操作不会删除原始体测或训练记录，但删除后无法从历史报告中查看。此操作不可撤销。
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="h-11 flex-1" onClick={() => setConfirmBatchDelete(false)} disabled={batchDeleting}>取消</Button>
              <Button variant="destructive" className="h-11 flex-1" onClick={handleBatchDelete} disabled={batchDeleting}>
                {batchDeleting ? <><Loader2 className="h-4 w-4 animate-spin" />删除中...</> : `删除 ${selectedIds.size} 份`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
