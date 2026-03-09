// src/features/admin/shipping-providers/scheme/workbench/cards/CellEditor.tsx
//
// 分拆说明：
// - 从 PricingWorkbenchPanel.tsx 中拆出。
// - 当前只负责“单个矩阵单元格”的价格编辑 UI。
// - 当前不负责：
//   1) 表格布局与行列渲染
//   2) 状态存储
//   3) 保存请求
//   4) 顶层校验提示汇总
// - 协作关系：
//   - 被 ./MatrixCard 渲染
//   - 由 ../usePricingWorkbench 提供状态更新回调
// - 维护约束：
//   - 这里只放单格编辑交互；不要引入整表逻辑与页面级副作用。
//   - 为抑制矩阵抖动，底部 displayText 区固定最小高度，避免文案长短变化导致单元格高度跳动。

import React from "react";
import { UI } from "../../ui";
import type { MatrixCellView } from "../domain/types";

type Props = {
  cell: MatrixCellView;
  disabled: boolean;
  onUpdateMode: (mode: MatrixCellView["pricingMode"]) => void;
  onToggleActive: () => void;
  onUpdateField: (field: "flatAmount" | "baseAmount" | "ratePerKg" | "baseKg", value: string) => void;
};

export const CellEditor: React.FC<Props> = ({ cell, disabled, onUpdateMode, onToggleActive, onUpdateField }) => {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-2">
      <div className="flex items-center justify-between gap-2">
        <select
          className="min-w-0 rounded-lg border border-slate-300 px-2 py-1 text-sm"
          value={cell.pricingMode}
          disabled={disabled}
          onChange={(e) => onUpdateMode(e.target.value as MatrixCellView["pricingMode"])}
        >
          <option value="flat">固定价格</option>
          <option value="step_over">首重续重</option>
          <option value="linear_total">面单费+总重费率</option>
        </select>

        <label className="shrink-0 flex items-center gap-1 text-xs text-slate-600">
          <input type="checkbox" checked={cell.active} disabled={disabled} onChange={() => onToggleActive()} />
          启用
        </label>
      </div>

      {cell.pricingMode === "flat" ? (
        <div>
          <div className={UI.tinyHelpText}>固定价格</div>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            value={cell.flatAmount}
            disabled={disabled}
            onChange={(e) => onUpdateField("flatAmount", e.target.value)}
            placeholder="例如 10"
          />
        </div>
      ) : null}

      {cell.pricingMode === "step_over" ? (
        <div className="grid grid-cols-1 gap-2">
          <div>
            <div className={UI.tinyHelpText}>首重重量（kg）</div>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              value={cell.baseKg}
              disabled={disabled}
              onChange={(e) => onUpdateField("baseKg", e.target.value)}
              placeholder="例如 1"
            />
          </div>
          <div>
            <div className={UI.tinyHelpText}>首重价</div>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              value={cell.baseAmount}
              disabled={disabled}
              onChange={(e) => onUpdateField("baseAmount", e.target.value)}
              placeholder="例如 8"
            />
          </div>
          <div>
            <div className={UI.tinyHelpText}>续重费率（元/kg）</div>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              value={cell.ratePerKg}
              disabled={disabled}
              onChange={(e) => onUpdateField("ratePerKg", e.target.value)}
              placeholder="例如 2"
            />
          </div>
        </div>
      ) : null}

      {cell.pricingMode === "linear_total" ? (
        <div className="grid grid-cols-1 gap-2">
          <div>
            <div className={UI.tinyHelpText}>面单费</div>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              value={cell.baseAmount}
              disabled={disabled}
              onChange={(e) => onUpdateField("baseAmount", e.target.value)}
              placeholder="例如 3"
            />
          </div>
          <div>
            <div className={UI.tinyHelpText}>费率（元/kg）</div>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              value={cell.ratePerKg}
              disabled={disabled}
              onChange={(e) => onUpdateField("ratePerKg", e.target.value)}
              placeholder="例如 4"
            />
          </div>
        </div>
      ) : null}

      <div
        className={`min-h-[32px] break-words text-xs leading-4 ${
          cell.isValid ? "text-slate-500" : "text-rose-700"
        }`}
      >
        {cell.displayText}
      </div>
    </div>
  );
};

export default CellEditor;
