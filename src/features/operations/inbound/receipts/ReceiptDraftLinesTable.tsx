// src/features/operations/inbound/receipts/ReceiptDraftLinesTable.tsx

import React, { useState } from "react";
import type { PurchaseOrderReceiveLineIn, PurchaseOrderReceiveWorkbenchOut, WorkbenchRowOut } from "./types";
import { receivePoLineWorkbench } from "./api";
import { InboundUI } from "../ui";

type RowDraft = {
  qtyText: string;
  productionDate: string;
  expiryDate: string;
  err: string | null;
  saving: boolean;
};

function safeInt(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

export const ReceiptDraftLinesTable: React.FC<{
  wb: PurchaseOrderReceiveWorkbenchOut;
  disabled: boolean;
  onAfterReceive: (next?: PurchaseOrderReceiveWorkbenchOut) => Promise<void>;
}> = ({ wb, disabled, onAfterReceive }) => {
  const rows: WorkbenchRowOut[] = Array.isArray(wb.rows) ? wb.rows : [];

  const [drafts, setDrafts] = useState<Record<number, RowDraft>>({});

  function getDraft(poLineId: number): RowDraft {
    return (
      drafts[poLineId] ?? {
        qtyText: "",
        productionDate: "",
        expiryDate: "",
        err: null,
        saving: false,
      }
    );
  }

  function setDraft(poLineId: number, patch: Partial<RowDraft>) {
    setDrafts((prev) => ({ ...prev, [poLineId]: { ...getDraft(poLineId), ...patch } }));
  }

  async function handleReceive(row: WorkbenchRowOut) {
    const d = getDraft(row.po_line_id);
    setDraft(row.po_line_id, { err: null });

    const qty = safeInt(d.qtyText);
    if (qty == null || qty <= 0) {
      setDraft(row.po_line_id, { err: "请输入有效的实收数量（必须为正整数，base 口径）" });
      return;
    }

    // ✅ remaining 只用后端给的 remaining_qty（禁止前端推导）
    const remaining = Number(row.remaining_qty ?? 0);
    if (qty > remaining) {
      setDraft(row.po_line_id, { err: `实收数量超出剩余应收：remaining_qty=${remaining}` });
      return;
    }

    const payload: PurchaseOrderReceiveLineIn = {
      line_id: row.po_line_id,
      qty,
      production_date: d.productionDate.trim() ? d.productionDate.trim() : null,
      expiry_date: d.expiryDate.trim() ? d.expiryDate.trim() : null,
    };

    setDraft(row.po_line_id, { saving: true });
    try {
      const next = await receivePoLineWorkbench(wb.po_summary.po_id, payload);
      setDraft(row.po_line_id, { qtyText: "", err: null, saving: false });
      await onAfterReceive(next);
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? "录入失败";
      setDraft(row.po_line_id, { err: msg, saving: false });
    }
  }

  if (rows.length === 0) {
    return <div className={InboundUI.quiet}>暂无可收货行（workbench.rows 为空）。</div>;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-slate-900">收货明细（DRAFT 录入表）</div>
        <div className="text-[12px] text-slate-500">口径：计划 / 草稿 / 已确认 / 剩余均以后端 workbench 为准（base）。</div>
      </div>

      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="min-w-[1080px] w-full text-[13px]">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left">行</th>
              <th className="px-3 py-2 text-left">商品</th>

              <th className="px-3 py-2 text-right">计划</th>
              <th className="px-3 py-2 text-right">草稿</th>
              <th className="px-3 py-2 text-right">已确认</th>
              <th className="px-3 py-2 text-right">剩余应收</th>

              <th className="px-3 py-2 text-left">本次实收</th>
              <th className="px-3 py-2 text-left">生产日期</th>
              <th className="px-3 py-2 text-left">到期日期</th>
              <th className="px-3 py-2 text-left">操作</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => {
              const d = getDraft(r.po_line_id);
              const remaining = Number(r.remaining_qty ?? 0);

              return (
                <tr key={r.po_line_id} className="border-t border-slate-200">
                  <td className="px-3 py-2 text-slate-600">
                    <div className="font-mono">#{r.line_no}</div>
                    <div className="text-[11px] text-slate-400">po_line_id={r.po_line_id}</div>
                  </td>

                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900">{r.item_name ?? "-"}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{r.item_sku ?? "-"}</div>
                  </td>

                  <td className="px-3 py-2 text-right font-mono text-slate-900">{r.ordered_qty}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-900">{r.draft_received_qty}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-900">{r.confirmed_received_qty}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-900">{remaining}</td>

                  <td className="px-3 py-2">
                    <input
                      className="w-[140px] rounded-md border border-slate-200 px-3 py-2 text-sm"
                      placeholder="例如 1"
                      value={d.qtyText}
                      onChange={(e) => setDraft(r.po_line_id, { qtyText: e.target.value })}
                      disabled={disabled || d.saving || remaining <= 0}
                    />
                    {d.err ? <div className={`mt-1 text-[12px] ${InboundUI.danger}`}>{d.err}</div> : null}
                  </td>

                  <td className="px-3 py-2">
                    <input
                      type="date"
                      className="w-[160px] rounded-md border border-slate-200 px-3 py-2 text-sm"
                      value={d.productionDate}
                      onChange={(e) => setDraft(r.po_line_id, { productionDate: e.target.value })}
                      disabled={disabled || d.saving}
                    />
                  </td>

                  <td className="px-3 py-2">
                    <input
                      type="date"
                      className="w-[160px] rounded-md border border-slate-200 px-3 py-2 text-sm"
                      value={d.expiryDate}
                      onChange={(e) => setDraft(r.po_line_id, { expiryDate: e.target.value })}
                      disabled={disabled || d.saving}
                    />
                  </td>

                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className={InboundUI.btnPrimary}
                      onClick={() => void handleReceive(r)}
                      disabled={disabled || d.saving || remaining <= 0}
                      title={remaining <= 0 ? "已无剩余应收" : undefined}
                    >
                      {d.saving ? "录入中…" : "录入实收"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={InboundUI.quiet}>说明：前端不推导任何口径；所有数量以 workbench.rows 为准。</div>
    </div>
  );
};
