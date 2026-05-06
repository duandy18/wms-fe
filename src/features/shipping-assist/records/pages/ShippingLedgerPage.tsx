// src/features/shipping-assist/records/pages/ShippingLedgerPage.tsx

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import ShippingLedgerFilters from "../components/ShippingLedgerFilters";
import ShippingLedgerPagination from "../components/ShippingLedgerPagination";
import ShippingLedgerTable from "../components/ShippingLedgerTable";
import ShippingLedgerToolbar from "../components/ShippingLedgerToolbar";
import { useShippingLedgerOptions } from "../hooks/useShippingLedgerOptions";
import { useShippingLedgerPage } from "../hooks/useShippingLedgerPage";

const ShippingLedgerPage: React.FC = () => {
  const {
    query,
    rows,
    total,
    loading,
    exporting,
    syncing,
    syncResult,
    error,
    currentPage,
    totalPages,
    setField,
    reset,
    setOffset,
    reload,
    exportCsv,
    syncFromLogistics,
  } = useShippingLedgerPage();

  const {
    providers,
    warehouses,
    loading: optionsLoading,
    error: optionsError,
  } = useShippingLedgerOptions();

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="发货记录"
        description="基于 WMS 本地物流台帐浏览发货事实；物流执行由独立 Logistics 系统负责，本页可手动同步 Logistics 发货事实。"
      />

      <ShippingLedgerToolbar
        total={total}
        loading={loading}
        exporting={exporting}
        syncing={syncing}
        syncResult={syncResult}
        onReload={() => void reload()}
        onExport={() => void exportCsv()}
        onSync={() => void syncFromLogistics()}
      />

      <ShippingLedgerFilters
        query={query}
        loading={loading || syncing}
        providers={providers}
        warehouses={warehouses}
        optionsLoading={optionsLoading}
        optionsError={optionsError}
        onChange={setField}
        onApply={() => void reload()}
        onReset={reset}
      />

      <ShippingLedgerTable
        rows={rows}
        warehouses={warehouses}
        loading={loading}
        error={error}
        offset={query.offset}
      />

      <ShippingLedgerPagination
        total={total}
        limit={query.limit}
        offset={query.offset}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setOffset(Math.max(0, query.offset - query.limit))}
        onNext={() => setOffset(query.offset + query.limit)}
      />
    </div>
  );
};

export default ShippingLedgerPage;
