// src/features/operations/inbound/return-receive/ReturnReceiveOrderRefListCard.tsx

import React from "react";
import { InboundUI } from "../ui";
import type { ReturnOrderRefItem } from "../../../return-tasks/api";

export const ReturnReceiveOrderRefListCard: React.FC<{
  items: ReturnOrderRefItem[];
  loading: boolean;
  error: string | null;
  selectedRef: string;
  onSelect: (orderRef: string) => void;
  onReload: () => void;
}> = ({ items, loading, error, selectedRef, onSelect, onReload }) => {
  return (
    <section className={`${InboundUI.card} ${InboundUI.cardPad} space-y-3`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={InboundUI.title}>退货订单</h2>
        <button type="button" className={InboundUI.btnGhost} onClick={onReload} disabled={loading}>
          {loading ? "刷新中…" : "刷新"}
        </button>
      </div>

      <div className={InboundUI.quiet}>从出库台账提取可退订单（显示“剩余可退”）。</div>

      {error ? <div className={InboundUI.danger}>{error}</div> : null}

      {items.length === 0 ? (
        <div className={InboundUI.quiet}>暂无可退订单（剩余可退为 0 的订单不会显示）。</div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => {
            const active = it.order_ref === selectedRef;
            return (
              <button
                key={it.order_ref}
                type="button"
                onClick={() => onSelect(it.order_ref)}
                className={
                  "w-full rounded-lg border px-3 py-2 text-left " +
                  (active
                    ? "border-sky-300 bg-sky-50"
                    : "border-slate-200 bg-white hover:bg-slate-50")
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono text-sm text-slate-900">{it.order_ref}</div>
                  <div className="text-[12px] text-slate-600">
                    {it.total_lines} 行 · 剩余可退 {it.remaining_qty} 件
                  </div>
                </div>
                <div className="text-[12px] text-slate-600">
                  仓库：{it.warehouse_id ?? "多仓/未知"} · 最近出库：{new Date(it.last_ship_at).toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
