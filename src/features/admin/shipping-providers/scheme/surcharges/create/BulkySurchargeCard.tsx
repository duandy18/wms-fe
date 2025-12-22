// src/features/admin/shipping-providers/scheme/surcharges/create/BulkySurchargeCard.tsx
//
// 异形件操作费（bulky / irregular）
// - 单独一张卡
// - 一个开关 + 一个金额
// - 保存 / 修改锁定
// - 命中由作业台 flag_any = ["bulky"] 决定

import React from "react";
import { UI } from "../../ui";

export const BulkySurchargeCard: React.FC<{
  enabled: boolean;
  amountText: string;
  editing: boolean;

  disabled?: boolean;

  onToggleEnabled: (v: boolean) => void;
  onChangeAmount: (v: string) => void;

  onSave: () => void;
  onEdit: () => void;
}> = ({
  enabled,
  amountText,
  editing,
  disabled,
  onToggleEnabled,
  onChangeAmount,
  onSave,
  onEdit,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">异形件操作费</div>
          <div className="mt-1 text-sm text-slate-600">
            适用于：异形件 / 超规件。是否命中由作业台 flags（bulky / irregular）决定。
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <button
              type="button"
              className={UI.btnPrimaryGreen}
              disabled={disabled}
              onClick={onSave}
            >
              保存
            </button>
          ) : (
            <button
              type="button"
              className={UI.btnNeutral}
              disabled={disabled}
              onClick={onEdit}
            >
              修改
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-6">
        {/* 启用开关 */}
        <div className="flex items-center gap-3 md:col-span-2">
          <input
            type="checkbox"
            checked={enabled}
            disabled={disabled || !editing}
            onChange={(e) => onToggleEnabled(e.target.checked)}
          />
          <span className="text-sm text-slate-700">启用异形件操作费</span>
        </div>

        {/* 金额 */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm text-slate-600">每单加价（元）</label>
          <input
            className={UI.inputMono}
            value={amountText}
            disabled={disabled || !editing || !enabled}
            onChange={(e) => onChangeAmount(e.target.value)}
            placeholder="例如：2.0"
          />
        </div>
      </div>

      {!enabled ? (
        <div className="mt-2 text-sm text-slate-500">
          当前未启用，不会生成/更新任何异形件附加费规则。
        </div>
      ) : null}
    </div>
  );
};
