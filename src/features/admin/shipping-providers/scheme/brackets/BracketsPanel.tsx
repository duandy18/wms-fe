// src/features/admin/shipping-providers/scheme/brackets/BracketsPanel.tsx

import React from "react";
import type { PricingSchemeDetail } from "../../api";

import ZoneSelectCard from "./ZoneSelectCard";
import ZoneEntryCard from "./ZoneEntryCard";
import QuoteMatrixCard from "./QuoteMatrixCard";
import { CopyBracketsCard } from "./CopyBracketsCard";
import { useBracketsPanelModel } from "./useBracketsPanelModel";

export const BracketsPanel: React.FC<{
  detail: PricingSchemeDetail;
  selectedZoneId: number | null;
  onSelectZone: (zoneId: number | null) => void;
}> = ({ detail, selectedZoneId, onSelectZone }) => {
  const vm = useBracketsPanelModel({ detail, selectedZoneId });

  return (
    <div className="space-y-4">
      <ZoneSelectCard
        busy={vm.busy}
        selectableZones={vm.selectableZones}
        selectedZoneId={selectedZoneId}
        selectedZone={vm.selectedZone}
        currentBracketsCount={vm.currentBrackets.length}
        onSelectZone={onSelectZone}
      />

      <ZoneEntryCard
        busy={vm.busy}
        selectedZoneId={selectedZoneId}
        tableRows={vm.tableRows}
        currentDrafts={vm.currentDrafts}
        currentBrackets={vm.currentBrackets}
        onSetDraft={vm.setDraftForCurrentZone}
        onSave={vm.saveCurrentZonePrices}
      />

      <CopyBracketsCard
        schemeId={detail.id}
        zones={vm.zones}
        selectableZones={vm.selectableZones}
        selectedZoneId={selectedZoneId}
        busy={vm.busy}
        onBusy={vm.setBusy}
        onAfterRefreshBrackets={vm.afterRefreshBrackets}
      />

      <QuoteMatrixCard
        busy={vm.busy}
        segments={vm.segments}
        zonesForTable={vm.zonesForTable}
        selectedZoneId={selectedZoneId}
        bracketsByZoneId={vm.bracketsByZoneId}
        draftsByZoneId={vm.draftsByZoneId}
        onUpsertCell={vm.upsertCellPrice}
      />
    </div>
  );
};

export default BracketsPanel;
