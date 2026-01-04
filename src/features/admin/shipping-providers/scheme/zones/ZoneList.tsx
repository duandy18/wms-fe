// src/features/admin/shipping-providers/scheme/zones/ZoneList.tsx

import React from "react";
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
  if (!zones.length) {
    return <div className={UI.zoneListEmpty}>暂无区域分类，请先创建一条。</div>;
  }

  // ✅ 排序：正在使用中在上；暂停使用在下；同组内新建在上（id 倒序）
  const sorted = [...zones].sort((a, b) => {
    const aa = a.active ? 1 : 0;
    const bb = b.active ? 1 : 0;
    if (aa !== bb) return bb - aa;
    return b.id - a.id;
  });

  return (
    <div className="space-y-3">
      {/* 表头 */}
      <div className={UI.zoneTableHeadWrap}>
        <div className={UI.zoneTableHeadRow}>
          <div className="col-span-1 text-center">序号</div>
          <div className="col-span-2">ID</div>
          <div className="col-span-5">区域</div>
          <div className="col-span-2">状态</div>
          <div className="col-span-2 text-right">操作</div>
        </div>
      </div>

      {sorted.map((z, idx) => (
        <ZoneRow
          key={z.id}
          index={idx + 1}
          zone={z}
          selected={selectedZoneId === z.id}
          disabled={disabled}
          onSelect={onSelectZone}
          onEdit={onEditZone}
          onToggleActive={onToggleZone}
        />
      ))}
    </div>
  );
};
