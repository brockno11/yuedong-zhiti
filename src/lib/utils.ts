import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 跑步项目 ID 集合 */
const RUN_ITEM_IDS = new Set(["50m_run", "800m_run", "1000m_run"]);

/** 耐力跑项目 ID 集合（需要 分:秒 格式显示） */
const ENDURANCE_RUN_IDS = new Set(["800m_run", "1000m_run"]);

/** 判断是否为跑步项目 */
export function isRunItem(itemId: string): boolean {
  return RUN_ITEM_IDS.has(itemId);
}

/** 判断是否为耐力跑项目（800m/1000m，需要 分:秒 格式） */
export function isEnduranceRun(itemId: string): boolean {
  return ENDURANCE_RUN_IDS.has(itemId);
}

/**
 * 将总秒数格式化为 "M:SS" 格式（用于 800m/1000m 跑步成绩展示）
 * @example formatRunTime(230) → "3:50"
 * @example formatRunTime(205) → "3:25"
 */
export function formatRunTime(totalSeconds: number): string {
  const total = Math.floor(totalSeconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * 将 "M:SS" 格式解析为总秒数
 * @example parseRunTime("3:50") → 230
 */
export function parseRunTime(text: string): number | null {
  const match = text.match(/^(\d+):(\d{2})$/);
  if (!match) return null;
  const m = parseInt(match[1], 10);
  const s = parseInt(match[2], 10);
  if (s >= 60) return null;
  return m * 60 + s;
}

/**
 * 格式化体测项目成绩值（自动判断是否需要 分:秒 格式）
 * @param itemId 项目 ID
 * @param value 成绩值（内部存储单位）
 * @param unit 显示单位（如 "秒"、"cm"、"ml"）
 */
export function formatItemValue(itemId: string, value: number, unit: string): string {
  if (isEnduranceRun(itemId)) {
    return formatRunTime(value);
  }
  return `${value}${unit}`;
}
