// src/features/orders/components/OrderInlineDetailPanel.tsx
import React, { useMemo } from "react";
import type { OrderFacts, OrderSummary, OrderView, WarehouseOption } from "../api/index";

import { OrderInlineDetailHeader } from "./inline-detail/OrderInlineDetailHeader";
import { OrderInlineDetailMetaGrid } from "./inline-detail/OrderInlineDetailMetaGrid";
import { OrderInlineDetailFactsTable } from "./inline-detail/OrderInlineDetailFactsTable";

type OrderWithFulfillment = OrderView["order"] & {
  fulfillment_status?: string | null;
  service_warehouse_id?: number | null;
};

export const OrderInlineDetailPanel: React.FC<{
  selectedSummary: OrderSummary;
  selectedView: OrderView | null;
  selectedFacts: OrderFacts | null;
  detailLoading: boolean;
  detailError: string | null;
  onClose: () => void;
  onReload: () => void;

  // ✅ 候选仓由 summary 给出（只读展示可能会用到；这里保持入参兼容）
  warehouses: WarehouseOption[];

  // ⚠️ 为兼容调用方保留（PickSidebar 仍在传）
  devConsoleHref: () => string;
}> = ({
  selectedSummary,
  selectedView,
  selectedFacts,
  detailLoading,
  detailError,
  onClose,
  onReload,
  warehouses,
  devConsoleHref: _devConsoleHref,
}) => {
  // ✅ 显式标记为“已使用”，避免 eslint no-unused-vars
  void _devConsoleHref;
  void warehouses;

  const detailOrder = selectedView?.order ?? null;
  const facts = useMemo(() => selectedFacts?.items ?? [], [selectedFacts]);

  const totals = useMemo(() => {
    if (!facts.length) return { ordered: 0, shipped: 0, returned: 0, remaining: 0 };
    return facts.reduce(
      (acc, f) => {
        acc.ordered += f.qty_ordered;
        acc.shipped += f.qty_shipped;
        acc.returned += f.qty_returned;
        acc.remaining += f.qty_remaining_refundable;
        return acc;
      },
      { ordered: 0, shipped: 0, returned: 0, remaining: 0 },
    );
  }, [facts]);

  // 展示字段来自后端（只读事实）
  const o = (detailOrder ?? undefined) as OrderWithFulfillment | undefined;
  const fulfillmentStatus = o?.fulfillment_status ?? null;
  const defaultWarehouseId = o?.service_warehouse_id ?? null;
  const shipWarehouseId = detailOrder?.warehouse_id ?? null;

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
      <OrderInlineDetailHeader selectedSummary={selectedSummary} onClose={onClose} />

      {detailLoading && <div className="text-xs text-slate-500">正在加载订单详情…</div>}
      {detailError && <div className="text-xs text-red-600">{detailError}</div>}

      {detailOrder && (
        <>
          {/* ✅ 只读详情：不在拣货侧边栏提供“人工指定发货仓库”等操作入口 */}
          <OrderInlineDetailMetaGrid
            order={detailOrder}
            fulfillmentStatus={fulfillmentStatus}
            serviceWarehouseId={defaultWarehouseId}
            execWarehouseId={shipWarehouseId}
          />

          <OrderInlineDetailFactsTable facts={facts} totals={totals} />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              className="rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
              onClick={onReload}
            >
              刷新
            </button>
          </div>
        </>
      )}
    </section>
  );
};
