// src/features/admin/shipping-providers/scheme/zones/ZoneCreateForm.tsx

import React, { useEffect, useMemo, useState } from "react";
import { UI } from "../../ui";
import { RegionSelector } from "../components/RegionSelector";
import type { PricingSchemeZone } from "../../api";

export type CreateZonePayload = { name: string; priority: number };

function buildZoneNameFromProvinces(list: string[]): string {
  const cleaned = (list ?? []).map((x) => (x || "").trim()).filter(Boolean);
  if (cleaned.length === 0) return "";
  return cleaned.join("、");
}

export const ZoneCreateForm: React.FC<{
  disabled?: boolean;
  onCreate: (payload: CreateZonePayload) => Promise<PricingSchemeZone>;
  onError: (msg: string) => void;
  onCreateWithProvinces?: (payload: CreateZonePayload, provinces: string[]) => Promise<void>;

  // ✅ 占用原因：省份 -> “已在：XX 区域”
  blockedReasonByProvince?: Record<string, string>;
}> = ({ disabled, onCreate, onError, onCreateWithProvinces, blockedReasonByProvince }) => {
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);

  const [provinces, setProvinces] = useState<string[]>([]);

  const suggestedName = useMemo(() => buildZoneNameFromProvinces(provinces), [provinces]);

  useEffect(() => {
    if (disabled) return;

    const s = suggestedName.trim();
    if (!s) return;

    const current = name.trim();
    if (!nameTouched || current === "") {
      setName(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedName]);

  const handleCreate = async () => {
    const cleanedProvinces = (provinces ?? []).map((x) => (x || "").trim()).filter(Boolean);
    if (cleanedProvinces.length === 0) {
      onError("必须选择省份");
      return;
    }

    const n = name.trim();
    if (!n) {
      onError("名称必填");
      return;
    }

    const payload: CreateZonePayload = { name: n, priority: 100 };

    if (onCreateWithProvinces) {
      await onCreateWithProvinces(payload, cleanedProvinces);
      setName("");
      setNameTouched(false);
      setProvinces([]);
      return;
    }

    await onCreate(payload);
    setName("");
    setNameTouched(false);
    setProvinces([]);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-800">新增区域收费规则</div>

      <div className="mt-4">
        <RegionSelector
          value={provinces}
          onChange={setProvinces}
          disabled={disabled}
          title="选择省份（必选）"
          hint=""
          blockedReasonByProvince={blockedReasonByProvince}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm text-slate-600">名称 *</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameTouched(true);
            }}
            disabled={disabled}
            placeholder="如：广东、福建 / 江浙沪 / 北京"
          />
        </div>

        <div className="flex items-end">
          <button
            className={UI.btnPrimaryGreen}
            type="button"
            disabled={disabled}
            onClick={() => void handleCreate()}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
};
