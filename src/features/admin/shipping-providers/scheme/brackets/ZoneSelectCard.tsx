// src/features/admin/shipping-providers/scheme/brackets/ZoneSelectCard.tsx

import React from "react";
import type { PricingSchemeZone } from "../../api";
import { UI } from "../ui";

export const ZoneSelectCard: React.FC<{
  busy: boolean;
  selectableZones: PricingSchemeZone[];
  selectedZoneId: number | null;
  selectedZone: PricingSchemeZone | null;
  currentBracketsCount: number;
  onSelectZone: (zoneId: number | null) => void;
}> = ({ busy, selectableZones, selectedZoneId, selectedZone, currentBracketsCount, onSelectZone }) => {
  return (
    <div className={UI.cardTight}>
      <div className={UI.sectionTitle}>选择区域（Zone）</div>

      <select
        className={`${UI.selectBase} mt-2`}
        value={selectedZoneId ?? ""}
        onChange={(e) => onSelectZone(e.target.value ? Number(e.target.value) : null)}
        disabled={busy}
      >
        <option value="">请选择…</option>
        {selectableZones.map((z) => (
          <option key={z.id} value={z.id}>
            {z.name}
          </option>
        ))}
      </select>

      <div className={`mt-2 ${UI.tinyHelpText}`}>
        {selectedZone ? (
          <span className="font-mono">
            当前编辑：{selectedZone.name} · 已有 brackets：{currentBracketsCount}
          </span>
        ) : (
          <span>先选择一个 Zone，才能填写该区域的报价。</span>
        )}
      </div>
    </div>
  );
};

export default ZoneSelectCard;
