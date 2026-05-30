// ===== 跃动智体 — iOS 风格滚轮选择器 =====
"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

interface WheelPickerProps {
  value: number;
  onChange: (_value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  label?: string;
  className?: string;
  quickOptions?: { label: string; value: number }[];
}

export function WheelPicker({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  label,
  className,
  quickOptions,
}: WheelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  // 生成可选值列表（限制数量避免过长）
  const options: number[] = [];
  for (let v = min; v <= max; v += step) {
    options.push(Math.round(v * 100) / 100);
  }

  // 触摸/拖拽处理
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startValue.current = value;
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = startY.current - e.clientY;
    const valueChange = Math.round(deltaY / 30) * step;
    const newValue = Math.min(max, Math.max(min, startValue.current + valueChange));
    onChange(Math.round(newValue * 100) / 100);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // 快捷选项点击
  const handleQuickOption = (optValue: number) => {
    onChange(optValue);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="text-sm font-medium">{label}</label>
      )}

      {/* 滚轮区域 */}
      <div className="relative flex items-center gap-2">
        {/* 减号按钮 */}
        <button
          onClick={() => {
            const newVal = Math.max(min, value - step);
            onChange(Math.round(newVal * 100) / 100);
          }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
          aria-label="减少"
        >
          <ChevronDown className="h-5 w-5" />
        </button>

        {/* 滚轮数字显示 */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={cn(
            "relative flex-1 cursor-grab select-none overflow-hidden rounded-2xl border-2 bg-card py-4 text-center",
            "touch-none transition-shadow",
            isDragging
              ? "border-primary/50 shadow-lg shadow-primary/10 cursor-grabbing"
              : "border-border hover:border-primary/20"
          )}
          style={{ minHeight: "64px" }}
        >
          {/* 中央高亮条 */}
          <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary/5 h-10" />

          {/* 滚动的数字 */}
          <div className="relative z-10 flex items-baseline justify-center gap-1">
            <span
              className={cn(
                "text-3xl font-bold tabular-nums transition-all duration-150",
                isDragging && "scale-110 text-primary"
              )}
            >
              {value}
            </span>
            {unit && (
              <span className="text-base text-muted-foreground">{unit}</span>
            )}
          </div>

          {/* 上下提示 */}
          <div className="absolute inset-y-0 left-3 flex flex-col justify-center gap-1 opacity-20 pointer-events-none">
            <ChevronUp className="h-3 w-3" />
            <ChevronDown className="h-3 w-3" />
          </div>
        </div>

        {/* 加号按钮 */}
        <button
          onClick={() => {
            const newVal = Math.min(max, value + step);
            onChange(Math.round(newVal * 100) / 100);
          }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
          aria-label="增加"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>

      {/* 快捷选项 */}
      {quickOptions && quickOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {quickOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleQuickOption(opt.value)}
              className={cn(
                "min-h-11 rounded-lg border px-3 py-2 text-xs font-medium transition-all active:scale-95",
                value === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* 拖拽提示 */}
      <p className="text-center text-[11px] text-muted-foreground/60">
        上下拖动数字或点击 ± 按钮调整
      </p>
    </div>
  );
}

// getVisibleOptions reserved for future scroll snap implementation
