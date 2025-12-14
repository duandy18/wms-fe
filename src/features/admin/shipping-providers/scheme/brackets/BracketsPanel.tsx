// src/features/admin/shipping-providers/scheme/brackets/BracketsPanel.tsx

import React, { useMemo } from "react";
import type { PricingSchemeDetail, PricingSchemeZone, PricingSchemeZoneBracket } from "../../api";
import { BracketCreateForm, type CreateBracketPayload } from "./BracketCreateForm";
import { BracketList } from "./BracketList";

export const BracketsPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;

  selectedZoneId: number | null;
  onSelectZone: (zoneId: number | null) => void;

  onError: (msg: string) => void;

  onCreate: (zoneId: number, payload: CreateBracketPayload) => Promise<void>;
  onToggle: (b: PricingSchemeZoneBracket) => Promise<void>;
  onDelete: (b: PricingSchemeZoneBracket) => Promise<void>;
}> = ({
  detail,
  disabled,
  selectedZoneId,
  onSelectZone,
  onError,
  onCreate,
  onToggle,
  onDelete,
}) => {
  const zones = detail.zones ?? [];

  const selectedZone = useMemo<PricingSchemeZone | null>(() => {
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId) ?? null;
  }, [zones, selectedZoneId]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-base font-semibold text-slate-900">重量区间（Bracket）维护</div>
        <div className="mt-1 text-sm text-slate-600">
          Bracket 属于某个 Zone：Zone 命中后按计费重落入区间，得到基础费用（base）。
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-800">选择 Zone（Bracket 依附于 Zone）</div>
          <div className="text-sm text-slate-600">
            当前选择：<span className="font-mono">{selectedZoneId ? `zone_id=${selectedZoneId}` : "未选择"}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-base"
            value={selectedZoneId ?? ""}
            disabled={disabled}
            onChange={(e) => onSelectZone(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">请选择…</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} (id={z.id})
              </option>
            ))}
          </select>

          <div className="text-sm text-slate-600 flex items-center">
            {selectedZone ? (
              <span className="font-mono">
                {selectedZone.name} · brackets {selectedZone.brackets.length} · members {selectedZone.members.length}
              </span>
            ) : (
              <span>请先选择一个 Zone</span>
            )}
          </div>
        </div>
      </div>

      {!selectedZone ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          你还没有选择 Zone。请先选择 Zone，再新增/启停/删除重量区间。
        </div>
      ) : (
        <>
          <BracketCreateForm
            disabled={disabled}
            onError={onError}
            onCreate={async (payload) => {
              await onCreate(selectedZone.id, payload);
            }}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-sm font-semibold text-slate-800">
              当前 Zone 的重量区间（Brackets） · <span className="font-mono">{selectedZone.name}</span>
            </div>
            <div className="mt-1 text-sm text-slate-500">
              列表区域内部滚动（避免顶栏被挤出视口）。
            </div>

            {/* ✅ 关键：只压缩列表区域，不动外层滚动 */}
            <div className="mt-3 max-h-[38vh] overflow-y-auto pr-1 pb-1">
              <BracketList
                list={selectedZone.brackets ?? []}
                disabled={disabled}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
