// ===== 跃动智体 — 体质雷达图 =====
"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import type { RadarChartDataPoint } from "@/lib/types";

interface FitnessRadarChartProps {
  data: RadarChartDataPoint[];
  showComparison?: boolean;
  height?: number;
  className?: string;
}

export function FitnessRadarChart({
  data,
  showComparison = true,
  height = 320,
  className,
}: FitnessRadarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-2xl bg-muted/30", className)} style={{ height }}>
        <p className="text-sm text-muted-foreground">暂无数据可供展示</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={data}
          cx="50%"
          cy="50%"
          outerRadius="70%"
          margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
        >
          <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{
              fontSize: 12,
              fill: "hsl(var(--muted-foreground))",
              fontWeight: 500,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickCount={5}
          />

          {/* 个人数据 */}
          <Radar
            name="个人"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary) / 0.2)"
            fillOpacity={0.3}
            strokeWidth={2}
          />

          {/* 班级平均对比 */}
          {showComparison && (
            <Radar
              name="班级平均"
              dataKey="classAverage"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted-foreground) / 0.1)"
              fillOpacity={0.2}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          )}

          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "13px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value: number, name: string) => [
              `${value}分`,
              name === "个人" ? "我的成绩" : "班级平均",
            ]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
