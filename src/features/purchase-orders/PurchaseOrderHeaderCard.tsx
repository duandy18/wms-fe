// src/features/purchase-orders/PurchaseOrderHeaderCard.tsx

import React from "react";
import type { PurchaseOrderDetail } from "./api";

interface PurchaseOrderHeaderCardProps {
  po: PurchaseOrderDetail;
  poRef: string;
  totalQtyOrdered: number;
  totalQtyReceived: number;

  /**
   * default: 其它页面使用，保持原样
   * inbound: 采购收货作业页使用（作业态字号更大、隐藏金额）
   */
  mode?: "default" | "inbound";
}

const formatTs = (ts: string | null) =>
  ts ? ts.replace("T", " ").replace("Z", "") : "-";

const formatMoney = (v: string | null) => (v == null ? "-" : v);

export const PurchaseOrderHeaderCard: React.FC<PurchaseOrderHeaderCardProps> = ({
  po,
  poRef,
  totalQtyOrdered,
  totalQtyReceived,
  mode = "default",
}) => {
  const remainingHead = totalQtyOrdered - totalQtyReceived;

  const isInbound = mode === "inbound";

  const cardCls = isInbound
    ? "bg-white border border-slate-200 rounded-xl p-5 space-y-4"
    : "bg-white border border-slate-200 rounded-xl p-4 space-y-3";

  const titleCls = isInbound
    ? "text-base font-semibold text-slate-800"
    : "text-sm font-semibold text-slate-800";

  const metaCls = isInbound ? "text-sm text-slate-500" : "text-xs text-slate-500";

  const gridCls = isInbound
    ? "grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-3 text-base text-slate-700"
    : "grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-2 text-sm text-slate-700";

  const labelCls = isInbound ? "text-sm text-slate-500" : "text-xs text-slate-500";

  const idCls = isInbound ? "font-mono text-[14px]" : "font-mono text-[13px]";

  return (
    <section className={cardCls}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className={titleCls}>基本信息</h2>

          {/* ✅ 入库作业页：口径提示（不打断、不噪音） */}
          {isInbound ? (
            <div className="text-[12px] text-slate-500">
              口径：库存 / 台账 / 收货事实均使用“最小单位”。采购单位仅用于解释。
            </div>
          ) : null}
        </div>

        <span className={metaCls}>创建时间： {formatTs(po.created_at)}</span>
      </div>

      <div className={gridCls}>
        <div>
          <span className={labelCls}>采购单 ID</span>
          <div className={idCls}>
            {po.id} ({poRef})
          </div>
        </div>

        <div>
          <span className={labelCls}>供应商</span>
          <div>{po.supplier_name ?? po.supplier}</div>
        </div>

        <div>
          <span className={labelCls}>状态</span>
          <div>{po.status}</div>
        </div>

        <div>
          <span className={labelCls}>仓库 ID</span>
          <div>{po.warehouse_id}</div>
        </div>

        <div>
          <span className={labelCls}>采购人</span>
          <div>{po.purchaser}</div>
        </div>

        <div>
          <span className={labelCls}>采购时间</span>
          <div>{formatTs(po.purchase_time)}</div>
        </div>

        <div>
          {/* ✅ 文案统一：这里显示的是最小单位口径 */}
          <span className={labelCls}>汇总数量（最小单位）</span>
          <div>
            {totalQtyReceived} / {totalQtyOrdered}
            {remainingHead > 0 && (
              <span className="ml-2 text-sm text-amber-700">
                （剩余 {remainingHead}）
              </span>
            )}
          </div>
        </div>

        {/* ✅ 作业页隐藏金额：避免噪音与误导 */}
        {!isInbound ? (
          <div>
            <span className={labelCls}>汇总金额（total_amount）</span>
            <div>{formatMoney(po.total_amount)}</div>
          </div>
        ) : null}

        <div>
          <span className={labelCls}>最后收货</span>
          <div>{formatTs(po.last_received_at)}</div>
        </div>

        <div>
          <span className={labelCls}>关闭时间</span>
          <div>{formatTs(po.closed_at)}</div>
        </div>
      </div>
    </section>
  );
};
