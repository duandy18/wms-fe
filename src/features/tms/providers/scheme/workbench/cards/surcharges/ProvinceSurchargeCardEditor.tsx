// src/features/tms/providers/scheme/workbench/cards/surcharges/ProvinceSurchargeCardEditor.tsx
//
// 分拆说明：
// - 从 SurchargesCard.tsx 中拆出。
// - 当前只负责单张省级附加费卡。

import React from "react";
import { UI } from "../../../ui";
import type { SurchargeRuleRow } from "../../domain/types";
import type { SurchargesCardProps } from "./types";

type Props = {
  row: SurchargeRuleRow;
  disabled: boolean;
  saving: boolean;
  onUpdateRow: SurchargesCardProps["onUpdateRow"];
  onRemoveRow: SurchargesCardProps["onRemoveRow"];
};

const ProvinceSurchargeCardEditor: React.FC<Props> = ({
  row,
  disabled,
  saving,
  onUpdateRow,
  onRemoveRow,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
            省份：{row.provinceName || row.provinceCode || "未选择"}
          </div>

          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
            模式：全省收费
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <span className="text-sm text-slate-500">加价</span>
            <input
              className={`${UI.inputBase} h-9 w-28 min-w-0`}
              value={row.fixedAmount}
              disabled={disabled || saving}
              onChange={(e) =>
                onUpdateRow(row.clientId, {
                  fixedAmount: e.target.value,
                })
              }
              placeholder="例如 5"
            />
          </div>

          <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={row.active}
              disabled={disabled || saving}
              onChange={(e) =>
                onUpdateRow(row.clientId, {
                  active: e.target.checked,
                })
              }
            />
            启用
          </label>
        </div>

        <button
          type="button"
          className={UI.btnDangerSm}
          onClick={() => onRemoveRow(row.clientId)}
          disabled={disabled || saving}
        >
          删除配置
        </button>
      </div>
    </div>
  );
};

export default ProvinceSurchargeCardEditor;
