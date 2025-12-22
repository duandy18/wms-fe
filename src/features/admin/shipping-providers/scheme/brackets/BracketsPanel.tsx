// src/features/admin/shipping-providers/scheme/brackets/BracketsPanel.tsx

import React from "react";
import type { PricingSchemeDetail } from "../../api";

import PricingRuleEditor from "./PricingRuleEditor";

import IntroCard from "./IntroCard";
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
      <IntroCard />

      {/* ✅ 这里会自动回显你以前保存的重量区间模板 */}
      <PricingRuleEditor schemeId={detail.id} value={vm.segments} onChange={vm.setSegments} />

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
        onSetDraft={vm.setDraftForCurrentZone}
        onSave={vm.saveCurrentZonePrices}
      />

      {/* ✅ 复制：放到录价之后，更符合人类流程 */}
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
