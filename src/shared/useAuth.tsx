// src/shared/useAuth.tsx
/* eslint-disable react-refresh/only-export-components */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { apiPost, setAccessToken, getAccessToken } from "../lib/api";

interface LoginInput {
  username: string;
  password: string;
}

interface LoginResult {
  access_token: string;
  token_type: string;
}

// 仅用于前端显示的用户信息，目前只存用户名。
// 以后如果后端提供 /me，可以在这里扩展字段。
interface UserInfo {
  username: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 用户名单独一个 key，不动 token 那套（WMS_TOKEN 仍由 lib/api 管）
const USERNAME_STORAGE_KEY = "WMS_USERNAME";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  // 启动时：根据 token + 本地用户名恢复状态
  useEffect(() => {
    const token = getAccessToken(); // 内部仍然用 WMS_TOKEN
    const savedUsername =
      typeof window !== "undefined"
        ? window.localStorage.getItem(USERNAME_STORAGE_KEY)
        : null;

    if (token) {
      setIsAuthenticated(true);
      if (savedUsername) {
        setUser({ username: savedUsername });
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

    const u: UserInfo = { username: input.username };
    setUser(u);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USERNAME_STORAGE_KEY, input.username);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USERNAME_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
