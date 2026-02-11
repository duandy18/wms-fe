// admin/shop-bundles/http.ts
import type { ApiProblem } from "./types";

const TOKEN_KEY = "WMS_TOKEN";

/**
 * dev 默认后端（你现在截图是 5173 的 Vite dev server）
 * 生产保持同源（空前缀）
 */
function resolveApiBase(): string {
  // 允许通过 env 显式指定（你要是有统一变量，优先用它）
  const envBase =
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL ??
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_BACKEND_URL;

  if (envBase && envBase.trim()) return envBase.trim().replace(/\/+$/, "");

  // Vite dev 默认：5173 -> 打到 8000
  try {
    const port = window.location.port;
    if (port === "5173") return "http://127.0.0.1:8000";
  } catch {
    // ignore
  }

  // 生产/同源
  return "";
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = resolveApiBase();
  if (!base) return path.startsWith("/") ? path : `/${path}`;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function getToken(): string | null {
  try {
    const v = localStorage.getItem(TOKEN_KEY);
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

export async function readProblemMessage(res: Response): Promise<string> {
  // 合同：Problem 至少有 message；其余字段不强依赖
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    const t = await safeReadText(res);
    const head = t.slice(0, 120).replace(/\s+/g, " ").trim();
    return head
      ? `后端返回非 JSON（HTTP ${res.status}）：${head}`
      : res.statusText || `HTTP ${res.status}`;
  }

  try {
    const dataUnknown: unknown = await res.json();
    const data = dataUnknown as ApiProblem;
    const msg = data.message;
    if (msg && String(msg).trim()) return String(msg);
  } catch {
    // ignore
  }
  return res.statusText || `HTTP ${res.status}`;
}

export async function apiFetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init?.headers);

  if (init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = buildUrl(input);
  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const msg = await readProblemMessage(res);
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as unknown as T;

  const ct = res.headers.get("content-type") ?? "";
  const text = await safeReadText(res);

  if (!text) return undefined as unknown as T;

  // 避免再次出现 <!doctype> 这种“假 JSON”
  if (!ct.includes("application/json")) {
    const head = text.slice(0, 120).replace(/\s+/g, " ").trim();
    throw new Error(head ? `后端返回非 JSON：${head}` : "后端返回非 JSON 响应");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const head = text.slice(0, 120).replace(/\s+/g, " ").trim();
    throw new Error(head ? `JSON 解析失败：${head}` : "JSON 解析失败");
  }
}

export function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}
