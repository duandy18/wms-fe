// src/features/wms/inbound/components/InboundModeSelector.tsx

import React from "react";
import type { InboundMode } from "../types";

const OPTIONS: Array<{ value: InboundMode; label: string }> = [
  { value: "PURCHASE", label: "采购入库" },
  { value: "RETURN", label: "退货入库" },
  { value: "OTHER", label: "其他入库" },
];

export interface InboundModeSelectorProps {
  value: InboundMode;
  onChange: (value: InboundMode) => void;
}

export const InboundModeSelector: React.FC<InboundModeSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      {OPTIONS.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "rounded-full border px-4 py-2 text-sm transition",
              active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default InboundModeSelector;
