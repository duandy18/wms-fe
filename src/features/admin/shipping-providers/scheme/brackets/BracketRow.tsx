// src/features/admin/shipping-providers/scheme/brackets/BracketRow.tsx

import React from "react";
import type { PricingSchemeZoneBracket } from "../../api";
import { confirmDeleteBracketText } from "./bracketActions";

function showRange(minKg: number, maxKg: number | null) {
  return `${minKg} ~ ${maxKg == null ? "∞" : maxKg}`;
}

export const BracketRow: React.FC<{
  b: PricingSchemeZoneBracket;
  disabled?: boolean;
  onToggle: (b: PricingSchemeZoneBracket) => Promise<void>;
  onDelete: (b: PricingSchemeZoneBracket) => Promise<void>;
}> = ({ b, disabled, onToggle, onDelete }) => {
  const handleDelete = () => {
    const ok = window.confirm(
      confirmDeleteBracketText({
        id: b.id,
        minKg: b.min_kg,
        maxKg: b.max_kg ?? null,
        pricingKind: b.pricing_kind,
      }),
    );
    if (!ok) return;
    void onDelete(b);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="text-sm text-slate-700">
        <span className="font-mono">#{b.id}</span>{" "}
        <span className="font-mono">{showRange(b.min_kg, b.max_kg ?? null)}</span>{" "}
        · <span className="font-mono">{b.pricing_kind}</span>{" "}
        ·{" "}
        <span className={`font-semibold ${b.active ? "text-emerald-700" : "text-slate-500"}`}>
          {b.active ? "启用" : "停用"}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60"
          onClick={() => void onToggle(b)}
        >
          {b.active ? "停用" : "启用"}
        </button>

        <button
          type="button"
          disabled={disabled}
          className="inline-flex items-center rounded-xl border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          onClick={handleDelete}
        >
          删除
        </button>
      </div>
    </div>
  );
};
