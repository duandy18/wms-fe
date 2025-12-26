// src/features/admin/shipping-providers/scheme/brackets/ZoneEntryHeader.tsx
//
// 当前区域录价（批量录入）- 头部（纯展示 + 按钮）

import React from "react";
import { PUI } from "./ui";

export const ZoneEntryHeader: React.FC<{
  editing: boolean;

  busy: boolean;
  hardDisabled: boolean;
  selectedZoneId: number | null;

  onToggleEditing: () => void;
  onSave: () => void;

  disabledEditBtn: boolean;
  disabledSaveBtn: boolean;
}> = ({ editing, busy, hardDisabled, selectedZoneId, onToggleEditing, onSave, disabledEditBtn, disabledSaveBtn }) => {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className={PUI.sectionTitle}>当前区域录价（批量录入）</div>
        <div className={`mt-1 ${PUI.tinyHelpText}`}>
          本卡默认锁定；需要批量调整请点“编辑”。日常小幅改价建议用底部“快递公司报价表”的单元格 ✏️。
        </div>

        {hardDisabled ? (
          <div className={PUI.warnBox}>当前报价表头（重量分段）尚未配置或为空：请先维护并保存“重量分段”，再进行录价。</div>
        ) : null}

        {!selectedZoneId ? <div className={`mt-2 ${PUI.helpText}`}>请先在上方选择区域分类。</div> : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={editing ? PUI.zoneEntryBtnNeutral : PUI.zoneEntryBtnEdit}
          disabled={disabledEditBtn}
          onClick={onToggleEditing}
          title={
            hardDisabled
              ? "请先配置并保存重量分段（表头）"
              : editing
                ? "退出编辑（不保存）"
                : "进入编辑（允许批量修改）"
          }
        >
          {editing ? "退出编辑" : "编辑"}
        </button>

        <button
          type="button"
          className={!disabledSaveBtn ? PUI.zoneEntryBtnSave : PUI.zoneEntryBtnSaveDisabled}
          disabled={disabledSaveBtn}
          onClick={onSave}
          title={hardDisabled ? "请先配置并保存重量分段（表头）" : !editing ? "先点“编辑”再保存" : "保存并锁定"}
        >
          保存当前区域报价
        </button>

        {busy ? <span className={PUI.tinyHelpText}>处理中…</span> : null}
      </div>
    </div>
  );
};

export default ZoneEntryHeader;
