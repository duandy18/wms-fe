// src/features/admin/items/sku-builder/components/SkuBuilderActions.tsx

import React from "react";
import { UI } from "../ui";

export const SkuBuilderActions: React.FC<{
  canApply: boolean;
  onApply: () => void;
  onApplyAndNext: () => void;
}> = ({ canApply, onApply, onApplyAndNext }) => {
  return (
    <div className={UI.actionsRow}>
      <button
        type="button"
        disabled={!canApply}
        onClick={onApply}
        className={`${UI.btnBase} ${canApply ? UI.btnPrimaryOn : UI.btnPrimaryOff}`}
      >
        应用到当前商品
      </button>

      <button
        type="button"
        disabled={!canApply}
        onClick={onApplyAndNext}
        className={`${UI.btnBase} ${canApply ? UI.btnSecondOn : UI.btnSecondOff}`}
      >
        应用并递增序号
      </button>

      <span className={UI.hint11Muted}>适合批量录入同一品牌/物种/系列的多个规格，只需修改重量和序号。</span>
    </div>
  );
};

export default SkuBuilderActions;
