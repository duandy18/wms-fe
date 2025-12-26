// src/features/admin/shipping-providers/scheme/brackets/QuoteCellEditor.tsx
//
// 单元格编辑器（弹层）
// ✅ 支持混合口径：按 draft.mode 选择并渲染输入框（flat / linear_total / step_over / manual_quote）
// ✅ 仍保留“恢复默认口径”（schemeMode）按钮
// ✅ 全中文文案，定位清晰：区域 + 重量段 + 当前模型

import React from "react";
import type { SchemeDefaultPricingMode } from "../../api/types";
import type { RowDraft } from "./quoteModel";
import { PUI } from "./ui";

type CellMode = SchemeDefaultPricingMode | "manual_quote";

function modeLabel(m: CellMode): string {
  if (m === "manual_quote") return "人工/未设";
  if (m === "flat") return "固定价";
  if (m === "step_over") return "首重 + 续重";
  return "票费 + 元/kg";
}

export const QuoteCellEditor: React.FC<{
  zoneName: string;
  segmentLabel: string;

  // 方案默认口径（仅默认值/恢复用）
  schemeMode: SchemeDefaultPricingMode;

  busy: boolean;
  disabled: boolean;

  draft: RowDraft;
  onChangeDraft: (next: RowDraft) => void;

  onSave: () => void;
  onCancel: () => void;
}> = ({ zoneName, segmentLabel, schemeMode, busy, disabled, draft, onChangeDraft, onSave, onCancel }) => {
  const curMode: CellMode = (draft.mode ?? schemeMode) as CellMode;

  function setMode(next: CellMode) {
    onChangeDraft({ ...draft, mode: next });
  }

  const modeHint = curMode === schemeMode ? "与默认一致" : "已偏离默认";

  return (
    <div className={PUI.editorWrap}>
      <div className={PUI.editorHeaderRow}>
        <div className="min-w-0">
          <div className={PUI.editorTitle}>录价 · {zoneName} · {segmentLabel}</div>
          <div className={PUI.editorSub}>
            默认口径：<span className={PUI.editorSubMono}>{modeLabel(schemeMode)}</span>
            <span className="ml-2">{modeHint}</span>
          </div>
        </div>

        <div className={PUI.editorBtnRow}>
          <button type="button" className={PUI.editorBtnPrimary} disabled={busy || disabled} onClick={onSave} title="保存">
            保存
          </button>
          <button type="button" className={PUI.editorBtnNeutral} disabled={busy} onClick={onCancel} title="取消">
            取消
          </button>
        </div>
      </div>

      {/* 计价模型选择 */}
      <div className="mt-3">
        <div className={PUI.editorSectionLabel}>计价模型</div>
        <div className="mt-1 flex items-center gap-2">
          <select
            className={PUI.editorSelect}
            value={curMode}
            disabled={busy || disabled}
            onChange={(e) => setMode(e.target.value as CellMode)}
          >
            <option value="linear_total">票费 + 元/kg</option>
            <option value="step_over">首重 + 续重</option>
            <option value="flat">固定价</option>
            <option value="manual_quote">人工/未设</option>
          </select>

          <button
            type="button"
            className={PUI.editorBtnGhost}
            disabled={busy || disabled}
            onClick={() => setMode(schemeMode)}
            title="恢复为方案默认口径"
          >
            恢复默认
          </button>
        </div>
      </div>

      {/* 输入区：跟随 curMode */}
      <div className="mt-3">
        <div className={PUI.editorSectionLabel}>输入价格</div>

        {curMode === "manual_quote" ? (
          <div className={PUI.editorHintBox}>
            当前设置为：人工/未设（保存后该区间将按 manual_quote 记录，不参与结构化算价）。
          </div>
        ) : curMode === "flat" ? (
          <input
            className={`${PUI.editorInput} mt-2`}
            placeholder="固定价金额（元）"
            value={draft.flatAmount}
            disabled={busy || disabled}
            onChange={(e) => onChangeDraft({ ...draft, mode: curMode, flatAmount: e.target.value })}
          />
        ) : curMode === "step_over" ? (
          <div className={PUI.editorCol}>
            <div className={PUI.editorRow}>
              <span className={PUI.editorInlineHint}>首重kg</span>
              <input
                className={PUI.editorInputSm}
                placeholder="例如 1"
                value={draft.baseKg}
                disabled={busy || disabled}
                onChange={(e) => onChangeDraft({ ...draft, mode: curMode, baseKg: e.target.value })}
              />
              <span className={PUI.editorInlineHint}>首重价</span>
              <input
                className={PUI.editorInputXs}
                placeholder="元"
                value={draft.baseAmount}
                disabled={busy || disabled}
                onChange={(e) => onChangeDraft({ ...draft, mode: curMode, baseAmount: e.target.value })}
              />
            </div>

            <div className={PUI.editorRow}>
              <span className={PUI.editorInlineHint}>续重</span>
              <input
                className={PUI.editorInputSm}
                placeholder="元/kg"
                value={draft.ratePerKg}
                disabled={busy || disabled}
                onChange={(e) => onChangeDraft({ ...draft, mode: curMode, ratePerKg: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <div className={PUI.editorRow}>
            <span className={PUI.editorInlineHint}>票费</span>
            <input
              className={PUI.editorInputSm}
              placeholder="每票"
              value={draft.baseAmount}
              disabled={busy || disabled}
              onChange={(e) => onChangeDraft({ ...draft, mode: curMode, baseAmount: e.target.value })}
            />
            <span className={PUI.editorInlineHint}>单价</span>
            <input
              className={PUI.editorInputSm}
              placeholder="元/kg"
              value={draft.ratePerKg}
              disabled={busy || disabled}
              onChange={(e) => onChangeDraft({ ...draft, mode: curMode, ratePerKg: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteCellEditor;
