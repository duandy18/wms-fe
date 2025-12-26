// src/features/admin/shipping-providers/scheme/zones/ZonesPanel.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PricingSchemeDetail, PricingSchemeZone } from "../../api";
import { ZoneList } from "./ZoneList";
import { RegionSelector } from "../components/RegionSelector";
import { UI } from "../ui";
import { buildProvinceOccupancy } from "./regionRules";

function buildNameFromProvinces(list: string[]): string {
  const cleaned = (list ?? [])
    .map((x) => (x || "").trim())
    .filter(Boolean);
  if (cleaned.length === 0) return "";
  return cleaned.join("、");
}

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return fallback;
}

function zoneDisplayName(z: PricingSchemeZone | null | undefined): string {
  if (!z) return "未选择";
  const n = (z.name ?? "").trim();
  if (n) return n;
  return `区域#${z.id}`;
}

export const ZonesPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;
  selectedZoneId: number | null;

  onError: (msg: string) => void;
  onSelectZone: (zoneId: number) => void;

  // ✅ 提交创建（原子接口）：一次性创建 zone + 写入 provinces members
  onCommitCreate: (name: string, provinces: string[]) => Promise<void>;

  onToggle: (z: PricingSchemeZone) => Promise<void>;

  // 兼容保留：历史上可能有人从外部传入（当前组件不使用）
  onChangeBracketAmount?: (bracketId: number, nextAmountJson: unknown) => Promise<void>;
}> = ({ detail, disabled, selectedZoneId, onError, onSelectZone, onCommitCreate, onToggle }) => {
  // 草稿：省份 + 名称
  const [provinces, setProvinces] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);

  const suggestedName = useMemo(() => buildNameFromProvinces(provinces), [provinces]);

  useEffect(() => {
    if (disabled) return;
    const s = suggestedName.trim();
    if (!s) return;

    const cur = name.trim();
    if (!nameTouched || cur === "") {
      setName(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedName]);

  // ✅ 占用规则：已被 active zone 占用的省份不可再选（新增时不考虑 selectedZoneId）
  const occupancy = useMemo(() => {
    return buildProvinceOccupancy(detail.zones ?? []);
  }, [detail.zones]);

  const selectedZone = useMemo(() => {
    const zones = detail.zones ?? [];
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId) ?? null;
  }, [detail.zones, selectedZoneId]);

  const doCommit = async () => {
    const ps = (provinces ?? [])
      .map((x) => (x || "").trim())
      .filter(Boolean);

    if (ps.length === 0) {
      onError("必须选择省份");
      return;
    }

    const n = name.trim();
    if (!n) {
      onError("名称必填");
      return;
    }

    const confirmText =
      `请确认创建以下“区域分类”：\n\n` +
      `名称：${n}\n` +
      `省份：${ps.join("、")}\n\n` +
      `确认提交创建？`;

    const ok = window.confirm(confirmText);
    if (!ok) return;

    try {
      await onCommitCreate(n, ps);
      setProvinces([]);
      setName("");
      setNameTouched(false);
    } catch (e: unknown) {
      onError(getErrorMessage(e, "提交失败"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className={UI.zonePageTitle}>区域分类</div>
            <div className={`mt-1 ${UI.zonePageHint}`}>先创建区域分类（提交确认），再维护对应的价格规则。</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className={UI.zoneSectionTitle}>新增区域分类</div>

        <div className="mt-4">
          <RegionSelector
            value={provinces}
            onChange={setProvinces}
            disabled={disabled}
            title="选择省份（必选）"
            hint=""
            blockedReasonByProvince={occupancy.reasonByProvince}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col md:col-span-2">
            <label className={UI.zoneLabel}>名称 *</label>
            <input
              className={UI.zoneInput}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameTouched(true);
              }}
              disabled={disabled}
              placeholder="如：海南省、青海省 / 北京市、天津市、河北省"
            />
          </div>

          <div className="flex items-end">
            <button type="button" disabled={disabled} className={UI.zoneCommitBtn} onClick={() => void doCommit()}>
              提交创建
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div className={UI.zoneSectionTitle}>区域分类列表</div>
          <div className={UI.zonePageHint}>
            当前编辑： <span className="font-mono">{zoneDisplayName(selectedZone)}</span>
          </div>
        </div>

        <div className="mt-3">
          <ZoneList
            zones={detail.zones ?? []}
            selectedZoneId={selectedZoneId}
            disabled={disabled}
            onSelectZone={onSelectZone}
            onToggleZone={onToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default ZonesPanel;
