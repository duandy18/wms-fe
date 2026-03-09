// src/features/admin/shipping-providers/scheme/zones/ZonesPanel.tsx

import React from "react";
import type { PricingSchemeDetail, PricingSchemeZone } from "../../api";

import ZoneEditorCard from "./ZoneEditorCard";

export const ZonesPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;
  selectedZoneId: number | null;

  onError: (msg: string) => void;
  onSelectZone: (zoneId: number) => void;

  onCommitCreate: (name: string, provinces: string[]) => Promise<void>;

  onToggle: (z: PricingSchemeZone) => Promise<void>;

  onReplaceProvinceMembers: (zoneId: number, provinces: string[]) => Promise<void>;

  onChangeBracketAmount?: (bracketId: number, nextAmountJson: unknown) => Promise<void>;
}> = ({ detail, disabled, selectedZoneId, onError, onSelectZone, onCommitCreate, onToggle, onReplaceProvinceMembers }) => {
  return (
    <div className="space-y-4">
      <ZoneEditorCard
        zones={detail.zones ?? []}
        disabled={!!disabled}
        selectedZoneId={selectedZoneId}
        onError={onError}
        onSelectZone={onSelectZone}
        onToggle={onToggle}
        onCommitCreate={onCommitCreate}
        onReplaceProvinceMembers={onReplaceProvinceMembers}
      />
    </div>
  );
};

export default ZonesPanel;
