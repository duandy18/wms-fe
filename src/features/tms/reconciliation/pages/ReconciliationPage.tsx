// src/features/tms/reconciliation/pages/ReconciliationPage.tsx

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import ReconciliationDetailCard from "../components/ReconciliationDetailCard";
import ReconciliationFilters from "../components/ReconciliationFilters";
import ReconciliationTable from "../components/ReconciliationTable";
import { useReconciliationList } from "../hooks/useReconciliationList";

const ReconciliationPage: React.FC = () => {
  const {
    query,
    rows,
    total,
    loading,
    error,
    currentPage,
    totalPages,
    selectedId,
    detail,
    detailLoading,
    detailError,
    setField,
    reset,
    setOffset,
    reload,
    loadDetail,
    clearDetail,
  } = useReconciliationList();

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="对账异常"
        description="基于当前账单与物流台账计算的异常列表（diff / bill_only / record_only）。"
      />

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">异常列表</div>
        <div className="mt-1 text-sm text-slate-600">
          当前结果 {total} 条异常，第 {currentPage} / {totalPages || 1} 页。
        </div>
      </section>

      <ReconciliationFilters
        query={query}
        loading={loading}
        onChange={setField}
        onApply={() => void reload()}
        onReset={reset}
      />

      <ReconciliationTable
        rows={rows}
        loading={loading}
        error={error}
        selectedId={selectedId}
        onSelect={(id) => void loadDetail(id)}
      />

      <ReconciliationDetailCard
        detail={detail}
        loading={detailLoading}
        error={detailError}
        onClose={clearDetail}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            onClick={() => setOffset(Math.max(0, query.offset - query.limit))}
            disabled={query.offset <= 0}
          >
            上一页
          </button>

          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
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

export default ReconciliationPage;
