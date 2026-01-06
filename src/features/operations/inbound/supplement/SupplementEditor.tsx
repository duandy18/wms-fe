// src/features/operations/inbound/supplement/SupplementEditor.tsx

import React from "react";
import type { ReceiveSupplementLine } from "./types";
import { missingLabel } from "./labels";

export const SupplementEditor: React.FC<{
  selected: ReceiveSupplementLine | null;

  editBatch: string;
  editProd: string;
  editExp: string;

  saveMsg: string | null;
  saveErr: string | null;

  onChangeBatch: (v: string) => void;
  onChangeProd: (v: string) => void;
  onChangeExp: (v: string) => void;

  onSave: () => void;
  onSaveAndNext: () => void;
}> = ({
  selected,
  editBatch,
  editProd,
  editExp,
  saveMsg,
  saveErr,
  onChangeBatch,
  onChangeProd,
  onChangeExp,
  onSave,
  onSaveAndNext,
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">补录编辑</h2>
        <span className="text-[11px] text-slate-500">当前仅接入“清单读取”</span>
      </div>

      {!selected ? (
        <div className="text-sm text-slate-600">请先从左侧选择一行。</div>
      ) : (
        <>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
            <div className="font-medium text-slate-800">
              {selected.item_name ?? "（未命名商品）"}
            </div>
            <div>收货任务：#{selected.task_id}</div>
            <div>
              已收：<span className="font-mono">{selected.scanned_qty}</span>
            </div>
            <div className="text-amber-700">
              缺失：{missingLabel(selected.missing_fields).join(" / ")}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">批次</label>
              <input
                className="border rounded-md px-3 py-2 text-sm font-mono"
                value={editBatch}
                onChange={(e) => onChangeBatch(e.target.value)}
                placeholder="例如：BATCH-202601"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">生产日期</label>
                <input
                  type="date"
                  className="border rounded-md px-3 py-2 text-sm"
                  value={editProd}
                  onChange={(e) => onChangeProd(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">到期日期</label>
                <input
                  type="date"
                  className="border rounded-md px-3 py-2 text-sm"
                  value={editExp}
                  onChange={(e) => onChangeExp(e.target.value)}
                />
              </div>
            </div>
          </div>

          {saveErr ? <div className="text-sm text-red-600">{saveErr}</div> : null}
          {saveMsg ? <div className="text-sm text-emerald-700">{saveMsg}</div> : null}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              onClick={onSave}
            >
              保存
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              onClick={onSaveAndNext}
            >
              保存并下一条
            </button>
          </div>
        </>
      )}
    </section>
  );
};
