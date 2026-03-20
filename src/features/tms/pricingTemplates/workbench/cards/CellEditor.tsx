// src/features/tms/pricingTemplates/workbench/cards/CellEditor.tsx
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
//   - 当前版本刻意压缩单元格高度：
//   - 1) 取消底部摘要展示
//   - 2) 输入项尽量横向排列
//   - 3) 避免模式名与字段标题重复显示

import React from "react";
import type { MatrixCellView } from "../domain/types";

type Props = {
  cell: MatrixCellView;
  disabled: boolean;
  onUpdateMode: (mode: MatrixCellView["pricingMode"]) => void;
  onToggleActive: () => void;
  onUpdateField: (field: "flatAmount" | "baseAmount" | "ratePerKg" | "baseKg", value: string) => void;
};

const inputCls =
  "w-full rounded-md border border-slate-300 px-2 py-1 text-sm";
const compactLabelCls = "text-[11px] leading-4 text-slate-500";
const topSelectCls =
  "min-w-0 rounded-md border border-slate-300 px-2 py-1 text-sm";

export const CellEditor: React.FC<Props> = ({
  cell,
  disabled,
  onUpdateMode,
  onToggleActive,
  onUpdateField,
}) => {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-2">
      <div className="flex items-center gap-2">
        <select
          className={`${topSelectCls} flex-1`}
          value={cell.pricingMode}
          disabled={disabled}
          onChange={(e) => onUpdateMode(e.target.value as MatrixCellView["pricingMode"])}
        >
          <option value="flat">固定价格</option>
          <option value="step_over">首重+续重每公斤</option>
          <option value="linear_total">面单费+总重每公斤</option>
        </select>

        <label className="shrink-0 flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
          <input
            type="checkbox"
            checked={cell.active}
            disabled={disabled}
            onChange={() => onToggleActive()}
          />
          启用
        </label>
      </div>

      {cell.pricingMode === "flat" ? (
        <div className="grid grid-cols-1 gap-1">
          <div className={compactLabelCls}>固定价格</div>
          <input
            className={inputCls}
            value={cell.flatAmount}
            disabled={disabled}
            onChange={(e) => onUpdateField("flatAmount", e.target.value)}
            placeholder="例如 10"
          />
        </div>
      ) : null}

      {cell.pricingMode === "step_over" ? (
        <div className="grid grid-cols-3 gap-2">
          <div className="min-w-0">
            <div className={compactLabelCls}>首重kg</div>
            <input
              className={inputCls}
              value={cell.baseKg}
              disabled={disabled}
              onChange={(e) => onUpdateField("baseKg", e.target.value)}
              placeholder="1"
            />
          </div>

          <div className="min-w-0">
            <div className={compactLabelCls}>首重费用</div>
            <input
              className={inputCls}
              value={cell.baseAmount}
              disabled={disabled}
              onChange={(e) => onUpdateField("baseAmount", e.target.value)}
              placeholder="8"
            />
          </div>

          <div className="min-w-0">
            <div className={compactLabelCls}>续重每公斤</div>
            <input
              className={inputCls}
              value={cell.ratePerKg}
              disabled={disabled}
              onChange={(e) => onUpdateField("ratePerKg", e.target.value)}
              placeholder="2"
            />
          </div>
        </div>
      ) : null}

      {cell.pricingMode === "linear_total" ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <div className={compactLabelCls}>面单费</div>
            <input
              className={inputCls}
              value={cell.baseAmount}
              disabled={disabled}
              onChange={(e) => onUpdateField("baseAmount", e.target.value)}
              placeholder="3"
            />
          </div>

          <div className="min-w-0">
            <div className={compactLabelCls}>总重每公斤</div>
            <input
              className={inputCls}
              value={cell.ratePerKg}
              disabled={disabled}
              onChange={(e) => onUpdateField("ratePerKg", e.target.value)}
              placeholder="4"
            />
          </div>
        </div>
      ) : null}

      {!cell.isValid ? (
        <div className="text-[11px] leading-4 text-rose-700">当前单元格填写不完整</div>
      ) : null}
    </div>
  );
};

export default CellEditor;
