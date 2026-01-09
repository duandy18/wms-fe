// src/features/operations/inbound/receive-task/PoReceivePlanTable.tsx

import React from "react";
import type { PlanRow } from "./usePoReceivePlan";

export function PoReceivePlanTable(props: {
  rows: PlanRow[];
  selected: Record<number, boolean>;
  qtyMap: Record<number, string>;
  onToggle: (id: number, checked: boolean, remain: number) => void;
  onQtyChange: (id: number, v: string) => void;
  validate: (v: string, remain: number) => string | null;
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
        const err = checked ? validate(v, r.remain) : null;

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
                  disabled={r.remain <= 0}
                  onChange={(e) => onToggle(r.poLineId, e.target.checked, r.remain)}
                />
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    {r.name}
                    {r.spec && <span className="ml-2 text-slate-600">· {r.spec}</span>}
                  </div>
                  <div className="text-sm text-slate-600">
                    剩余应收 {r.remain}（应收 {r.ordered} · 已收 {r.received}）
                  </div>
                </div>
              </label>

              <input
                className="w-28 rounded-md border border-slate-300 bg-white px-3 py-2 text-base"
                value={v}
                disabled={!checked}
                onChange={(e) => onQtyChange(r.poLineId, e.target.value)}
                placeholder={checked ? `≤${r.remain}` : "-"}
              />
            </div>

            {err && <div className="mt-2 text-sm text-rose-700">{err}</div>}
          </div>
        );
      })}
    </div>
  );
}
