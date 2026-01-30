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

  onCommitCreate: (name: string, provinces: string[], segmentTemplateId: number | null) => Promise<void>;

  onToggle: (z: PricingSchemeZone) => Promise<void>;

  onReplaceProvinceMembers: (zoneId: number, provinces: string[]) => Promise<void>;

  onPatchZone: (zoneId: number, payload: { segment_template_id?: number | null }) => Promise<void>;

  onChangeBracketAmount?: (bracketId: number, nextAmountJson: unknown) => Promise<void>;
}> = ({ detail, disabled, selectedZoneId, onError, onSelectZone, onCommitCreate, onToggle, onReplaceProvinceMembers, onPatchZone }) => {
  return (
    <div className="space-y-4">
      <ZoneEditorCard
        zones={detail.zones ?? []}
        disabled={!!disabled}
        selectedZoneId={selectedZoneId}
        // ✅ zones tab 不再展示/绑定模板；模板绑定统一在二维工作台完成
        templates={[]}
        templatesLoading={false}
        templatesErr={null}
        onError={onError}
        onSelectZone={onSelectZone}
        onToggle={onToggle}
        onCommitCreate={onCommitCreate}
        onReplaceProvinceMembers={onReplaceProvinceMembers}
        onPatchZone={onPatchZone}
      />
    </div>
  );
};

export default ZonesPanel;
