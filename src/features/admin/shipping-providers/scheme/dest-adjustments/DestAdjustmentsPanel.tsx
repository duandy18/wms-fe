// src/features/admin/shipping-providers/scheme/dest-adjustments/DestAdjustmentsPanel.tsx
import React, { useState } from "react";
import type { PricingSchemeDestAdjustment } from "../../api/types";
import { useGeoOptions } from "./hooks/useGeoOptions";
import { extractConflictIds, extractGeoErrorMessage } from "./utils/errors";
import DestAdjustmentsUpsertCard from "./components/DestAdjustmentsUpsertCard";
import DestAdjustmentsTable from "./components/DestAdjustmentsTable";

type Scope = "province" | "city";

export const DestAdjustmentsPanel: React.FC<{
  schemeId: number;
  list: PricingSchemeDestAdjustment[];
  disabled: boolean;
  onError: (msg: string) => void;
  onUpsert: (payload: {
    scope: Scope;
    province_code: string;
    city_code?: string | null;
    province_name?: string | null;
    city_name?: string | null;
    amount: number;
    active?: boolean;
    priority?: number;
  }) => Promise<void>;
  onPatch: (id: number, payload: Partial<{ active: boolean; amount: number; priority: number }>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}> = (p) => {
  const [scope, setScope] = useState<Scope>("city");

  const [provinceCode, setProvinceCode] = useState("");
  const [cityCode, setCityCode] = useState("");

  const [busy, setBusy] = useState(false);

  const geo = useGeoOptions({
    provinceCode,
    cityCode,
    onError: p.onError,
  });

  async function doUpsert(payload: {
    scope: Scope;
    province_code: string;
    city_code?: string | null;
    province_name?: string | null;
    city_name?: string | null;
    amount: number;
    active?: boolean;
    priority?: number;
  }) {
    if (p.disabled || busy) return;

    setBusy(true);
    try {
      await p.onUpsert(payload);
    } catch (e) {
      const geoMsg = extractGeoErrorMessage(e);
      if (geoMsg) {
        p.onError(geoMsg);
        return;
      }

      const ids = extractConflictIds(e);
      if (ids.length) {
        p.onError(`互斥冲突：请先停用冲突项（id=${ids.join(", ")}）`);
      } else {
        p.onError(e instanceof Error ? e.message : "写入失败");
      }
    } finally {
      setBusy(false);
    }
  }

  async function doToggle(x: PricingSchemeDestAdjustment) {
    if (p.disabled || busy) return;
    setBusy(true);
    try {
      await p.onPatch(x.id, { active: !x.active });
    } catch (e) {
      const ids = extractConflictIds(e);
      if (ids.length) {
        p.onError(`互斥冲突：请先停用冲突项（id=${ids.join(", ")}）`);
      } else {
        p.onError(e instanceof Error ? e.message : "更新失败");
      }
    } finally {
      setBusy(false);
    }
  }

  async function doDeleteRow(x: PricingSchemeDestAdjustment) {
    if (p.disabled || busy) return;

    if (x.active) {
      p.onError("启用态不可删除：请先停用");
      return;
    }

    setBusy(true);
    try {
      await p.onDelete(x.id);
    } catch (e) {
      p.onError(e instanceof Error ? e.message : "删除失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-800">目的地附加费（结构化事实）</div>
      <div className="mt-1 text-sm text-slate-600">
        规则：同一省份下 <span className="font-semibold">市优先（city wins）</span>；province 与 city 不允许同时启用（互斥由后端强制）。
      </div>
      <div className="mt-1 text-sm text-slate-600">
        输入口径：只允许选择 <span className="font-semibold">标准行政区划码（GB2260）</span>，不再接受自由文本。
      </div>

      <DestAdjustmentsUpsertCard
        disabled={p.disabled}
        busy={busy}
        geoLoading={geo.geoLoading}
        scope={scope}
        setScope={setScope}
        provinces={geo.provinces}
        cities={geo.cities}
        provinceCode={provinceCode}
        setProvinceCode={setProvinceCode}
        cityCode={cityCode}
        setCityCode={setCityCode}
        provinceName={geo.provinceName}
        cityName={geo.cityName}
        onError={p.onError}
        onSubmit={doUpsert}
      />

      <DestAdjustmentsTable list={p.list} disabled={p.disabled} busy={busy} onToggle={doToggle} onDelete={doDeleteRow} />
    </div>
  );
};

export default DestAdjustmentsPanel;
