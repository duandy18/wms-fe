// src/features/admin/shipping-providers/scheme/brackets/ZoneEntryCard.tsx
//
// 当前区域录价（批量录入）
// - 默认锁定：避免误操作改价
// - 点“编辑”才允许输入
// - 保存成功后自动锁定
//
// 方案级口径：由 scheme.default_pricing_mode 决定录价结构
// - flat：固定价
// - linear_total：票费 + 单价
// - step_over：首重kg + 首重价 + 续重单价
//
// 交互：输入允许留空；保存时由上层校验给出明确提示（不强制塞 0）

import React, { useState } from "react";
import type { SchemeDefaultPricingMode } from "../../api/types";
import type { WeightSegment } from "./PricingRuleEditor";
import type { RowDraft } from "./quoteModel";
import { PUI } from "./ui";

import ZoneEntryHeader from "./ZoneEntryHeader";
import ZoneEntryTable from "./ZoneEntryTable";

export const ZoneEntryCard: React.FC<{
  busy: boolean;
  schemeMode: SchemeDefaultPricingMode;
  selectedZoneId: number | null;
  tableRows: { segment: WeightSegment; key: string | null }[];
  currentDrafts: Record<string, RowDraft>;
  onSetDraft: (key: string, patch: Partial<RowDraft>) => void;
  onSave: () => Promise<void>;

  // ✅ Phase 4.3：当没有 segments（表头）时禁用录价
  disabled?: boolean;
}> = ({ busy, schemeMode, selectedZoneId, tableRows, currentDrafts, onSetDraft, onSave, disabled }) => {
  const [editing, setEditing] = useState(false);

  const hardDisabled = !!disabled;
  const locked = !editing;

  async function handleSave() {
    if (!selectedZoneId) return;
    if (hardDisabled) return;
    try {
      await onSave();
      setEditing(false);
    } catch {
      // onSave 内部会 alert / onError
    }
  }

  const editBtnDisabled = !selectedZoneId || busy || hardDisabled;
  const saveBtnDisabled = !editing || !selectedZoneId || busy || hardDisabled;

  return (
    <div className={PUI.card}>
      <ZoneEntryHeader
        editing={editing}
        busy={busy}
        hardDisabled={hardDisabled}
        selectedZoneId={selectedZoneId}
        onToggleEditing={() => setEditing((v) => !v)}
        onSave={() => void handleSave()}
        disabledEditBtn={editBtnDisabled}
        disabledSaveBtn={saveBtnDisabled}
      />

      {selectedZoneId ? (
        <>
          <div className="mt-3">
            <ZoneEntryTable
              busy={busy}
              schemeMode={schemeMode}
              locked={locked}
              hardDisabled={hardDisabled}
              tableRows={tableRows}
              currentDrafts={currentDrafts}
              onSetDraft={onSetDraft}
            />
          </div>

          {locked ? <div className={PUI.infoBox}>当前为锁定状态，点右上角“编辑”后才能修改；保存后会自动锁定。</div> : null}
        </>
      ) : null}
    </div>
  );
};

export default ZoneEntryCard;
