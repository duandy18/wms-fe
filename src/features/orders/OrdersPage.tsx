// src/features/orders/OrdersPage.tsx
import React from "react";
import PageTitle from "../../components/ui/PageTitle";

import { OrdersFiltersPanel } from "./components/OrdersFiltersPanel";
import { OrdersTable } from "./components/OrdersTable";
import { OrderInlineDetailPanel } from "./components/OrderInlineDetailPanel";

import { useOrdersList } from "./hooks/useOrdersList";
import { useOrderInlineDetail } from "./hooks/useOrderInlineDetail";

const OrdersPage: React.FC = () => {
  const list = useOrdersList({ initialPlatform: "PDD" });
  const detail = useOrderInlineDetail();

  // 如果当前选中的订单已经不在列表里了，清掉详情（保持行为与原来一致）
  React.useEffect(() => {
    if (!detail.selectedSummary) return;
    const exists = list.rows.some((r) => r.id === detail.selectedSummary?.id);
    if (!exists) {
      detail.closeDetail();
    }
  }, [list.rows, detail]);

  function devConsoleHref() {
    const o = detail.detailOrder;
    if (!o) return "/dev";
    const qs = new URLSearchParams();
    qs.set("platform", o.platform);
    qs.set("shop_id", o.shop_id);
    qs.set("ext_order_no", o.ext_order_no);
    return `/dev?${qs.toString()}`;
  }

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="订单管理"
        description="按平台 / 店铺 / 状态 / 时间窗口浏览订单。在下方列表中选择一行，在列表下方查看详情；更深入的退货、对账、Trace 在 DevConsole 中完成。"
      />

      <OrdersFiltersPanel
        filters={list.filters}
        setFilters={(patch) => list.setFilters((prev) => ({ ...prev, ...patch }))}
        loading={list.loading}
        onSearch={() => void list.loadList()}
        error={list.error}
      />

      <OrdersTable rows={list.rows} loading={list.loading} onSelect={(r) => void detail.loadDetail(r)} />

      {detail.selectedSummary && (
        <OrderInlineDetailPanel
          selectedSummary={detail.selectedSummary}
          selectedView={detail.selectedView}
          selectedFacts={detail.selectedFacts}
          detailLoading={detail.detailLoading}
          detailError={detail.detailError}
          onClose={detail.closeDetail}
          onReload={() => void detail.reloadDetail()}
          devConsoleHref={devConsoleHref}
        />
      )}
    </div>
  );
};

export default OrdersPage;
