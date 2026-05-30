"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface LoginData {
  role: "student" | "teacher";
  username: string;
  name: string;
  class?: string;
  grade?: string;
  gender?: string;
  timestamp: number;
}

export function getLoginData(): LoginData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("demo_login");
    return raw ? (JSON.parse(raw) as LoginData) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getLoginData();
}

export function getRole(): "student" | "teacher" | null {
  return getLoginData()?.role || null;
}

// 登录守卫 Hook — 未登录跳转到 /
export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const data = getLoginData();

    // 已在 / 且已登录 → 跳到对应首页
    if (pathname === "/" && data) {
      router.replace(data.role === "student" ? "/dashboard" : "/teacher");
      return;
    }

    // 不在 / 且未登录 → 跳到登录页
    if (pathname !== "/" && !data) {
      router.replace("/");
      return;
    }

    setReady(true);
  }, [pathname, router]);

  return ready;
}
