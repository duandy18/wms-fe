// src/features/admin/stores/components/StoreFulfillmentStatusCard.tsx

import React, { useMemo } from "react";
import type { StoreBinding } from "../types";
import type { StoreRoutingHealth } from "../api";
import type { RouteMode } from "../types";

type Props = {
  routeMode?: RouteMode | null;
  bindings: StoreBinding[];
  defaultWarehouseId: number | null;

  routingHealth: StoreRoutingHealth | null;
  routingHealthLoading: boolean;
  routingHealthError: string | null;
  onReloadRoutingHealth: () => void;
};

type UiLevel = "OK" | "WARN" | "ERROR";

function normalizeHealthStatus(s: string | null | undefined): UiLevel {
  const v = (s ?? "").toUpperCase();
  if (v === "OK") return "OK";
  if (v === "WARN" || v === "WARNING") return "WARN";
  if (v === "ERROR") return "ERROR";
  return "WARN";
}

function badgeClass(level: UiLevel) {
  switch (level) {
    case "OK":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "WARN":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "ERROR":
      return "border-red-200 bg-red-50 text-red-800";
  }
}

function levelLabel(level: UiLevel) {
  switch (level) {
    case "OK":
      return "正常";
    case "WARN":
      return "有风险";
    case "ERROR":
      return "不可履约";
  }
}

export function StoreFulfillmentStatusCard(props: Props) {
  const {
    routeMode,
    bindings,
    defaultWarehouseId,
    routingHealth,
    routingHealthLoading,
    routingHealthError,
    onReloadRoutingHealth,
  } = props;

  const derived = useMemo(() => {
    const bindingsCount = bindings.length;
    const hasBindings = bindingsCount > 0;
    const hasDefault = defaultWarehouseId != null;

    const healthLevel: UiLevel = normalizeHealthStatus(routingHealth?.status);

    // 业务解释层：前置条件缺失时直接升级严重性（不靠字符串猜）
    let level: UiLevel = healthLevel;
    if (!hasBindings) level = "ERROR";
    else if (!hasDefault) level = routeMode === "FALLBACK" ? "WARN" : "ERROR";

    const facts: string[] = [];
    facts.push(`已绑定仓：${bindingsCount} 个`);
    facts.push(`默认仓：${hasDefault ? `WH#${defaultWarehouseId}` : "未设置"}`);
    facts.push(`路由模式：${routeMode ?? "未知"}`);

    const nextSteps: string[] = [];
    if (!hasBindings) nextSteps.push("先绑定至少一个仓库（否则无法路由，也无法设置默认仓）。");
    if (hasBindings && !hasDefault) nextSteps.push("设置默认仓（FALLBACK 的兜底仓 / TOP 仓）。");
    if (hasBindings) nextSteps.push("根据发货省份补齐省级分仓规则（STRICT_TOP 下缺规则会导致不可履约）。");

    const warnings = routingHealth?.warnings ?? [];
    const errors = routingHealth?.errors ?? [];

    return { level, facts, nextSteps, warnings, errors };
  }, [bindings, defaultWarehouseId, routeMode, routingHealth]);

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">履约状态</div>
          <div className="mt-1 text-sm text-slate-600">
            这张卡回答：这个店铺的订单能不能被系统“选仓并占货”（配置是否可履约）。
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(derived.level)}`}>
            {levelLabel(derived.level)}
          </span>
          <button
            type="button"
            className="rounded-md border px-3 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={onReloadRoutingHealth}
            disabled={routingHealthLoading}
            title="重新拉取路由健康检查"
          >
            {routingHealthLoading ? "刷新中…" : "刷新"}
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-md border bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-700">关键事实</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {derived.facts.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          {routingHealthError && <div className="mt-2 text-xs text-red-600">{routingHealthError}</div>}
        </div>

        <div className="rounded-md border bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-700">下一步怎么修</div>
          {derived.nextSteps.length === 0 ? (
            <div className="mt-2 text-sm text-slate-700">已满足关键前置条件。继续按健康检查提示优化即可。</div>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {derived.nextSteps.map((s, idx) => (
                <li key={`${s}-${idx}`}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(derived.errors.length > 0 || derived.warnings.length > 0) && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-red-100 bg-red-50 p-3">
            <div className="text-xs font-semibold text-red-700">健康检查：错误</div>
            {derived.errors.length === 0 ? (
              <div className="mt-2 text-sm text-red-700">无</div>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                {derived.errors.map((x, idx) => (
                  <li key={`${x}-${idx}`}>{x}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-md border border-amber-100 bg-amber-50 p-3">
            <div className="text-xs font-semibold text-amber-800">健康检查：提示</div>
            {derived.warnings.length === 0 ? (
              <div className="mt-2 text-sm text-amber-800">无</div>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                {derived.warnings.map((x, idx) => (
                  <li key={`${x}-${idx}`}>{x}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
