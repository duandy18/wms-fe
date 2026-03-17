// src/features/tms/billing/pages/BillingItemsPage.tsx

import React from "react";
import { Link } from "react-router-dom";
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
    batchSummaries,
    activeBatch,
    setField,
    reset,
    setOffset,
    focusBatch,
    clearFocusedBatch,
    reload,
  } = useBillingItemsPage();

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="快递账单"
        description={
          activeBatch
            ? `当前聚焦批次 #${activeBatch.import_batch_id}（${activeBatch.carrier_code} / ${activeBatch.import_batch_no}），共 ${total} 条明细。`
            : `当前结果 ${total} 条明细，第 ${currentPage} / ${totalPages || 1} 页。页面先围绕“批次”组织，再展开查看明细。`
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">批次入口</div>
            <div className="mt-1 text-sm text-slate-600">
              当前结果中识别出 <span className="font-semibold">{batchSummaries.length}</span> 个批次。
              先选定批次，再查看明细或进入对账。
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/tms/billing/import"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              去导入账单
            </Link>

            {query.import_batch_id != null ? (
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={clearFocusedBatch}
              >
                取消批次聚焦
              </button>
            ) : null}
          </div>
        </div>

        {batchSummaries.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {batchSummaries.map((batch) => {
              const isActive = batch.import_batch_id === query.import_batch_id;

              return (
                <div
                  key={batch.import_batch_id}
                  className={`rounded-xl border p-4 ${
                    isActive
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900">
                        批次 #{batch.import_batch_id}
                      </div>
                      <div className="text-sm text-slate-700">
                        {batch.carrier_code} / {batch.import_batch_no}
                      </div>
                      <div className="text-xs text-slate-500">
                        账期：{batch.bill_month || "-"} · 当前结果明细数：{batch.item_count}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!isActive ? (
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-white"
                          onClick={() => focusBatch(batch.import_batch_id)}
                        >
                          查看该批次
                        </button>
                      ) : null}

                      <Link
                        to={`/tms/reconciliation?import_batch_id=${batch.import_batch_id}`}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
                      >
                        去对账
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !loading && !error ? (
          <div className="mt-4 text-sm text-slate-500">当前结果中没有可展示的批次。</div>
        ) : null}
      </section>

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
