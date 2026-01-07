// src/features/operations/ship/internal-outbound/components/InternalOutboundLinesSection.tsx

import React from "react";
import type { InternalOutboundDoc, StockHint } from "../types";

export const InternalOutboundLinesSection: React.FC<{
  doc: InternalOutboundDoc;
  disabled: boolean;

  itemIdInput: string;
  onItemIdInputChange: (v: string) => void;
  onItemIdBlur: React.FocusEventHandler<HTMLInputElement>;

  selectedItemName: string;

  qtyInput: string;
  onQtyInputChange: (v: string) => void;

  batchCodeInput: string;
  onBatchCodeInputChange: (v: string) => void;

  uomInput: string;
  onUomInputChange: (v: string) => void;

  lineNoteInput: string;
  onLineNoteInputChange: (v: string) => void;

  stockHint: StockHint;

  onOpenItemSelector: () => void;
  onAddLine: () => void;
  onConfirm: () => void;
}> = ({
  doc,
  disabled,
  itemIdInput,
  onItemIdInputChange,
  onItemIdBlur,
  selectedItemName,
  qtyInput,
  onQtyInputChange,
  batchCodeInput,
  onBatchCodeInputChange,
  uomInput,
  onUomInputChange,
  lineNoteInput,
  onLineNoteInputChange,
  stockHint,
  onOpenItemSelector,
  onAddLine,
  onConfirm,
}) => {
  return (
    <section className="space-y-3 rounded-xl border bg-white p-4 text-sm">
      <h2 className="text-base font-semibold">明细行</h2>

      <div className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
        <div className="grid gap-3 md:grid-cols-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">Item ID</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={itemIdInput}
              onChange={(event) => onItemIdInputChange(event.target.value)}
              onBlur={onItemIdBlur}
              disabled={disabled}
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs text-slate-600">已选商品名称</label>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-lg border px-3 py-2 text-xs"
                value={selectedItemName}
                readOnly
                placeholder="尚未选择商品"
              />
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs hover:bg-slate-100 disabled:opacity-60"
                onClick={onOpenItemSelector}
                disabled={disabled}
              >
                选择商品
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">数量</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={qtyInput}
              onChange={(event) => onQtyInputChange(event.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">批次（空 = FEFO）</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={batchCodeInput}
              onChange={(event) => onBatchCodeInputChange(event.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">单位</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={uomInput}
              onChange={(event) => onUomInputChange(event.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">行备注</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={lineNoteInput}
              onChange={(event) => onLineNoteInputChange(event.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">可用库存提示</label>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              {stockHint.loading ? (
                <span>查询中…</span>
              ) : stockHint.qty == null ? (
                <span className="text-slate-400">暂无可用库存信息（请确保选中仓库 + 商品）</span>
              ) : (
                <span>
                  估算可用数量：
                  <span className="font-mono text-slate-900">{stockHint.qty}</span>
                  {stockHint.batches != null && (
                    <span className="ml-2 text-slate-500">批次数：{stockHint.batches}</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-60"
            onClick={onAddLine}
            disabled={disabled}
          >
            添加 / 累加行
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border">
        {!doc.lines || doc.lines.length === 0 ? (
          <div className="px-3 py-4 text-xs text-slate-500">暂无明细，请先添加行。</div>
        ) : (
          <table className="min-w-full text-xs">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-2 py-1 text-left">行号</th>
                <th className="px-2 py-1 text-left">Item ID</th>
                <th className="px-2 py-1 text-left">批次</th>
                <th className="px-2 py-1 text-right">数量</th>
                <th className="px-2 py-1 text-left">单位</th>
                <th className="px-2 py-1 text-left">备注</th>
              </tr>
            </thead>
            <tbody>
              {doc.lines.map((ln) => (
                <tr key={ln.id} className="border-b hover:bg-slate-50">
                  <td className="px-2 py-1">{ln.line_no}</td>
                  <td className="px-2 py-1">{ln.item_id}</td>
                  <td className="px-2 py-1">
                    {ln.batch_code || <span className="text-slate-400">[FEFO]</span>}
                  </td>
                  <td className="px-2 py-1 text-right">{ln.requested_qty}</td>
                  <td className="px-2 py-1">{ln.uom || "-"}</td>
                  <td className="px-2 py-1">{ln.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-end pt-3">
        <button
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
          onClick={onConfirm}
          disabled={disabled || doc.status !== "DRAFT"}
        >
          确认出库
        </button>
      </div>
    </section>
  );
};
