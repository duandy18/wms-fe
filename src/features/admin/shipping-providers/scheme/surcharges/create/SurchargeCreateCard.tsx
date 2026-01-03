// src/features/admin/shipping-providers/scheme/surcharges/create/SurchargeCreateCard.tsx

import React, { useMemo } from "react";
import type { PricingSchemeSurcharge } from "../../../api";
import { UI } from "../../ui";
import { ProvincePicker } from "./ProvincePicker";
import { CityPicker } from "./CityPicker";
import { SelectedScopePriceTable, type ScopeRow } from "./SelectedScopePriceTable";
import { useSurchargeDraft } from "./useSurchargeDraft";
import { BulkyFeeCard } from "@/features/admin/shipping-providers/scheme/surcharges/cards/BulkyFeeCard";

import { getDestKeyFromSurcharge, readAmt, toNum } from "./utils";

function SectionHeader(props: {
  title: string;
  subtitle?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  right?: React.ReactNode;
}) {
  const { title, subtitle, collapsed, onToggleCollapsed, right } = props;
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-slate-600">{subtitle}</div> : null}
      </div>

      <div className="flex items-center gap-2">
        {right}
        <button type="button" className={UI.btnNeutralSm} onClick={onToggleCollapsed}>
          {collapsed ? "展开" : "折叠"}
        </button>
      </div>
    </div>
  );
}

export const SurchargeCreateCard: React.FC<{
  schemeId: number;
  existingSurcharges: PricingSchemeSurcharge[];

  disabled?: boolean;

  onCreate: (payload: {
    name: string;
    condition_json: Record<string, unknown>;
    amount_json: Record<string, unknown>;
  }) => Promise<void>;

  onPatch: (
    surchargeId: number,
    payload: Partial<{
      name: string;
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
        await onPatch(old.id, { name, active: true, condition_json, amount_json });
      } else {
        await onCreate({ name, condition_json, amount_json });
      }
    }

    d.saveTable();
  };

  return (
    <div className="space-y-4">
      {/* 卡 1：省 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <SectionHeader
          title="第一部分：选择省（全省收费）"
          subtitle={d.provinceEditing ? "编辑中：选完点“保存”。" : "已锁定：点“修改”才能改。"}
          collapsed={d.provinceCollapsed}
          onToggleCollapsed={() => d.setProvinceCollapsed(!d.provinceCollapsed)}
          right={
            d.provinceEditing ? (
              <button type="button" className={UI.btnPrimaryGreen} disabled={disabled} onClick={d.saveProvinces}>
                保存
              </button>
            ) : (
              <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={d.editProvinces}>
                修改
              </button>
            )
          }
        />
        {!d.provinceCollapsed ? (
          <div className="mt-3">
            <ProvincePicker value={d.provinceDraft} onChange={d.setProvinceDraft} disabled={disabled || !d.provinceEditing} />
          </div>
        ) : null}
      </div>

      {/* 卡 2：城市 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <SectionHeader
          title="第二部分：选择城市（省内点名收费）"
          subtitle={d.cityEditing ? "编辑中：选完点“保存”。（这里不填价格）" : "已锁定：点“修改”才能改。"}
          collapsed={d.cityCollapsed}
          onToggleCollapsed={() => d.setCityCollapsed(!d.cityCollapsed)}
          right={
            d.cityEditing ? (
              <button type="button" className={UI.btnPrimaryGreen} disabled={disabled} onClick={d.saveCities}>
                保存
              </button>
            ) : (
              <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={d.editCities}>
                修改
              </button>
            )
          }
        />
        {!d.cityCollapsed ? (
          <div className="mt-3">
            <CityPicker
              selectedProvinces={d.cityPickerProvinces}
              onChangeSelectedProvinces={d.setCityPickerProvinces}
              selectedCities={d.cityDraft}
              onChangeSelectedCities={d.setCityDraft}
              disabled={disabled || !d.cityEditing}
              hint="第二部分只选城市，不录价；价格在第三部分清单表逐行填写。"
            />
          </div>
        ) : null}
      </div>

      {/* 卡 3：清单 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-800">第三部分：已保存的省/城市清单（逐行录价）</div>
            <div className="mt-1 text-sm text-slate-600">保存后金额锁定，必须点“修改”才能再改。</div>
          </div>

          <div className="flex items-center gap-2">
            {d.tableEditing ? (
              <button type="button" className={UI.btnPrimaryGreen} disabled={disabled} onClick={d.saveTable}>
                保存金额
              </button>
            ) : (
              <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={d.editTable}>
                修改金额
              </button>
            )}

            <button type="button" className={UI.btnPrimaryGreen} disabled={disabled} onClick={() => void handleGenerate()}>
              生成/更新附加费
            </button>
          </div>
        </div>

        {validationMsg ? <div className="mt-2 text-sm text-red-700">{validationMsg}</div> : null}

        <div className="mt-3">
          <SelectedScopePriceTable
            title="（清单表）"
            rows={tableRows}
            amountById={d.amountById}
            onChangeAmount={d.setAmountForId}
            disabled={disabled || !d.tableEditing}
            emptyText="第三表为空：请先在第一/第二部分选择后点击“保存”。"
          />
        </div>
      </div>

      {/* 卡 4：异形件操作费 */}
      <BulkyFeeCard
        existingSurcharges={existing}
        disabled={disabled}
        onCreate={onCreate}
        onPatch={onPatch}
        onError={onError}
      />
    </div>
  );
};

export default SurchargeCreateCard;
