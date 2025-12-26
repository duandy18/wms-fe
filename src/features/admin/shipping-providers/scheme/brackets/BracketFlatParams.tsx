// src/features/admin/shipping-providers/scheme/brackets/BracketFlatParams.tsx
import React from "react";

export const BracketFlatParams: React.FC<{
  disabled?: boolean;
  flatAmount: string;
  onChange: (v: string) => void;
}> = ({ disabled, flatAmount, onChange }) => {
  return (
    <>
      <div className="flex flex-col md:col-span-2">
        <label className="text-sm text-slate-600">固定价金额（flat_amount）</label>
        <input
          className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
          value={flatAmount}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="md:col-span-4" />
    </>
  );
};
