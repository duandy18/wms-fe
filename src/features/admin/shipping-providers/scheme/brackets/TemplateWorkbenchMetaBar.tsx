// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchMetaBar.tsx
//
// 方案状态栏（保存 / 启用）
//
// 语义收敛：
// - “保存方案” = 保存草稿（不影响线上）
// - “启用为当前生效” = 替换线上生效方案（整体切换）
//
// ✅ 关键引导：
// - 非 draft（已发布/已生效）不允许直接编辑 → “复制为草稿”再改
//
// ⚠️ 明确区分“编辑行为”和“线上事实变更”，避免误操作

import React from "react";
import type { SegmentTemplateOut } from "./segmentTemplates";
import { UI } from "../ui";

export const TemplateWorkbenchMetaBar: React.FC<{
  template: SegmentTemplateOut | null;
  disabled: boolean;
  dirty: boolean;

  onSaveDraft: () => void;
  onActivateTemplate: () => void;

  // ✅ 新增：复制为草稿（从已发布/生效复制出草稿再编辑）
  onCloneToDraft: () => void;
}> = ({ template, disabled, dirty, onSaveDraft, onActivateTemplate, onCloneToDraft }) => {
  if (!template) return null;

  const st = String(template.status ?? "");
  const isDraft = st === "draft";
  const isActive = !!template.is_active;

  function handleActivateClick() {
    if (disabled) return;
    if (dirty) {
      window.alert("当前方案有未保存的修改，请先保存方案，再启用为当前生效。");
      return;
    }
    if (isActive) return;
    onActivateTemplate();
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className={dirty ? "text-sm font-semibold text-red-700" : "text-sm font-semibold text-emerald-700"}>
        {dirty ? "未保存" : "已保存"}
      </span>

      {/* 非 draft：引导复制为草稿 */}
      {!isDraft ? (
        <button
          type="button"
          className={UI.btnNeutralSm}
          disabled={disabled}
          onClick={onCloneToDraft}
          title="已发布/已生效方案不能直接编辑，复制为草稿后再修改"
        >
          复制为草稿
        </button>
      ) : null}

      <button
        type="button"
        className={UI.btnNeutralSm}
        disabled={disabled || !dirty || !isDraft}
        onClick={onSaveDraft}
        title={!isDraft ? "已发布/已生效方案不可直接保存，请先复制为草稿" : "保存草稿（不影响线上）"}
      >
        保存方案
      </button>

      <button
        type="button"
        className={UI.btnNeutralSm}
        disabled={disabled || isActive}
        onClick={handleActivateClick}
        title={isActive ? "该方案已是当前生效" : "启用后将整体替换当前线上生效的重量段方案"}
      >
        {isActive ? "已是当前生效" : "启用为当前生效"}
      </button>
    </div>
  );
};

export default TemplateWorkbenchMetaBar;
