// src/features/admin/shipping-providers/scheme/flow/sections/PricingSection.tsx

import React from "react";
import FlowSectionCard from "../FlowSectionCard";
import { PricingTableWorkbenchPanel } from "../../table/PricingTableWorkbenchPanel";
import type { PricingSchemeDetail, PricingSchemeZone } from "../../../api";

type Props = {
  detail: PricingSchemeDetail;
  disabled: boolean;
  flowLocked: boolean;

  selectedZoneId: number | null;
  onSelectZone: (zoneId: number) => void;
  onError: (msg: string) => void;

  onToggleZone: (z: PricingSchemeZone) => Promise<void>;
  onPatchZoneTemplate: (zoneId: number, templateId: number) => Promise<void>;

  // ✅ 解除绑定：segment_template_id -> null
  onUnbindZoneTemplate: (zoneId: number) => Promise<void>;

  onGoZonesTab: () => void;
  onGoSegmentsTab: () => void;
};

export const PricingSection: React.FC<Props> = (p) => {
  return (
    <FlowSectionCard
      title="3）区域绑定重量段 + 4）二维价格表格"
      desc="绑定在二维价格表中完成：先选 Zone，再为该 Zone 显式绑定一个启用中的重量段模板，然后录价。"
    >
      <PricingTableWorkbenchPanel
        detail={p.detail}
        disabled={p.disabled || p.flowLocked}
        selectedZoneId={p.selectedZoneId}
        onSelectZone={p.onSelectZone}
        onError={p.onError}
        onToggleZone={p.onToggleZone}
        onPatchZoneTemplate={p.onPatchZoneTemplate}
        onUnbindZoneTemplate={p.onUnbindZoneTemplate}
        onGoZonesTab={p.onGoZonesTab}
        onGoSegmentsTab={p.onGoSegmentsTab}
      />
    </FlowSectionCard>
  );
};

export default PricingSection;
