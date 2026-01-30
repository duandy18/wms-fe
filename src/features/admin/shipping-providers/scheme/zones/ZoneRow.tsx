// src/features/admin/shipping-providers/scheme/zones/ZoneRow.tsx

import React from "react";
import type { PricingSchemeZone } from "../../api";
import { UI } from "../ui";

export const ZoneRow: React.FC<{
  zone: PricingSchemeZone;
  selected?: boolean;
  disabled?: boolean;
  onSelect: (zoneId: number) => void;

  // ✅ 收敛：本页不再暴露“启用/停用”，只暴露“归档”
  // - 仍沿用上层传入的 onToggleActive（避免牵连签名）
  // - 仅当 zone.active=true 时触发（归档），zone.active=false 时不提供恢复入口
  onToggleActive: (zone: PricingSchemeZone) => Promise<void>;

  onEdit: (zoneId: number) => void;
}> = ({ zone, selected, disabled, onSelect, onToggleActive, onEdit }) => {
  const isArchived = !zone.active;

  return (
    <div className={`${UI.zoneRowWrap} ${selected ? UI.zoneRowSelected : UI.zoneRowNormal}`}>
      <div className="grid grid-cols-12 items-center gap-2">
        {/* 区域 */}
        <div className="col-span-7">
          <button
            type="button"
            disabled={disabled}
            className="text-left"
            onClick={() => onSelect(zone.id)}
            title="选择该区域分类作为后续编辑目标"
          >
            <div className={`${UI.body} font-semibold`}>{zone.name}</div>
          </button>
        </div>

        {/* 状态（收敛为：已保存 / 已归档） */}
        <div className="col-span-3">
          {isArchived ? (
            <span className={`${UI.zoneStatusPill} ${UI.zoneStatusInactive}`}>已归档</span>
          ) : (
            <span className={`${UI.zoneStatusPill} ${UI.zoneStatusActive}`}>已保存</span>
          )}
        </div>

        {/* 操作 */}
        <div className="col-span-2 flex justify-end gap-2">
          <button type="button" disabled={disabled || isArchived} className={UI.btnNeutralSm} onClick={() => onEdit(zone.id)}>
            编辑
          </button>

          <button
            type="button"
            disabled={disabled || isArchived}
            className={`${UI.zoneToggleBtnBase} ${UI.zoneToggleBtnInactive}`}
            onClick={() => void onToggleActive(zone)}
            title={isArchived ? "已归档" : "归档该区域（归档后不可编辑；绑定与录价在下一环节）"}
          >
            归档
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZoneRow;
