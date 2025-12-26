// src/features/admin/shipping-providers/scheme/brackets/DraftEditorCard.tsx
//
// 草稿编辑器卡：仅在选中模板为 draft 时显示
// - 内部使用 PricingRuleEditor 编辑 WeightSegment[]
// - 保存动作由上层传入（onSave）
// - ✅ 不再使用通用“新增重量分段”按钮：改为语义化追加（下一段 / ∞段）
// - ✅ 增加 dirty 状态：未保存 / 已保存（防止用户不确定）

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { WeightSegment } from "./PricingRuleEditor";
import PricingRuleEditor from "./PricingRuleEditor";
import UI from "../ui";

function hasInfinity(segs: WeightSegment[]): boolean {
  const last = segs?.[segs.length - 1];
  return !!last && !(String(last.max ?? "").trim());
}

function stableKey(segs: WeightSegment[]): string {
  return JSON.stringify(segs ?? []);
}

export const DraftEditorCard: React.FC<{
  schemeId: number;
  disabled: boolean;
  saving: boolean;
  draftSegments: WeightSegment[];
  setDraftSegments: React.Dispatch<React.SetStateAction<WeightSegment[]>>;
  onSave: () => Promise<void>;
}> = ({ schemeId, disabled, saving, draftSegments, setDraftSegments, onSave }) => {
  const canAppendNext = useMemo(() => {
    if (disabled) return false;
    if (saving) return false;
    if (!draftSegments.length) return true;
    return !hasInfinity(draftSegments);
  }, [disabled, saving, draftSegments]);

  const canAppendInfinity = useMemo(() => {
    if (disabled) return false;
    if (saving) return false;
    if (!draftSegments.length) return true;
    if (hasInfinity(draftSegments)) return false;
    return true;
  }, [disabled, saving, draftSegments]);

  // dirty flag：草稿是否有未保存修改
  const [dirty, setDirty] = useState(false);
  const lastSavedKeyRef = useRef<string>(stableKey(draftSegments));

  // 当 draftSegments 变化时，如果与 lastSavedKey 不同，则 dirty=true
  useEffect(() => {
    const cur = stableKey(draftSegments);
    if (cur !== lastSavedKeyRef.current) {
      setDirty(true);
    }
  }, [draftSegments]);

  function appendNextSegment() {
    if (!canAppendNext) return;
    setDraftSegments((prev) => [...(prev ?? []), { min: "", max: "" }]);
  }

  function appendInfinitySegment() {
    if (!canAppendInfinity) return;

    setDraftSegments((prev) => {
      const rows = [...(prev ?? [])];
      if (rows.length && !(String(rows[rows.length - 1]?.max ?? "").trim())) return rows;
      rows.push({ min: "", max: "" });
      return rows;
    });
  }

  async function saveDraft() {
    if (disabled || saving) return;
    await onSave();
    // 保存成功后，更新 lastSavedKey
    lastSavedKeyRef.current = stableKey(draftSegments);
    setDirty(false);
  }

  return (
    <div className={UI.cardSoft}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className={UI.sectionTitle}>草稿编辑器</div>
          <div className={UI.panelHint}>
            只在草稿里改结构：建议“追加一段 → 填 max → 保存草稿”。发布后结构只读。
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={dirty ? "text-sm font-semibold text-red-700" : "text-sm font-semibold text-emerald-700"}>
            {dirty ? "未保存" : "已保存"}
          </span>

          <button
            type="button"
            className={UI.btnNeutralSm}
            disabled={!canAppendNext}
            onClick={appendNextSegment}
            title={hasInfinity(draftSegments) ? "已存在无上限（∞）段，不能再追加后续段" : "追加下一段（连续结构）"}
          >
            追加下一段
          </button>

          <button
            type="button"
            className={UI.btnNeutralSm}
            disabled={!canAppendInfinity}
            onClick={appendInfinitySegment}
            title={hasInfinity(draftSegments) ? "已存在无上限（∞）段" : "追加无上限段（∞，必须最后一段）"}
          >
            追加∞段
          </button>

          <button
            type="button"
            className={UI.btnNeutralSm}
            disabled={disabled || saving || !dirty}
            onClick={() => void saveDraft()}
            title={!dirty ? "没有变更，无需保存" : "保存草稿（只保存到模板草稿，不会影响当前生效规则）"}
          >
            {saving ? "保存中…" : "保存草稿"}
          </button>
        </div>
      </div>

      {disabled ? <div className="mt-2 text-sm text-amber-700">当前不可编辑（无权限或页面被禁用）。</div> : null}

      <div className={`mt-2 ${disabled ? "opacity-70 pointer-events-none" : ""}`}>
        <PricingRuleEditor
          schemeId={schemeId}
          value={draftSegments}
          onChange={setDraftSegments}
          onSave={async () => {
            if (disabled) return;
            await saveDraft();
          }}
          saving={saving}
          hideAddRow={true}
        />
      </div>

      <div className="mt-2 text-xs text-slate-500">
        安全提示：草稿不会影响当前生效规则；只有“发布并启用”才会替换线上重量段结构。
      </div>
    </div>
  );
};

export default DraftEditorCard;
