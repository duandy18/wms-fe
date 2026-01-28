// src/features/admin/shipping-providers/scheme/zones/ZoneRow.tsx

import React from "react";
import type { PricingSchemeZone } from "../../api";
import { UI } from "../ui";

export const ZoneRow: React.FC<{
  index: number;
  zone: PricingSchemeZone;
  selected?: boolean;
  disabled?: boolean;
  onSelect: (zoneId: number) => void;
  onToggleActive: (zone: PricingSchemeZone) => Promise<void>;
  onEdit: (zoneId: number) => void;

  // ✅ 新增：重量段方案信息（由 ZoneList 组装并传入）
  templateName: string;
  templateSummary: string;
}> = ({ index, zone, selected, disabled, onSelect, onToggleActive, onEdit, templateName, templateSummary }) => {
  return (
    <div className={`${UI.zoneRowWrap} ${selected ? UI.zoneRowSelected : UI.zoneRowNormal}`}>
      <div className="grid grid-cols-16 items-center gap-2">
        {/* 序号 */}
        <div className="col-span-1 text-center">
          <span className={UI.zoneIndexBadge}>{index}</span>
        </div>

        {/* ID */}
        <div className="col-span-2">
          <div className={UI.zoneIdMono}>{zone.id}</div>
        </div>

        {/* 区域名称 */}
        <div className="col-span-4">
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

        {/* 状态 */}
        <div className="col-span-2">
          {zone.active ? (
            <span className={`${UI.zoneStatusPill} ${UI.zoneStatusActive}`}>正在使用中</span>
          ) : (
            <span className={`${UI.zoneStatusPill} ${UI.zoneStatusInactive}`}>暂停使用</span>
          )}
        </div>

        {/* 重量段方案名称 */}
        <div className="col-span-2">
          <div className="text-sm font-semibold text-slate-900 truncate" title={templateName}>
            {templateName}
          </div>
        </div>

        {/* 段结构内容 */}
        <div className="col-span-3">
          <div className="text-xs font-mono text-slate-700 truncate" title={templateSummary}>
            {templateSummary}
          </div>
        </div>

        {/* 操作 */}
        <div className="col-span-2 flex justify-end gap-2">
          <button
            type="button"
            disabled={disabled}
            className={UI.btnNeutralSm}
            onClick={() => onEdit(zone.id)}
          >
            编辑
          </button>

          <button
            type="button"
            disabled={disabled}
            className={`${UI.zoneToggleBtnBase} ${zone.active ? UI.zoneToggleBtnActive : UI.zoneToggleBtnInactive}`}
            onClick={() => void onToggleActive(zone)}
          >
            {zone.active ? "暂停使用" : "恢复使用"}
          </button>
        </div>
      </div>

      {/* 辅助信息 */}
      <div className={UI.zoneMetaLine}>
        Members <span className="font-mono">{zone.members?.length ?? 0}</span>
        {" · "}
        Brackets <span className="font-mono">{zone.brackets?.length ?? 0}</span>
      </div>
    </div>
  );
};
