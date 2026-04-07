// src/shared/runtime/internal/storage.ts
//
// 拆分说明：
// 本文件从 src/shared/runtime/provider.tsx 中拆出 storage 相关内部细节，
// 目的是让 provider 回到“状态编排层”，不再内嵌 localStorage 读写实现。

import type { UserRole } from "../types";

export const USERNAME_STORAGE_KEY = "WMS_USERNAME";
export const ROLE_STORAGE_KEY = "WMS_ROLE";

export function safeGetLS(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetLS(key: string, value: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function safeRemoveLS(key: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function normalizeRole(v: string | null): UserRole {
  return v === "admin" ? "admin" : "staff";
}
