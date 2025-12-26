// src/features/admin/shipping-providers/scheme/brackets/PricingRuleEditorHeader.tsx
//
// PricingRuleEditor 头部：标题/提示 + 编辑/保存按钮

import React from "react";
import { PUI } from "./ui";

export const PricingRuleEditorHeader: React.FC<{
  editing: boolean;
  saving?: boolean;
  canSave: boolean;
  hasInfinityInMiddle: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
}> = ({ editing, saving, canSave, hasInfinityInMiddle, onToggleEdit, onSave }) => {
  return (
    <div className={PUI.headerRow}>
      <div>
        <div className={PUI.segmentsTitle}>重量分段</div>
        <div className={PUI.segmentsHint}>
          口径：左开右闭（min&lt;w≤max），并且分段必须连续。默认锁定，避免误改；需要调整请先点“编辑”。
        </div>
      </div>

      <div className={PUI.workbenchHeaderActions}>
        <button
          type="button"
          className={editing ? PUI.zoneEntryBtnNeutral : PUI.zoneEntryBtnEdit}
          onClick={onToggleEdit}
          title={editing ? "退出编辑（不保存）" : "进入编辑（允许改动表头）"}
          disabled={!!saving}
        >
          {editing ? "退出编辑" : "编辑"}
        </button>

        <button
          type="button"
          disabled={!editing || !canSave || !!saving || hasInfinityInMiddle}
          className={editing && canSave && !saving && !hasInfinityInMiddle ? PUI.zoneEntryBtnSave : PUI.zoneEntryBtnSaveDisabled}
          onClick={onSave}
          title={
            !editing
              ? "先点“编辑”再保存"
              : hasInfinityInMiddle
                ? "无上限（∞）分段后不允许再有后续分段"
                : "保存并锁定（写回后端）"
          }
        >
          {saving ? "保存中…" : "保存"}
        </button>
      </div>
    </div>
  );
};

export default PricingRuleEditorHeader;
