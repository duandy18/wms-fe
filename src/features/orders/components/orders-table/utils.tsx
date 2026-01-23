// src/features/orders/components/orders-table/utils.tsx

import React from "react";
import type {
  OrderWarehouseAvailabilityCell,
  OrderWarehouseAvailabilityLine,
  WarehouseBrief,
} from "../../api/types";

export function whLabel(id: number | null | undefined) {
  if (id == null) return "—";
  return `WH${id}`;
}

export function whOptionLabel(w: { id: number; code: string | null; name: string | null }) {
  const code = (w.code ?? "").trim();
  const name = (w.name ?? "").trim();
  if (code && name) return `${code} · ${name}`;
  if (code) return code;
  if (name) return name;
  return `#${w.id}`;
}

export function whBriefLabel(w: WarehouseBrief) {
  const name = (w.name ?? "").trim();
  const code = (w.code ?? "").trim();
  if (code && name) return `${code} · ${name}`;
  if (code) return code;
  if (name) return name;
  return `#${w.id}`;
}

export function lineLabel(ln: OrderWarehouseAvailabilityLine) {
  const t = (ln.title ?? "").trim();
  const sku = (ln.sku_id ?? "").trim();
  if (sku && t) return `${sku} · ${t}`;
  if (sku) return sku;
  if (t) return t;
  return `item_id=${ln.item_id}`;
}

export function scopeHint(scope: string) {
  const s = (scope || "").toUpperCase();
  if (s === "DEFAULT_SERVICE_EXECUTION") return "当前仅展示：服务仓 / 当前执行仓。";
  if (s === "EXPLICIT_WAREHOUSE_IDS") return "当前展示：候选仓对照（用于辅助决策）。";
  return `当前展示范围：${scope || "-"}`;
}

export function buildCellMap(matrix: OrderWarehouseAvailabilityCell[]) {
  const m = new Map<number, Map<number, OrderWarehouseAvailabilityCell>>();
  for (const c of matrix || []) {
    const wid = Number(c.warehouse_id);
    const iid = Number(c.item_id);
    if (!Number.isFinite(wid) || !Number.isFinite(iid)) continue;
    if (!m.has(wid)) m.set(wid, new Map());
    m.get(wid)!.set(iid, c);
  }
  return m;
}

export function isNeedManualAssign(r: { can_manual_assign_execution_warehouse?: boolean }) {
  return r.can_manual_assign_execution_warehouse === true;
}

export function assignModeBadge(modeRaw: string | null | undefined) {
  const mode = (modeRaw ?? "").toUpperCase();
  if (mode === "AUTO_FROM_SERVICE") {
    return (
      <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        AUTO
      </span>
    );
  }
  if (mode === "MANUAL") {
    return (
      <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
        手工
      </span>
    );
  }
  return null;
}
