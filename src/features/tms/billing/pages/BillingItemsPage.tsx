// src/features/tms/billing/pages/BillingItemsPage.tsx

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import BillingItemsFilters from "../components/BillingItemsFilters";
import BillingItemsTable from "../components/BillingItemsTable";
import { useBillingItemsPage } from "../hooks/useBillingItemsPage";

const BillingItemsPage: React.FC = () => {
  const {
    query,
    rows,
    total,
    loading,
    error,
    currentPage,
    totalPages,
    setField,
    reset,
    setOffset,
    reload,
  } = useBillingItemsPage();

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="运输对账 / 账单明细"
        description={`浏览承运商账单原始明细。当前 ${total} 条，第 ${currentPage} / ${totalPages || 1} 页。`}
      />

      <BillingItemsFilters
        query={query}
        loading={loading}
        onChange={setField}
        onApply={() => void reload()}
        onReset={reset}
      />

      <BillingItemsTable rows={rows} loading={loading} error={error} />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setOffset(Math.max(0, query.offset - query.limit))}
            disabled={query.offset <= 0}
          >
            上一页
          </button>

          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setOffset(query.offset + query.limit)}
            disabled={query.offset + query.limit >= total}
          >
            下一页
          </button>
        </div>
      </section>
    </div>
  );
};

export default BillingItemsPage;
