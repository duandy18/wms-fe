// src/shared/runtime/index.ts

export { AuthProvider } from "./provider";
export {
  useSessionRuntime,
  usePermissionRuntime,
  useNavigationRuntime,
} from "./hooks";

export {
  can,
  canAny,
  canAll,
} from "./permissions";

export {
  normalizePath,
  splitPath,
  isStaticRoutePrefix,
  normalizeNavigationPage,
  normalizeNavigationRoutePrefix,
  normalizeNavigationResponse,
  buildPageIndex,
  resolvePageByPath,
  buildPrimaryPathByPageCode,
  canViewPage,
} from "./navigation";

export type {
  UserRole,
  Permission,
  LoginInput,
  LoginResult,
  MeResponse,
  NavigationPage,
  NavigationRoutePrefix,
  NavigationResponse,
  UserInfo,
  AuthContextType,
} from "./types";

export type {
  PageIndex,
  ResolvedPage,
} from "./navigation";
