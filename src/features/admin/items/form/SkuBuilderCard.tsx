// src/features/admin/items/form/SkuBuilderCard.tsx

import React from "react";
import { UI } from "./ui";
import type { SkuParts } from "./types";
import { CATEGORY_OPTIONS, TARGET_OPTIONS, BRAND_OPTIONS } from "./types";

export const SkuBuilderCard: React.FC<{
  skuParts: SkuParts;
  skuPrefix: string;
  previewSku: string;
  skuConflict: boolean;

  onChange: <K extends keyof SkuParts>(field: K, value: SkuParts[K]) => void;
  onBuildSku: () => void;
}> = ({ skuParts, skuPrefix, previewSku, skuConflict, onChange, onBuildSku }) => {
  return (
    <div className={`${UI.card} text-sm`}>
      <h2 className={UI.h2}>SKU 生成器</h2>

      {/* 分类 + 对象 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={UI.label}>分类代码(2)</label>
          <select className={UI.inputSm} value={skuParts.category} onChange={(e) => onChange("category", e.target.value.toUpperCase())}>
            <option value="">请选择或自填</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            className={`${UI.inputSmMono} mt-1`}
            value={skuParts.category}
            onChange={(e) => onChange("category", e.target.value.toUpperCase())}
            placeholder="自定义分类代码，如 KF / GT"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={UI.label}>对象代码(1)</label>
          <select className={UI.inputSm} value={skuParts.target} onChange={(e) => onChange("target", e.target.value.toUpperCase())}>
            <option value="">请选择或自填</option>
            {TARGET_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            className={`${UI.inputSmMono} mt-1`}
            value={skuParts.target}
            onChange={(e) => onChange("target", e.target.value.toUpperCase())}
            placeholder="自定义对象代码，如 C / G / T"
          />
        </div>
      </div>

      {/* 品牌 + 规格编码 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={UI.label}>品牌代码(2)</label>
          <select className={UI.inputSm} value={skuParts.brand} onChange={(e) => onChange("brand", e.target.value.toUpperCase())}>
            <option value="">请选择或自填</option>
            {BRAND_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            className={`${UI.inputSmMono} mt-1`}
            value={skuParts.brand}
            onChange={(e) => onChange("brand", e.target.value.toUpperCase())}
            placeholder="自定义品牌代码，如 WP / RC"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={UI.label}>规格+口味编码(3+)</label>
          <input
            className={UI.inputSmMono}
            value={skuParts.specCode}
            onChange={(e) => onChange("specCode", e.target.value.toUpperCase())}
            placeholder="如 2KG / CH2 / FD1 / 2KG-CH1"
          />
        </div>
      </div>

      {/* 序号 + 按钮 */}
      <div className="grid grid-cols-[1.5fr_auto] items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className={UI.label}>序号(3，自填 / 自动递增)</label>
          <input
            className={UI.inputSmMono}
            value={skuParts.serial}
            onChange={(e) => onChange("serial", e.target.value.replace(/\s+/g, ""))}
            placeholder="001 / 010 / 101"
          />

          {skuPrefix ? (
            <span className={UI.hint}>
              前缀：<span className={UI.pill}>{skuPrefix}</span>
            </span>
          ) : null}

          {previewSku ? (
            <span className={UI.hint}>
              预览 SKU：<span className={UI.pill}>{previewSku}</span>
            </span>
          ) : null}

          {skuConflict && previewSku ? <span className="text-[11px] text-red-600">SKU {previewSku} 已存在，请调整序号。</span> : null}
        </div>

        <button type="button" onClick={onBuildSku} className={UI.btnNeutral}>
          使用当前编码生成 SKU
        </button>
      </div>
    </div>
  );
};

export default SkuBuilderCard;
