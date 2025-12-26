// src/features/admin/shipping-providers/scheme/brackets/PricingAuditTableCard.tsx
//
// 最底部：快递公司报价表（核对 + 补录）
// - 主录价完成后，用于核对全局报价
// - 允许少量补录/修正

import React from "react";
import type { PricingSchemeZone, PricingSchemeZoneBracket } from "../../api";
import type { SchemeDefaultPricingMode } from "../../api/types";
import type { WeightSegment } from "./PricingRuleEditor";
import type { RowDraft } from "./quoteModel";

import QuoteMatrixCard from "./QuoteMatrixCard";
import { PUI } from "./ui";

export const PricingAuditTableCard: React.FC<{
  busy: boolean;
  schemeMode: SchemeDefaultPricingMode;

  segments: WeightSegment[];
  hasSegments: boolean;

  zonesForTable: PricingSchemeZone[];
  selectedZoneId: number | null;

  bracketsByZoneId: Record<number, PricingSchemeZoneBracket[]>;
  draftsByZoneId: Record<number, Record<string, RowDraft>>;

  onUpsertCell: (args: { zoneId: number; min: number; max: number | null; draft: RowDraft }) => Promise<void>;
}> = ({
  busy,
  schemeMode,
  segments,
  hasSegments,
  zonesForTable,
  selectedZoneId,
  bracketsByZoneId,
  draftsByZoneId,
  onUpsertCell,
}) => {
  return (
    <div className={PUI.card}>
      <div className="flex items-center justify-between gap-3">
        <div className={PUI.title}>快递公司报价表（核对与补录）</div>
        <div className={PUI.hint}>用于核对全局报价、少量补录与修正（主录价请用上方“主流程”）。</div>
      </div>

      <div className="mt-3">
        <QuoteMatrixCard
          busy={busy}
          schemeMode={schemeMode}
          segments={segments}
          zonesForTable={zonesForTable}
          selectedZoneId={selectedZoneId}
          bracketsByZoneId={bracketsByZoneId}
          draftsByZoneId={draftsByZoneId}
          onUpsertCell={onUpsertCell}
          disabled={!hasSegments}
        />
      </div>
    </div>
  );
};

export default PricingAuditTableCard;
