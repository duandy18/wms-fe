// src/features/admin/shipping-providers/scheme/brackets/BracketRoundingParams.tsx
import React from "react";
import type { RoundingMode } from "./bracketCreateTypes";

export const BracketRoundingParams: React.FC<{
  disabled?: boolean;
  roundingMode: RoundingMode;
  roundingStepKg: string;
  onChangeMode: (m: RoundingMode) => void;
  onChangeStep: (v: string) => void;
}> = ({ disabled, roundingMode, roundingStepKg, onChangeMode, onChangeStep }) => {
  return (
    <>
      <div className="flex flex-col md:col-span-2">
        <label className="text-sm text-slate-600">rounding_mode</label>
        <select
          className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
          value={roundingMode}
          disabled={disabled}
          onChange={(e) => onChangeMode(e.target.value as RoundingMode)}
        >
          <option value="ceil">ceil（向上取整）</option>
          <option value="floor">floor（向下取整）</option>
          <option value="round">round（四舍五入）</option>
        </select>
      </div>

      <div className="flex flex-col md:col-span-2">
        <label className="text-sm text-slate-600">rounding_step_kg</label>
        <input
          className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
          value={roundingStepKg}
          disabled={disabled}
          onChange={(e) => onChangeStep(e.target.value)}
        />
      </div>

      <div className="md:col-span-2" />
    </>
  );
};
