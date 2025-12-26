// src/features/admin/shipping-providers/scheme/brackets/PricingRuleEditorRow.tsx
//
// PricingRuleEditor 单行渲染（无全局状态）
// - min 只读（系统计算）
// - max 可编辑（仅在 editing 时）
// - 删除按钮仅在 editing 时显示

import React from "react";
import { PUI } from "./ui";
import type { WeightSegment, ComputedRow } from "./pricingRuleEditorUtils";
import { formatMinLabel, labelLeftOpenRightClosed } from "./pricingRuleEditorUtils";

export const PricingRuleEditorRow: React.FC<{
  row: ComputedRow;
  value: WeightSegment[];
  computedRows: ComputedRow[];
  editing: boolean;
  saving?: boolean;
  onChange: (next: WeightSegment[]) => void;
}> = ({ row, value, computedRows, editing, saving, onChange }) => {
  const r = row;

  const rowLabel = labelLeftOpenRightClosed(r.computedMin || "0", r.maxText);

  const minCls = PUI.segmentsInputLocked;
  const maxCls = editing ? PUI.segmentsInputEditable : PUI.segmentsInputLocked;

  const prevIsInfinity = r.idx > 0 && !(computedRows[r.idx - 1]?.maxText ?? "").trim();
  const rowDisabled = prevIsInfinity;

  return (
    <div className={PUI.segmentsRow}>
      <div className={PUI.segmentsRowLabel}>{rowLabel}</div>

      <input
        className={minCls}
        value={formatMinLabel(r.idx, r.idx === 0 ? "0" : r.computedMin)}
        placeholder="起始kg"
        disabled={true}
        readOnly={true}
      />

      <span className={PUI.segmentsRangeSep}>～</span>

      <input
        className={maxCls}
        value={value[r.idx]?.max ?? ""}
        placeholder={r.isLast ? "截止kg / ∞" : "截止kg"}
        disabled={!editing || !!saving || rowDisabled}
        onChange={(e) => {
          const v = e.target.value;
          onChange(value.map((x, i) => (i === r.idx ? { ...x, max: v } : x)));
        }}
      />

      <span className={PUI.segmentsKgSuffix}>kg</span>

      {editing ? (
        <button
          type="button"
          className={PUI.segmentsDeleteBtn}
          disabled={!!saving}
          onClick={() => {
            const ok = window.confirm("确认删除该重量分段？删除后请记得保存。");
            if (!ok) return;
            onChange(value.filter((_, i) => i !== r.idx));
          }}
        >
          删除
        </button>
      ) : (
        <span className={PUI.segmentsLockedText}>已锁定</span>
      )}
    </div>
  );
};

export default PricingRuleEditorRow;
