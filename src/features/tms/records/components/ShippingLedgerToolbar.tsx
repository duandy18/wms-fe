// src/features/tms/records/components/ShippingLedgerToolbar.tsx

import React from "react";

interface ShippingLedgerToolbarProps {
  total: number;
  loading: boolean;
  exporting: boolean;
  onReload: () => void;
  onExport: () => void;
}

const ShippingLedgerToolbar: React.FC<ShippingLedgerToolbarProps> = ({
  total,
  loading,
  exporting,
  onReload,
  onExport,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-600">
          当前结果 {total} 条，仅展示已写入台帐的发货事实与预估费用结构。
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onReload}
            disabled={loading}
          >
            {loading ? "刷新中…" : "刷新"}
          </button>

          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onExport}
            disabled={exporting}
          >
            {exporting ? "导出中…" : "导出 CSV"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ShippingLedgerToolbar;
