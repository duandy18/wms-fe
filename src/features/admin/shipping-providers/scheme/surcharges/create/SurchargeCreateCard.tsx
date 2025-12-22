// src/features/admin/shipping-providers/scheme/surcharges/create/SurchargeCreateCard.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PricingSchemeSurcharge } from "../../../api";
import { UI } from "../../ui";
import { ProvincePicker } from "./ProvincePicker";
import { CityPicker } from "./CityPicker";
import { SelectedScopePriceTable, type ScopeRow } from "./SelectedScopePriceTable";
import { useSurchargeDraft } from "./useSurchargeDraft";

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).map((x) => x.trim()).filter(Boolean);
}

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

function toNum(v: string): number | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function readCond(s: PricingSchemeSurcharge): Record<string, unknown> {
  return isRecord(s.condition_json) ? s.condition_json : {};
}
function readAmt(s: PricingSchemeSurcharge): Record<string, unknown> {
  return isRecord(s.amount_json) ? s.amount_json : {};
}

function getDestKeyFromSurcharge(s: PricingSchemeSurcharge): string | null {
  const cond = readCond(s);
  const destRaw = cond["dest"];
  const dest = isRecord(destRaw) ? destRaw : {};

  const provArr = asStringArray(dest["province"]);
  const cityArr = asStringArray(dest["city"]);

  if (cityArr.length === 1) return `city:${cityArr[0]}`;
  if (provArr.length === 1 && cityArr.length === 0) return `province:${provArr[0]}`;
  return null;
}

function findBulkySurcharge(existing: PricingSchemeSurcharge[]): PricingSchemeSurcharge | null {
  for (const s of existing) {
    const cond = readCond(s);
    const flags = asStringArray(cond["flag_any"]);
    if (flags.includes("bulky") || flags.includes("irregular")) return s;
  }
  return null;
}

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

  // 第四卡：异形件操作费（独立）
  const [bulkyEditing, setBulkyEditing] = useState(true);
  const [bulkyEnabled, setBulkyEnabled] = useState(false);
  const [bulkyAmountText, setBulkyAmountText] = useState("2.0");

  const bulkyExisting = useMemo(() => findBulkySurcharge(existing), [existing]);

  useEffect(() => {
    if (!bulkyExisting) return;

    const amt = readAmt(bulkyExisting);
    const kind = String(amt["kind"] ?? "flat").toLowerCase();
    if (kind !== "flat") return;

    const raw = amt["amount"];
    const a = typeof raw === "number" ? raw : Number(raw);

    setBulkyEnabled(!!bulkyExisting.active);
    if (Number.isFinite(a)) setBulkyAmountText(String(a));
    setBulkyEditing(false);
  }, [bulkyExisting]);

  const handleSaveBulky = async () => {
    if (bulkyEnabled) {
      const n = toNum(bulkyAmountText);
      if (n === null || n < 0) return onError("异形件操作费金额无效");

      const payload = {
        name: "异形件操作费",
        priority: 100,
        active: true,
        condition_json: { flag_any: ["bulky"] },
        amount_json: { kind: "flat", amount: n },
      };

      if (bulkyExisting) await onPatch(bulkyExisting.id, payload);
      else await onCreate(payload);
    } else {
      if (bulkyExisting) await onPatch(bulkyExisting.id, { active: false });
    }
    setBulkyEditing(false);
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
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-800">异形件操作费</div>
            <div className="mt-1 text-sm text-slate-600">用于 bulky / irregular。命中由作业台 flags 触发。</div>
          </div>

          {bulkyEditing ? (
            <button type="button" className={UI.btnPrimaryGreen} disabled={disabled} onClick={() => void handleSaveBulky()}>
              保存
            </button>
          ) : (
            <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={() => setBulkyEditing(true)}>
              修改
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-6">
          <div className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={bulkyEnabled}
              disabled={disabled || !bulkyEditing}
              onChange={(e) => setBulkyEnabled(e.target.checked)}
            />
            <span className="text-sm text-slate-700">启用异形件操作费</span>
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-slate-600">每单加价（元）</label>
            <input
              className={UI.inputMono}
              value={bulkyAmountText}
              disabled={disabled || !bulkyEditing || !bulkyEnabled}
              onChange={(e) => setBulkyAmountText(e.target.value)}
              placeholder="例如：2.0"
            />
          </div>
        </div>

        {!bulkyEnabled ? <div className="mt-2 text-sm text-slate-500">当前未启用，不会生成/更新任何异形件规则。</div> : null}
      </div>
    </div>
  );
};

export default SurchargeCreateCard;
