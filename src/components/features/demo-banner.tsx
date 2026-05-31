"use client";

import { useState } from "react";
import { X, FlaskConical } from "lucide-react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800">
      <div className="flex items-center gap-2 min-w-0">
        <FlaskConical className="h-3.5 w-3.5 shrink-0 text-amber-600" />
        <span className="leading-relaxed">
          演示模式：当前数据为高二(1)班匿名模拟数据，用于功能展示与教学案例申报。
        </span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-md p-1 hover:bg-amber-100 transition-colors"
        aria-label="关闭"
      >
        <X className="h-3.5 w-3.5 text-amber-600" />
      </button>
    </div>
  );
}
