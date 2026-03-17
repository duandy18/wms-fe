// src/features/tms/reconciliation/pages/ReconciliationPage.tsx

import React from "react";
import { Link } from "react-router-dom";
import PageTitle from "../../../../components/ui/PageTitle";
import ReconciliationForm from "../components/ReconciliationForm";
import ReconciliationResultCard from "../components/ReconciliationResultCard";
import { useReconciliationPage } from "../hooks/useReconciliationPage";

const ReconciliationPage: React.FC = () => {
  const {
    importBatchId,
    loading,
    error,
    result,
    hasPresetBatch,
    setImportBatchId,
    submit,
  } = useReconciliationPage();

  const batchIdText = importBatchId.trim();

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="对账"
        description="按账单批次 ID 触发自动对账，生成差异汇总结果。对账主链使用 import_batch_id，而不是 carrier_code + import_batch_no。"
      />

      {hasPresetBatch ? (
        <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-sky-900">已带入账单批次</div>
              <div className="mt-1 text-sm text-sky-800">
                当前批次 ID：<span className="font-mono font-semibold">{batchIdText}</span>
                。你可以直接开始自动对账，或返回账单页继续查看该批次明细。
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/tms/billing/items?import_batch_id=${batchIdText}`}
                className="rounded-lg border border-sky-300 px-3 py-2 text-sm text-sky-900 hover:bg-white"
              >
                返回该批次账单
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <ReconciliationForm
        importBatchId={importBatchId}
        loading={loading}
        error={error}
        onImportBatchIdChange={setImportBatchId}
        onSubmit={() => void submit()}
      />

      <ReconciliationResultCard result={result} />
    </div>
  );
};

export default ReconciliationPage;
