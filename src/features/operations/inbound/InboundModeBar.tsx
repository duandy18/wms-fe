// src/features/operations/inbound/InboundModeBar.tsx

import React from "react";

type InboundMode = "PO" | "ORDER";

export function InboundModeBar(props: {
  mode: InboundMode;
  onChange: (m: InboundMode) => void;
}) {
  const { mode, onChange } = props;

  return (
    <div className="inline-flex items-center gap-1 text-[11px]">
      <span className="text-slate-500">模式：</span>
      <button
        type="button"
        className={
          "px-2 py-0.5 rounded border " +
          (mode === "PO"
            ? "border-slate-900 text-slate-900 bg-slate-50"
            : "border-slate-300 text-slate-500")
        }
        onClick={() => onChange("PO")}
      >
        采购收货
      </button>
      <button
        type="button"
        className={
          "px-2 py-0.5 rounded border " +
          (mode === "ORDER"
            ? "border-slate-900 text-slate-900 bg-slate-50"
            : "border-slate-300 text-slate-500")
        }
        onClick={() => onChange("ORDER")}
      >
        退货收货
      </button>
    </div>
  );
}
