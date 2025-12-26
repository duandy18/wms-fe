// src/features/admin/items/sku-builder/components/SkuBuilderHeader.tsx

import React from "react";
import { UI } from "../ui";

export const SkuBuilderHeader: React.FC<{
  currentSku?: string | null;
}> = ({ currentSku }) => {
  return (
    <div className={UI.headerRow}>
      <h3 className={UI.title}>SKU 生成器（实验版）</h3>
      {currentSku ? (
        <span className={UI.hint11}>
          当前 SKU：<span className={UI.mono}>{currentSku}</span>
        </span>
      ) : null}
    </div>
  );
};

export default SkuBuilderHeader;
