// src/features/auth/LoginPage.tsx
//
// 登录页（现代企业风 · 放大 2x 版）
// - 左侧大面积品牌区（宽度/高度/文字/插图全部扩大）
// - 右侧大号表单卡片（字体/按钮/输入框扩大）
// - 全局气质：阿里云 / 京东物流系统登录页风格

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth/useAuth";

type ApiErrorShape = {
  message?: string;
  body?: { detail?: string };
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 环境标签
  const envRaw =
    import.meta.env.VITE_WMS_ENV || import.meta.env.MODE || "dev";

  const envLabel = (() => {
    const val = String(envRaw).toLowerCase();
    if (val.includes("prod")) return "生产环境";
    if (val.includes("pilot") || val.includes("pre") || val.includes("trial"))
      return "中试环境";
    if (val.includes("test")) return "测试环境";
    return "开发环境";
  })();

  const envBadgeClass = (() => {
    switch (envLabel) {
      case "生产环境":
        return "bg-emerald-200 text-emerald-800 border-emerald-300";
      case "中试环境":
        return "bg-amber-200 text-amber-800 border-amber-300";
      case "测试环境":
        return "bg-sky-200 text-sky-800 border-sky-300";
      default:
        return "bg-slate-200 text-slate-700 border-slate-300";
    }
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("请输入用户名和密码");
      return;
    }

    setSubmitting(true);
    try {
      await login({ username: username.trim(), password });
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
      const msg =
        e?.body?.detail ||
        e?.message ||
        "登录失败，请检查用户名或密码是否正确。";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-[1600px] rounded-3xl bg-white shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* =========== 左侧品牌区 · 超大号版 =========== */}
        <div className="relative flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800 text-slate-50 px-24 py-24 min-h-[900px]">

          {/* 小标签 */}
          <div className="flex items-center gap-3 mb-20">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-5 py-2 text-sm font-medium text-emerald-300 border border-emerald-400/40">
              <span className="w-3 h-3 rounded-full bg-emerald-300" />
              实时仓储链路 · 可解释 Golden Flow
            </span>
          </div>

          {/* 系统标题 */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              WMS-DU 仓储作业系统
            </h1>

            <p className="text-xl text-slate-200 max-w-2xl leading-relaxed">
              一体化 Golden Flow 履约引擎 · 作业驾驶舱 Cockpit · 全链路诊断工具
              Diagnostics Studio，为仓储运营提供可回放、可审计、可解释的端到端能力。
            </p>
          </div>

          {/* 插画（放大 2X） */}
          <div className="mt-24 flex-1 flex items-center">
            <div className="w-full max-w-2xl">
              <div className="relative h-96 rounded-3xl bg-slate-900/60 border border-slate-700/60 overflow-hidden shadow-2xl">

                {/* 背景网格 */}
                <div className="absolute inset-0 opacity-40">
                  <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#1e293b_1px,transparent_0)] [background-size:22px_22px]" />
                </div>

                {/* 三模块：Stocks / Batches / Ledger */}
                <div className="relative h-full px-10 py-10 flex flex-col justify-between">

                  <div className="flex justify-between gap-6">
                    <div className="flex-1 h-24 rounded-xl border border-slate-600/70 bg-slate-900/60 shadow-inner flex items-center justify-center text-lg text-slate-300">
                      入库 / 盘点
                    </div>
                    <div className="flex-1 h-24 rounded-xl border border-slate-600/70 bg-slate-900/50 shadow-inner flex items-center justify-center text-lg text-slate-300">
                      拣货 / 发货
                    </div>
                  </div>

                  <div className="flex items-center justify-between my-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-emerald-400/20 via-emerald-400/80 to-sky-400/60" />
                    <span className="px-4 text-sm text-emerald-300 font-mono tracking-wide">
                      trace_id
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-emerald-400/20 via-emerald-400/80 to-sky-400/60" />
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="h-28 rounded-xl border border-slate-600/70 bg-slate-900/70 flex flex-col justify-center px-4">
                      <span className="text-sm text-slate-400">
                        Stocks
                      </span>
                      <span className="text-lg text-slate-100 font-semibold">
                        实时库存
                      </span>
                    </div>

                    <div className="h-28 rounded-xl border border-slate-600/70 bg-slate-900/70 flex flex-col justify-center px-4">
                      <span className="text-sm text-slate-400">
                        Batches
                      </span>
                      <span className="text-lg text-slate-100 font-semibold">
                        FEFO 批次
                      </span>
                    </div>

                    <div className="h-28 rounded-xl border border-slate-600/70 bg-slate-900/70 flex flex-col justify-center px-4">
                      <span className="text-sm text-slate-400">
                        Ledger
                      </span>
                      <span className="text-lg text-slate-100 font-semibold">
                        台账事件
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 版权 */}
          <div className="pt-8 text-base text-slate-300 border-t border-slate-800/70 mt-12">
            本系统版权归北京安快泰科技有限公司所有
          </div>
        </div>

        {/* =========== 右侧登录卡片 · 大号版 =========== */}
        <div className="flex flex-col justify-center px-16 py-20 bg-slate-50">

          <div className="flex justify-end mb-10">
            <span
              className={[
                "inline-flex items-center rounded-full border px-5 py-1.5 text-base font-medium",
                envBadgeClass,
              ].join(" ")}
            >
              {envLabel}
            </span>
          </div>

          <div className="max-w-md mx-auto w-full space-y-10">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-semibold text-slate-900">
                登录 WMS-DU
              </h2>
              <p className="text-base text-slate-500">
                请输入用户名与密码登录系统，所有操作将记录至审计日志。
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-base text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>

              <div className="space-y-2">
                <label className="block text-base text-slate-600">
                  用户名
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="请输入用户名"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-base text-slate-600">
                  密码
                </label>
                <div className="flex items-center rounded-lg border border-slate-300 bg-white px-4 py-3 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500">
                  <input
                    className="flex-1 bg-transparent text-lg outline-none"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    className="ml-4 text-slate-400 hover:text-slate-600 text-2xl"
                    onClick={() => setShowPassword((v) => !v)}
                    title={showPassword ? "隐藏密码" : "显示密码"}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-xl bg-sky-600 py-3 text-lg font-semibold text-white shadow-xl hover:bg-sky-700 disabled:opacity-60"
              >
                {submitting ? "登录中…" : "登录"}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
