// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchMetaBar.tsx
import React from "react";
import type { SegmentTemplateOut } from "../../api/types";
import UI from "../ui";

function humanStatus(status: string): string {
  if (status === "draft") return "草稿";
  if (status === "published") return "可应用";
  if (status === "archived") return "已归档";
  return status;
}

export const TemplateWorkbenchMetaBar: React.FC<{
  template: SegmentTemplateOut | null;
  disabled: boolean;
  dirty: boolean;
  onSaveDraft: () => void;

  // ✅ 应用（启用）
  onActivateTemplate: () => void;
}> = ({ template, disabled, dirty, onSaveDraft, onActivateTemplate }) => {
  if (!template) return null;

  const status = String(template.status);
  const isDraft = status === "draft";
  const isPublished = status === "published";
  const isActive = !!template.is_active;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-slate-800">
        <span className="font-semibold">{template.name}</span>
        <span className="ml-2 text-xs text-slate-500">
          文件状态：{humanStatus(status)}
          {isActive ? " · 当前生效" : ""}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isDraft ? (
          <>
            <span className={dirty ? "text-sm font-semibold text-red-700" : "text-sm font-semibold text-emerald-700"}>
              {dirty ? "未保存" : "已保存"}
            </span>

            <button type="button" className={UI.btnNeutralSm} disabled={disabled || !dirty} onClick={onSaveDraft}>
              保存草稿
            </button>

            <div className="text-xs text-slate-500">
              保存后才可应用（系统不会影响当前生效文件）
            </div>
          </>
        ) : null}

        {isPublished && !isActive ? (
          <button type="button" className={UI.btnNeutralSm} disabled={disabled} onClick={onActivateTemplate}>
            应用此重量段文件
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default TemplateWorkbenchMetaBar;
