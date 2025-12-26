// src/features/orders/OrdersPage.tsx

import React from "react";
import PageTitle from "../../components/ui/PageTitle";

import { UI } from "./page/ui";
import { useOrdersPageModel } from "./page/hooks/useOrdersPageModel";

import OrdersFiltersCard from "./page/components/OrdersFiltersCard";
import OrdersListCard from "./page/components/OrdersListCard";
import OrderDetailCard from "./page/components/OrderDetailCard";

const OrdersPage: React.FC = () => {
  const vm = useOrdersPageModel();

  return (
    <div className={UI.page}>
      <PageTitle
        title="订单管理"
        description="按平台 / 店铺 / 状态 / 时间窗口浏览订单。在下方列表中选择一行，在列表下方查看详情；更深入的退货、对账、Trace 在 DevConsole 中完成。"
      />

      <OrdersFiltersCard
        platform={vm.platform}
        shopId={vm.shopId}
        status={vm.status}
        timeFrom={vm.timeFrom}
        timeTo={vm.timeTo}
        limit={vm.limit}
        loading={vm.loading}
        error={vm.error}
        onChangePlatform={vm.setPlatform}
        onChangeShopId={vm.setShopId}
        onChangeStatus={vm.setStatus}
        onChangeTimeFrom={vm.setTimeFrom}
        onChangeTimeTo={vm.setTimeTo}
        onChangeLimit={vm.setLimit}
        onQuery={vm.loadList}
      />

      <OrdersListCard rows={vm.rows} loading={vm.loading} onOpenDetail={vm.loadDetail} />

      {vm.selectedSummary ? (
        <OrderDetailCard
          selectedSummary={vm.selectedSummary}
          detailOrder={vm.detailOrder}
          detailFacts={vm.detailFacts}
          detailTotals={vm.detailTotals}
          detailLoading={vm.detailLoading}
          detailError={vm.detailError}
          devConsoleHref={vm.devConsoleHref}
          onClose={vm.closeDetail}
        />
      ) : null}
    </div>
  );
};

export default OrdersPage;
