// ===== 跃动智体 — 趋势折线图（支持双系列）=====
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";

interface TrendDataPoint { date: string; value: number; grade?: string; }

interface FitnessTrendChartProps {
  data: TrendDataPoint[];
  dailyData?: TrendDataPoint[];
  height?: number;
  unit?: string;
  className?: string;
}

export function FitnessTrendChart({ data, dailyData, height = 280, unit = "", className }: FitnessTrendChartProps) {
  const hasDual = dailyData && dailyData.length >= 2;
  // 合并双系列数据
  const combined = hasDual
    ? [...data.map(d => ({ ...d, type: "正式体测" })), ...dailyData.map(d => ({ ...d, type: "日常训练" }))]
    : data;

  if (data.length < 1) {
    return (<div className={cn("flex items-center justify-center rounded-2xl bg-muted/30", className)} style={{ height }}><p className="text-sm text-muted-foreground">暂无数据</p></div>);
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={hasDual ? combined : data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={45} />
          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "13px" }}
            labelFormatter={(label: string, payload: unknown[]) => { const p = (payload as { payload?: { fullDate?: string } }[])[0]?.payload; return p?.fullDate || label; }}
            formatter={(value: number, name: string) => [`${value}${unit ? " " + unit : ""}`, name === "value" ? "成绩" : name]} />
          {hasDual && <Legend />}
          {hasDual ? (
            <>
              <Line type="monotone" dataKey="value" data={data} name="正式体测" stroke="hsl(var(--primary))" strokeWidth={2.5}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }} activeDot={{ fill: "hsl(var(--primary))", r: 7 }} connectNulls />
              <Line type="monotone" dataKey="value" data={dailyData} name="日常训练" stroke="#f59e0b" strokeWidth={2}
                strokeDasharray="5 5" dot={{ fill: "#f59e0b", strokeWidth: 1, r: 4 }} activeDot={{ fill: "#f59e0b", r: 6 }} connectNulls />
            </>
          ) : (
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }} activeDot={{ fill: "hsl(var(--primary))", r: 7 }} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
