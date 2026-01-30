// src/features/admin/shipping-providers/scheme/zones/ZoneList.tsx

import React, { useMemo } from "react";
import type { PricingSchemeZone } from "../../api";
import { ZoneRow } from "./ZoneRow";
import { UI } from "../ui";

export const ZoneList: React.FC<{
  zones: PricingSchemeZone[];
  selectedZoneId: number | null;
  disabled?: boolean;
  onSelectZone: (zoneId: number) => void;
  onToggleZone: (z: PricingSchemeZone) => Promise<void>;
  onEditZone: (zoneId: number) => void;
}> = ({ zones, selectedZoneId, disabled, onSelectZone, onToggleZone, onEditZone }) => {
  const sorted = useMemo(() => {
    const arr = [...(zones ?? [])];
    // ✅ 收敛：不再按 active 排序（避免“启用/停用=生效”心智）
    // - 新的默认：按 id 倒序（最近创建/更新的更靠前）
    arr.sort((a, b) => b.id - a.id);
    return arr;
  }, [zones]);

  if (!sorted.length) {
    return <div className={UI.zoneListEmpty}>暂无区域分类，请先创建一条。</div>;
  }

  return (
    <div className="space-y-3">
      {/* 表头（3 列：区域 / 状态 / 操作） */}
      <div className={UI.zoneTableHeadWrap}>
        <div className="grid grid-cols-12 items-center gap-2 text-sm font-semibold text-slate-700">
          <div className="col-span-7">区域</div>
          <div className="col-span-3">状态</div>
          <div className="col-span-2 text-right">操作</div>
        </div>
      </div>

      {sorted.map((z) => (
        <ZoneRow
          key={z.id}
          zone={z}
          selected={selectedZoneId === z.id}
          disabled={disabled}
          onSelect={onSelectZone}
          onEdit={onEditZone}
          onToggleActive={async (zone) => {
            // ✅ 收敛：只允许从“已保存” -> “已归档”
            // - 不提供恢复入口（避免“生效/启用”语义回流）
            if (!zone.active) return;
            await onToggleZone(zone); // 上层现有实现：active -> !active
          }}
        />
      ))}
    </div>
  );
};

export default ZoneList;
