// src/features/admin/shipping-providers/components/SchemesCreateCard.tsx

import React from "react";
import { UI } from "../ui";
import type { SchemeDefaultPricingMode } from "../api/types";
import { CUI } from "./ui";

export const SchemesCreateCard: React.FC<{
  newSchemeName: string;
  newSchemePriority: string;
  newSchemeCurrency: string;
  newSchemeSaving: boolean;

  newSchemeDefaultMode: SchemeDefaultPricingMode;
  onChangeDefaultMode: (v: SchemeDefaultPricingMode) => void;

  onChangeName: (v: string) => void;
  onChangePriority: (v: string) => void;
  onChangeCurrency: (v: string) => void;

  onCreateScheme: () => void;
}> = ({
  newSchemeName,
  newSchemePriority,
  newSchemeCurrency,
  newSchemeSaving,
  // 保留但不在 Admin 中暴露（默认口径已下沉到 Workbench / 系统侧）
  newSchemeDefaultMode,
  onChangeDefaultMode,
  onChangeName,
  onChangePriority,
  onChangeCurrency,
  onCreateScheme,
}) => {
  // 明确声明：这是刻意不在 Admin 展示的字段，避免 lint unused
  void newSchemeDefaultMode;
  void onChangeDefaultMode;

  return (
    <div className={CUI.subCard}>
      <div className={CUI.subTitle}>录入运费价格表</div>

      <div className={CUI.grid5}>
        {/* 运费表名称：语义字段，横向占两列 */}
        <div className={`${CUI.fieldCol} md:col-span-2`}>
          <label className={CUI.label}>运费表名称（可选）</label>
          <input
            className={CUI.input}
            value={newSchemeName}
            placeholder="例如：2025年1月运费 / 春节前调价"
            onChange={(e) => onChangeName(e.target.value)}
          />
          <div className="mt-1 text-xs text-slate-500">
            仅用于区分和对账，不影响运费计算
          </div>
        </div>

        <div className={CUI.fieldCol}>
          <label className={CUI.label}>优先级</label>
          <input
            className={CUI.inputMono}
            value={newSchemePriority}
            onChange={(e) => onChangePriority(e.target.value)}
          />
        </div>

        <div className={CUI.fieldCol}>
          <label className={CUI.label}>币种</label>
          <input
            className={CUI.inputMono}
            value={newSchemeCurrency}
            onChange={(e) => onChangeCurrency(e.target.value)}
          />
        </div>

        <div className={CUI.createBtnCol}>
          <button
            type="button"
            className={UI.btnPrimaryGreen}
            disabled={newSchemeSaving}
            onClick={onCreateScheme}
          >
            {newSchemeSaving ? "录入中…" : "录入"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemesCreateCard;
