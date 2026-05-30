// ===== 跃动智体 — 班级薄弱项排行柱状图 =====
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface BarChartDataPoint {
  itemName: string;
  passRate: number;
}

interface ClassBarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  className?: string;
}

// 颜色：及格率越低越红，越高越绿
function getBarColor(rate: number): string {
  if (rate >= 80) return "hsl(var(--level-excellent))";
  if (rate >= 65) return "hsl(var(--level-pass))";
  return "hsl(var(--level-improve))";
}

export function ClassBarChart({
  data,
  height = 320,
  className,
}: ClassBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-2xl bg-muted/30", className)}
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">暂无班级数据</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, bottom: 5, left: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            unit="%"
          />
          <YAxis
            type="category"
            dataKey="itemName"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "13px",
            }}
            formatter={(value: number) => [`${value}%`, "及格率"]}
          />
          <Bar dataKey="passRate" radius={[0, 8, 8, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.passRate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
