// src/features/admin/shipping-providers/scheme/flow/sections/SegmentsSection.tsx

import React from "react";
import FlowSectionCard from "../FlowSectionCard";
import SegmentsPanel from "../../brackets/SegmentsPanel";
import type { PricingSchemeDetail } from "../../../api"; // 若路径不对，我再按实际类型修

type Props = {
  detail: PricingSchemeDetail;
  disabled: boolean;
  onError: (msg: string) => void;
};

export const SegmentsSection: React.FC<Props> = ({ detail, disabled, onError }) => {
  return (
    <FlowSectionCard
      title="1）重量段方案"
      desc="先创建并启用至少一个重量段模板，后续区域绑定与录价才能成立。"
    >
      <SegmentsPanel detail={detail} disabled={disabled} onError={onError} />
    </FlowSectionCard>
  );
};

export default SegmentsSection;
