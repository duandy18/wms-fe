// src/shared/runtime/provider.tsx
/* eslint-disable react-refresh/only-export-components */
//
// 拆分说明：
// 本文件已将 storage / errors / dev-HMR / session hydration 细节下沉到
// src/shared/runtime/internal/*，当前文件只保留 runtime state、生命周期编排、
// login/logout、context value 组装等 provider 真身职责。

import React, {
  createContext,
  useCallback,
  useState,
} from "react";
import { apiPost, getAccessToken, setAccessToken } from "../../lib/api";
import { setupDevHmrForceLogout } from "./internal/dev";
import { isNotAuthenticatedError } from "./internal/errors";
import { fetchHydratedSession } from "./internal/session";
import {
  ROLE_STORAGE_KEY,
  USERNAME_STORAGE_KEY,
  normalizeRole,
  safeGetLS,
  safeRemoveLS,
  safeSetLS,
} from "./internal/storage";
import { can as canPermission, canAll, canAny } from "./permissions";
import type {
  AuthContextType,
  LoginInput,
  LoginResult,
  NavigationPage,
  NavigationResponse,
  NavigationRoutePrefix,
  Permission,
  UserInfo,
  UserRole,
} from "./types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

setupDevHmrForceLogout();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authReady, setAuthReady] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const [role, setRole] = useState<UserRole>(
    normalizeRole(safeGetLS(ROLE_STORAGE_KEY)),
  );
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [navigation, setNavigation] = useState<NavigationResponse | null>(null);
  const [pages, setPages] = useState<NavigationPage[]>([]);
  const [routePrefixes, setRoutePrefixes] = useState<NavigationRoutePrefix[]>(
    [],
  );
  const [navigationError, setNavigationError] = useState<string | null>(null);

  const clearNavigationState = useCallback(() => {
    setNavigation(null);
    setPages([]);
    setRoutePrefixes([]);
    setNavigationError(null);
  }, []);

  const applyNavigationState = useCallback((next: NavigationResponse | null) => {
    setNavigation(next);
    setPages(next?.pages ?? []);
    setRoutePrefixes(next?.route_prefixes ?? []);
  }, []);

  const hardLogout = useCallback(() => {
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setPermissions([]);
    setRole("staff");
    clearNavigationState();
    safeRemoveLS(USERNAME_STORAGE_KEY);
    safeRemoveLS(ROLE_STORAGE_KEY);
  }, [clearNavigationState]);

  const hydrateSession = useCallback(
    async (args: {
      usernameFallback: string;
    }) => {
      const hydrated = await fetchHydratedSession(args);

      setRole(hydrated.role);
      setPermissions(hydrated.permissions);
      setUser(hydrated.user);

      safeSetLS(USERNAME_STORAGE_KEY, hydrated.user.username);
      safeSetLS(ROLE_STORAGE_KEY, hydrated.role);

      setIsAuthenticated(true);

      if (hydrated.navigation) {
        applyNavigationState(hydrated.navigation);
      } else {
        clearNavigationState();
      }

      setNavigationError(hydrated.navigationError);
    },
    [applyNavigationState, clearNavigationState],
  );

  React.useEffect(() => {
    const isDev = !!import.meta.env.DEV;

    if (isDev) {
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
    setAuthReady(false);

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
    clearNavigationState();

    (async () => {
      try {
        await hydrateSession({
          usernameFallback: username0,
        });
      } catch (err: unknown) {
        if (isNotAuthenticatedError(err)) {
          hardLogout();
        }
      } finally {
        setAuthReady(true);
      }
    })();
  }, [clearNavigationState, hardLogout, hydrateSession]);

  const login = async (input: LoginInput) => {
    const result = await apiPost<LoginResult>("/users/login", {
      username: input.username,
      password: input.password,
    });

    const token = result.access_token;
    setAccessToken(token);

    setIsAuthenticated(false);
    setAuthReady(false);
    clearNavigationState();

    try {
      await hydrateSession({
        usernameFallback: input.username,
      });

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

  const can = (perm: Permission) => canPermission(permissions, perm);
  const canAnyFn = (perms: Permission[]) => canAny(permissions, perms);
  const canAllFn = (perms: Permission[]) => canAll(permissions, perms);
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
        canAny: canAnyFn,
        canAll: canAllFn,
        navigation,
        pages,
        routePrefixes,
        navigationError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
