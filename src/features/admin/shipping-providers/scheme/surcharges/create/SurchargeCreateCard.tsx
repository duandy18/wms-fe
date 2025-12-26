// src/features/admin/shipping-providers/scheme/surcharges/create/SurchargeCreateCard.tsx

import React, { useMemo, useState } from "react";
import type { PricingSchemeSurcharge } from "../../../api";
import { useSurchargeDraft } from "./useSurchargeDraft";
import type { ScopeRow } from "./SelectedScopePriceTable";

import { ProvincesSectionCard } from "./ProvincesSectionCard";
import { CitiesSectionCard } from "./CitiesSectionCard";
import { ScopeTableSectionCard } from "./ScopeTableSectionCard";
import { BulkyFeeSectionCard } from "./BulkyFeeSectionCard";

import { getDestKeyFromSurcharge, readAmt, toNum } from "./surchargeCreateUtils";

export const SurchargeCreateCard: React.FC<{
  schemeId: number;
  existingSurcharges: PricingSchemeSurcharge[];

  disabled?: boolean;

  onCreate: (payload: {
    name: string;
    priority: number;
    condition_json: Record<string, unknown>;
    amount_json: Record<string, unknown>;
  }) => Promise<void>;

  onPatch: (
    surchargeId: number,
    payload: Partial<{
      name: string;
      priority: number;
      active: boolean;
      condition_json: Record<string, unknown>;
      amount_json: Record<string, unknown>;
    }>,
  ) => Promise<void>;

  onError: (msg: string) => void;
}> = ({ schemeId, existingSurcharges, disabled, onCreate, onPatch, onError }) => {
  // ✅ 稳定化 existing，消除 react-hooks/exhaustive-deps warning
  const existing = useMemo(() => (Array.isArray(existingSurcharges) ? existingSurcharges : []), [existingSurcharges]);

  const d = useSurchargeDraft({ schemeId, existingSurcharges: existing });

  const tableRows: ScopeRow[] = d.scopeRows.map((r) => ({
    id: r.id,
    scope: r.scope,
    label: r.label,
  }));

  const validationMsg = useMemo(() => {
    if (tableRows.length === 0) return "第三表为空：请先在第一/第二部分选择并保存。";
    const bad = Object.entries(d.rowAmountErrors);
    if (bad.length > 0) return `金额未填完/有误（共 ${bad.length} 项）`;
    return null;
  }, [tableRows.length, d.rowAmountErrors]);

  // 只针对目的地附加费（flat）做“按省/市去重查找”
  const existingByDestKey = useMemo(() => {
    const map = new Map<string, PricingSchemeSurcharge>();
    for (const s of existing) {
      const amt = readAmt(s);
      const kind = String(amt["kind"] ?? "flat").toLowerCase();
      if (kind !== "flat") continue;

      const k = getDestKeyFromSurcharge(s);
      if (!k) continue;

      const prev = map.get(k);
      if (!prev || (s.id ?? 0) > (prev.id ?? 0)) map.set(k, s);
    }
    return map;
  }, [existing]);

  const handleGenerate = async () => {
    if (validationMsg) return onError(validationMsg);

    const baseName = "目的地附加费";
    const priority = 100;

    for (const r of d.scopeRows) {
      const amt = toNum(d.amountById[r.id] ?? "");
      if (amt === null || amt < 0) return onError(`金额无效：${r.label}`);

      const isProvince = r.scope === "province";
      const destKey = isProvince ? `province:${r.province}` : `city:${r.city!}`;

      const condition_json = isProvince
        ? { dest: { province: [r.province] } }
        : { dest: { province: [r.province], city: [r.city!] } };

      const amount_json = { kind: "flat", amount: amt };
      const name = `${baseName}-${r.label}`;

      const old = existingByDestKey.get(destKey);
      if (old) {
        await onPatch(old.id, { name, priority, active: true, condition_json, amount_json });
      } else {
        await onCreate({ name, priority, condition_json, amount_json });
      }
    }

    d.saveTable();
  };

  // 维持一个“生成中”轻状态（避免重复点击）
  const [generating, setGenerating] = useState(false);

  return (
    <div className="space-y-4">
      <ProvincesSectionCard
        disabled={disabled}
        editing={d.provinceEditing}
        collapsed={d.provinceCollapsed}
        subtitleEditing="编辑中：选完点“保存”。"
        subtitleLocked="已锁定：点“修改”才能改。"
        onToggleCollapsed={() => d.setProvinceCollapsed(!d.provinceCollapsed)}
        onSave={d.saveProvinces}
        onEdit={d.editProvinces}
        value={d.provinceDraft}
        onChange={d.setProvinceDraft}
      />

      <CitiesSectionCard
        disabled={disabled}
        editing={d.cityEditing}
        collapsed={d.cityCollapsed}
        subtitleEditing="编辑中：选完点“保存”。（这里不填价格）"
        subtitleLocked="已锁定：点“修改”才能改。"
        onToggleCollapsed={() => d.setCityCollapsed(!d.cityCollapsed)}
        onSave={d.saveCities}
        onEdit={d.editCities}
        selectedProvinces={d.cityPickerProvinces}
        onChangeSelectedProvinces={d.setCityPickerProvinces}
        selectedCities={d.cityDraft}
        onChangeSelectedCities={d.setCityDraft}
        hint="第二部分只选城市，不录价；价格在第三部分清单表逐行填写。"
      />

      <ScopeTableSectionCard
        disabled={disabled || generating}
        tableEditing={d.tableEditing}
        onSaveTable={d.saveTable}
        onEditTable={d.editTable}
        onGenerate={async () => {
          setGenerating(true);
          try {
            await handleGenerate();
          } finally {
            setGenerating(false);
          }
        }}
        validationMsg={validationMsg}
        rows={tableRows}
        amountById={d.amountById}
        onChangeAmount={d.setAmountForId}
        tableDisabled={!!disabled || !d.tableEditing}
      />

      <BulkyFeeSectionCard existingSurcharges={existing} disabled={disabled} onCreate={onCreate} onPatch={onPatch} onError={onError} />
    </div>
  );
};

export default SurchargeCreateCard;
