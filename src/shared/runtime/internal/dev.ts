// src/shared/runtime/internal/dev.ts
//
// 拆分说明：
// 本文件从 src/shared/runtime/provider.tsx 中拆出 DEV / HMR 强制登出逻辑，
// 避免 provider 模块顶部混放开发期副作用细节。

import { setAccessToken } from "../../../lib/api";
import {
  ROLE_STORAGE_KEY,
  USERNAME_STORAGE_KEY,
  safeRemoveLS,
} from "./storage";

export function devForceLogout(reason: string) {
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
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem("WMS_DEV_FORCE_LOGOUT_REASON", reason);
  } catch {
    // ignore
  }
}

export function setupDevHmrForceLogout() {
  try {
    const isDev = !!import.meta.env.DEV;

    const meta = import.meta as unknown as {
      hot?: { dispose?: (cb: () => void) => void };
    };
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
}
