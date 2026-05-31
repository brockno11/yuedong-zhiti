"use client";

// ===== 跃动智体 — 演示模式统一状态管理 =====
// 替代分散的 useState/localStorage，提供统一数据读写和审核同步

import type { FitnessItemId, BodyFeeling, OnboardingData } from "@/lib/types";

const STORAGE_KEYS = {
  onboarding: "onboardingData",
  records: "demo_records",
  reviews: "demo_reviews",
  demoMode: "demo_mode",
} as const;

// ===== 引导数据 =====
export function getOnboardingData(): OnboardingData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.onboarding);
    return raw ? (JSON.parse(raw) as OnboardingData) : null;
  } catch {
    return null;
  }
}

export function saveOnboardingData(data: OnboardingData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.onboarding, JSON.stringify(data));
}

// ===== 体测记录 =====
export interface StoredRecord {
  id: string;
  date: string;
  selectedItems: FitnessItemId[];
  scores: Record<string, number>;
  feelings: Partial<Record<FitnessItemId, BodyFeeling>>;
  overallDiscomfort: { hasDiscomfort: boolean; discomfortNotes: string };
}

// ===== AI 分析持久化（跨页面导航不中断） =====
const AI_ANALYSIS_KEY = "ai_analysis_cache";

interface CachedAnalysis {
  studentReport: Record<string, unknown> | null;
  classReport: Record<string, unknown> | null;
  lastUpdated: string;
  mode: "ai" | "mock" | "fallback";
}

export function getCachedAnalysis(): CachedAnalysis | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AI_ANALYSIS_KEY);
    return raw ? (JSON.parse(raw) as CachedAnalysis) : null;
  } catch { return null; }
}

export function saveCachedAnalysis(analysis: CachedAnalysis): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AI_ANALYSIS_KEY, JSON.stringify(analysis));
}

export function getRecords(): StoredRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.records);
    return raw ? (JSON.parse(raw) as StoredRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveRecord(record: StoredRecord): void {
  if (typeof window === "undefined") return;
  const records = getRecords();
  records.unshift(record);
  localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
  // 清除旧的 AI 缓存，下次打开 AI 分析将基于最新记录重新生成
  localStorage.removeItem(AI_ANALYSIS_KEY);
}

export function getLatestStoredRecord(): StoredRecord | null {
  const records = getRecords();
  return records.length > 0 ? records[0] : null;
}

// ===== 审核状态（跨页面同步） =====
export interface StoredReview {
  reportId: string;
  reportType: "student" | "class";
  status: "pending" | "approved" | "modified" | "rejected";
  teacherNotes: string;
  reviewedAt?: string;
  modifications?: { section: string; original: string; modified: string }[];
}

export function getReviews(): StoredReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.reviews);
    return raw ? (JSON.parse(raw) as StoredReview[]) : [];
  } catch {
    return [];
  }
}

export function updateReview(reviewId: string, updates: Partial<StoredReview>): void {
  if (typeof window === "undefined") return;
  const reviews = getReviews();
  const idx = reviews.findIndex((r) => r.reportId === reviewId);
  if (idx >= 0) {
    reviews[idx] = { ...reviews[idx], ...updates, reviewedAt: new Date().toISOString() };
  } else {
    reviews.push({
      reportId: reviewId,
      reportType: "student",
      status: "pending",
      teacherNotes: "",
      ...updates,
    });
  }
  localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
}

export function getReviewByReportId(reportId: string): StoredReview | null {
  return getReviews().find((r) => r.reportId === reportId) || null;
}

// ===== 演示模式 =====
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.demoMode) === "true";
}

export function resetDemoData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function seedDemoData(): void {
  if (typeof window === "undefined") return;
  // 预设引导数据（高二男生）
  saveOnboardingData({
    grade: "高二",
    gender: "male",
    age: 16,
    height: 172,
    weight: 60,
    sportGoal: "overall_health",
    sportBase: "moderate",
    discomforts: ["none"],
  });
  // 预设一条体测记录
  saveRecord({
    id: `demo-${Date.now()}`,
    date: new Date().toISOString(),
    selectedItems: ["50m_run", "standing_long_jump", "1000m_run", "vital_capacity", "sit_and_reach", "pull_up"],
    scores: { "50m_run": 8.2, standing_long_jump: 185, "1000m_run": 250, vital_capacity: 2800, sit_and_reach: 10, pull_up: 5 },
    feelings: {},
    overallDiscomfort: { hasDiscomfort: false, discomfortNotes: "" },
  });
}
