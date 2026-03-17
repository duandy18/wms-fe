// src/features/tms/records/pages/ShippingLedgerPage.tsx

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import ShippingLedgerFilters from "../components/ShippingLedgerFilters";
import ShippingLedgerPagination from "../components/ShippingLedgerPagination";
import ShippingLedgerTable from "../components/ShippingLedgerTable";
import ShippingLedgerToolbar from "../components/ShippingLedgerToolbar";
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

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="发货记录"
        description="基于运输事实账本浏览发货记录，不展示物流状态，不承载对账结果。"
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
        onChange={setField}
        onApply={() => void reload()}
        onReset={reset}
      />

      <ShippingLedgerTable
        rows={rows}
        loading={loading}
        error={error}
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
