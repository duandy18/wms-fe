// src/lib/api.ts

// ============================================================================
// Access Token 管理：统一使用一个键 WMS_TOKEN
// ============================================================================

let _accessToken: string | null = null;

// 全系统唯一标准 token 键
const ACCESS_TOKEN_KEY = "WMS_TOKEN";

// ★ 必须导出：供整个前端拼接后端地址
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * 写入或清空访问 token（推荐所有登录/登出逻辑都调用它）
 */
export function setAccessToken(token: string | null): void {
  _accessToken = token;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

/**
 * 获取当前 token：只认 WMS_TOKEN
 */
export function getAccessToken(): string | null {
  if (_accessToken !== null) return _accessToken;

  const token = localStorage.getItem(ACCESS_TOKEN_KEY) || null;
  _accessToken = token;
  return token;
}

// ============================================================================
// 通用 API 响应结构
// ============================================================================
export interface ApiResponse<T> {
  data: T;
}

// ============================================================================
// 自定义错误类型
// ============================================================================
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

// 把 query params 拼到 path 上（不包含 API_BASE_URL）
function buildPathWithQuery(path: string, params?: QueryParams): string {
  if (!params) return path;

  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    search.append(k, String(v));
  }
  const qs = search.toString();
  if (!qs) return path;

  return path + (path.includes("?") ? "&" : "?") + qs;
}

// 判断一个对象是否像 RequestInit（用于重载识别）
function looksLikeRequestInit(x: unknown): x is RequestInit {
  if (!x || typeof x !== "object") return false;
  const o = x as RequestInit;
  return (
    "headers" in o ||
    "credentials" in o ||
    "mode" in o ||
    "cache" in o ||
    "redirect" in o ||
    "referrer" in o ||
    "integrity" in o
  );
}

// ============================================================================
// 核心 request 封装
// ============================================================================
async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const resp = await fetch(url, {
    method,
    headers,
    body:
      body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    credentials: "include",
    ...options,
  });

  if (!resp.ok) {
    let errBody: unknown = null;
    try {
      errBody = await resp.json();
    } catch {
      // ignore parse error，直接用 statusText
    }
    throw new ApiError(
      `HTTP ${resp.status}: ${
        errBody ? JSON.stringify(errBody) : resp.statusText
      }`,
      resp.status,
      errBody,
    );
  }

  try {
    return (await resp.json()) as T;
  } catch {
    // 没有返回体（204 或纯文本）时，返回 null as T
    return null as T;
  }
}

// ============================================================================
// 对外暴露的四个标准方法
// ============================================================================

/**
 * GET 请求：
 * - apiGet(path)                         // 无 query
 * - apiGet(path, params)                 // 以 params 拼 query
 * - apiGet(path, params, requestInit)    // query + 额外 fetch 选项
 * - apiGet(path, requestInit)            // 兼容旧签名：第二个参数当成 RequestInit
 */
export async function apiGet<T>(
  path: string,
  paramsOrOptions?: unknown,
  maybeOptions?: RequestInit,
): Promise<T> {
  let params: QueryParams | undefined;
  let options: RequestInit = {};

  if (maybeOptions) {
    params = paramsOrOptions as QueryParams;
    options = maybeOptions;
  } else if (looksLikeRequestInit(paramsOrOptions)) {
    options = paramsOrOptions as RequestInit;
  } else {
    params = paramsOrOptions as QueryParams | undefined;
  }

  const finalPath = buildPathWithQuery(path, params);
  return request<T>("GET", finalPath, undefined, options);
}

/**
 * POST 请求（新增 query 重载）：
 * - apiPost(path, body)
 * - apiPost(path, body, options)
 * - apiPost(path, body, params)
 * - apiPost(path, body, params, options)
 */
export async function apiPost<T>(
  path: string,
  body: unknown,
  paramsOrOptions?: unknown,
  maybeOptions?: RequestInit,
): Promise<T> {
  let params: QueryParams | undefined;
  let options: RequestInit = {};

  if (maybeOptions) {
    params = paramsOrOptions as QueryParams;
    options = maybeOptions;
  } else if (looksLikeRequestInit(paramsOrOptions)) {
    options = paramsOrOptions as RequestInit;
  } else {
    params = paramsOrOptions as QueryParams | undefined;
  }

  const finalPath = buildPathWithQuery(path, params);
  return request<T>("POST", finalPath, body, options);
}

/**
 * PATCH 请求（新增 query 重载）：
 * - apiPatch(path, body)
 * - apiPatch(path, body, options)
 * - apiPatch(path, body, params)
 * - apiPatch(path, body, params, options)
 */
export async function apiPatch<T>(
  path: string,
  body: unknown,
  paramsOrOptions?: unknown,
  maybeOptions?: RequestInit,
): Promise<T> {
  let params: QueryParams | undefined;
  let options: RequestInit = {};

  if (maybeOptions) {
    params = paramsOrOptions as QueryParams;
    options = maybeOptions;
  } else if (looksLikeRequestInit(paramsOrOptions)) {
    options = paramsOrOptions as RequestInit;
  } else {
    params = paramsOrOptions as QueryParams | undefined;
  }

  const finalPath = buildPathWithQuery(path, params);
  return request<T>("PATCH", finalPath, body, options);
}

/**
 * DELETE 请求（新增 query 重载）：
 * - apiDelete(path)
 * - apiDelete(path, options)
 * - apiDelete(path, params)
 * - apiDelete(path, params, options)
 */
export async function apiDelete<T>(
  path: string,
  paramsOrOptions?: unknown,
  maybeOptions?: RequestInit,
): Promise<T> {
  let params: QueryParams | undefined;
  let options: RequestInit = {};

  if (maybeOptions) {
    params = paramsOrOptions as QueryParams;
    options = maybeOptions;
  } else if (looksLikeRequestInit(paramsOrOptions)) {
    options = paramsOrOptions as RequestInit;
  } else {
    params = paramsOrOptions as QueryParams | undefined;
  }

  const finalPath = buildPathWithQuery(path, params);
  return request<T>("DELETE", finalPath, undefined, options);
}
