// src/features/tms/reports/pages/TransportReportsPage.tsx

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import TransportReportsByCarrierTable from "../components/TransportReportsByCarrierTable";
import TransportReportsByProvinceTable from "../components/TransportReportsByProvinceTable";
import TransportReportsByShopTable from "../components/TransportReportsByShopTable";
import TransportReportsByWarehouseTable from "../components/TransportReportsByWarehouseTable";
import TransportReportsDailyTable from "../components/TransportReportsDailyTable";
import TransportReportsFilters from "../components/TransportReportsFilters";
import TransportReportsOverview from "../components/TransportReportsOverview";
import { useTransportReportsPage } from "../hooks/useTransportReportsPage";

function formatMoney(value: number): string {
  return `￥${value.toFixed(2)}`;
}

const TransportReportsPage: React.FC = () => {
  const {
    query,
    carrierRows,
    provinceRows,
    shopRows,
    warehouseRows,
    dailyRows,
    options,
    loading,
    error,
    totalShipCnt,
    totalCost,
    setField,
    reset,
    reload,
  } = useTransportReportsPage();

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="快递成本分析"
        description="基于发货记录进行快递成本聚合分析，展示承运商、仓库、省份、店铺与时间趋势。"
      />

      <TransportReportsOverview
        totalShipCnt={totalShipCnt}
        totalCostText={formatMoney(totalCost)}
        error={error}
      />

      <TransportReportsFilters
        query={query}
        options={options}
        loading={loading}
        totalShipCnt={totalShipCnt}
        totalCostText={formatMoney(totalCost)}
        onChange={setField}
        onApply={() => void reload()}
        onReset={reset}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TransportReportsByCarrierTable rows={carrierRows} />
        <TransportReportsByProvinceTable rows={provinceRows} />
        <TransportReportsByShopTable rows={shopRows} />
        <TransportReportsByWarehouseTable rows={warehouseRows} />
      </div>

      <TransportReportsDailyTable rows={dailyRows} />
    </div>
  );
};

export default TransportReportsPage;
