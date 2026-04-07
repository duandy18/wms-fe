// src/shared/runtime/hooks.ts

import { useContext, useMemo } from "react";
import { AuthContext } from "./provider";
import type { AuthContextType } from "./types";

/**
 * runtime 内部总入口。
 * 页面 / feature 默认不要直接使用，优先使用：
 * - useSessionRuntime
 * - usePermissionRuntime
 * - useNavigationRuntime
 */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function useSessionRuntime() {
  const { authReady, isAuthenticated, user, login, logout } = useAuth();

  return useMemo(
    () => ({
      authReady,
      isAuthenticated,
      user,
      login,
      logout,
    }),
    [authReady, isAuthenticated, user, login, logout],
  );
}

export function usePermissionRuntime() {
  const { role, isAdmin, permissions, can, canAny, canAll } = useAuth();

  return useMemo(
    () => ({
      role,
      isAdmin,
      permissions,
      can,
      canAny,
      canAll,
    }),
    [role, isAdmin, permissions, can, canAny, canAll],
  );
}

export function useNavigationRuntime() {
  const { navigation, pages, routePrefixes, navigationError } = useAuth();

  return useMemo(
    () => ({
      navigation,
      pages,
      routePrefixes,
      navigationError,
    }),
    [navigation, pages, routePrefixes, navigationError],
  );
}
