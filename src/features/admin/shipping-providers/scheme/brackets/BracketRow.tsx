// src/features/admin/shipping-providers/scheme/brackets/BracketRow.tsx

import React from "react";
import type { PricingSchemeZoneBracket } from "../../api";
import { confirmDeleteBracketText } from "./bracketActions";
import { UI } from "../ui";

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
        pricingKind: b.pricing_mode,
      }),
    );
    if (!ok) return;
    void onDelete(b);
  };

  return (
    <div className={UI.bracketRowWrap}>
      <div className={UI.bracketRowText}>
        <span className="font-mono">#{b.id}</span>{" "}
        <span className="font-mono">{showRange(b.min_kg, b.max_kg ?? null)}</span>{" "}
        · <span className="font-mono">{b.pricing_mode}</span>{" "}
        ·{" "}
        <span className={b.active ? UI.bracketActive : UI.bracketInactive}>
          {b.active ? "启用" : "停用"}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          className={UI.btnNeutralSm}
          onClick={() => void onToggle(b)}
        >
          {b.active ? "停用" : "启用"}
        </button>

        <button
          type="button"
          disabled={disabled}
          className={UI.btnDangerSm}
          onClick={handleDelete}
        >
          删除
        </button>
      </div>
    </div>
  );
};
