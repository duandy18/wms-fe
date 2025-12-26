// src/features/admin/shipping-providers/scheme/surcharges/create/ScopeTableSectionCard.tsx

import React from "react";
import { UI } from "../../ui";
import { SelectedScopePriceTable, type ScopeRow } from "./SelectedScopePriceTable";

export function ScopeTableSectionCard(props: {
  disabled?: boolean;

  tableEditing: boolean;
  onSaveTable: () => void;
  onEditTable: () => void;

  onGenerate: () => Promise<void>;

  validationMsg: string | null;

  rows: ScopeRow[];
  amountById: Record<string, string>;
  onChangeAmount: (id: string, next: string) => void;

  tableDisabled: boolean;
}) {
  const {
    disabled,
    tableEditing,
    onSaveTable,
    onEditTable,
    onGenerate,
    validationMsg,
    rows,
    amountById,
    onChangeAmount,
    tableDisabled,
  } = props;

  return (
    <div className={UI.surchargeSectionCard}>
      <div className={UI.surchargeScopeHeaderRow}>
        <div>
          <div className={UI.sectionTitle}>第三部分：已保存的省/城市清单（逐行录价）</div>
          <div className={`mt-1 ${UI.panelHint}`}>保存后金额锁定，必须点“修改金额”才能再改。</div>
        </div>

        <div className={UI.surchargeScopeActionsRow}>
          {tableEditing ? (
            <button type="button" className={UI.btnPrimaryGreen} disabled={disabled} onClick={onSaveTable}>
              保存金额
            </button>
          ) : (
            <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={onEditTable}>
              修改金额
            </button>
          )}

          <button type="button" className={UI.btnPrimaryGreen} disabled={disabled} onClick={() => void onGenerate()}>
            生成/更新附加费
          </button>
        </div>
      </div>

      {validationMsg ? <div className={UI.surchargeValidationError}>{validationMsg}</div> : null}

      <div className={UI.surchargeSectionBody}>
        <SelectedScopePriceTable
          title="（清单表）"
          rows={rows}
          amountById={amountById}
          onChangeAmount={onChangeAmount}
          disabled={tableDisabled}
          emptyText="第三表为空：请先在第一/第二部分选择后点击“保存”。"
        />
      </div>
    </div>
  );
}

export default ScopeTableSectionCard;
