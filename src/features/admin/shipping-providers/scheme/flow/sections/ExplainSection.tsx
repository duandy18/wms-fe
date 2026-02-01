// src/features/admin/shipping-providers/scheme/flow/sections/ExplainSection.tsx

import React from "react";
import FlowSectionCard from "../FlowSectionCard";
import QuoteExplainCard from "../../table/cards/QuoteExplainCard";

type Props = {
  schemeId: number;
  selectedZoneId: number | null;
  disabled: boolean;
  onError: (msg: string) => void;
};

export const ExplainSection: React.FC<Props> = (p) => {
  return (
    <FlowSectionCard title="6）结果校验与算价解释">
      <QuoteExplainCard
        schemeId={p.schemeId}
        disabled={p.disabled}
        onError={p.onError}
      />
    </FlowSectionCard>
  );
};

export default ExplainSection;
