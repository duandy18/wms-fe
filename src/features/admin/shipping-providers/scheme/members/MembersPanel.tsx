// src/features/admin/shipping-providers/scheme/members/MembersPanel.tsx

import React, { useMemo } from "react";
import type { PricingSchemeDetail, PricingSchemeZone, PricingSchemeZoneMember } from "../../api";
import { MemberCreateForm, type CreateMemberPayload } from "./MemberCreateForm";
import { MemberList } from "./MemberList";
import { UI } from "../ui";
import { buildProvinceOccupancy } from "../zones/regionRules";

function zoneDisplayName(z: PricingSchemeZone | null): string {
  if (!z) return "未选择";
  const name = (z.name ?? "").trim();
  return name ? name : `区域#${z.id}`;
}

export const MembersPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;

  selectedZoneId: number | null;
  onSelectZone: (zoneId: number) => void;

  onError: (msg: string) => void;
  onCreate: (payload: CreateMemberPayload) => Promise<void>;
  onDelete: (m: PricingSchemeZoneMember) => Promise<void>;
}> = ({ detail, disabled, selectedZoneId, onSelectZone, onError, onCreate, onDelete }) => {
  const zones = useMemo(() => detail.zones ?? [], [detail.zones]);

  const selectedZone = useMemo<PricingSchemeZone | null>(() => {
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId) ?? null;
  }, [zones, selectedZoneId]);

  // ✅ 对 province 级别：禁选“已被其它 active zone 占用的省”（放行当前 selected zone）
  const occupancy = useMemo(() => {
    return buildProvinceOccupancy(zones as unknown[], { editingZoneId: selectedZoneId });
  }, [zones, selectedZoneId]);

  return (
    <div className="space-y-4">
      <div className={UI.cardTight}>
        <div className={UI.panelTitle}>目的地命中规则</div>
        <div className={`mt-1 ${UI.panelHint}`}>
          让“区域分类（Zone）”能命中订单地址。一般只需要配置 省 / 市 / 区（文本规则仅在特殊场景用）。
        </div>
      </div>

      <div className={UI.cardTight}>
        <div className={UI.headerRow}>
          <div className={UI.sectionTitle}>选择要维护的区域分类（Zone）</div>
          <div className={UI.headerMeta}>
            当前选择： <span className={UI.headerMetaMono}>{zoneDisplayName(selectedZone)}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
            className={UI.selectBase}
            value={selectedZoneId ?? ""}
            disabled={disabled}
            onChange={(e) => onSelectZone(e.target.value ? Number(e.target.value) : 0)}
          >
            <option value="">请选择…</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          <div className={`${UI.helpText} flex items-center`}>
            {selectedZone ? (
              <span className={UI.headerMetaMono}>
                {selectedZone.name} · 命中条件 {selectedZone.members.length} · 价格规则 {selectedZone.brackets.length}
              </span>
            ) : (
              <span>请先选择一个 Zone</span>
            )}
          </div>
        </div>
      </div>

      {!selectedZone ? (
        <div className={UI.cardSoft}>
          <div className={UI.emptyText}>你还没有选择 Zone。请先在上方选择一个 Zone，再新增/删除命中规则。</div>
        </div>
      ) : (
        <>
          <MemberCreateForm
            disabled={disabled}
            onCreate={onCreate}
            onError={onError}
            selectedZoneName={selectedZone.name}
            blockedReasonByProvince={occupancy.reasonByProvince}
          />

          <div className={UI.cardTight}>
            <div className={UI.sectionTitle}>
              当前 Zone 的命中规则 · <span className={UI.headerMetaMono}>{selectedZone.name}</span>
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

export default MembersPanel;
