// src/features/admin/shipping-providers/scheme/surcharges/create/CitiesSectionCard.tsx

import React from "react";
import { UI } from "../../ui";
import { CityPicker } from "./CityPicker";
import { SectionHeader } from "./SectionHeader";

export function CitiesSectionCard(props: {
  disabled?: boolean;

  editing: boolean;
  collapsed: boolean;

  subtitleEditing: string;
  subtitleLocked: string;

  onToggleCollapsed: () => void;

  onSave: () => void;
  onEdit: () => void;

  selectedProvinces: string[];
  onChangeSelectedProvinces: (next: string[]) => void;

  selectedCities: string[];
  onChangeSelectedCities: (next: string[]) => void;

  hint?: string;
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
    selectedProvinces,
    onChangeSelectedProvinces,
    selectedCities,
    onChangeSelectedCities,
    hint,
  } = props;

  return (
    <div className={UI.surchargeSectionCard}>
      <SectionHeader
        title="第二部分：选择城市（省内点名收费）"
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
          <CityPicker
            selectedProvinces={selectedProvinces}
            onChangeSelectedProvinces={onChangeSelectedProvinces}
            selectedCities={selectedCities}
            onChangeSelectedCities={onChangeSelectedCities}
            disabled={disabled || !editing}
            hint={hint ?? "第二部分只选城市，不录价；价格在第三部分清单表逐行填写。"}
          />
        </div>
      ) : null}
    </div>
  );
}

export default CitiesSectionCard;
