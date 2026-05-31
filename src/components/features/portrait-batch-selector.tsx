"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

interface BatchInfo { id: string; name: string; type: string; status: string; academicYear: string; semester: string; round: number; }

export function PortraitBatchSelector({ currentBatchId }: { currentBatchId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [open, setOpen] = useState(false);
  const activeId = searchParams.get("batchId") || currentBatchId || "";
  const active = batches.find(b => b.id === activeId);

  useEffect(() => {
    fetch("/api/batches").then(r => r.json()).then((data: BatchInfo[]) => {
      setBatches(data.filter(b => b.type !== "daily"));
    }).catch(() => {});
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
