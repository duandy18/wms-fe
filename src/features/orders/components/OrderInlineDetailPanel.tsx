// src/features/orders/components/OrderInlineDetailPanel.tsx
import React, { useMemo, useState } from "react";
import type { OrderFacts, OrderSummary, OrderView, WarehouseOption } from "../api/index";

import { OrderInlineDetailHeader } from "./inline-detail/OrderInlineDetailHeader";
import { ManualAssignBanner } from "./inline-detail/ManualAssignBanner";
import { OrderInlineDetailMetaGrid } from "./inline-detail/OrderInlineDetailMetaGrid";
import { OrderInlineDetailFactsTable } from "./inline-detail/OrderInlineDetailFactsTable";
import { ManualAssignWarehouseModal } from "./inline-detail/ManualAssignWarehouseModal";

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

  // ✅ 候选执行仓由后端 summary 给出（前端不得自行拉 /warehouses）
  warehouses: WarehouseOption[];

  // ⚠️ 为兼容调用方保留，但本面板不再展示 DevConsole 入口
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

  // Phase 5.2：展示字段来自后端（只读事实）
  const o = (detailOrder ?? undefined) as OrderWithFulfillment | undefined;
  const fulfillmentStatus = o?.fulfillment_status ?? null;
  const serviceWarehouseId = o?.service_warehouse_id ?? null;
  const execWarehouseId = detailOrder?.warehouse_id ?? null;

  // ✅ 后端对齐：是否需要人工指定执行仓，直接消费 summary 布尔字段（前端不得推导）
  const needManualAssign = selectedSummary.can_manual_assign_execution_warehouse === true;

  const [assignOpen, setAssignOpen] = useState(false);

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
      <OrderInlineDetailHeader selectedSummary={selectedSummary} onClose={onClose} />

      {detailLoading && <div className="text-xs text-slate-500">正在加载订单详情…</div>}
      {detailError && <div className="text-xs text-red-600">{detailError}</div>}

      {detailOrder && (
        <>
          <ManualAssignBanner show={needManualAssign} onOpen={() => setAssignOpen(true)} />

          <OrderInlineDetailMetaGrid
            order={detailOrder}
            fulfillmentStatus={fulfillmentStatus}
            serviceWarehouseId={serviceWarehouseId}
            execWarehouseId={execWarehouseId}
          />

          <OrderInlineDetailFactsTable facts={facts} totals={totals} />

          <ManualAssignWarehouseModal
            open={assignOpen}
            onClose={() => setAssignOpen(false)}
            selectedSummary={selectedSummary}
            serviceWarehouseId={serviceWarehouseId}
            execWarehouseId={execWarehouseId}
            warehouses={warehouses}
            onSuccess={() => {
              setAssignOpen(false);
              onReload();
            }}
          />
        </>
      )}
    </section>
  );
};
