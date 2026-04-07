// src/shared/runtime/types.ts

export type UserRole = "staff" | "admin";
export type Permission = string;

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResult {
  access_token: string;
  token_type: string;
}

export interface MeResponse {
  id: number;
  username: string;
  roles?: { id: number; name: string }[];
  permissions?: string[];
}

export type NavigationPage = {
  code: string;
  name: string;
  parent_code: string | null;
  level: number;
  domain_code: string | null;
  show_in_topbar: boolean;
  show_in_sidebar: boolean;
  sort_order: number;
  is_active: boolean;
  inherit_permissions: boolean;
  effective_read_permission: string | null;
  effective_write_permission: string | null;
  children: NavigationPage[];
};

export type NavigationRoutePrefix = {
  route_prefix: string;
  page_code: string;
  sort_order: number;
  is_active: boolean;
  effective_read_permission: string | null;
  effective_write_permission: string | null;
};

export type NavigationResponse = {
  pages: NavigationPage[];
  route_prefixes: NavigationRoutePrefix[];
};

export interface UserInfo {
  username: string;
  role: UserRole;
  roles: string[];
  permissions: Permission[];
}

export interface AuthContextType {
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

  navigation: NavigationResponse | null;
  pages: NavigationPage[];
  routePrefixes: NavigationRoutePrefix[];
  navigationError: string | null;
}
