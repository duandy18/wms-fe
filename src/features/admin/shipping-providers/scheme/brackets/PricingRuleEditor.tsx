// src/features/admin/shipping-providers/scheme/brackets/PricingRuleEditor.tsx
import React, { useMemo, useState } from "react";
import { PUI } from "./ui";

import type { WeightSegment as WeightSegmentType } from "./pricingRuleEditorUtils";
import { computeRows, findInfinityAt } from "./pricingRuleEditorUtils";

import PricingRuleEditorHeader from "./PricingRuleEditorHeader";
import PricingRuleEditorRow from "./PricingRuleEditorRow";

export type WeightSegment = WeightSegmentType;

export const PricingRuleEditor: React.FC<{
  schemeId: number;
  value: WeightSegment[];
  onChange: (next: WeightSegment[]) => void;
  onSave: (next: WeightSegment[]) => Promise<void>;
  saving?: boolean;
  hideAddRow?: boolean;

  // ✅ 新增：draft 模式 = 草稿直接可编辑（隐藏编辑/保存头部）
  mode?: "locked" | "draft";
}> = ({ value, onChange, onSave, saving, hideAddRow, mode }) => {
  const isDraftMode = mode === "draft";
  const [editing, setEditing] = useState(false);
  const effectiveEditing = isDraftMode ? true : editing;

  const canSave = useMemo(() => value.length > 0, [value.length]);
  const computedRows = useMemo(() => computeRows(value), [value]);

  const infinityAt = useMemo(() => findInfinityAt(computedRows), [computedRows]);
  const hasInfinityInMiddle = infinityAt >= 0 && infinityAt < computedRows.length - 1;

  async function handleSave() {
    if (!canSave) {
      window.alert("至少保留一条重量分段。");
      return;
    }
    if (hasInfinityInMiddle) {
      window.alert("存在“无上限（∞）”的分段后仍有后续分段，请先删除后续分段或为该段填写 max。");
      return;
    }
    const ok = window.confirm("确认保存重量分段？保存后将作为报价表的表头使用，并写回方案主数据。");
    if (!ok) return;

    await onSave(value);
    setEditing(false);
  }

  return (
    <div className={PUI.segmentsCard}>
      {/* locked 模式才显示头部按钮 */}
      {!isDraftMode ? (
        <PricingRuleEditorHeader
          editing={effectiveEditing}
          saving={saving}
          canSave={canSave}
          hasInfinityInMiddle={hasInfinityInMiddle}
          onToggleEdit={() => setEditing((v) => !v)}
          onSave={() => void handleSave()}
        />
      ) : null}

      <div className={PUI.segmentsList}>
        {computedRows.map((r) => (
          <PricingRuleEditorRow
            key={r.idx}
            row={r}
            value={value}
            computedRows={computedRows}
            editing={effectiveEditing}
            saving={saving}
            onChange={onChange}
          />
        ))}

        {/* 通用新增按钮：draft 模式下默认隐藏，由外层“追加一行”控制 */}
        {effectiveEditing && !hideAddRow && !isDraftMode ? (
          <button
            type="button"
            className={PUI.segmentsAddBtn}
            disabled={!!saving || infinityAt >= 0}
            onClick={() => {
              onChange([...value, { min: "", max: "" }]);
            }}
            title={infinityAt >= 0 ? "已存在无上限（∞）分段，不能再新增后续分段" : "新增一个重量分段"}
          >
            + 新增重量分段
          </button>
        ) : null}

        {effectiveEditing && !hideAddRow && !isDraftMode && infinityAt >= 0 ? (
          <div className="mt-2 text-xs text-slate-500">
            提示：检测到第 {infinityAt + 1} 行为无上限（max 为空）。无上限分段应放在最后，因此已禁用“新增”。
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PricingRuleEditor;
