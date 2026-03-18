// src/features/tms/billing/components/BillingImportCard.tsx

import React, { useRef } from "react";
import type { CarrierBillImportResult } from "../types";

type ProviderOption = {
  code: string;
  name: string;
};

interface Props {
  carrierCode: string;
  fileName: string;
  loading: boolean;
  error: string;
  result: CarrierBillImportResult | null;
  providerOptions: ProviderOption[];
  providersLoading: boolean;
  providersError: string;
  onCarrierCodeChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
}

function formatProviderLabel(option: ProviderOption): string {
  return `${option.name}（${option.code}）`;
}

const BillingImportCard: React.FC<Props> = ({
  carrierCode,
  fileName,
  loading,
  error,
  result,
  providerOptions,
  providersLoading,
  providersError,
  onCarrierCodeChange,
  onFileChange,
  onSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">账单导入</h2>
        <div className="mt-1 text-sm text-slate-600">
          先选择快递网点，再上传账单文件。导入按{" "}
          <span className="font-mono">carrier_code + tracking_no</span> 幂等写入。
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className="space-y-1 md:col-span-2">
          <div className="text-xs text-slate-600">快递网点</div>
          <select
            value={carrierCode}
            onChange={(e) => onCarrierCodeChange(e.target.value)}
            disabled={loading || providersLoading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">
              {providersLoading ? "正在加载快递网点…" : "请选择快递网点"}
            </option>
            {providerOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {formatProviderLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-1 md:col-span-1">
          <div className="text-xs text-slate-600">账单文件（.xlsx）</div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="hidden"
          />

          <button
            type="button"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            选择文件
          </button>

          <div className="min-h-[20px] break-all text-xs text-slate-500">
            {fileName || "未选择文件"}
          </div>
        </div>

        <div className="space-y-1 md:col-span-1">
          <div className="text-xs text-slate-600">导入操作</div>
          <button
            type="button"
            className="w-full rounded-lg bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onSubmit}
            disabled={loading || providersLoading}
          >
            {loading ? "导入中…" : "导入账单"}
          </button>
          <div className="min-h-[20px] text-xs text-slate-500">
            导入后将写入当前账单明细表。
          </div>
        </div>
      </div>

      {providersError ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          快递网点加载失败：{providersError}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            导入完成：承运商 <span className="font-semibold">{result.carrier_code}</span>，成功{" "}
            {result.imported_count}，跳过 {result.skipped_count}，错误 {result.error_count}
          </div>

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
