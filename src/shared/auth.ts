// src/shared/auth.ts
//
// Auth 只读接口层（Read-only Facade）
// 目的：业务页面默认只拿“读权限/读状态”的接口，避免随手调用 login/logout 等副作用。
// 可写能力（login/logout）只允许在特定页面/模块显式引入 src/shared/useAuth.tsx。

import { useAuth } from "./useAuth";

// 这里故意不 re-export useAuth，以免业务页面顺手拿到可写能力。
export type AuthReadOnly = {
  // 尽量保守：不假设 useAuth 的具体字段名
  // 统一提供最常用的读取能力
  isAuthenticated: boolean;

  // 用户对象/claims：原样透传（若不存在则为 null）
  user: unknown | null;

  // 权限/角色：原样透传（若不存在则为空数组）
  permissions: string[];
};

function pickStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string") as string[];
}

export function useAuthReadOnly(): AuthReadOnly {
  const a = useAuth() as unknown as Record<string, unknown>;

  // 兼容不同实现：isAuthenticated / authed / loggedIn
  const isAuthenticated =
    (typeof a["isAuthenticated"] === "boolean" && (a["isAuthenticated"] as boolean)) ||
    (typeof a["authed"] === "boolean" && (a["authed"] as boolean)) ||
    (typeof a["loggedIn"] === "boolean" && (a["loggedIn"] as boolean)) ||
    Boolean(a["user"]);

  // user 兼容：user / me / profile
  const user = (a["user"] ?? a["me"] ?? a["profile"] ?? null) as unknown | null;

  // permissions 兼容：permissions / perms / scopes
  const permissions = pickStringArray(a["permissions"] ?? a["perms"] ?? a["scopes"]);

  return { isAuthenticated, user, permissions };
}
