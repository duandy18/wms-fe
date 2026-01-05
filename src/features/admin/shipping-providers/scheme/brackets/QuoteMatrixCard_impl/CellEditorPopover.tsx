// src/features/admin/shipping-providers/scheme/brackets/QuoteMatrixCard/CellEditorPopover.tsx

import React from "react";
import type { RowDraft, CellMode } from "../quoteModel";
import { resetDraftForMode } from "./helpers";

export const CellEditorPopover: React.FC<{
  busy: boolean;
  draft: RowDraft;
  setDraft: React.Dispatch<React.SetStateAction<RowDraft>>;
  onSave: () => void;
  onCancel: () => void;
}> = ({ busy, draft, setDraft, onSave, onCancel }) => {
  const modeValue = draft.mode === "manual" ? "" : draft.mode;

  return (
    <div className="w-[300px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <select
          className="rounded border border-slate-300 px-2 py-1 text-sm"
          value={modeValue}
          disabled={busy}
          onChange={(e) => setDraft((p) => resetDraftForMode(p, e.target.value as CellMode))}
        >
          <option value="" disabled>
            请选择计价方式
          </option>
          <option value="linear_total">票费 + 单价</option>
          <option value="step_over">首重 / 续重</option>
          <option value="flat">固定价</option>
        </select>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
            disabled={busy || draft.mode === "manual"}
            onClick={onSave}
            title="保存"
          >
            ✅
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-60"
            disabled={busy}
            onClick={onCancel}
            title="取消"
          >
            ❌
          </button>
        </div>
      </div>

      <div className="mt-2">
        {draft.mode === "flat" ? (
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm font-mono"
            placeholder="金额"
            value={draft.flatAmount}
            disabled={busy}
            onChange={(e) => setDraft((p) => ({ ...p, flatAmount: e.target.value }))}
          />
        ) : draft.mode === "linear_total" ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">票费</span>
            <input
              className="w-20 rounded border border-slate-300 px-2 py-1 font-mono"
              placeholder="每票"
              value={draft.baseAmount}
              disabled={busy}
              onChange={(e) => setDraft((p) => ({ ...p, baseAmount: e.target.value }))}
            />
            <span className="text-slate-500">单价</span>
            <input
              className="w-20 rounded border border-slate-300 px-2 py-1 font-mono"
              placeholder="元/kg"
              value={draft.ratePerKg}
              disabled={busy}
              onChange={(e) => setDraft((p) => ({ ...p, ratePerKg: e.target.value }))}
            />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">首重</span>
            <input
              className="w-16 rounded border border-slate-300 px-2 py-1 font-mono"
              placeholder="kg"
              value={draft.baseKg}
              disabled={busy}
              onChange={(e) => setDraft((p) => ({ ...p, baseKg: e.target.value }))}
            />
            <span className="text-slate-500">首重费</span>
            <input
              className="w-20 rounded border border-slate-300 px-2 py-1 font-mono"
              placeholder="元"
              value={draft.baseAmount}
              disabled={busy}
              onChange={(e) => setDraft((p) => ({ ...p, baseAmount: e.target.value }))}
            />
            <span className="text-slate-500">续重单价</span>
            <input
              className="w-20 rounded border border-slate-300 px-2 py-1 font-mono"
              placeholder="元/kg"
              value={draft.ratePerKg}
              disabled={busy}
              onChange={(e) => setDraft((p) => ({ ...p, ratePerKg: e.target.value }))}
            />
          </div>
        )}
      </div>
    </div>
  );
};
