// src/features/tms/reconciliation/components/ReconciliationForm.tsx

import React from "react";

interface Props {
  importBatchId: string;
  loading: boolean;
  error: string;
  onImportBatchIdChange: (value: string) => void;
  onSubmit: () => void;
}

const ReconciliationForm: React.FC<Props> = ({
  importBatchId,
  loading,
  error,
  onImportBatchIdChange,
  onSubmit,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-slate-900">自动对账</h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <div className="text-xs text-slate-600">账单批次 ID</div>
          <input
            value={importBatchId}
            onChange={(e) => onImportBatchIdChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="请输入 import_batch_id"
          />
          <div className="text-xs text-slate-500">
            对账主链以 import_batch_id 为准，不再通过承运商代码 + 导入批次号手工驱动。
          </div>
        </label>
      </div>

      <div className="mt-4">
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "对账中…" : "开始自动对账"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </section>
  );
};

export default ReconciliationForm;
