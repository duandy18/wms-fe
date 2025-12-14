// src/features/admin/shipping-providers/scheme/zones/ZoneRow.tsx

import React from "react";
import type { PricingSchemeZone } from "../../api";
import { confirmDeleteZoneText } from "./zoneActions";

export const ZoneRow: React.FC<{
  zone: PricingSchemeZone;
  selected?: boolean;
  disabled?: boolean;
  onSelect: (zoneId: number) => void;
  onToggleActive: (zone: PricingSchemeZone) => Promise<void>;
  onDelete: (zone: PricingSchemeZone) => Promise<void>;
}> = ({ zone, selected, disabled, onSelect, onToggleActive, onDelete }) => {
  return (
    <div className={`rounded-2xl border p-4 ${selected ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button
          type="button"
          disabled={disabled}
          className="text-left"
          onClick={() => onSelect(zone.id)}
          title="选择该 Zone 作为后续 Member/Bracket 的编辑目标"
        >
          <div className="text-base font-semibold text-slate-900">
            {zone.name}
            <span className="ml-2 text-sm text-slate-500 font-mono">id={zone.id}</span>
          </div>
          <div className="mt-1 text-sm text-slate-600">
            优先级 <span className="font-mono">{zone.priority}</span> · 状态{" "}
            <span className={`font-semibold ${zone.active ? "text-emerald-700" : "text-slate-500"}`}>
              {zone.active ? "启用" : "停用"}
            </span>
          </div>
          <div className="mt-1 text-sm text-slate-500">
            Members {zone.members?.length ?? 0} · Brackets {zone.brackets?.length ?? 0}
          </div>
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60"
            onClick={() => void onToggleActive(zone)}
          >
            {zone.active ? "停用" : "启用"}
          </button>

          <button
            type="button"
            disabled={disabled}
            className="inline-flex items-center rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
            onClick={() => {
              const ok = window.confirm(confirmDeleteZoneText(zone.name));
              if (!ok) return;
              void onDelete(zone);
            }}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
};
