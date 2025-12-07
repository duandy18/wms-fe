// src/features/auth/LoginPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth/useAuth";

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
      // ✅ 正确调用：传入 LoginInput 对象，而不是两个参数
      await login({ username: u, password: p });
      navigate("/snapshot", { replace: true });
    } catch (err: any) {
      console.error("login failed:", err);

      // 尝试更友好地解析后端错误信息
      let msg: string = "登录失败，请检查用户名和密码。";

      const detail = err?.body?.detail;
      if (typeof detail === "string") {
        msg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        // FastAPI 422 风格：[{loc, msg, type}, ...]
        const first = detail[0];
        if (typeof first?.msg === "string") {
          msg = first.msg;
        } else {
          msg = JSON.stringify(detail);
        }
      } else if (err?.message) {
        msg = String(err.message);
      }

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold text-slate-900 text-center">
          登录 WMS-DU
        </h1>
        <p className="text-xs text-slate-500 text-center">
          请输入用户名和密码进入系统（当前已对接后端 /users/login）。
        </p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">用户名</label>
            <input
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">密码</label>
            <input
              type="password"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-60"
          >
            {submitting ? "登录中…" : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
