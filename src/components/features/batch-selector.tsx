"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";

interface BatchOption {
  id: string;
  name: string;
  type: string;
  status: string;
}

export function BatchSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const currentBatchId = searchParams.get("batchId") ?? "";

  useEffect(() => {
    fetch("/api/batches")
      .then(r => r.json())
      .then(setBatches)
      .catch(() => {});
  }, []);

  const selectBatch = (batchId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (batchId) {
      params.set("batchId", batchId);
    } else {
      params.delete("batchId");
    }
    router.push(`/teacher?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground shrink-0">体测批次：</span>
      <button
        type="button"
        onClick={() => selectBatch("")}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          !currentBatchId
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-accent"
        }`}
      >
        全部
      </button>
      {batches.map((batch) => (
        <button
          key={batch.id}
          type="button"
          onClick={() => selectBatch(batch.id)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            currentBatchId === batch.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          {batch.type === "daily" ? "🏋" : <GraduationCap className="h-3 w-3" />}
          {batch.name}
          {batch.status === "active" && (
            <Badge variant="excellent" className="text-[9px] py-0 px-1">进行中</Badge>
          )}
        </button>
      ))}
    </div>
  );
}
