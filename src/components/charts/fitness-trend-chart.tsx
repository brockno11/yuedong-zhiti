// ===== 跃动智体 — 单项趋势折线图 =====
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface TrendDataPoint {
  date: string;
  value: number;
  grade?: string;
}

interface FitnessTrendChartProps {
  data: TrendDataPoint[];
  height?: number;
  unit?: string;
  className?: string;
}

export function FitnessTrendChart({
  data,
  height = 280,
  unit = "",
  className,
}: FitnessTrendChartProps) {
  if (!data || data.length < 2) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-2xl bg-muted/30", className)}
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">
          仅有一次测试数据，暂无趋势可供展示
        </p>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{
              fontSize: 12,
              fill: "hsl(var(--muted-foreground))",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{
              fontSize: 12,
              fill: "hsl(var(--muted-foreground))",
            }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "13px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value: number) => [
              `${value}${unit ? " " + unit : ""}`,
              "成绩",
            ]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{
              fill: "hsl(var(--primary))",
              strokeWidth: 2,
              r: 5,
            }}
            activeDot={{
              fill: "hsl(var(--primary))",
              strokeWidth: 0,
              r: 7,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
