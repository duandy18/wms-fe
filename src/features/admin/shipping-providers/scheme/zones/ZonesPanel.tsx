// src/features/admin/shipping-providers/scheme/zones/ZonesPanel.tsx

import React from "react";
import type { PricingSchemeDetail, PricingSchemeZone } from "../../api";
import { ZoneCreateForm, type CreateZonePayload } from "./ZoneCreateForm";
import { ZoneList } from "./ZoneList";

export const ZonesPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;
  selectedZoneId: number | null;

  onError: (msg: string) => void;
  onSelectZone: (zoneId: number) => void;

  onCreate: (payload: CreateZonePayload) => Promise<void>;
  onToggle: (z: PricingSchemeZone) => Promise<void>;
  onDelete: (z: PricingSchemeZone) => Promise<void>;
}> = ({ detail, disabled, selectedZoneId, onError, onSelectZone, onCreate, onToggle, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-base font-semibold text-slate-900">地区规则（Zone）维护</div>
        <div className="mt-1 text-sm text-slate-600">
          Zone 用于对目的地分组。后续 Member/Bracket 都依附在 Zone 下。
        </div>
      </div>

      <ZoneCreateForm disabled={disabled} onCreate={onCreate} onError={onError} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-800">Zone 列表（可启停/删除/选择）</div>
          <div className="text-sm text-slate-600">
            当前选择：{" "}
            <span className="font-mono">
              {selectedZoneId ? `zone_id=${selectedZoneId}` : "未选择"}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <ZoneList
            zones={detail.zones ?? []}
            selectedZoneId={selectedZoneId}
            disabled={disabled}
            onSelectZone={onSelectZone}
            onToggleZone={onToggle}
            onDeleteZone={onDelete}
          />
        </div>
      </div>
    </div>
  );
};
