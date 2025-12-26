// src/features/admin/shipping-providers/scheme/brackets/SegmentPricingHeader.tsx
//
// 录价主流程 - 顶部标题区（纯展示）

import React from "react";
import type { SchemeDefaultPricingMode } from "../../api/types";
import { PUI } from "./ui";
import { modeLabel } from "./SegmentPricingForm/utils";

export const SegmentPricingHeader: React.FC<{
  schemeMode: SchemeDefaultPricingMode;
}> = ({ schemeMode }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className={PUI.title}>录价（主流程）</div>
      <div className={PUI.metaText}>
        默认口径：<span className="font-mono">{modeLabel(schemeMode)}</span>（作为默认值）
      </div>
    </div>
  );
};

export default SegmentPricingHeader;
