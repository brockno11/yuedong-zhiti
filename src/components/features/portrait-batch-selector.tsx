"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

interface BatchInfo { id: string; name: string; type: string; status: string; academicYear: string; semester: string; round: number; }

function sortBatches(batches: BatchInfo[]) {
  const semesterRank: Record<string, number> = { 春季: 2, 秋季: 1 };
  return [...batches].sort((a, b) => {
    const aYear = Number(a.academicYear.split("-")[1] ?? a.academicYear.split("-")[0] ?? 0);
    const bYear = Number(b.academicYear.split("-")[1] ?? b.academicYear.split("-")[0] ?? 0);
    if (aYear !== bYear) return bYear - aYear;
    const semesterDiff = (semesterRank[b.semester] ?? 0) - (semesterRank[a.semester] ?? 0);
    if (semesterDiff !== 0) return semesterDiff;
    return b.round - a.round;
  });
}

export function PortraitBatchSelector({ currentBatchId }: { currentBatchId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [open, setOpen] = useState(false);
  const activeId = searchParams.get("batchId") || currentBatchId || "";
  const active = batches.find(b => b.id === activeId);

  useEffect(() => {
    fetch("/api/batches").then(r => r.json()).then((data: BatchInfo[]) => {
      const filtered = sortBatches(data.filter(b => b.type !== "daily"));
      setBatches(filtered);
      if (!activeId && filtered.length > 0) {
        const latest = filtered[0];
        select(latest.id);
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (id: string) => {
    setOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("batchId", id); else params.delete("batchId");
    router.push(`/portrait?${params.toString()}`);
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium hover:bg-accent transition-colors">
        <span>{active?.name ?? "选择体测批次"}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 w-56 rounded-xl border bg-card shadow-lg p-1">
          {batches.map(b => (
            <button key={b.id} type="button" onClick={() => select(b.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-accent transition-colors ${activeId === b.id ? "bg-primary/5 font-semibold" : ""}`}>
              <div className="flex items-center justify-between">
                <span>{b.name}</span>
                <Badge variant={b.status === "active" ? "excellent" : "secondary"} className="text-[9px]">
                  {b.status === "active" ? "进行中" : "已归档"}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{b.academicYear} · {b.semester} · 第{b.round}次</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
