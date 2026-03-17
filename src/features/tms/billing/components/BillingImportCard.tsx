// src/features/tms/billing/components/BillingImportCard.tsx

import React from "react";
import type { CarrierBillImportResult } from "../types";

interface Props {
  carrierCode: string;
  importBatchNo: string;
  billMonth: string;
  fileName: string;
  loading: boolean;
  error: string;
  result: CarrierBillImportResult | null;
  viewBatchHref: string | null;
  goReconcileHref: string | null;
  onCarrierCodeChange: (value: string) => void;
  onImportBatchNoChange: (value: string) => void;
  onBillMonthChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
}

const BillingImportCard: React.FC<Props> = ({
  carrierCode,
  importBatchNo,
  billMonth,
  fileName,
  loading,
  error,
  result,
  viewBatchHref,
  goReconcileHref,
  onCarrierCodeChange,
  onImportBatchNoChange,
  onBillMonthChange,
  onFileChange,
  onSubmit,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-slate-900">账单导入</h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <div className="text-xs text-slate-600">承运商代码</div>
          <input
            value={carrierCode}
            onChange={(e) => onCarrierCodeChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">导入批次号</div>
          <input
            value={importBatchNo}
            onChange={(e) => onImportBatchNoChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">账期（月）</div>
          <input
            value={billMonth}
            onChange={(e) => onBillMonthChange(e.target.value)}
            placeholder="如 2026-03"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">账单文件（.xlsx）</div>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          <div className="text-xs text-slate-500">{fileName || "未选择文件"}</div>
        </label>
      </div>

      <div className="mt-4">
        <button
          type="button"
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "导入中…" : "开始导入"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            导入完成：批次 #{result.import_batch_id}，成功 {result.imported_count}，跳过{" "}
            {result.skipped_count}，错误 {result.error_count}
          </div>

          {viewBatchHref || goReconcileHref ? (
            <div className="flex flex-wrap items-center gap-2">
              {viewBatchHref ? (
                <a
                  href={viewBatchHref}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  查看该批次账单
                </a>
              ) : null}

              {goReconcileHref ? (
                <a
                  href={goReconcileHref}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
                >
                  去对账
                </a>
              ) : null}
            </div>
          ) : null}

          {result.errors.length > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 text-sm font-semibold text-slate-800">错误行</div>
              <ul className="space-y-1 text-xs text-slate-700">
                {result.errors.map((item) => (
                  <li key={`${item.row_no}-${item.message}`}>
                    第 {item.row_no} 行：{item.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default BillingImportCard;
