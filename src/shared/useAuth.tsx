// src/shared/useAuth.tsx
/* eslint-disable react-refresh/only-export-components */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import {
  apiPost,
  apiGet,
  setAccessToken,
  getAccessToken,
} from "../lib/api";

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

// /users/me 返回结构（按后端实际 schema 调整）
interface MeResponse {
  id: number;
  username: string;
  roles?: { id: number; name: string }[];
  permissions?: string[];
}

// 前端使用的用户信息模型：挂上 roles / permissions，方便调试与 gating。
interface UserInfo {
  username: string;
  role: UserRole; // 前端视角 admin/staff（通过 roles 推导）
  roles: string[]; // 后端角色名列表，如 ["admin"] / ["operator"]
  permissions: Permission[];
}

interface AuthContextType {
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

// 用户名和角色各自一个 key，不动 token 那套（WMS_TOKEN 仍由 lib/api 管）
const USERNAME_STORAGE_KEY = "WMS_USERNAME";
const ROLE_STORAGE_KEY = "WMS_ROLE";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  // 默认 staff，当成“业务人员”角色
  const [role, setRole] = useState<UserRole>("staff");
  // 后端返回的权限串，如 ["system.user.manage", "operations.inbound", ...]
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // 启动时：根据 token + /users/me 恢复状态
  useEffect(() => {
    const token = getAccessToken(); // 内部仍然用 WMS_TOKEN

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setPermissions([]);
      return;
    }

    const savedUsername =
      typeof window !== "undefined"
        ? window.localStorage.getItem(USERNAME_STORAGE_KEY)
        : null;

    (async () => {
      try {
        const me = await apiGet<MeResponse>("/users/me");

        const backendRoles = me.roles?.map((r) => r.name) ?? [];
        const backendPerms = me.permissions ?? [];

        // 约定：拥有 admin 角色 → 前端视角 admin；否则 staff
        const effectiveRole: UserRole = backendRoles.includes("admin")
          ? "admin"
          : "staff";

        setIsAuthenticated(true);
        setRole(effectiveRole);
        setPermissions(backendPerms);

        const username = me.username ?? savedUsername ?? "unknown";

        setUser({
          username,
          role: effectiveRole,
          roles: backendRoles,
          permissions: backendPerms,
        });

        if (typeof window !== "undefined") {
          window.localStorage.setItem(USERNAME_STORAGE_KEY, username);
          window.localStorage.setItem(ROLE_STORAGE_KEY, effectiveRole);
        }
      } catch {
        // /users/me 掉线时，至少保持“已登录 + 基础信息”
        setIsAuthenticated(true);
        const fallbackRole: UserRole = "staff";

        setRole(fallbackRole);
        setPermissions([]);

        const username = savedUsername ?? "unknown";
        setUser({
          username,
          role: fallbackRole,
          roles: [],
          permissions: [],
        });
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
    setIsAuthenticated(true);

    try {
      const me = await apiGet<MeResponse>("/users/me");

      const backendRoles = me.roles?.map((r) => r.name) ?? [];
      const backendPerms = me.permissions ?? [];

      const effectiveRole: UserRole = backendRoles.includes("admin")
        ? "admin"
        : "staff";

      setRole(effectiveRole);
      setPermissions(backendPerms);

      const username = me.username ?? input.username;

      setUser({
        username,
        role: effectiveRole,
        roles: backendRoles,
        permissions: backendPerms,
      });

      if (typeof window !== "undefined") {
        window.localStorage.setItem(USERNAME_STORAGE_KEY, username);
        window.localStorage.setItem(ROLE_STORAGE_KEY, effectiveRole);
      }
    } catch {
      // /users/me 暂时失败 → 退化到只记录用户名，权限为空
      const fallbackRole: UserRole = "staff";

      setRole(fallbackRole);
      setPermissions([]);

      setUser({
        username: input.username,
        role: fallbackRole,
        roles: [],
        permissions: [],
      });

      if (typeof window !== "undefined") {
        window.localStorage.setItem(USERNAME_STORAGE_KEY, input.username);
        window.localStorage.setItem(ROLE_STORAGE_KEY, fallbackRole);
      }
    }
  };

  const logout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setPermissions([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USERNAME_STORAGE_KEY);
      window.localStorage.removeItem(ROLE_STORAGE_KEY);
    }
  };

  const can = (perm: Permission) => permissions.includes(perm);

  const canAny = (perms: Permission[]) =>
    perms.some((p) => permissions.includes(p));

  const canAll = (perms: Permission[]) =>
    perms.every((p) => permissions.includes(p));

  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{
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
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
