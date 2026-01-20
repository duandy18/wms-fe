// src/features/admin/stores/components/StoreFulfillmentStatusCard.tsx

import React, { useMemo } from "react";
import type { StoreBinding, RouteMode } from "../types";
import type { StoreRoutingHealth } from "../api";

type Props = {
  // Phase 1：商铺页不展示任何策略/模式含义，但为避免调用方改动，保留入参
  routeMode?: RouteMode | null;

  // 绑定事实（允许展示）
  bindings: StoreBinding[];

  // Phase 1：不展示“默认仓”概念，但为避免调用方改动，保留入参
  defaultWarehouseId: number | null;

  // 只读的健康检查结果（用作 BLOCKED/提示原因的来源）
  routingHealth: StoreRoutingHealth | null;
  routingHealthLoading: boolean;
  routingHealthError: string | null;
  onReloadRoutingHealth: () => void;
};

type FulfillmentFactStatus = "READY" | "BLOCKED";

type UiLevel = "OK" | "WARN" | "ERROR";

function normalizeHealthStatus(s: string | null | undefined): UiLevel {
  const v = (s ?? "").toUpperCase();
  if (v === "OK") return "OK";
  if (v === "WARN" || v === "WARNING") return "WARN";
  if (v === "ERROR") return "ERROR";
  return "WARN";
}

function badgeClass(status: FulfillmentFactStatus, hasWarnings: boolean) {
  if (status === "BLOCKED") return "border-red-200 bg-red-50 text-red-800";
  if (hasWarnings) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function statusLabel(status: FulfillmentFactStatus, hasWarnings: boolean) {
  if (status === "BLOCKED") return "已阻断";
  if (hasWarnings) return "可履约（有提示）";
  return "可履约";
}

export function StoreFulfillmentStatusCard(props: Props) {
  const { bindings, routingHealth, routingHealthLoading, routingHealthError, onReloadRoutingHealth } =
    props;

  const derived = useMemo(() => {
    const bindingsCount = bindings.length;
    const hasBindings = bindingsCount > 0;

    const healthLevel: UiLevel = normalizeHealthStatus(routingHealth?.status);
    const warnings = routingHealth?.warnings ?? [];
    const errors = routingHealth?.errors ?? [];

    // Phase 1 事实口径（不讲策略，不输出模式）：
    // - 没绑定仓库 => 必然 BLOCKED
    // - 健康检查 ERROR 或存在 errors => BLOCKED（只读原因）
    // - 其余 => READY（warnings 作为“提示”展示）
    let status: FulfillmentFactStatus = "READY";
    const blockedReasons: string[] = [];

    if (!hasBindings) {
      status = "BLOCKED";
      blockedReasons.push("未绑定可服务仓库");
    }

    if (errors.length > 0 || healthLevel === "ERROR") {
      status = "BLOCKED";
      errors.forEach((x) => blockedReasons.push(x));
      if (errors.length === 0 && healthLevel === "ERROR") {
        blockedReasons.push("健康检查返回不可用状态");
      }
    }

    const hintMessages: string[] = [];
    if (status === "READY") {
      warnings.forEach((x) => hintMessages.push(x));
      if (healthLevel === "WARN" && warnings.length === 0) {
        hintMessages.push("健康检查返回提示状态");
      }
    }

    const facts: string[] = [];
    facts.push(`已绑定仓库：${bindingsCount} 个`);

    return {
      status,
      facts,
      blockedReasons,
      hintMessages,
      hasWarnings: status === "READY" && hintMessages.length > 0,
    };
  }, [bindings, routingHealth]);

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">履约状态（只读）</div>
          <div className="mt-1 text-sm text-slate-600">
            仅展示当前“是否可履约”的事实结果：可履约 / 已阻断；原因只读，不在此处修正。
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
              derived.status,
              derived.hasWarnings,
            )}`}
          >
            {statusLabel(derived.status, derived.hasWarnings)}
          </span>
          <button
            type="button"
            className="rounded-md border px-3 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={onReloadRoutingHealth}
            disabled={routingHealthLoading}
            title="重新拉取状态"
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
          <div className="text-xs font-semibold text-slate-700">
            {derived.status === "BLOCKED" ? "阻断原因" : "提示"}
          </div>

          {derived.status === "BLOCKED" ? (
            derived.blockedReasons.length === 0 ? (
              <div className="mt-2 text-sm text-slate-700">未提供具体原因。</div>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {derived.blockedReasons.map((s, idx) => (
                  <li key={`${s}-${idx}`}>{s}</li>
                ))}
              </ul>
            )
          ) : derived.hintMessages.length === 0 ? (
            <div className="mt-2 text-sm text-slate-700">无</div>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {derived.hintMessages.map((s, idx) => (
                <li key={`${s}-${idx}`}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
