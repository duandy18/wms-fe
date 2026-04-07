// src/shared/runtime/internal/session.ts
//
// 拆分说明：
// 本文件从 src/shared/runtime/provider.tsx 中拆出 session hydration 的拉取与组装逻辑，
// provider 只保留状态写入与生命周期编排，不再直接拼装 /users/me 与 navigation 结果。

import { apiGet } from "../../../lib/api";
import { normalizeNavigationResponse } from "../navigation";
import type {
  MeResponse,
  NavigationResponse,
  Permission,
  UserInfo,
  UserRole,
} from "../types";
import { extractErrorMessage } from "./errors";

export type HydratedSession = {
  role: UserRole;
  permissions: Permission[];
  user: UserInfo;
  navigation: NavigationResponse | null;
  navigationError: string | null;
};

export async function fetchHydratedSession(args: {
  usernameFallback: string;
}): Promise<HydratedSession> {
  const { usernameFallback } = args;

  const me = await apiGet<MeResponse>("/users/me");

  const backendRoles = me.roles?.map((r) => r.name) ?? [];
  const backendPerms = me.permissions ?? [];

  const role: UserRole = backendRoles.includes("admin")
    ? "admin"
    : "staff";

  const username = me.username ?? usernameFallback;

  const user: UserInfo = {
    username,
    role,
    roles: backendRoles,
    permissions: backendPerms,
  };

  try {
    const navRaw = await apiGet<NavigationResponse>("/users/me/navigation");
    const navigation = normalizeNavigationResponse(navRaw);

    return {
      role,
      permissions: backendPerms,
      user,
      navigation,
      navigationError: null,
    };
  } catch (err: unknown) {
    return {
      role,
      permissions: backendPerms,
      user,
      navigation: null,
      navigationError: extractErrorMessage(err, "导航加载失败"),
    };
  }
}
