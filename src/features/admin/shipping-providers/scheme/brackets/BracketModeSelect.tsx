// src/features/admin/shipping-providers/scheme/brackets/BracketModeSelect.tsx
import React from "react";
import type { PricingMode } from "./bracketCreateTypes";

export const BracketModeSelect: React.FC<{
  disabled?: boolean;
  mode: PricingMode;
  onChange: (mode: PricingMode) => void;
}> = ({ disabled, mode, onChange }) => {
  return (
    <div className="flex flex-col md:col-span-2">
      <label className="text-sm text-slate-600">计价方式</label>
      <select
        className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
        value={mode}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as PricingMode)}
      >
        <option value="linear_total">票费 + 元/kg</option>
        <option value="step_over">首重 + 续重</option>
        <option value="flat">固定价</option>
        <option value="manual_quote">人工报价</option>
      </select>
    </div>
  );
};
