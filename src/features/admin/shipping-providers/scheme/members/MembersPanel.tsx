// src/features/admin/shipping-providers/scheme/members/MembersPanel.tsx

import React, { useMemo } from "react";
import type { PricingSchemeDetail, PricingSchemeZone, PricingSchemeZoneMember } from "../../api";
import { MemberCreateForm, type CreateMemberPayload } from "./MemberCreateForm";
import { MemberList } from "./MemberList";

export const MembersPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;

  selectedZoneId: number | null;
  onSelectZone: (zoneId: number) => void;

  onError: (msg: string) => void;
  onCreate: (payload: CreateMemberPayload) => Promise<void>;
  onDelete: (m: PricingSchemeZoneMember) => Promise<void>;
}> = ({ detail, disabled, selectedZoneId, onSelectZone, onError, onCreate, onDelete }) => {
  const zones = detail.zones ?? [];

  const selectedZone = useMemo<PricingSchemeZone | null>(() => {
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId) ?? null;
  }, [zones, selectedZoneId]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-base font-semibold text-slate-900">命中条件（Member）维护</div>
        <div className="mt-1 text-sm text-slate-600">
          Member 用于让 Zone 命中目的地（province/city/district/text）。Member 只属于某个 Zone。
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-800">选择 Zone（Member 依附于 Zone）</div>
          <div className="text-sm text-slate-600">
            当前选择：<span className="font-mono">{selectedZoneId ? `zone_id=${selectedZoneId}` : "未选择"}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-base"
            value={selectedZoneId ?? ""}
            disabled={disabled}
            onChange={(e) => onSelectZone(e.target.value ? Number(e.target.value) : 0)}
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
                {selectedZone.name} · members {selectedZone.members.length} · brackets {selectedZone.brackets.length}
              </span>
            ) : (
              <span>请先选择一个 Zone</span>
            )}
          </div>
        </div>
      </div>

      {!selectedZone ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          你还没有选择 Zone。请先在上方选择一个 Zone，再新增/删除命中条件。
        </div>
      ) : (
        <>
          <MemberCreateForm disabled={disabled} onCreate={onCreate} onError={onError} />

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-sm font-semibold text-slate-800">
              当前 Zone 的命中条件（Members） · <span className="font-mono">{selectedZone.name}</span>
            </div>
            <div className="mt-3">
              <MemberList members={selectedZone.members ?? []} disabled={disabled} onDelete={onDelete} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
