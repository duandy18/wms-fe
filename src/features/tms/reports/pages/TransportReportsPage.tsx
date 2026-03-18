// src/features/tms/reports/pages/TransportReportsPage.tsx

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import TransportReportsByCarrierTable from "../components/TransportReportsByCarrierTable";
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
    summary,
    carrierRows,
    timeRows,
    loading,
    error,
    modeLabel,
    carrierOptions,
    setField,
    reset,
    reload,
  } = useTransportReportsPage();

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="快递成本分析"
        description="按账单成本或台帐预估成本进行轻量分析，展示承运商分布与按天趋势。"
      />

      <TransportReportsOverview
        modeLabel={modeLabel}
        ticketCount={summary.ticket_count}
        totalCostText={formatMoney(summary.total_cost)}
        error={error}
      />

      <TransportReportsFilters
        query={query}
        loading={loading}
        ticketCount={summary.ticket_count}
        totalCostText={formatMoney(summary.total_cost)}
        carrierOptions={carrierOptions}
        onChange={setField}
        onApply={() => void reload()}
        onReset={reset}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TransportReportsByCarrierTable rows={carrierRows} />
        <TransportReportsDailyTable rows={timeRows} />
      </div>
    </div>
  );
};

export default TransportReportsPage;
