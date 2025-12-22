// src/features/admin/shipping-providers/scheme/brackets/BracketRangeFields.tsx
import React from "react";

export const BracketRangeFields: React.FC<{
  disabled?: boolean;
  minKg: string;
  maxKg: string;
  onChangeMin: (v: string) => void;
  onChangeMax: (v: string) => void;
}> = ({ disabled, minKg, maxKg, onChangeMin, onChangeMax }) => {
  return (
    <>
      <div className="flex flex-col">
        <label className="text-sm text-slate-600">min_kg</label>
        <input
          className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
          value={minKg}
          disabled={disabled}
          onChange={(e) => onChangeMin(e.target.value)}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm text-slate-600">max_kg（空=∞）</label>
        <input
          className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
          value={maxKg}
          disabled={disabled}
          onChange={(e) => onChangeMax(e.target.value)}
        />
      </div>
    </>
  );
};
