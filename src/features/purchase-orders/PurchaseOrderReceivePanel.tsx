// src/features/purchase-orders/PurchaseOrderReceivePanel.tsx

import React from "react";
import type { PurchaseOrderDetail, PurchaseOrderDetailLine } from "./api";

interface PurchaseOrderReceivePanelProps {
  po: PurchaseOrderDetail;
  selectedLine: PurchaseOrderDetailLine | null;
  selectedLineId: number | null;
  receiveQty: string;
  receiving: boolean;
  remainingOfSelected: number | null;
  receiveError: string | null;
  onChangeSelectedLineId: (lineId: number | null) => void;
  onChangeReceiveQty: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PurchaseOrderReceivePanel: React.FC<
  PurchaseOrderReceivePanelProps
> = ({
  po,
  selectedLine,
  selectedLineId,
  receiveQty,
  receiving,
  remainingOfSelected,
  receiveError,
  onChangeSelectedLineId,
  onChangeReceiveQty,
  onSubmit,
}) => {
  return (
    <section className="bg-white border border-emerald-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-emerald-800">
          行级收货
        </h2>
        {receiveError && (
          <div className="text-xs text-red-600">{receiveError}</div>
        )}
      </div>

      {po.status === "RECEIVED" || po.status === "CLOSED" ? (
        <div className="text-xs text-slate-600">
          该采购单已整体收完（状态：{po.status}），不能继续收货。
        </div>
      ) : po.lines.length === 0 ? (
        <div className="text-xs text-slate-600">
          当前采购单没有行数据。
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="flex flex-wrap items-end gap-3 text-sm"
        >
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">
              选择收货行
            </label>
            <select
              className="mt-1 w-40 rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={selectedLineId ?? ""}
              onChange={(e) =>
                onChangeSelectedLineId(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
            >
              {po.lines.map((line) => {
                const remaining =
                  line.qty_ordered - line.qty_received;
                return (
                  <option key={line.id} value={line.id}>
                    行 {line.line_no} · item {line.item_id} · 剩余{" "}
                    {remaining}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500">
              本次收货数量
            </label>
            <input
              className="mt-1 w-32 rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={receiveQty}
              onChange={(e) => onChangeReceiveQty(e.target.value)}
              placeholder="数量"
            />
            {remainingOfSelected != null && (
              <span className="mt-1 text-[11px] text-slate-500">
                当前行剩余：{remainingOfSelected}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={receiving || !selectedLine}
            className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm disabled:opacity-60"
          >
            {receiving ? "收货中…" : "执行行级收货"}
          </button>
        </form>
      )}
    </section>
  );
};
