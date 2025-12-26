// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchMetaBar.tsx
import React from "react";
import type { SegmentTemplateOut } from "../../api/types";
import UI from "../ui";

export const TemplateWorkbenchMetaBar: React.FC<{
  template: SegmentTemplateOut | null;
  disabled: boolean;
  dirty: boolean;

  onSaveDraft: () => void;
  onActivateTemplate: () => void;
}> = ({ template, disabled, dirty, onSaveDraft, onActivateTemplate }) => {
  if (!template) return null;

  function handleActivateClick() {
    if (disabled) return;
    if (dirty) {
      window.alert("请先保存方案。");
      return;
    }
    onActivateTemplate();
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className={dirty ? "text-sm font-semibold text-red-700" : "text-sm font-semibold text-emerald-700"}>
        {dirty ? "未保存" : "已保存"}
      </span>

      <button type="button" className={UI.btnNeutralSm} disabled={disabled || !dirty} onClick={onSaveDraft}>
        保存方案
      </button>

      <button type="button" className={UI.btnNeutralSm} disabled={disabled} onClick={handleActivateClick}>
        启用
      </button>
    </div>
  );
};

export default TemplateWorkbenchMetaBar;
