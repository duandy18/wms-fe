// src/features/admin/shipping-providers/scheme/workbench/cards/SurchargesCard.tsx
//
// 分拆说明：
// - 从 PricingWorkbenchPanel.tsx 中拆出。
// - 当前只负责“附加费”卡片 UI。
// - 当前不负责：
//   1) surcharge 校验
//   2) upsert / patch / delete 请求
//   3) 顶层错误与成功提示
// - 协作关系：
//   - 父层由 ../PricingWorkbenchPanel 传入省份选项与动作回调
//   - 真实状态更新与保存逻辑位于 ../usePricingWorkbench
// - 维护约束：
//   - 本文件保持为附加费表单展示层，不再承载 API 与业务判定细节。
//   - 为抑制局部视觉抖动，本卡片关闭滚动锚定，并通过 React.memo 避免无意义重渲染放大抖动。

import React from "react";
import type { GeoItem } from "../../../api/geo";
import { UI } from "../../ui";
import type { SurchargeRuleRow } from "../domain/types";

type Props = {
  disabled: boolean;
  saving: boolean;
  rows: SurchargeRuleRow[];
  provinceOptions: GeoItem[];
  provinceNameByCode: Map<string, string>;
  onAddRow: () => void;
  onSave: () => void;
  onUpdateRow: (
    clientId: string,
    patch: Partial<
      Pick<
        SurchargeRuleRow,
        "name" | "active" | "scope" | "provinceCode" | "provinceName" | "cityName" | "fixedAmount"
      >
    >,
  ) => void;
  onRemoveRow: (clientId: string) => void;
};

export const SurchargesCard: React.FC<Props> = React.memo(
  ({
    disabled,
    saving,
    rows,
    provinceOptions,
    provinceNameByCode,
    onAddRow,
    onSave,
    onUpdateRow,
    onRemoveRow,
  }) => {
    const aliveRows = rows.filter((x) => !x.isDeleted);

    return (
      <div className={`${UI.cardTight} [overflow-anchor:none]`}>
        <div className={UI.headerRow}>
          <div>
            <div className={UI.panelTitle}>4）附加费</div>
            <div className={UI.panelHint}>只支持省 / 市两层；城市优先覆盖省份；单次只命中一条，不叠加。</div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className={UI.btnNeutralSm} onClick={onAddRow} disabled={disabled || saving}>
              新增附加费
            </button>
            <button type="button" className={UI.btnPrimaryGreen} onClick={onSave} disabled={disabled || saving}>
              {saving ? "保存中…" : "保存附加费"}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {aliveRows.map((row) => (
            <div key={row.clientId} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-6">
              <div>
                <label className={UI.tinyHelpText}>范围</label>
                <select
                  className={`${UI.selectBase} mt-1 w-full`}
                  value={row.scope}
                  disabled={disabled || saving}
                  onChange={(e) =>
                    onUpdateRow(row.clientId, {
                      scope: e.target.value as "province" | "city",
                    })
                  }
                >
                  <option value="province">省级</option>
                  <option value="city">市级</option>
                </select>
              </div>

              <div>
                <label className={UI.tinyHelpText}>省份</label>
                <select
                  className={`${UI.selectBase} mt-1 w-full`}
                  value={row.provinceCode}
                  disabled={disabled || saving}
                  onChange={(e) => {
                    const provinceCode = e.target.value;
                    const provinceName = provinceNameByCode.get(provinceCode) ?? "";
                    onUpdateRow(row.clientId, { provinceCode, provinceName });
                  }}
                >
                  <option value="">请选择省份</option>
                  {provinceOptions.map((opt) => (
                    <option key={String(opt.code)} value={String(opt.code)}>
                      {String(opt.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={UI.tinyHelpText}>城市（省级可留空）</label>
                <input
                  className={UI.inputBase}
                  value={row.cityName}
                  disabled={disabled || saving || row.scope !== "city"}
                  onChange={(e) => onUpdateRow(row.clientId, { cityName: e.target.value })}
                  placeholder="例如 深圳市"
                />
              </div>

              <div>
                <label className={UI.tinyHelpText}>固定加价</label>
                <input
                  className={UI.inputBase}
                  value={row.fixedAmount}
                  disabled={disabled || saving}
                  onChange={(e) => onUpdateRow(row.clientId, { fixedAmount: e.target.value })}
                  placeholder="例如 2"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={row.active}
                    disabled={disabled || saving}
                    onChange={(e) => onUpdateRow(row.clientId, { active: e.target.checked })}
                  />
                  启用
                </label>
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="button"
                  className={UI.btnDangerSm}
                  onClick={() => onRemoveRow(row.clientId)}
                  disabled={disabled || saving}
                >
                  删除
                </button>
              </div>
            </div>
          ))}

          {aliveRows.length === 0 ? <div className={UI.emptyText}>当前方案暂无附加费规则。</div> : null}
        </div>
      </div>
    );
  },
);

SurchargesCard.displayName = "SurchargesCard";

export default SurchargesCard;
