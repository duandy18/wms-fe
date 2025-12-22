// src/features/operations/inbound/InboundManualReceiveCard.tsx
// 采购单行收货卡片（手工录入）
// - 只负责录入数量；批次/日期由收货明细行统一编辑
// - 重要：前端不再用“缺批次/缺日期”阻塞流程，最终以服务端 commit 规则为准
//   * 有保质期商品：服务端 commit 会强制批次+日期
//   * 无保质期商品：服务端允许日期为空，批次为空会自动 NOEXP

import React, { useMemo, useState } from "react";
import type { InboundCockpitController } from "./types";
import type { ReceiveTaskLine } from "../../receive-tasks/api";

interface Props {
  c: InboundCockpitController;
}

type QtyInputMap = Record<number, string>; // item_id -> 输入数量

type ApiErrorShape = {
  message?: string;
};

export const InboundManualReceiveCard: React.FC<Props> = ({ c }) => {
  const task = c.currentTask;
  const [qtyInputs, setQtyInputs] = useState<QtyInputMap>({});
  const [error, setError] = useState<string | null>(null);
  const [savingItemId, setSavingItemId] = useState<number | null>(null);

  const lines: ReceiveTaskLine[] = useMemo(() => (task ? task.lines : []), [task]);

  if (!task) {
    return (
      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">采购单行收货（手工录入）</h2>
        <p className="text-xs text-slate-500">尚未绑定收货任务。请先选择采购单并创建收货任务。</p>
      </section>
    );
  }

  const handleQtyChange = (itemId: number, value: string) => {
    setQtyInputs((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleReceive = async (line: ReceiveTaskLine) => {
    setError(null);
    const raw = qtyInputs[line.item_id] ?? "";
    const trimmed = raw.trim();
    const baseRemaining = line.expected_qty != null ? line.expected_qty - line.scanned_qty : 0;

    let qty: number;
    if (trimmed === "") {
      qty = baseRemaining > 0 ? baseRemaining : 0;
    } else {
      qty = Number(trimmed);
    }

    if (!Number.isFinite(qty) || qty <= 0) {
      setError(`行 item_id=${line.item_id} 的本次收货数量必须为正整数。`);
      return;
    }

    setSavingItemId(line.item_id);
    try {
      // 只递交数量即可；批次/日期由明细行统一维护（或由服务端在 commit 时自动 NOEXP）
      await c.manualReceiveLine(line.item_id, qty);

      setQtyInputs((prev) => {
        const next = { ...prev };
        delete next[line.item_id];
        return next;
      });
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      setError(err?.message ?? "行收货失败");
    } finally {
      setSavingItemId(null);
    }
  };

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">采购单行收货（手工录入）</h2>
        <span className="text-[11px] text-slate-500">
          场景：整箱整托、不便扫码或供应商已给出清单时，可按采购单行直接录入本次收货数量。
          批次/日期建议在左侧明细里维护；最终校验以服务端 commit 规则为准。
        </span>
      </div>

      {error && <div className="text-[11px] text-red-600">{error}</div>}

      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
        <div className="font-semibold">规则提示</div>
        <div className="mt-1">
          有保质期商品：服务端提交入库（commit）会要求“批次 +（生产/到期日期至少一项）”。<br />
          无保质期商品：允许日期为空，批次为空会自动归入 <span className="font-mono">NOEXP</span>。
        </div>
      </div>

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
                const remaining = l.expected_qty != null ? l.expected_qty - l.scanned_qty : null;
                return (
                  <tr key={l.id} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-1 text-right font-mono">{l.item_id}</td>
                    <td className="px-2 py-1">{l.item_name ?? "-"}</td>
                    <td className="px-2 py-1 text-right font-mono">{l.expected_qty ?? "-"}</td>
                    <td className="px-2 py-1 text-right font-mono">{l.scanned_qty}</td>
                    <td className="px-2 py-1 text-right font-mono">{remaining ?? "-"}</td>
                    <td className="px-2 py-1 text-right">
                      <input
                        className="w-20 rounded border border-slate-300 px-1 py-0.5 text-right font-mono"
                        placeholder={remaining != null && remaining > 0 ? String(remaining) : ""}
                        value={qtyInputs[l.item_id] ?? ""}
                        onChange={(e) => handleQtyChange(l.item_id, e.target.value)}
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
                        onClick={() => void handleReceive(l)}
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
    </section>
  );
};
