// src/features/admin/items/SkuBuilderPanel.tsx
//
// SKU 生成器 v2（独立小面板）
//
// 目标：
// - 减少脑力消耗：品牌/物种/口味/重量/单位/序号分栏选择
// - 实时预览 SKU
// - 记住上次选择（localStorage）
// - 应用后自动递增序号（B01 -> B02）
//
// 用法示例（在 ItemsFormSection 里）：
// <SkuBuilderPanel
//   currentSku={form.sku}
//   onApplySku={(sku) => setForm((f) => ({ ...f, sku }))}
// />

import React from "react";
import type { Props } from "./sku-builder/types";
import { UI } from "./sku-builder/ui";
import { useSkuBuilderState } from "./sku-builder/hooks/useSkuBuilderState";

import SkuBuilderHeader from "./sku-builder/components/SkuBuilderHeader";
import SkuBuilderFields from "./sku-builder/components/SkuBuilderFields";
import SkuBuilderPreview from "./sku-builder/components/SkuBuilderPreview";
import SkuBuilderActions from "./sku-builder/components/SkuBuilderActions";

export const SkuBuilderPanel: React.FC<Props> = ({ currentSku, onApplySku }) => {
  const vm = useSkuBuilderState();

  return (
    <section className={UI.card}>
      <SkuBuilderHeader currentSku={currentSku} />

      <p className={UI.hint11}>
        按「品牌 / 物种 / 口味 / 重量 / 单位 / 序号」拼出规范 SKU，自动记住上次选择。适合猫粮这类标准化商品。
      </p>

      <SkuBuilderFields state={vm.state} onChange={vm.patch} />

      <SkuBuilderPreview preview={vm.preview} />

      <SkuBuilderActions
        canApply={vm.canApply}
        onApply={() => vm.apply(onApplySku)}
        onApplyAndNext={() => vm.applyAndNext(onApplySku)}
      />
    </section>
  );
};

export default SkuBuilderPanel;
