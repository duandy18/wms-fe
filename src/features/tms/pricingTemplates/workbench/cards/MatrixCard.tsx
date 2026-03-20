// src/features/tms/pricingTemplates/workbench/cards/MatrixCard.tsx
//
// 分拆说明：
// - 从 PricingWorkbenchPanel.tsx 中拆出。
// - 当前只负责“价格矩阵”卡片 UI 与表格渲染。
// - 当前不负责：
//   1) 单元格状态更新
//   2) 保存实现
//   3) 行列派生计算
// - 协作关系：
//   - 父层由 ../PricingWorkbenchPanel 传入 rows / columns / canEdit
//   - 单元格内容通过 renderCell 注入，具体编辑器位于 ./CellEditor
// - 维护约束：
//   - 本文件只保持“矩阵卡片 + 表格外壳”职责，不吸收 CellEditor 内部细节与 hook 逻辑。
//   - 为抑制输入时的视觉抖动，这里固定 table 布局，并关闭本卡片区域的滚动锚定。
//   - 当前版本配合 CellEditor 收紧矩阵展示密度，避免单元格过高。

import React from "react";
import { UI } from "../ui";
import SuccessBar from "../SuccessBar";
import type { MatrixCellView, ModuleEditorState } from "../domain/types";

type MatrixColumn = {
  moduleRangeId: number;
  label: string;
};

type MatrixRow = {
  groupId: number;
  provinceNames: string[];
  cells: MatrixCellView[];
};

type Props = {
  disabled: boolean;
  moduleState: ModuleEditorState;
  errorMessage: string | null;
  successMessage: string | null;
  columns: MatrixColumn[];
  rows: MatrixRow[];
  canEdit: boolean;
  onSaveCells: () => Promise<boolean>;
  renderCell: (cell: MatrixCellView) => React.ReactNode;
};

function summarizeProvinceNames(names: string[]): string {
  const clean = names.map((x) => x.trim()).filter(Boolean);
  if (clean.length === 0) return "未配置省份";
  return clean.join("、");
}

export const MatrixCard: React.FC<Props> = ({
  disabled,
  moduleState,
  errorMessage,
  successMessage,
  columns,
  rows,
  canEdit,
  onSaveCells,
  renderCell,
}) => {
  return (
    <div className={`${UI.cardTight} [overflow-anchor:none]`}>
      <div className={UI.headerRow}>
        <div>
          <div className={UI.panelTitle}>3）价格矩阵</div>
          <div className={UI.panelHint}>行=地区范围，列=重量段。先保存重量段和区域范围，矩阵才可编辑。</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={UI.btnPrimaryGreen}
            onClick={() => void onSaveCells()}
            disabled={disabled || !canEdit || moduleState.savingCells}
          >
            {moduleState.savingCells ? "保存中…" : "保存价格矩阵"}
          </button>
        </div>
      </div>

      <div className="mt-3">
        <SuccessBar msg={successMessage} onClose={() => undefined} />
      </div>

      {errorMessage ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {errorMessage}
        </div>
      ) : null}

      {!canEdit ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          请先保存重量段和区域范围，再录入价格矩阵。
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full table-fixed border-collapse">
            <thead>
              <tr>
                <th className="w-[210px] min-w-[210px] border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-semibold text-slate-700">
                  地区范围
                </th>
                {columns.map((col) => (
                  <th
                    key={col.moduleRangeId}
                    className="w-[220px] min-w-[220px] border border-slate-200 bg-slate-50 px-2 py-2 text-left text-sm font-semibold text-slate-700"
                  >
                    <div className="truncate">{col.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.groupId}>
                  <td className="border border-slate-200 px-3 py-3 align-top text-sm text-slate-800">
                    <div className="break-words">{summarizeProvinceNames(row.provinceNames)}</div>
                  </td>
                  {row.cells.map((cell) => (
                    <td key={cell.key} className="border border-slate-200 px-2 py-2 align-top">
                      {renderCell(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 || columns.length === 0 ? (
            <div className="mt-3 text-sm text-slate-600">当前矩阵还没有可展示的行列。</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default MatrixCard;
