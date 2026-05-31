"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FitnessTrendChart } from "@/components/charts/fitness-trend-chart";

interface TrendOption {
  key: string;
  label: string;
  data: { timestamp: number; date: string; fullDate: string; value: number; grade: string }[];
  dailyData: { timestamp: number; date: string; fullDate: string; value: number; grade: string }[];
  unit: string;
}

export function PortraitTrendSection({ options }: {
  options: TrendOption[];
}) {
  const [active, setActive] = useState(options[0]?.key ?? "");
  const current = options.find(o => o.key === active) ?? options[0];
  if (!current || current.data.length < 1) return null;
  const dailyData = current.dailyData;

  return (
    <Card className="rounded-xl border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">体质变化趋势</CardTitle>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-primary" />正式体测</span>
            {dailyData && dailyData.length > 0 && <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-level-pass" />日常训练</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <FitnessTrendChart data={current.data} dailyData={dailyData} height={220} unit={current.unit} />
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {options.map(o => (
            <button key={o.key} type="button" onClick={() => setActive(o.key)}
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] transition-colors ${o.key === active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent"}`}>
              {o.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
