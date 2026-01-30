// src/features/admin/shipping-providers/scheme/flow/sections/ExplainSection.tsx

import React from "react";
import FlowSectionCard from "../FlowSectionCard";
import { QuotePreviewPanel } from "../../preview/QuotePreviewPanel";

type Props = {
  schemeId: number;
  disabled: boolean;
  onError: (msg: string) => void;
};

export const ExplainSection: React.FC<Props> = (p) => {
  return (
    <FlowSectionCard title="6）算价解释" desc="解释链路：地址 → Zone → 命中重量段 → 附加费 → 总价。">
      <QuotePreviewPanel schemeId={p.schemeId} disabled={p.disabled} onError={p.onError} />
    </FlowSectionCard>
  );
};

export default ExplainSection;
