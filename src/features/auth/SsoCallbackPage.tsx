import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { setAccessToken } from "../../lib/api";
import { exchangeWmsSsoAuthorizationCode } from "./ssoCallbackApi";

type CallbackStatus = "loading" | "exchanging" | "failed";

function normalizeAppBasePath(value: string | undefined): string {
  const raw = String(value ?? "/").trim();

  if (!raw || raw === "/") {
    return "";
  }

  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

function normalizeRedirectPath(value: string | null | undefined): string {
  const path = String(value ?? "/").trim();

  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return "/inventory";
  }

  if (path.startsWith("/sso/callback")) {
    return "/inventory";
  }

  return path;
}

function toBrowserUrl(routePath: string): string {
  const appBase = normalizeAppBasePath(import.meta.env.VITE_APP_BASE_PATH);
  const normalizedRoute = normalizeRedirectPath(routePath);

  if (!appBase) {
    return normalizedRoute;
  }

  if (normalizedRoute === "/") {
    return appBase || "/";
  }

  return `${appBase}${normalizedRoute}`;
}

function describeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  return "SSO 登录失败，请返回 ERP「我的应用」重新进入 WMS。";
}

const SsoCallbackPage: React.FC = () => {
  const [params] = useSearchParams();
  const startedRef = useRef(false);

  const code = useMemo(() => params.get("code")?.trim() ?? "", [params]);
  const state = useMemo(() => params.get("state")?.trim() ?? "", [params]);

  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("正在处理 ERP 单点登录…");

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!code || !state) {
      setStatus("failed");
      setMessage("SSO 回调参数缺失：code 或 state 为空。");
      return;
    }

    let cancelled = false;

    async function run() {
      setStatus("exchanging");
      setMessage("正在换取 WMS 本地登录态…");

      try {
        const result = await exchangeWmsSsoAuthorizationCode({ code, state });

        if (cancelled) return;

        const token = String(result.access_token ?? "").trim();
        if (!token) {
          throw new Error("WMS API 未返回 access_token。");
        }

        setAccessToken(token);

        const target = toBrowserUrl(result.redirect_path || "/");
        window.location.replace(target);
      } catch (error) {
        if (cancelled) return;

        setAccessToken(null);
        setStatus("failed");
        setMessage(describeError(error));
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [code, state]);

  const isFailed = status === "failed";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6">
          <div className="text-sm font-medium text-slate-500">ERP SSO</div>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            正在进入 WMS
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {message}
          </p>
        </div>

        {!isFailed ? (
          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4 text-base text-sky-800">
            请稍候，系统正在校验一次性授权码并生成 WMS 本地 token。
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-700">
              {message}
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/"
                className="rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white hover:bg-slate-800"
              >
                返回 ERP 我的应用
              </a>
              <Link
                to="/login"
                className="rounded-xl border border-slate-300 px-5 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                使用 WMS 本地登录
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SsoCallbackPage;
