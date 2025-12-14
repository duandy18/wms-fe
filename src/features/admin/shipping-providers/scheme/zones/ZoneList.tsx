// src/features/admin/shipping-providers/scheme/zones/ZoneList.tsx

import React from "react";
import type { PricingSchemeZone } from "../../api";
import { ZoneRow } from "./ZoneRow";

export const ZoneList: React.FC<{
  zones: PricingSchemeZone[];
  selectedZoneId: number | null;
  disabled?: boolean;
  onSelectZone: (zoneId: number) => void;
  onToggleZone: (z: PricingSchemeZone) => Promise<void>;
  onDeleteZone: (z: PricingSchemeZone) => Promise<void>;
}> = ({ zones, selectedZoneId, disabled, onSelectZone, onToggleZone, onDeleteZone }) => {
  if (!zones.length) {
    return <div className="text-sm text-slate-600">暂无 Zone。建议先创建一个“全国-默认”。</div>;
  }

  return (
    <div className="space-y-3">
      {zones.map((z) => (
        <ZoneRow
          key={z.id}
          zone={z}
          selected={selectedZoneId === z.id}
          disabled={disabled}
          onSelect={onSelectZone}
          onToggleActive={onToggleZone}
          onDelete={onDeleteZone}
        />
      ))}
      <div className="text-sm text-slate-600">
        删除失败常见原因：Zone 下已有 Members/Brackets（数据库 RESTRICT 拒绝）。建议先停用。
      </div>
    </div>
  );
};
