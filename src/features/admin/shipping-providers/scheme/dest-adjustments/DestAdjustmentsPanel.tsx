// src/features/admin/shipping-providers/scheme/dest-adjustments/DestAdjustmentsPanel.tsx
import React, { useMemo, useState } from "react";
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

  const [amountText, setAmountText] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [busy, setBusy] = useState(false);

  const geo = useGeoOptions({
    provinceCode,
    cityCode,
    onError: p.onError,
  });

  const editingRow = useMemo(() => {
    if (editingId == null) return null;
    const hit = (p.list ?? []).find((x) => Number(x.id) === Number(editingId)) ?? null;
    return hit;
  }, [editingId, p.list]);

  function resetForm() {
    setEditingId(null);
    setScope("city");
    setProvinceCode("");
    setCityCode("");
    setAmountText("");
  }

  function enterEdit(x: PricingSchemeDestAdjustment) {
    // ✅ 刚性：启用态不允许编辑（必须先停用）
    if (x.active) {
      p.onError("启用状态不可编辑：请先停用后再修改金额。");
      return;
    }

    setEditingId(x.id);
    setScope(x.scope === "city" ? "city" : "province");
    setProvinceCode(x.province_code ?? "");
    setCityCode(x.scope === "city" ? x.city_code ?? "" : "");
    setAmountText(typeof x.amount === "number" ? String(x.amount) : String(x.amount ?? ""));
  }

  async function doSubmit(payload: {
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
      if (editingRow) {
        await p.onPatch(editingRow.id, { amount: payload.amount });
      } else {
        await p.onUpsert(payload);
      }
      resetForm();
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
        p.onError(e instanceof Error ? e.message : "保存失败");
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
      // ✅ 若正在编辑该行，而它被切到启用态：强制退出编辑，避免“启用中编辑”的脏状态
      if (editingId === x.id && !x.active === false) {
        resetForm();
      }
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
      if (editingId === x.id) resetForm();
    } catch (e) {
      p.onError(e instanceof Error ? e.message : "删除失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-800">目的地附加费</div>

      <DestAdjustmentsUpsertCard
        disabled={p.disabled}
        busy={busy}
        geoLoading={geo.geoLoading}
        editing={editingRow != null}
        onCancelEdit={() => resetForm()}
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
        amountText={amountText}
        setAmountText={setAmountText}
        onError={p.onError}
        onSubmit={doSubmit}
      />

      <DestAdjustmentsTable
        list={p.list}
        disabled={p.disabled}
        busy={busy}
        onEdit={(x) => enterEdit(x)}
        onToggle={doToggle}
        onDelete={doDeleteRow}
      />
    </div>
  );
};

export default DestAdjustmentsPanel;
