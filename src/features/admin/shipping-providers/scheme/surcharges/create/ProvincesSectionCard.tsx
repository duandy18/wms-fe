// src/features/admin/shipping-providers/scheme/surcharges/create/ProvincesSectionCard.tsx

import React from "react";
import { UI } from "../../ui";
import { ProvincePicker } from "./ProvincePicker";
import { SectionHeader } from "./SectionHeader";

export function ProvincesSectionCard(props: {
  disabled?: boolean;

  editing: boolean;
  collapsed: boolean;

  subtitleEditing: string;
  subtitleLocked: string;

  onToggleCollapsed: () => void;

  onSave: () => void;
  onEdit: () => void;

  value: string[];
  onChange: (next: string[]) => void;
}) {
  const {
    disabled,
    editing,
    collapsed,
    subtitleEditing,
    subtitleLocked,
    onToggleCollapsed,
    onSave,
    onEdit,
    value,
    onChange,
  } = props;

  return (
    <div className={UI.surchargeSectionCard}>
      <SectionHeader
        title="第一部分：选择省（全省收费）"
        subtitle={editing ? subtitleEditing : subtitleLocked}
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
        right={
          editing ? (
            <button type="button" className={UI.btnPrimaryGreen} disabled={disabled} onClick={onSave}>
              保存
            </button>
          ) : (
            <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={onEdit}>
              修改
            </button>
          )
        }
      />

      {!collapsed ? (
        <div className={UI.surchargeSectionBody}>
          <ProvincePicker value={value} onChange={onChange} disabled={disabled || !editing} />
        </div>
      ) : null}
    </div>
  );
}

export default ProvincesSectionCard;
