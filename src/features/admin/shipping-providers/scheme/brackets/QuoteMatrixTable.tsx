// src/features/admin/shipping-providers/scheme/brackets/QuoteMatrixTable.tsx
//
// 报价表表格渲染（不持有业务状态）
// - 负责 thead/tbody/行列循环
// - 需要编辑时通过 renderEditor 插槽渲染编辑器
// - 单元格状态机：unset / manual / set（不再依赖 text 判断）
//
// ✅ 样式收口：字号/密度/高度/表头 sticky 统一走录价页私有 PUI

import React from "react";
import type { PricingSchemeZone, PricingSchemeZoneBracket } from "../../api";
import type { SchemeDefaultPricingMode } from "../../api/types";
import type { RowDraft } from "./quoteModel";
import type { QuoteColumn } from "./quoteMatrixUtils";
import { buildRowBracketByKey, cellText, detectCellState, columnLabel } from "./quoteMatrixUtils";
import QuoteMatrixCellButton from "./QuoteMatrixCellButton";
import { PUI } from "./ui";

export const QuoteMatrixTable: React.FC<{
  columns: QuoteColumn[];
  zones: PricingSchemeZone[];
  selectedZoneId: number | null;

  schemeMode: SchemeDefaultPricingMode;

  busy: boolean;
  disabled: boolean;

  bracketsByZoneId: Record<number, PricingSchemeZoneBracket[]>;
  draftsByZoneId: Record<number, Record<string, RowDraft>>;

  editingKey: { zoneId: number; key: string } | null;

  onOpenEditor: (zoneId: number, col: QuoteColumn) => void;

  renderEditor: (args: { zone: PricingSchemeZone; col: QuoteColumn }) => React.ReactNode;
}> = ({
  columns,
  zones,
  selectedZoneId,
  schemeMode,
  busy,
  disabled,
  bracketsByZoneId,
  draftsByZoneId,
  editingKey,
  onOpenEditor,
  renderEditor,
}) => {
  const clickDisabled = busy || disabled;

  return (
    <div className={`${PUI.tableWrap} ${PUI.tableWrapHeight}`}>
      <table className={PUI.table}>
        <thead className={PUI.thead}>
          <tr>
            <th className={PUI.thLeft}>区域</th>
            {columns.map((c, idx) => (
              <th key={idx} className={PUI.th}>
                {columnLabel(c)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {zones.map((z) => {
            const rowBrackets = bracketsByZoneId[z.id] ?? (z.brackets ?? []);
            const rowBracketByKey = buildRowBracketByKey(rowBrackets);

            const rowDrafts = draftsByZoneId[z.id] ?? {};
            const isCurrent = selectedZoneId === z.id;

            return (
              <tr key={z.id} className={isCurrent ? PUI.rowCurrentBg : "bg-white"}>
                <td className={PUI.tdZone}>
                  {z.name}
                  {isCurrent ? <span className={PUI.zoneCurrentBadge}>（当前）</span> : null}
                </td>

                {columns.map((c, idx) => {
                  if (!c.valid || !c.key) {
                    return (
                      <td key={idx} className={`${PUI.tdCell} ${PUI.cellInvalidText}`}>
                        重量段配置有误
                      </td>
                    );
                  }

                  const d = rowDrafts[c.key];
                  const b = rowBracketByKey[c.key];

                  const isEditing = !!editingKey && editingKey.zoneId === z.id && editingKey.key === c.key;

                  const state = detectCellState({ draft: d, bracket: b });
                  const text = cellText({ draft: d, bracket: b, schemeMode });

                  const title = clickDisabled ? "当前不可编辑" : "点击录价";

                  return (
                    <td key={idx} className={PUI.tdCell}>
                      <div className={PUI.cellInnerWrap}>
                        {!isEditing ? (
                          <QuoteMatrixCellButton
                            text={text}
                            state={state}
                            disabled={clickDisabled}
                            title={title}
                            onClick={() => onOpenEditor(z.id, c)}
                          />
                        ) : (
                          renderEditor({ zone: z, col: c })
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default QuoteMatrixTable;
