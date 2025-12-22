// src/shared/useAuth.tsx
/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiPost, apiGet, setAccessToken, getAccessToken } from "../lib/api";

export type UserRole = "staff" | "admin";
type Permission = string;

interface LoginInput {
  username: string;
  password: string;
}

interface LoginResult {
  access_token: string;
  token_type: string;
}

interface MeResponse {
  id: number;
  username: string;
  roles?: { id: number; name: string }[];
  permissions?: string[];
}

interface UserInfo {
  username: string;
  role: UserRole;
  roles: string[];
  permissions: Permission[];
}

interface AuthContextType {
  authReady: boolean;

  isAuthenticated: boolean;
  user: UserInfo | null;

  login: (input: LoginInput) => Promise<void>;
  logout: () => void;

  role: UserRole;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;

  permissions: Permission[];
  can: (perm: Permission) => boolean;
  canAny: (perms: Permission[]) => boolean;
  canAll: (perms: Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERNAME_STORAGE_KEY = "WMS_USERNAME";
const ROLE_STORAGE_KEY = "WMS_ROLE";

function safeGetLS(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLS(key: string, value: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeRemoveLS(key: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function normalizeRole(v: string | null): UserRole {
  return v === "admin" ? "admin" : "staff";
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function isNotAuthenticatedError(err: unknown): boolean {
  const e = isRecord(err) ? err : {};

  const status =
    (typeof e["status"] === "number" ? e["status"] : undefined) ??
    (typeof e["statusCode"] === "number" ? e["statusCode"] : undefined) ??
    (isRecord(e["response"]) && typeof (e["response"] as Record<string, unknown>)["status"] === "number"
      ? ((e["response"] as Record<string, unknown>)["status"] as number)
      : undefined);

  if (status === 401) return true;

  const detail =
    (isRecord(e["body"]) ? (e["body"] as Record<string, unknown>)["detail"] : undefined) ??
    e["detail"] ??
    (isRecord(e["response"]) && isRecord((e["response"] as Record<string, unknown>)["data"])
      ? (((e["response"] as Record<string, unknown>)["data"] as Record<string, unknown>)["detail"] as unknown)
      : undefined) ??
    e["message"];

  return typeof detail === "string" && detail.toLowerCase().includes("not authenticated");
}

function devForceLogout(reason: string) {
  try {
    setAccessToken(null);
  } catch {
    // ignore
  }

  try {
    safeRemoveLS(USERNAME_STORAGE_KEY);
    safeRemoveLS(ROLE_STORAGE_KEY);
  } catch {
    // ignore
  }

  try {
    window.sessionStorage.setItem("WMS_DEV_FORCE_LOGOUT_REASON", reason);
  } catch {
    // ignore
  }
}

// HMR: 模块被替换前强制 logout + 回登录页（DEV only）
try {
  const isDev = !!import.meta.env.DEV;

  const meta = import.meta as unknown as { hot?: { dispose?: (cb: () => void) => void } };
  const hot = meta.hot;

  if (isDev && hot?.dispose) {
    hot.dispose(() => {
      devForceLogout("HMR_DISPOSE");
      try {
        window.location.replace("/login");
      } catch {
        // ignore
      }
    });
  }
} catch {
  // ignore
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authReady, setAuthReady] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const [role, setRole] = useState<UserRole>(normalizeRole(safeGetLS(ROLE_STORAGE_KEY)));
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const hardLogout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setPermissions([]);
    setRole("staff");
    safeRemoveLS(USERNAME_STORAGE_KEY);
    safeRemoveLS(ROLE_STORAGE_KEY);
  };

  useEffect(() => {
    const isDev = !!import.meta.env.DEV;

    if (isDev) {
      devForceLogout("DEV_COLD_START");
      hardLogout();
      setAuthReady(true);
      return;
    }

    const token = getAccessToken();

    if (!token) {
      hardLogout();
      setAuthReady(true);
      return;
    }

    setAccessToken(token);
    setIsAuthenticated(false);

    const username0 = safeGetLS(USERNAME_STORAGE_KEY) ?? "unknown";
    const role0 = normalizeRole(safeGetLS(ROLE_STORAGE_KEY));

    setUser({
      username: username0,
      role: role0,
      roles: role0 === "admin" ? ["admin"] : [],
      permissions: [],
    });
    setRole(role0);
    setPermissions([]);

    (async () => {
      try {
        const me = await apiGet<MeResponse>("/users/me");

        const backendRoles = me.roles?.map((r) => r.name) ?? [];
        const backendPerms = me.permissions ?? [];

        const effectiveRole: UserRole = backendRoles.includes("admin") ? "admin" : "staff";
        const username = me.username ?? username0;

        setRole(effectiveRole);
        setPermissions(backendPerms);
        setUser({
          username,
          role: effectiveRole,
          roles: backendRoles,
          permissions: backendPerms,
        });

        safeSetLS(USERNAME_STORAGE_KEY, username);
        safeSetLS(ROLE_STORAGE_KEY, effectiveRole);

        setIsAuthenticated(true);
        setAuthReady(true);
      } catch (err: unknown) {
        if (isNotAuthenticatedError(err)) {
          hardLogout();
        }
        setAuthReady(true);
      }
    })();
  }, []);

  const login = async (input: LoginInput) => {
    const result = await apiPost<LoginResult>("/users/login", {
      username: input.username,
      password: input.password,
    });

    const token = result.access_token;
    setAccessToken(token);

    setIsAuthenticated(false);
    setAuthReady(false);

    try {
      const me = await apiGet<MeResponse>("/users/me");

      const backendRoles = me.roles?.map((r) => r.name) ?? [];
      const backendPerms = me.permissions ?? [];

      const effectiveRole: UserRole = backendRoles.includes("admin") ? "admin" : "staff";
      const username = me.username ?? input.username;

      setRole(effectiveRole);
      setPermissions(backendPerms);
      setUser({
        username,
        role: effectiveRole,
        roles: backendRoles,
        permissions: backendPerms,
      });

      safeSetLS(USERNAME_STORAGE_KEY, username);
      safeSetLS(ROLE_STORAGE_KEY, effectiveRole);

      setIsAuthenticated(true);
      setAuthReady(true);

      try {
        window.sessionStorage.removeItem("WMS_DEV_FORCE_LOGOUT_REASON");
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      if (isNotAuthenticatedError(err)) {
        hardLogout();
      }
      setAuthReady(true);
    }
  };

  const logout = () => {
    hardLogout();
    setAuthReady(true);
  };

  const can = (perm: Permission) => permissions.includes(perm);
  const canAny = (perms: Permission[]) => perms.some((p) => permissions.includes(p));
  const canAll = (perms: Permission[]) => perms.every((p) => permissions.includes(p));
  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{
        authReady,
        isAuthenticated,
        user,
        login,
        logout,
        role,
        setRole,
        isAdmin,
        permissions,
        can,
        canAny,
        canAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
