"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FitnessTrendChart } from "@/components/charts/fitness-trend-chart";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

interface TrendOption {
  key: string;
  label: string;
  data: { date: string; value: number; grade: string }[];
  unit: string;
}

export function PortraitTrendSection({ options }: { options: TrendOption[] }) {
  const [active, setActive] = useState(options[0]?.key ?? "");
  const current = options.find(o => o.key === active) ?? options[0];
  if (!current || current.data.length < 2) return null;

  return (
    <Card className="rounded-xl border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">体质变化趋势</CardTitle>
          <span className="text-[11px] text-muted-foreground">{current.label}</span>
        </div>
      </CardHeader>
      <CardContent>
        <FitnessTrendChart data={current.data.map(d => ({ date: d.date, value: d.value, grade: d.grade }))} height={200} unit={current.unit} />
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {options.map(o => (
            <button key={o.key} type="button" onClick={() => setActive(o.key)}
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] transition-colors ${o.key === active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent"}`}>
              {o.label}
            </button>
          ))}
        </div>
        {current.data.length < 2 && (
          <div className="py-6 text-center">
            <p className="text-xs text-muted-foreground">该维度历史数据不足，继续记录后可生成趋势</p>
            <Link href="/record"><Button variant="outline" size="sm" className="gap-1 mt-2 h-7 text-xs"><PlusCircle className="h-3 w-3" />补充记录</Button></Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
