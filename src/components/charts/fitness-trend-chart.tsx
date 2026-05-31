// ===== 跃动智体 — 趋势折线图（支持双系列）=====
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";

interface TrendDataPoint {
  timestamp: number;
  date: string;
  fullDate: string;
  value: number;
  grade?: string;
}

interface FitnessTrendChartProps {
  data: TrendDataPoint[];
  dailyData?: TrendDataPoint[];
  height?: number;
  unit?: string;
  className?: string;
}

interface ChartPoint {
  timestamp: number;
  date: string;
  fullDate: string;
  officialValue: number | null;
  dailyValue: number | null;
}

interface TooltipPayloadItem {
  dataKey?: string;
  value?: number | null;
  payload?: ChartPoint;
}

export function FitnessTrendChart({ data, dailyData, height = 280, unit = "", className }: FitnessTrendChartProps) {
  const hasDual = dailyData && dailyData.length >= 2;
  const chartData = mergeSeries(data, dailyData ?? []);
  const timestamps = chartData.map((point) => point.timestamp);
  const domain: [number, number] = [Math.min(...timestamps), Math.max(...timestamps)];
  const dateByTimestamp = new Map(chartData.map((point) => [point.timestamp, point.date]));
  const dailyColor = "hsl(var(--level-pass))";

  if (data.length < 1) {
    return (<div className={cn("flex items-center justify-center rounded-2xl bg-muted/30", className)} style={{ height }}><p className="text-sm text-muted-foreground">暂无数据</p></div>);
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={domain}
            scale="time"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value: number) => dateByTimestamp.get(value) ?? formatMonth(value)}
            axisLine={false}
            tickLine={false}
            minTickGap={18}
          />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={45} />
          <Tooltip
            filterNull
            cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }}
            content={({ active, label, payload }) => (
              <TrendTooltip
                active={active}
                label={typeof label === "number" ? label : undefined}
                payload={payload as TooltipPayloadItem[] | undefined}
                chartData={chartData}
                unit={unit}
              />
            )}
          />
          {hasDual && <Legend />}
          {hasDual ? (
            <>
              <Line type="monotone" dataKey="officialValue" name="正式体测" stroke="hsl(var(--primary))" strokeWidth={2.5}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }} activeDot={{ fill: "hsl(var(--primary))", r: 7 }} connectNulls />
              <Line type="monotone" dataKey="dailyValue" name="日常训练" stroke={dailyColor} strokeWidth={2}
                strokeDasharray="5 5" dot={{ fill: dailyColor, strokeWidth: 1, r: 4 }} activeDot={{ fill: dailyColor, r: 6 }} connectNulls />
            </>
          ) : (
            <Line type="monotone" dataKey="officialValue" name="正式体测" stroke="hsl(var(--primary))" strokeWidth={2.5}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }} activeDot={{ fill: "hsl(var(--primary))", r: 7 }} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendTooltip({
  active,
  label,
  payload,
  chartData,
  unit,
}: {
  active?: boolean;
  label?: number;
  payload?: TooltipPayloadItem[];
  chartData: ChartPoint[];
  unit: string;
}) {
  if (!active || label === undefined) return null;

  const activePoint = chartData.find((point) => point.timestamp === label)
    ?? payload?.find((item) => item.payload)?.payload;
  if (!activePoint) return null;

  const nearbyThreshold = 3 * 24 * 60 * 60 * 1000;
  const officialPoint = findNearestPoint(chartData, label, "officialValue", nearbyThreshold);
  const dailyPoint = findNearestPoint(chartData, label, "dailyValue", nearbyThreshold);
  const rows = [
    officialPoint ? { key: "official", label: "正式体测", value: officialPoint.officialValue, fullDate: officialPoint.fullDate, colorClass: "text-primary" } : null,
    dailyPoint ? { key: "daily", label: "日常训练", value: dailyPoint.dailyValue, fullDate: dailyPoint.fullDate, colorClass: "text-level-pass" } : null,
  ].filter((row): row is { key: string; label: string; value: number; fullDate: string; colorClass: string } => row !== null && row.value !== null);

  if (rows.length === 0) return null;
  const title = rows.length === 1 || rows.every((row) => row.fullDate === rows[0].fullDate)
    ? rows[0].fullDate
    : "相邻日期数据";

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 text-sm font-medium text-foreground">{title}</p>
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-4">
            <span className={row.colorClass}>{row.label}</span>
            <span className="font-medium tabular-nums text-foreground">{row.value}{unit ? ` ${unit}` : ""}</span>
          </div>
        ))}
      </div>
      {rows.length > 1 && (
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          {rows.map((row) => `${row.label} ${row.fullDate}`).join(" · ")}
        </p>
      )}
    </div>
  );
}

function findNearestPoint(
  chartData: ChartPoint[],
  timestamp: number,
  key: "officialValue" | "dailyValue",
  threshold: number,
) {
  let nearest: ChartPoint | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const point of chartData) {
    if (point[key] === null) continue;
    const distance = Math.abs(point.timestamp - timestamp);
    if (distance <= threshold && distance < nearestDistance) {
      nearest = point;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function mergeSeries(officialData: TrendDataPoint[], dailyData: TrendDataPoint[]): ChartPoint[] {
  const byTimestamp = new Map<number, ChartPoint>();

  for (const point of officialData) {
    byTimestamp.set(point.timestamp, {
      timestamp: point.timestamp,
      date: point.date,
      fullDate: point.fullDate,
      officialValue: point.value,
      dailyValue: null,
    });
  }

  for (const point of dailyData) {
    const existing = byTimestamp.get(point.timestamp);
    if (existing) {
      existing.dailyValue = point.value;
    } else {
      byTimestamp.set(point.timestamp, {
        timestamp: point.timestamp,
        date: point.date,
        fullDate: point.fullDate,
        officialValue: null,
        dailyValue: point.value,
      });
    }
  }

  return Array.from(byTimestamp.values()).sort((a, b) => a.timestamp - b.timestamp);
}

function formatMonth(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}
