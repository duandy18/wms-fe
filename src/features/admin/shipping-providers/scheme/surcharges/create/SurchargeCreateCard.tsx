// src/features/admin/shipping-providers/scheme/surcharges/create/SurchargeCreateCard.tsx

import React, { useMemo, useState } from "react";
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
  collapsed: boolean;
  onToggleCollapsed: () => void;
  right?: React.ReactNode;
}) {
  const { title, collapsed, onToggleCollapsed, right } = props;
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-sm font-semibold text-slate-800">{title}</div>

      <div className="flex items-center gap-2">
        {right}
        <button type="button" className={UI.btnNeutralSm} onClick={onToggleCollapsed}>
          {collapsed ? "展开" : "折叠"}
        </button>
      </div>
    </div>
  );
}

type ProvinceRow = { province: string; status: "已保存" | "未保存" };

function buildProvinceRows(args: { draft: string[]; saved: string[] }): ProvinceRow[] {
  const draft = Array.isArray(args.draft) ? args.draft : [];
  const savedSet = new Set((Array.isArray(args.saved) ? args.saved : []).map((x) => String(x).trim()).filter(Boolean));

  const cleanedDraft = draft
    .map((x) => String(x).trim())
    .filter(Boolean);

  // 去重 + 保序
  const seen = new Set<string>();
  const uniq = cleanedDraft.filter((p) => {
    if (seen.has(p)) return false;
    seen.add(p);
    return true;
  });

  return uniq.map((p) => ({ province: p, status: savedSet.has(p) ? "已保存" : "未保存" }));
}

export const SurchargeCreateCard: React.FC<{
  schemeId: number;
  existingSurcharges: PricingSchemeSurcharge[];

  disabled?: boolean;

  onCreate: (payload: { name: string; condition_json: Record<string, unknown>; amount_json: Record<string, unknown> }) => Promise<void>;

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
  const existing = useMemo(() => (Array.isArray(existingSurcharges) ? existingSurcharges : []), [existingSurcharges]);

  const d = useSurchargeDraft({ schemeId, existingSurcharges: existing });

  // ✅ 就地绿条：用于 “UI 保存（draft→saved）” 的明确回执（不等同于后端写入）
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const flashOkLocal = (msg: string) => {
    setOkMsg(msg);
    window.setTimeout(() => setOkMsg(null), 2200);
  };

  const tableRows: ScopeRow[] = d.scopeRows.map((r) => ({
    id: r.id,
    scope: r.scope,
    label: r.label,
  }));

  const validationMsg = useMemo(() => {
    if (tableRows.length === 0) return "无可生成条目";
    const bad = Object.entries(d.rowAmountErrors);
    if (bad.length > 0) return `金额未填完/有误（${bad.length}）`;
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

  const selectedProvinceRows = useMemo(() => {
    return buildProvinceRows({ draft: d.provinceDraft, saved: d.provinceSaved });
  }, [d.provinceDraft, d.provinceSaved]);

  const handleGenerate = async () => {
    if (validationMsg) return onError(validationMsg);

    try {
      for (const r of d.scopeRows) {
        const amt = toNum(d.amountById[r.id] ?? "");
        if (amt === null || amt < 0) return onError(`金额无效：${r.label}`);

        const isProvince = r.scope === "province";
        const destKey = isProvince ? `province:${r.province}` : `city:${r.city!}`;

        const condition_json = isProvince
          ? { dest: { province: [r.province] } }
          : { dest: { province: [r.province], city: [r.city!] } };

        const amount_json = { kind: "flat", amount: amt };

        const name = String(r.label ?? "").trim() || destKey;

        const old = existingByDestKey.get(destKey);
        if (old) {
          await onPatch(old.id, { name, active: true, condition_json, amount_json });
        } else {
          await onCreate({ name, condition_json, amount_json });
        }
      }

      d.saveTable();
      flashOkLocal("已生成并更新（写入规则）");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "生成/更新失败";
      onError(msg);
    }
  };

  return (
    <div className="space-y-4">
      {okMsg ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{okMsg}</div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <SectionHeader
          title="选择省"
          collapsed={d.provinceCollapsed}
          onToggleCollapsed={() => d.setProvinceCollapsed(!d.provinceCollapsed)}
          right={
            d.provinceEditing ? (
              <button
                type="button"
                className={UI.btnPrimaryGreen}
                disabled={disabled}
                onClick={() => {
                  d.saveProvinces();
                  flashOkLocal("已保存省份选择");
                }}
              >
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
          <div className="mt-3 space-y-3">
            <ProvincePicker value={d.provinceDraft} onChange={d.setProvinceDraft} disabled={disabled || !d.provinceEditing} />

            {/* ✅ 已选列表：紧贴勾选网格下面，显式化事实（两列：省份 / 状态） */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 text-sm font-semibold text-slate-800">已选附加费省份</div>

              {selectedProvinceRows.length === 0 ? (
                <div className="text-sm text-slate-600">未选择任何省份</div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">省份</th>
                        <th className="px-3 py-2 text-left font-semibold">状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedProvinceRows.map((r) => (
                        <tr key={r.province}>
                          <td className="px-3 py-2 text-slate-900">{r.province}</td>
                          <td className="px-3 py-2">
                            {r.status === "已保存" ? (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">已保存</span>
                            ) : (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">未保存</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <SectionHeader
          title="选择城市"
          collapsed={d.cityCollapsed}
          onToggleCollapsed={() => d.setCityCollapsed(!d.cityCollapsed)}
          right={
            d.cityEditing ? (
              <button
                type="button"
                className={UI.btnPrimaryGreen}
                disabled={disabled}
                onClick={() => {
                  d.saveCities();
                  flashOkLocal("已保存城市选择");
                }}
              >
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
            />
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div />
          <div className="flex items-center gap-2">
            {d.tableEditing ? (
              <button
                type="button"
                className={UI.btnPrimaryGreen}
                disabled={disabled}
                onClick={() => {
                  d.saveTable();
                  flashOkLocal("已锁定金额清单");
                }}
              >
                保存
              </button>
            ) : (
              <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={d.editTable}>
                修改
              </button>
            )}

            <button type="button" className={UI.btnPrimaryGreen} disabled={disabled} onClick={() => void handleGenerate()}>
              生成/更新
            </button>
          </div>
        </div>

        {validationMsg ? <div className="mt-2 text-sm text-red-700">{validationMsg}</div> : null}

        <div className="mt-3">
          <SelectedScopePriceTable
            title=""
            rows={tableRows}
            amountById={d.amountById}
            onChangeAmount={d.setAmountForId}
            disabled={disabled || !d.tableEditing}
            emptyText="—"
          />
        </div>
      </div>

      <BulkyFeeCard existingSurcharges={existing} disabled={disabled} onCreate={onCreate} onPatch={onPatch} onError={onError} />
    </div>
  );
};

export default SurchargeCreateCard;
