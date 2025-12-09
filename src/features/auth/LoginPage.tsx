// src/features/auth/LoginPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth/useAuth";

type BackendErrorDetailItem = {
  msg?: string;
};

type BackendErrorShape = {
  detail?: string | BackendErrorDetailItem[];
};

type ApiErrorShape = {
  message?: string;
  body?: BackendErrorShape;
};

const extractLoginErrorMessage = (err: unknown): string => {
  const e = err as ApiErrorShape | undefined;

  const detail = e?.body?.detail;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (typeof first?.msg === "string") {
      return first.msg;
    }
    try {
      return JSON.stringify(detail);
    } catch {
      return "登录失败，请检查用户名和密码。";
    }
  }

  if (e?.message) return String(e.message);

  return "登录失败，请检查用户名和密码。";
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setError("用户名和密码都不能为空。");
      return;
    }

    setSubmitting(true);
    try {
      await login({ username: u, password: p });
      navigate("/snapshot", { replace: true });
    } catch (err: unknown) {
      console.error("login failed:", err);
      const msg = extractLoginErrorMessage(err);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-center text-xl font-semibold text-slate-900">
          登录 WMS-DU
        </h1>
        <p className="text-center text-xs text-slate-500">
          请输入用户名和密码进入系统（当前已对接后端 /users/login）。
        </p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">用户名</label>
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">密码</label>
            <input
              type="password"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {submitting ? "登录中…" : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
