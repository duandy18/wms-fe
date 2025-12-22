// src/features/admin/shipping-providers/scheme/brackets/BracketList.tsx

import React, { useMemo } from "react";
import type { PricingSchemeZoneBracket } from "../../api";

function label(b: PricingSchemeZoneBracket): string {
  if (b.max_kg == null) return `${b.min_kg}kg+`;
  return `${b.min_kg}–${b.max_kg}kg`;
}

export const BracketList: React.FC<{
  list: PricingSchemeZoneBracket[];
  disabled?: boolean;
  onToggle: (b: PricingSchemeZoneBracket) => Promise<void>;
  onDelete: (b: PricingSchemeZoneBracket) => Promise<void>;
}> = ({ list, disabled, onToggle, onDelete }) => {
  const sorted = useMemo(
    () => [...list].sort((a, b) => a.min_kg - b.min_kg),
    [list],
  );

  if (!sorted.length) {
    return <div className="text-sm text-slate-500">暂无重量分段</div>;
  }

  return (
    <div className="flex gap-3 overflow-x-auto">
      {sorted.map((b) => (
        <div
          key={b.id}
          className="min-w-[180px] rounded-xl border border-slate-200 bg-white p-3"
        >
          <div className="text-sm font-mono">{label(b)}</div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              disabled={disabled}
              className="text-xs text-slate-600 hover:underline"
              onClick={() => void onToggle(b)}
            >
              启停
            </button>
            <button
              type="button"
              disabled={disabled}
              className="text-xs text-red-600 hover:underline"
              onClick={() => void onDelete(b)}
            >
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
