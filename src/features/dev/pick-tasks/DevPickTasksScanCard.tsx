// src/features/dev/pick-tasks/DevPickTasksScanCard.tsx

import React from "react";
import type { ScanFormState } from "../DevPickTasksPanel";

interface Props {
  scanForm: ScanFormState;
  scanLoading: boolean;
  scanSuccess: boolean;
  hasTask: boolean;
  onChangeScanForm: (patch: Partial<ScanFormState>) => void;
  onSubmitScan: (e: React.FormEvent) => void;
}

export const DevPickTasksScanCard: React.FC<Props> = ({
  scanForm,
  scanLoading,
  scanSuccess,
  hasTask,
  onChangeScanForm,
  onSubmitScan,
}) => {
  return (
    <form
      onSubmit={onSubmitScan}
      className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs"
    >
      <h3 className="text-xs font-semibold text-slate-700">
        扫码拣货（record_scan，仅写任务）
      </h3>
      <div className="grid gap-2 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-[11px] text-slate-600">item_id</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
            value={scanForm.itemId}
            onChange={(e) => onChangeScanForm({ itemId: e.target.value })}
            placeholder="必填"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-slate-600">qty</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
            value={scanForm.qty}
            onChange={(e) => onChangeScanForm({ qty: e.target.value })}
            placeholder="默认为 1"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-slate-600">
            batch_code（可为空）
          </label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
            value={scanForm.batchCode}
            onChange={(e) =>
              onChangeScanForm({ batchCode: e.target.value })
            }
            placeholder="例如 BATCH-TEST-001"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={scanLoading || !hasTask}
        className="mt-1 inline-flex items-center rounded bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-600 disabled:opacity-50"
      >
        {scanLoading ? "写入中…" : "写入拣货任务（不扣库存）"}
      </button>

      {scanLoading && (
        <div className="mt-1 text-[11px] text-slate-500">处理中…</div>
      )}
      {!scanLoading && scanSuccess && (
        <div className="mt-1 text-[11px] text-emerald-700">
          最近一次拣货写入成功。
        </div>
      )}
    </form>
  );
};
