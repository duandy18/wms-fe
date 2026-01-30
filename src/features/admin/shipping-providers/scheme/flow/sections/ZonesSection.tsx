// src/features/admin/shipping-providers/scheme/flow/sections/ZonesSection.tsx

import React from "react";
import FlowSectionCard from "../FlowSectionCard";
import { ZonesPanel } from "../../zones/ZonesPanel";
import type { PricingSchemeDetail, PricingSchemeZone } from "../../../api";

type Props = {
  detail: PricingSchemeDetail;
  disabled: boolean;
  flowLocked: boolean;
  selectedZoneId: number | null;
  onSelectZone: (zoneId: number) => void;
  onError: (msg: string) => void;

  onCommitCreate: (name: string, provinces: string[], segmentTemplateId: number | null) => Promise<void>;
  onToggle: (z: PricingSchemeZone) => Promise<void>;
  onReplaceProvinceMembers: (zoneId: number, provinces: string[]) => Promise<void>;
  onPatchZone: (zoneId: number, payload: { segment_template_id?: number | null }) => Promise<void>;
};

export const ZonesSection: React.FC<Props> = (p) => {
  return (
    <FlowSectionCard title="2）区域" desc="维护区域范围（省份归属、启停等）。">
      <ZonesPanel
        detail={p.detail}
        disabled={p.disabled || p.flowLocked}
        selectedZoneId={p.selectedZoneId}
        onError={p.onError}
        onSelectZone={p.onSelectZone}
        onCommitCreate={p.onCommitCreate}
        onToggle={p.onToggle}
        onReplaceProvinceMembers={p.onReplaceProvinceMembers}
        onPatchZone={p.onPatchZone}
      />
    </FlowSectionCard>
  );
};

export default ZonesSection;
