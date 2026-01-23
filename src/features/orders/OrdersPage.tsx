// src/features/orders/OrdersPage.tsx
import React from "react";
import PageTitle from "../../components/ui/PageTitle";

import { OrdersTable } from "./components/OrdersTable";
import { ManualShipDecisionCard } from "./components/ManualShipDecisionCard";

import { useOrdersList } from "./hooks/useOrdersList";
import type { OrderSummary } from "./api/index";

const OrdersPage: React.FC = () => {
  const list = useOrdersList({ initialPlatform: "PDD", limit: 100 });

  const [selectedForManual, setSelectedForManual] = React.useState<OrderSummary | null>(null);

  // 列表刷新后，若选中订单不在“未发运列表”里，自动关闭处理卡
  React.useEffect(() => {
    if (!selectedForManual) return;
    const exists = list.rows.some((r) => r.id === selectedForManual.id);
    if (!exists) setSelectedForManual(null);
  }, [list.rows, selectedForManual]);

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="订单管理"
        description="本页只展示未发运订单（用于处理与发货决策）。已发运订单请在「订单统计」中查看。"
      />

      <OrdersTable
        rows={list.rows}
        warehouses={list.warehouses}
        loading={list.loading}
        onReload={() => void list.loadList()}
        onOpenManual={(row) => setSelectedForManual(row)}
      />

      {selectedForManual && (
        <ManualShipDecisionCard
          selected={selectedForManual}
          warehouses={list.warehouses}
          onClose={() => setSelectedForManual(null)}
          onReload={() => void list.loadList()}
        />
      )}
    </div>
  );
};

export default OrdersPage;
