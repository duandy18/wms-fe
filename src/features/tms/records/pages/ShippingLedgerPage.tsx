// src/features/tms/records/pages/ShippingLedgerPage.tsx

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
    error,
    currentPage,
    totalPages,
    setField,
    reset,
    setOffset,
    reload,
    exportCsv,
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
        description="基于运输事实台帐浏览发货记录，展示快递网点、仓库、预估费用结构、尺寸与寄件人，不承载状态和对账结果。"
      />

      <ShippingLedgerToolbar
        total={total}
        loading={loading}
        exporting={exporting}
        onReload={() => void reload()}
        onExport={() => void exportCsv()}
      />

      <ShippingLedgerFilters
        query={query}
        loading={loading}
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
