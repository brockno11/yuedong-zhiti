// ===== 跃动智体 — 等级分布环形图 =====
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import type { DonutChartSegment } from "@/lib/types";

interface LevelDonutChartProps {
  data: DonutChartSegment[];
  height?: number;
  className?: string;
}

const LEVEL_COLORS: Record<string, string> = {
  excellent: "hsl(var(--level-excellent))",
  good: "hsl(var(--level-good))",
  pass: "hsl(var(--level-pass))",
  improve: "hsl(var(--level-improve))",
};

export function LevelDonutChart({
  data,
  height = 300,
  className,
}: LevelDonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-2xl bg-muted/30", className)}
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">暂无等级数据</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="count"
            nameKey="label"
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell
                key={entry.grade}
                fill={LEVEL_COLORS[entry.grade] || "hsl(var(--muted))"}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "13px",
            }}
            formatter={(value: number, name: string) => [
              `${value}人 (${data.find((d) => d.label === name)?.percentage ?? 0}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
