// src/features/admin/stores/StoreRoutingHealthCard.tsx
import React, { useMemo } from "react";
import type { StoreRoutingHealth } from "./api";

type UiLevel = "OK" | "WARN" | "ERROR";

function normalizeStatus(s: string | null | undefined): UiLevel {
  const v = (s ?? "").toUpperCase();
  if (v === "OK") return "OK";
  if (v === "WARN" || v === "WARNING") return "WARN";
  if (v === "ERROR") return "ERROR";
  return "WARN";
}

function statusLabel(level: UiLevel) {
  switch (level) {
    case "OK":
      return "正常";
    case "WARN":
      return "有风险";
    case "ERROR":
      return "不可履约";
  }
}

function statusColor(level: UiLevel) {
  switch (level) {
    case "OK":
      return "text-emerald-700";
    case "WARN":
      return "text-amber-700";
    case "ERROR":
      return "text-rose-700";
  }
}

function pillClass(level: UiLevel) {
  switch (level) {
    case "OK":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "WARN":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "ERROR":
      return "border-rose-200 bg-rose-50 text-rose-800";
  }
}

export const StoreRoutingHealthCard: React.FC<{
  data: StoreRoutingHealth | null;
  loading: boolean;
  err: string | null;
  onReload: () => void;
  routeMode?: "STRICT_TOP" | "FALLBACK" | string | null;
}> = ({ data, loading, err, onReload, routeMode }) => {
  const derived = useMemo(() => {
    const level: UiLevel = normalizeStatus(data?.status);
    const statusText = data?.status ?? "-";
    return { level, statusText };
  }, [data]);

  return (
    <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-base font-semibold text-slate-900">分仓规则健康检查</div>
          <div className="mt-1 text-sm text-slate-600">
            展示后端健康检查结果（错误/提示）。修复动作请优先参考“履约状态”与配置区。
          </div>
        </div>

        <button
          type="button"
          onClick={onReload}
          disabled={loading}
          className="text-[11px] px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? "刷新中…" : "刷新"}
        </button>
      </div>

      {err ? <div className="text-xs text-red-600">{err}</div> : null}

      {!data ? (
        <div className="text-xs text-slate-500">{loading ? "加载中…" : "暂无数据"}</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div>
              状态：
              <span className={`font-semibold ${statusColor(derived.level)} ml-1`}>
                {derived.statusText}
              </span>
            </div>

            <span className={`rounded-full border px-2 py-[2px] text-xs font-semibold ${pillClass(derived.level)}`}>
              {statusLabel(derived.level)}
            </span>

            {routeMode ? (
              <span className="rounded-full border px-2 py-[2px] text-xs text-slate-700">
                路由模式：{routeMode}
              </span>
            ) : null}
          </div>

          <div className="text-[12px] text-slate-700">
            绑定仓：<span className="font-mono">{data.bindings_count}</span> · 默认仓：
            <span className="font-mono"> {data.default_count}</span> · 省级规则：
            <span className="font-mono"> {data.routes_count}</span>
          </div>

          {data.errors?.length ? (
            <div className="rounded border border-rose-100 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
              <div className="font-semibold">错误</div>
              <ul className="mt-1 list-disc pl-4 space-y-1">
                {data.errors.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {data.warnings?.length ? (
            <div className="rounded border border-amber-100 bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
              <div className="font-semibold">提示</div>
              <ul className="mt-1 list-disc pl-4 space-y-1">
                {data.warnings.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
};
