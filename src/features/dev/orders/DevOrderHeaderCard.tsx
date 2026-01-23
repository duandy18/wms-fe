// src/features/dev/orders/DevOrderHeaderCard.tsx
// 订单头信息 + 商品概要 + trace 区（纯 UI 模块）

import React from "react";
import type { DevOrderInfo, DevOrderItemFact } from "./api/index";

type Props = {
  order: DevOrderInfo | null;
  orderFacts: DevOrderItemFact[] | null;
  traceId?: string | null;
  orderRef?: string | null;
  onViewLedger: () => void;
  onViewStock: () => void;
  onViewOrderLifecycle: () => void;
  onViewLedgerCockpit: () => void;
};

function assignModeLabel(mode?: string | null): { text: string; cls: string } {
  const m = (mode || "").toUpperCase();
  if (m === "AUTO_FROM_SERVICE") {
    return { text: "自动（服务仓确认）", cls: "border-sky-200 bg-sky-50 text-sky-800" };
  }
  if (m === "MANUAL") {
    return { text: "人工改派", cls: "border-violet-200 bg-violet-50 text-violet-800" };
  }
  if (m === "UNASSIGNED") {
    return { text: "未指定执行仓", cls: "border-amber-200 bg-amber-50 text-amber-800" };
  }
  if (!m) {
    return { text: "—", cls: "border-slate-200 bg-slate-50 text-slate-700" };
  }
  return { text: mode || "OTHER", cls: "border-slate-200 bg-slate-50 text-slate-700" };
}

export const DevOrderHeaderCard: React.FC<Props> = ({
  order,
  orderFacts,
  traceId,
  orderRef,
  onViewLedger,
  onViewStock,
  onViewOrderLifecycle,
  onViewLedgerCockpit,
}) => {
  if (!order) return null;

  const totalLines = orderFacts?.length ?? 0;
  const totalQtyOrdered = orderFacts?.reduce((acc, f) => acc + (f.qty_ordered ?? 0), 0) ?? 0;

  const modeBadge = assignModeLabel(order.warehouse_assign_mode ?? null);

  return (
    <div className="space-y-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      {/* 头部信息 + 快捷跳诊断页 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-800">订单信息</h2>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <button
            type="button"
            onClick={onViewLedger}
            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            查看账本（账本工具）
          </button>
          <button
            type="button"
            onClick={onViewStock}
            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            查看库存（库存工具）
          </button>
          <button
            type="button"
            onClick={onViewOrderLifecycle}
            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            诊断视图：订单链路
          </button>
          <button
            type="button"
            onClick={onViewLedgerCockpit}
            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            诊断视图：Ledger Cockpit
          </button>
        </div>
      </div>

      {/* 订单基础字段 */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-700">
        <div>
          <span className="font-medium text-gray-500">订单 ID：</span>
          {order.id}
        </div>
        <div>
          <span className="font-medium text-gray-500">平台：</span>
          {order.platform}
        </div>
        <div>
          <span className="font-medium text-gray-500">店铺：</span>
          {order.shop_id}
        </div>
        <div>
          <span className="font-medium text-gray-500">外部订单号：</span>
          {order.ext_order_no}
        </div>
        <div>
          <span className="font-medium text-gray-500">状态：</span>
          {order.status ?? "-"}
        </div>
        <div>
          <span className="font-medium text-gray-500">仓库：</span>
          {order.warehouse_id ?? "-"}
        </div>

        {/* ✅ Phase 5.2：执行仓来源 */}
        <div className="col-span-2">
          <span className="font-medium text-gray-500">执行仓来源：</span>
          <span
            className={
              "ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium " +
              modeBadge.cls
            }
          >
            {modeBadge.text}
          </span>
        </div>
      </div>

      {/* 订单概要（商品 & 数量） */}
      {orderFacts && orderFacts.length > 0 && (
        <div className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold text-slate-800">订单概要（商品 & 数量）</span>
            <span className="text-[10px] text-slate-500">
              行数：{totalLines} · 总下单数量：{totalQtyOrdered}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {orderFacts.map((f) => {
              const label = f.title || f.sku_id || `item#${f.item_id}`;
              return (
                <span
                  key={f.item_id}
                  className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] text-slate-700"
                >
                  <span className="max-w-[140px] truncate">{label}</span>
                  <span className="ml-1 font-mono">×{f.qty_ordered}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* trace_id 区 & 跳转按钮 */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2">
        <div className="text-xs text-slate-700">
          <span className="font-medium text-slate-500">trace_id：</span>
          <span className="font-mono">{traceId ?? "（暂无 trace_id）"}</span>
        </div>

        {traceId && (
          <a
            href={`/trace?trace_id=${encodeURIComponent(String(traceId))}${
              orderRef ? `&focus_ref=${encodeURIComponent(orderRef)}` : ""
            }`}
            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
          >
            查看链路（Trace 页面）
          </a>
        )}
      </div>
    </div>
  );
};
