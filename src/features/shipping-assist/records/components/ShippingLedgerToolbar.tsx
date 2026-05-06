// src/features/shipping-assist/records/components/ShippingLedgerToolbar.tsx

import React from "react";
import type { SyncLogisticsShippingRecordsResponse } from "../types";

interface ShippingLedgerToolbarProps {
  total: number;
  loading: boolean;
  exporting: boolean;
  syncing: boolean;
  syncResult: SyncLogisticsShippingRecordsResponse | null;
  onReload: () => void;
  onExport: () => void;
  onSync: () => void;
}

const ShippingLedgerToolbar: React.FC<ShippingLedgerToolbarProps> = ({
  total,
  loading,
  exporting,
  syncing,
  syncResult,
  onReload,
  onExport,
  onSync,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-sm text-slate-600">
          <div>当前结果 {total} 条，仅展示已写入台帐的发货事实与预估费用结构。</div>
          {syncResult ? (
            <div className="text-xs text-emerald-700">
              已同步物流事实：拉取 {syncResult.fetched} 条，写入 {syncResult.upserted} 条，
              游标 {syncResult.last_cursor}
              {syncResult.has_more ? "，仍有后续数据可继续同步。" : "。"}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onReload}
            disabled={loading || syncing}
          >
            {loading ? "刷新中…" : "刷新"}
          </button>

          <button
            type="button"
            className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onSync}
            disabled={syncing || loading}
          >
            {syncing ? "同步中…" : "同步物流事实"}
          </button>

          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onExport}
            disabled={exporting || syncing}
          >
            {exporting ? "导出中…" : "导出 CSV"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ShippingLedgerToolbar;
