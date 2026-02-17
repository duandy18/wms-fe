// src/features/operations/inbound/receive-task/PoReceivePlanTable.tsx

import React from "react";
import type { PlanRow } from "./usePoReceivePlan";

export function PoReceivePlanTable(props: {
  rows: PlanRow[];
  selected: Record<number, boolean>;
  qtyMap: Record<number, string>;
  batchMap: Record<number, string>;
  prodMap: Record<number, string>;
  expMap: Record<number, string>;
  onToggle: (id: number, checked: boolean, remain_base: number) => void;
  onQtyChange: (id: number, v: string) => void;
  onBatchChange: (id: number, v: string) => void;
  onProdChange: (id: number, v: string) => void;
  onExpChange: (id: number, v: string) => void;
  validateQty: (v: string, remain_base: number) => string | null;
  validateMeta: (row: PlanRow) => { batch?: string; prod?: string; exp?: string } | null;
}) {
  const {
    rows,
    selected,
    qtyMap,
    batchMap,
    prodMap,
    expMap,
    onToggle,
    onQtyChange,
    onBatchChange,
    onProdChange,
    onExpChange,
    validateQty,
    validateMeta,
  } = props;

  if (rows.length === 0) {
    return <div className="text-sm text-slate-500">无可收货行。</div>;
  }

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const checked = !!selected[r.poLineId];
        const v = qtyMap[r.poLineId] ?? "";
        const errQty = checked ? validateQty(v, r.remain_base) : null;
        const errMeta = checked ? validateMeta(r) : null;

        const showMeta = checked && r.has_shelf_life;

        return (
          <div key={r.poLineId} className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 space-y-2">
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

                  <div className="text-sm text-slate-700">
                    剩余应收 <span className="font-mono">{r.remain_base}</span>{" "}
                    <span className="text-slate-600">{r.base_uom}</span>
                  </div>

                  <div className="text-[12px] text-slate-500">
                    （应收 {r.ordered_purchase} {r.purchase_uom} · 已收 {r.received_purchase} {r.purchase_uom} · 每
                    {r.purchase_uom}={r.units_per_case}
                    {r.base_uom}）
                  </div>

                  {r.has_shelf_life ? (
                    <div className="text-[12px] text-amber-700 mt-1">
                      保质期商品：创建任务时必须填写批次/生产日期（必要时到期日期）
                    </div>
                  ) : null}
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

            {showMeta ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">批次（必填）</label>
                  <input
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-mono"
                    value={batchMap[r.poLineId] ?? ""}
                    onChange={(e) => onBatchChange(r.poLineId, e.target.value)}
                    placeholder="例如：BATCH-20260216-A"
                  />
                  {errMeta?.batch ? <div className="text-[12px] text-rose-700">{errMeta.batch}</div> : null}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">生产日期（必填）</label>
                  <input
                    type="date"
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={prodMap[r.poLineId] ?? ""}
                    onChange={(e) => onProdChange(r.poLineId, e.target.value)}
                  />
                  {errMeta?.prod ? <div className="text-[12px] text-rose-700">{errMeta.prod}</div> : null}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-600">到期日期（必要时）</label>
                  <input
                    type="date"
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={expMap[r.poLineId] ?? ""}
                    onChange={(e) => onExpChange(r.poLineId, e.target.value)}
                  />
                  {errMeta?.exp ? <div className="text-[12px] text-rose-700">{errMeta.exp}</div> : null}
                </div>
              </div>
            ) : null}

            {errQty ? <div className="text-sm text-rose-700">{errQty}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
