// src/features/operations/inbound/receive-task/PoReceivePlanTable.tsx

import React from "react";
import type { PlanRow } from "./usePoReceivePlan";

export function PoReceivePlanTable(props: {
  rows: PlanRow[];
  selected: Record<number, boolean>;
  qtyMap: Record<number, string>;
  onToggle: (id: number, checked: boolean, remain_base: number) => void;
  onQtyChange: (id: number, v: string) => void;
  validate: (v: string, remain_base: number) => string | null;
}) {
  const { rows, selected, qtyMap, onToggle, onQtyChange, validate } = props;

  if (rows.length === 0) {
    return <div className="text-sm text-slate-500">无可收货行。</div>;
  }

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const checked = !!selected[r.poLineId];
        const v = qtyMap[r.poLineId] ?? "";
        const err = checked ? validate(v, r.remain_base) : null;

        return (
          <div
            key={r.poLineId}
            className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={r.remain_base <= 0}
                  onChange={(e) => onToggle(r.poLineId, e.target.checked, r.remain_base)}
                />
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    {r.name}
                    {r.spec && <span className="ml-2 text-slate-600">· {r.spec}</span>}
                  </div>

                  {/* ✅ 主口径：最小单位 */}
                  <div className="text-sm text-slate-700">
                    剩余应收{" "}
                    <span className="font-mono">{r.remain_base}</span>{" "}
                    <span className="text-slate-600">{r.base_uom}</span>
                  </div>

                  {/* ✅ 辅助口径：采购单位解释 */}
                  <div className="text-[12px] text-slate-500">
                    （应收 {r.ordered_purchase} {r.purchase_uom} · 已收 {r.received_purchase} {r.purchase_uom} · 每{r.purchase_uom}={r.units_per_case}{r.base_uom}）
                  </div>
                </div>
              </label>

              <input
                className="w-28 rounded-md border border-slate-300 bg-white px-3 py-2 text-base"
                value={v}
                disabled={!checked}
                onChange={(e) => onQtyChange(r.poLineId, e.target.value)}
                placeholder={checked ? `≤${r.remain_base}` : "-"}
              />
            </div>

            {err && <div className="mt-2 text-sm text-rose-700">{err}</div>}
          </div>
        );
      })}
    </div>
  );
}
