// src/features/admin/shipping-providers/scheme/brackets/QuoteMatrixCellButton.tsx
//
// 报价表单元格按钮（可发现性增强）
// - 使用状态机：unset / manual / set（不再靠文案字符串判断）
// - 未设置（unset）：强提示「点击录价」
// - 人工兜底（manual）：显示「人工/未设」，并提示可继续录价
// - 已设置（set）：展示价格摘要
//
// ✅ 样式收口：全部使用录价页私有 PUI（字号/密度/间距一处控制）

import React from "react";
import type { QuoteCellState } from "./quoteMatrixUtils";
import { PUI } from "./ui";

export const QuoteMatrixCellButton: React.FC<{
  text: string;
  state: QuoteCellState;

  disabled: boolean;
  title: string;

  onClick: () => void;
}> = ({ text, state, disabled, title, onClick }) => {
  const isUnset = state === "unset";
  const isManual = state === "manual";

  const containerCls = disabled
    ? `${PUI.cellBtnBase} ${PUI.cellBtnDisabled}`
    : isUnset
      ? `${PUI.cellBtnBase} ${PUI.cellBtnUnset}`
      : isManual
        ? `${PUI.cellBtnBase} ${PUI.cellBtnManual}`
        : `${PUI.cellBtnBase} ${PUI.cellBtnSet}`;

  const badgeCls = disabled ? PUI.cellBtnBadgeDisabled : PUI.cellBtnBadgeEnabled;

  return (
    <button type="button" className={containerCls} disabled={disabled} onClick={onClick} title={title}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {isUnset ? (
            <span className={PUI.cellBtnPrimaryTextUnset}>点击录价</span>
          ) : isManual ? (
            <span className={PUI.cellBtnPrimaryTextManual}>人工/未设</span>
          ) : (
            <span className={PUI.cellBtnPrimaryTextSet}>{text}</span>
          )}
        </div>

        <span className={badgeCls}>录价</span>
      </div>

      {isUnset ? (
        <div className={PUI.cellBtnSubText}>（未设置，点击开始录价）</div>
      ) : isManual ? (
        <div className={PUI.cellBtnSubText}>（兜底状态，可点击改为具体口径）</div>
      ) : null}
    </button>
  );
};

export default QuoteMatrixCellButton;
