// src/features/admin/shipping-providers/scheme/zones/ZonesPanel.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PricingSchemeDetail, PricingSchemeZone } from "../../api";
import { ZoneList } from "./ZoneList";
import { RegionSelector } from "../components/RegionSelector";
import { UI } from "../ui";

function buildNameFromProvinces(list: string[]): string {
  const cleaned = (list ?? []).map((x) => (x || "").trim()).filter(Boolean);
  if (cleaned.length === 0) return "";
  return cleaned.join("、");
}

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return fallback;
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

  const doCommit = async () => {
    const ps = (provinces ?? []).map((x) => (x || "").trim()).filter(Boolean);
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
          <RegionSelector value={provinces} onChange={setProvinces} disabled={disabled} title="选择省份（必选）" hint="" />
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
            当前编辑： <span className="font-mono">{selectedZoneId ? `zone_id=${selectedZoneId}` : "未选择"}</span>
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
