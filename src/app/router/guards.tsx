// src/app/router/guards.tsx
// =====================================================
// 路由守卫与兜底页面（硬防御版）
// - RequireAuth: 登录守卫
// - RequirePermission: 权限守卫（带自诊断兜底）
// =====================================================

import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../shared/useAuth";

/** 无权限页面（简单版） */
export const ForbiddenPage: React.FC = () => (
  <div className="p-6 text-center text-lg">
    <div className="mb-2 text-2xl font-semibold">无权限访问</div>
    <div className="text-slate-600">当前账号没有权限访问这个页面，如需开通请联系管理员。</div>
  </div>
);

export const AuthLoading: React.FC = () => (
  <div className="p-6 text-center text-base text-slate-600">正在恢复登录状态…</div>
);

export const RouteLoading: React.FC = () => (
  <div className="p-6 text-center text-base text-slate-600">页面加载中…</div>
);

/**
 * 永不崩的 value 描述器（严禁 String(obj)）
 */
function describeValue(v: unknown): string {
  try {
    if (v === null) return "null";
    if (v === undefined) return "undefined";
    if (typeof v === "string") return `string(${v})`;
    if (typeof v === "number") return `number(${v})`;
    if (typeof v === "boolean") return `boolean(${v})`;
    if (Array.isArray(v)) return `array(len=${v.length})`;
    if (typeof v === "object") return `object(${Object.prototype.toString.call(v)})`;
    return typeof v;
  } catch {
    return "[uninspectable]";
  }
}

function safeJson(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return "[unserializable]";
  }
}

function normalizePerms(permission: unknown): string[] {
  if (typeof permission === "string") return [permission];
  if (Array.isArray(permission)) return permission.filter((x) => typeof x === "string") as string[];
  return [];
}

/* 登录守卫 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { authReady, isAuthenticated } = useAuth();

  if (!authReady) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/* 通用权限守卫（硬防御版） */
export function RequirePermission({ permission, children }: { permission: unknown; children: ReactNode }) {
  const { authReady, isAuthenticated, can, permissions } = useAuth();

  if (!authReady) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ✅ 绝不相信外部入参，先 normalize
  const perms = normalizePerms(permission);

  try {
    // perms 为空视为无权限
    const ok =
      perms.length > 0 &&
      perms.some((p) => {
        // can(p) 也可能抛异常，必须兜底
        try {
          return can(p);
        } catch {
          return false;
        }
      });

    if (!ok) return <Navigate to="/forbidden" replace />;
    return <>{children}</>;
  } catch (err) {
    // ✅ 这里不能 console.error(String(err))，会再次触发 object-to-primitive
    // 直接显示自诊断面板，让你看到到底是谁在传“怪东西”
    return (
      <div className="p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="text-lg font-semibold text-red-700">RequirePermission 渲染异常（已拦截，不再炸全站）</div>

          <div className="mt-3 text-sm text-slate-700">
            permission 入参类型：<span className="font-mono">{describeValue(permission)}</span>
          </div>

          <div className="mt-1 text-sm text-slate-700">
            normalizePerms 结果：<span className="font-mono">{safeJson(perms)}</span>
          </div>

          <div className="mt-1 text-sm text-slate-700">
            当前 permissions（前 20 项）：<span className="font-mono">{safeJson((permissions ?? []).slice(0, 20))}</span>
          </div>

          <div className="mt-3 text-sm text-slate-700">捕获到的异常对象（安全序列化）：</div>
          <pre className="mt-2 max-h-[240px] overflow-auto rounded-xl border border-red-200 bg-white p-3 text-xs font-mono text-red-700">
            {safeJson(err)}
          </pre>

          <div className="mt-2 text-xs text-slate-600">这块信息发我，我就能把“怪 permission 从哪传进来”彻底钉死。</div>
        </div>
      </div>
    );
  }
}
