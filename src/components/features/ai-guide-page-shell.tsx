// ===== 跃动智体 — AI 指导页面外壳 =====
// 管理标题区显隐：列表视图显示标题，详情视图隐藏（由 FloatingBackBar 接管）
"use client";

import { useState, useCallback } from "react";
import { AIStudentReportView } from "@/components/features/ai-student-report";
import type { StudentReportHistoryItem } from "@/lib/server/db-mappers";
import type { FitnessRecord, StudentProfile } from "@/lib/types";

interface AIGuidePageShellProps {
  studentId: string;
  student: StudentProfile | null;
  records: FitnessRecord[];
  reportHistory: StudentReportHistoryItem[];
  batches: Array<{ id: string; name: string; type: string; status: string }>;
}

export function AIGuidePageShell(props: AIGuidePageShellProps) {
  const [isViewingDetail, setIsViewingDetail] = useState(false);

  const handleViewingChange = useCallback((viewing: boolean) => {
    setIsViewingDetail(viewing);
  }, []);

  return (
    <div className="content-breathing-room max-w-5xl space-y-6">
      {/* 标题区 — 详情视图时隐藏，由 FloatingBackBar 接管 */}
      {!isViewingDetail && (
        <div className="space-y-1 px-1">
          <h1 className="text-xl font-bold tracking-tight">AI 智能指导</h1>
          <p className="text-sm text-muted-foreground">
            基于正式体测与日常训练记录生成个性化分析参考
          </p>
        </div>
      )}

      <AIStudentReportView {...props} onViewingChange={handleViewingChange} />
    </div>
  );
}
