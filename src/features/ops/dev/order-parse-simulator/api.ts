// src/features/ops/dev/order-parse-simulator/api.ts

import type { JsonObject } from "./types";

function getApiBase(): string {
  // 1) 可选：从 localStorage 配置（方便不同环境切换）
  const fromLs = window.localStorage.getItem("WMS_API_BASE");
  if (fromLs && fromLs.trim()) return fromLs.trim().replace(/\/+$/, "");

  // 2) 可选：从 Vite env 读取（如果你工程有配）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const envBase = (import.meta as any)?.env?.VITE_API_BASE;
  if (typeof envBase === "string" && envBase.trim()) return envBase.trim().replace(/\/+$/, "");

  // 3) 默认：本地后端
  return "http://127.0.0.1:8000";
}

export function getBearerToken(): string | null {
  // ✅ 项目统一：WMS_TOKEN（兼容旧 key）
  const candidates = ["WMS_TOKEN", "token", "TOKEN", "access_token", "ACCESS_TOKEN"];
  for (const k of candidates) {
    const v = window.localStorage.getItem(k);
    if (v && v.trim()) return v.trim();
  }
  return null;
}

function toAbsoluteUrl(url: string): string {
  // 已经是绝对地址就不动
  if (/^https?:\/\//i.test(url)) return url;

  const base = getApiBase();
  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
}

export async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const token = getBearerToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const absUrl = toAbsoluteUrl(url);

  const resp = await fetch(absUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await resp.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!resp.ok) {
    const obj = (data && typeof data === "object" ? (data as JsonObject) : null) as JsonObject | null;
    const msg =
      obj && typeof obj.message === "string"
        ? obj.message
        : `HTTP ${resp.status} (${resp.statusText || "Request Failed"})`;
    throw new Error(msg);
  }

  return data as T;
}
