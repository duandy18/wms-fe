// src/features/admin/shipping-providers/scheme/brackets/SegmentPricingBlockingTips.tsx
//
// 录价主流程 - 阻断提示（纯展示）

import React from "react";
import { PUI } from "./ui";

export const SegmentPricingBlockingTips: React.FC<{
  tips: string[];
}> = ({ tips }) => {
  if (!tips.length) return null;

  return (
    <div className={PUI.warnBox}>
      <div className="font-semibold">录价前需要先完成：</div>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        {tips.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
};

export default SegmentPricingBlockingTips;
