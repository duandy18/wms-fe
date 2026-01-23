// src/features/orders/components/OrderBasicsCard.tsx
import React from "react";
import type { OrderView } from "../api/index";
import { formatTs } from "../ui/format";
import { OrderDetailActionsBar } from "./OrderDetailActionsBar";

type Order = OrderView["order"];

export const OrderBasicsCard: React.FC<{
  order: Order;
  traceId: string | null;
  hasRemainingRefundable: boolean;
  reconcileLoading: boolean;
  creatingRma: boolean;
  onViewTrace: () => void;
  onReconcile: () => void;
  onCreateRma: () => void;
  onViewLedger: () => void;
}> = ({
  order,
  traceId,
  hasRemainingRefundable,
  reconcileLoading,
  creatingRma,
  onViewTrace,
  onReconcile,
  onCreateRma,
  onViewLedger,
}) => {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">基本信息</h2>
        <div className="text-xs text-slate-500">
          创建时间：{formatTs(order.created_at)}，状态：
          <span className="font-medium ml-1">{order.status ?? "-"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-2 gap-x-8 md:grid-cols-3">
        <div>
          <div className="text-[11px] text-slate-500">平台 / 店铺</div>
          <div>
            {order.platform}/{order.shop_id}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500">外部订单号</div>
          <div className="font-mono text-[12px]">{order.ext_order_no}</div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500">仓库 ID</div>
          <div>{order.warehouse_id ?? "-"}</div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500">金额 / 实付</div>
          <div className="font-mono text-[12px]">
            {order.order_amount ?? "-"} / {order.pay_amount ?? "-"}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500">trace_id</div>
          <div className="font-mono text-[11px]">{traceId ?? "（暂无）"}</div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500">退货状态提示</div>
          <div className="text-[11px]">
            {hasRemainingRefundable ? (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                该订单仍有剩余可退数量
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                无剩余可退（或尚未发货）
              </span>
            )}
          </div>
        </div>
      </div>

      <OrderDetailActionsBar
        traceId={traceId}
        hasRemainingRefundable={hasRemainingRefundable}
        reconcileLoading={reconcileLoading}
        creatingRma={creatingRma}
        onViewTrace={onViewTrace}
        onReconcile={onReconcile}
        onCreateRma={onCreateRma}
        onViewLedger={onViewLedger}
      />
    </section>
  );
};
