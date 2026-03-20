// src/features/tms/pricingTemplates/workbench/flow/sections/PricingSection.tsx

import React from "react";
import FlowSectionCard from "../FlowSectionCard";
import type { PricingSchemeDetail } from "../../../../providers/api/types";
import PricingWorkbenchPanel from "../../PricingWorkbenchPanel";

type Props = {
  detail: PricingSchemeDetail;
  disabled: boolean;
  onError: (msg: string) => void;
};

const PricingSection: React.FC<Props> = ({ detail, disabled, onError }) => {
  return (
    <FlowSectionCard
      title="运价编辑"
      hint="按模块维护重量段、区域范围、价格矩阵与附加费。当前所有编辑以后端已保存数据为基准。"
    >
      <PricingWorkbenchPanel
        detail={detail}
        disabled={disabled}
        onError={onError}
      />
    </FlowSectionCard>
  );
};

export default PricingSection;
