// src/features/operations/inbound/manual/ManualReceiveTable.tsx

import React from "react";
import type { ReceiveTaskLine } from "../../../receive-tasks/api";

export const ManualReceiveTable: React.FC<{
  lines: ReceiveTaskLine[];

  qtyInputs: Record<number, string>;
  savingItemId: number | null;

  onQtyChange: (itemId: number, value: string) => void;
  onReceive: (line: ReceiveTaskLine) => void;
}> = ({ lines, qtyInputs, savingItemId, onQtyChange, onReceive }) => {
  return (
    <div className="max-h-60 overflow-y-auto rounded bg-slate-50 border border-slate-100">
      <table className="min-w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-slate-100 text-slate-600">
            <th className="px-2 py-1 text-right">Item</th>
            <th className="px-2 py-1 text-left">商品名</th>
            <th className="px-2 py-1 text-right">应收</th>
            <th className="px-2 py-1 text-right">已收</th>
            <th className="px-2 py-1 text-right">剩余</th>
            <th className="px-2 py-1 text-right">本次收货</th>
            <th className="px-2 py-1 text-left">批次 / 生产 / 到期（只读）</th>
            <th className="px-2 py-1 text-center">操作</th>
          </tr>
        </thead>

        <tbody>
          {lines.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-2 py-2 text-center text-slate-500">
                当前任务没有任何行，无法进行行级收货。
              </td>
            </tr>
          ) : (
            lines.map((l) => {
              const scanned = l.scanned_qty ?? 0;
              const remaining = l.expected_qty != null ? (l.expected_qty ?? 0) - scanned : null;

              return (
                <tr key={l.id} className="border-t border-slate-100 align-top">
                  <td className="px-2 py-1 text-right font-mono">{l.item_id}</td>
                  <td className="px-2 py-1">{l.item_name ?? "-"}</td>
                  <td className="px-2 py-1 text-right font-mono">{l.expected_qty ?? "-"}</td>
                  <td className="px-2 py-1 text-right font-mono">{scanned}</td>
                  <td className="px-2 py-1 text-right font-mono">{remaining ?? "-"}</td>

                  <td className="px-2 py-1 text-right">
                    <input
                      className="w-20 rounded border border-slate-300 px-1 py-0.5 text-right font-mono"
                      placeholder={remaining != null && remaining > 0 ? String(remaining) : ""}
                      value={qtyInputs[l.item_id] ?? ""}
                      onChange={(e) => onQtyChange(l.item_id, e.target.value)}
                    />
                  </td>

                  <td className="px-2 py-1">
                    <div className="space-y-0.5">
                      <div>
                        批次：<span className="font-mono">{l.batch_code ?? "(留空将自动 NOEXP)"}</span>
                      </div>
                      <div>
                        生产：<span className="font-mono">{l.production_date ?? "-"}</span> / 到期：
                        <span className="font-mono">{l.expiry_date ?? "-"}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-1 text-center">
                    <button
                      type="button"
                      disabled={savingItemId === l.item_id}
                      onClick={() => onReceive(l)}
                      className="rounded border border-emerald-500 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 disabled:opacity-60"
                    >
                      {savingItemId === l.item_id ? "保存中…" : "记录本行收货"}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
