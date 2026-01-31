// src/features/admin/shipping-providers/scheme/flow/sections/SurchargesSection.tsx

import React from "react";
import FlowSectionCard from "../FlowSectionCard";
import { SurchargesPanel } from "../../surcharges/SurchargesPanel";
import type { PricingSchemeDetail, PricingSchemeSurcharge } from "../../../api";

type Props = {
  detail: PricingSchemeDetail;
  disabled: boolean;
  onError: (msg: string) => void;

  onCreate: (payload: { name: string; condition_json: Record<string, unknown>; amount_json: Record<string, unknown> }) => Promise<void>;
  onPatch: (
    surchargeId: number,
    payload: Partial<{ name: string; condition_json: Record<string, unknown>; amount_json: Record<string, unknown>; active: boolean }>,
  ) => Promise<void>;

  onToggle: (s: PricingSchemeSurcharge) => Promise<void>;
  onDelete: (s: PricingSchemeSurcharge) => Promise<void>;
};

export const SurchargesSection: React.FC<Props> = (p) => {
  return (
    <FlowSectionCard title="6）附加费" desc="规则附加费：用于 flag / 规则型修正项。目的地附加费已迁移到上一节（结构化事实）。">
      <SurchargesPanel
        detail={p.detail}
        disabled={p.disabled}
        onError={p.onError}
        onCreate={p.onCreate}
        onPatch={p.onPatch}
        onToggle={p.onToggle}
        onDelete={p.onDelete}
      />
    </FlowSectionCard>
  );
};

export default SurchargesSection;
