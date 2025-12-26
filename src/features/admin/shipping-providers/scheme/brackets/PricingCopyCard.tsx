// src/features/admin/shipping-providers/scheme/brackets/PricingCopyCard.tsx
//
// 复制区域报价（页面级卡片容器）
// - 目的：把“复制逻辑卡片”从 BracketsPanel 编排中进一步拆出去
// - CopyBracketsCard 仍是业务组件，这里只负责标题/说明/页面语义

import React from "react";
import type { PricingSchemeZone } from "../../api";
import { CopyBracketsCard } from "./CopyBracketsCard";
import { PUI } from "./ui";

export const PricingCopyCard: React.FC<{
  schemeId: number;

  zones: PricingSchemeZone[];
  selectableZones: PricingSchemeZone[];

  selectedZoneId: number | null;

  busy: boolean;
  onBusy: (v: boolean) => void;

  onAfterRefreshBrackets: (freshZones: PricingSchemeZone[]) => void;
}> = ({ schemeId, zones, selectableZones, selectedZoneId, busy, onBusy, onAfterRefreshBrackets }) => {
  return (
    <div className={PUI.card}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={PUI.title}>复制区域报价到其他区域</div>
          <div className={PUI.hint}>
            用途：某些区域报价结构相同，只是价格一致/接近时，可先录一个区域，再一键复制到其他区域，最后再少量微调。
          </div>
        </div>
      </div>

      <div className="mt-3">
        <CopyBracketsCard
          schemeId={schemeId}
          zones={zones}
          selectableZones={selectableZones}
          selectedZoneId={selectedZoneId}
          busy={busy}
          onBusy={onBusy}
          onAfterRefreshBrackets={onAfterRefreshBrackets}
        />
      </div>
    </div>
  );
};

export default PricingCopyCard;
