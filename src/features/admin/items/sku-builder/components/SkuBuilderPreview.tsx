// src/features/admin/items/sku-builder/components/SkuBuilderPreview.tsx

import React from "react";
import { UI } from "../ui";

export const SkuBuilderPreview: React.FC<{
  preview: string;
}> = ({ preview }) => {
  return (
    <div className={UI.previewBox}>
      <div className={UI.previewRow}>
        <span className={UI.previewLabel}>预览 SKU：</span>
        {preview ? (
          <span className={UI.previewValue}>{preview}</span>
        ) : (
          <span className={UI.hint11Muted}>请先填写品牌 / 物种 / 口味 / 重量 / 序号中的至少一项。</span>
        )}
      </div>
    </div>
  );
};

export default SkuBuilderPreview;
