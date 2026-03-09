// src/features/admin/shipping-providers/scheme/flow/sections/PricingSection.tsx

import React from "react";
import FlowSectionCard from "../FlowSectionCard";
import type { PricingSchemeDetail } from "../../../api";
import PricingWorkbenchPanel from "../../workbench/PricingWorkbenchPanel";

type Props = {
  detail: PricingSchemeDetail;
  disabled: boolean;
  onError: (msg: string) => void;
};

export const PricingSection: React.FC<Props> = (p) => {
  const readOnly = p.disabled || p.detail.status !== "draft";

  return (
    <FlowSectionCard
      title="1）运价编辑工作台"
      desc="按真实业务顺序编辑：重量段 → 区域范围 → 价格矩阵 → 附加费。算价与解释作为第 5 张卡由页面下方承接。"
    >
      <PricingWorkbenchPanel detail={p.detail} disabled={readOnly} onError={p.onError} />
    </FlowSectionCard>
  );
};

export default PricingSection;
