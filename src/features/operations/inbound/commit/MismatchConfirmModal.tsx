// src/features/operations/inbound/commit/MismatchConfirmModal.tsx

import React from "react";
import type { ReceiveTaskLine } from "../../../receive-tasks/api";
import { calcLineVariance, varianceClass } from "./commitUtils";

export const MismatchConfirmModal: React.FC<{
  open: boolean;
  mismatchLines: ReceiveTaskLine[];
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ open, mismatchLines, onCancel, onConfirm }) => {
  if (!open || mismatchLines.length === 0) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">⚠️ 入库差异提示</h3>

        <p className="text-xs text-slate-700">
          本次收货任务中存在
          <span className="font-semibold mx-1">{mismatchLines.length}</span>
          行实收与应收不一致，请确认差异合理后再继续入库。
        </p>

        <div className="max-h-40 overflow-y-auto border border-slate-100 rounded bg-slate-50">
          <table className="min-w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600">
                <th className="px-2 py-1 text-right">Item</th>
                <th className="px-2 py-1 text-left">名称</th>
                <th className="px-2 py-1 text-right">应收</th>
                <th className="px-2 py-1 text-right">实收</th>
                <th className="px-2 py-1 text-right">差异</th>
              </tr>
            </thead>

            <tbody>
              {mismatchLines.map((l) => {
                const v = calcLineVariance(l);
                const cls = varianceClass(v);
                return (
                  <tr key={l.id} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-1 text-right font-mono">{l.item_id}</td>
                    <td className="px-2 py-1">{l.item_name ?? "-"}</td>
                    <td className="px-2 py-1 text-right font-mono">{l.expected_qty ?? "-"}</td>
                    <td className="px-2 py-1 text-right font-mono">{l.scanned_qty ?? 0}</td>
                    <td className={"px-2 py-1 text-right font-mono " + cls}>{v}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            className="px-3 py-1 text-[11px] rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className="px-3 py-1 text-[11px] rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={onConfirm}
          >
            继续入库
          </button>
        </div>
      </div>
    </div>
  );
};
