// src/features/inventory/ledger/components/LedgerHintBanner.tsx
import React from "react";
import type { LedgerHint } from "../types_ui";

type Props = {
  hint: LedgerHint;
  hasHint: boolean;
  onApply: () => void;
  onClear: () => void;
};

export const LedgerHintBanner: React.FC<Props> = ({ hint, hasHint, onApply, onClear }) => {
  if (!hasHint) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px]">
      <div className="flex flex-wrap items-center gap-2 text-slate-700">
        <span className="font-medium">已收到定位条件：</span>

        {hint.item_id ? (
          <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">
            item_id={hint.item_id}
          </span>
        ) : null}

        {hint.item_keyword ? (
          <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">
            item_keyword={hint.item_keyword}
          </span>
        ) : null}

        {hint.warehouse_id ? (
          <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">
            warehouse_id={hint.warehouse_id}
          </span>
        ) : null}

        {hint.batch_code ? (
          <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">
            batch_code={hint.batch_code}
          </span>
        ) : null}

        {hint.reason ? (
          <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">
            reason={hint.reason}
          </span>
        ) : null}

        {hint.ref ? (
          <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">
            ref={hint.ref}
          </span>
        ) : null}

        {hint.trace_id ? (
          <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">
            trace_id={hint.trace_id}
          </span>
        ) : null}

        {hint.time_from || hint.time_to ? (
          <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">
            time={hint.time_from ?? "…"} ~ {hint.time_to ?? "…"}
          </span>
        ) : null}

        <span className="text-slate-500">（不会自动套用到筛选框）</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onApply}
          className="inline-flex h-7 items-center rounded-full bg-slate-900 px-3 text-[12px] font-medium text-white hover:bg-slate-800"
        >
          应用到筛选框
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-7 items-center rounded-full border border-slate-300 bg-white px-3 text-[12px] text-slate-700 hover:bg-slate-100"
        >
          清空定位
        </button>
      </div>
    </div>
  );
};
