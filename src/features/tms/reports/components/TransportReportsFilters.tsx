// src/features/tms/reports/components/TransportReportsFilters.tsx

import React from "react";
import type { TransportReportsQuery } from "../types";

type CarrierOption = {
  value: string;
  label: string;
};

interface TransportReportsFiltersProps {
  query: TransportReportsQuery;
  loading: boolean;
  ticketCount: number;
  totalCostText: string;
  carrierOptions: CarrierOption[];
  onChange: <K extends keyof TransportReportsQuery>(
    key: K,
    value: TransportReportsQuery[K],
  ) => void;
  onApply: () => void;
  onReset: () => void;
}

const TransportReportsFilters: React.FC<TransportReportsFiltersProps> = ({
  query,
  loading,
  ticketCount,
  totalCostText,
  carrierOptions,
  onChange,
  onApply,
  onReset,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-sm font-semibold text-slate-800">报表筛选</div>
        <div className="text-xs text-slate-500">
          票数 {ticketCount} · 总成本 {totalCostText}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <div className="text-xs text-slate-600">分析口径</div>
          <select
            value={query.mode}
            onChange={(e) =>
              onChange("mode", e.target.value as TransportReportsQuery["mode"])
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="bill">账单成本</option>
            <option value="record">台帐预估成本</option>
          </select>
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">承运商代码</div>
          <select
            value={query.carrier_code ?? ""}
            onChange={(e) => onChange("carrier_code", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">全部</option>
            {carrierOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">开始日期</div>
          <input
            type="date"
            value={query.start_date ?? ""}
            onChange={(e) => onChange("start_date", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs text-slate-600">结束日期</div>
          <input
            type="date"
            value={query.end_date ?? ""}
            onChange={(e) => onChange("end_date", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onApply}
          disabled={loading}
        >
          {loading ? "加载中…" : "查询"}
        </button>

        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          onClick={onReset}
        >
          重置
        </button>
      </div>
    </section>
  );
};

export default TransportReportsFilters;
