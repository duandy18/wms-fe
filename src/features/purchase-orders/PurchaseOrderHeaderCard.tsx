// src/features/purchase-orders/PurchaseOrderHeaderCard.tsx

import React from "react";
import type { PurchaseOrderWithLines } from "./api";

interface PurchaseOrderHeaderCardProps {
  po: PurchaseOrderWithLines;
  poRef: string;
  totalQtyOrdered: number;
  totalQtyReceived: number;
}

const formatTs = (ts: string | null) =>
  ts ? ts.replace("T", " ").replace("Z", "") : "-";

const formatMoney = (v: string | null) =>
  v == null ? "-" : v;

export const PurchaseOrderHeaderCard: React.FC<PurchaseOrderHeaderCardProps> = ({
  po,
  poRef,
  totalQtyOrdered,
  totalQtyReceived,
}) => {
  const remainingHead = totalQtyOrdered - totalQtyReceived;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          基本信息
        </h2>
        <span className="text-xs text-slate-500">
          创建时间： {formatTs(po.created_at)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-2 text-sm text-slate-700">
        <div>
          <span className="text-xs text-slate-500">采购单 ID</span>
          <div className="font-mono text-[13px]">
            {po.id} ({poRef})
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500">供应商</span>
          <div>{po.supplier_name ?? po.supplier}</div>
        </div>

        <div>
          <span className="text-xs text-slate-500">状态</span>
          <div>{po.status}</div>
        </div>

        <div>
          <span className="text-xs text-slate-500">仓库 ID</span>
          <div>{po.warehouse_id}</div>
        </div>

        <div>
          <span className="text-xs text-slate-500">采购人</span>
          <div>{po.purchaser}</div>
        </div>

        <div>
          <span className="text-xs text-slate-500">采购时间</span>
          <div>{formatTs(po.purchase_time)}</div>
        </div>

        <div>
          <span className="text-xs text-slate-500">
            汇总数量（已收 / 订购）
          </span>
          <div>
            {totalQtyReceived} / {totalQtyOrdered}
            {remainingHead > 0 && (
              <span className="ml-2 text-xs text-amber-700">
                （剩余 {remainingHead}）
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500">
            汇总金额（total_amount）
          </span>
          <div>{formatMoney(po.total_amount)}</div>
        </div>

        <div>
          <span className="text-xs text-slate-500">最后收货</span>
          <div>{formatTs(po.last_received_at)}</div>
        </div>

        <div>
          <span className="text-xs text-slate-500">关闭时间</span>
          <div>{formatTs(po.closed_at)}</div>
        </div>
      </div>
    </section>
  );
};
