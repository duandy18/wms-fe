// src/shared/useAuth.tsx
/* eslint-disable react-refresh/only-export-components */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { apiPost, setAccessToken, getAccessToken } from "../lib/api";

export type UserRole = "staff" | "admin";

interface LoginInput {
  username: string;
  password: string;
}

interface LoginResult {
  access_token: string;
  token_type: string;
}

// 仅用于前端显示的用户信息。
// 以后如果后端提供 /me，可以在这里扩展字段（真实角色、姓名等）。
interface UserInfo {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;

  role: UserRole;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;
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

  // 启动时：根据 token + 本地用户名 + 本地角色恢复状态
  useEffect(() => {
    const token = getAccessToken(); // 内部仍然用 WMS_TOKEN
    const savedUsername =
      typeof window !== "undefined"
        ? window.localStorage.getItem(USERNAME_STORAGE_KEY)
        : null;
    const savedRoleRaw =
      typeof window !== "undefined"
        ? window.localStorage.getItem(ROLE_STORAGE_KEY)
        : null;

    const validRoles: UserRole[] = ["staff", "admin"];

    if (token) {
      const effectiveRole: UserRole = validRoles.includes(
        savedRoleRaw as UserRole,
      )
        ? (savedRoleRaw as UserRole)
        : "staff";

      setIsAuthenticated(true);
      setRole(effectiveRole);

      if (savedUsername) {
        setUser({ username: savedUsername, role: effectiveRole });
      } else {
        setUser({ username: "unknown", role: effectiveRole });
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const login = async (input: LoginInput) => {
    const result = await apiPost<LoginResult>("/users/login", {
      username: input.username,
      password: input.password,
    });

    const token = result.access_token;

    setAccessToken(token);
    setIsAuthenticated(true);

    // 暂时沿用当前内存中的角色（默认为 staff），以后可以从 /me 覆盖
    const currentRole: UserRole = role || "staff";
    const u: UserInfo = { username: input.username, role: currentRole };
    setUser(u);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(USERNAME_STORAGE_KEY, input.username);
      window.localStorage.setItem(ROLE_STORAGE_KEY, currentRole);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USERNAME_STORAGE_KEY);
      window.localStorage.removeItem(ROLE_STORAGE_KEY);
    }
  };

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
