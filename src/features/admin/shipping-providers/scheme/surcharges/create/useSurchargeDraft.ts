// src/features/admin/shipping-providers/scheme/surcharges/create/useSurchargeDraft.ts
//
// 三卡编辑器：省 / 城市 / 清单（金额）
//
// 关键保证：
// - 必须返回：draft/saved、editing、save/edit、collapsed、setCollapsed、amountById、setAmountForId、rowAmountErrors、scopeRows
// - “修改”按钮一定能把 editing=true 且展开
// - “保存”按钮一定能锁定（editing=false）且折叠
// - 第三表金额：保存/修改锁定（tableEditing）
// - 回显：localStorage（防丢） + existingSurcharges（兜底）
// - 现实约束：城市点名省 与 全省收费互斥（保存城市时自动从省 saved/draft 移除同省）

import { useEffect, useMemo, useState } from "react";
import type { PricingSchemeSurcharge } from "../../../api";
import { PROVINCE_CITIES } from "../data/provinceCities";

export type ScopeRow =
  | { id: string; scope: "province"; province: string; label: string }
  | { id: string; scope: "city"; province: string; city: string; label: string };

type PersistedState = {
  provinceSaved: string[];
  citySaved: string[];
  amountById: Record<string, string>;
  provinceCollapsed: boolean;
  cityCollapsed: boolean;
  tableEditing: boolean;
};

function storageKey(schemeId: number) {
  return `WMS_SCHEME_SURCHARGES_UI_V2_${schemeId}`;
}

function rowIdProvince(prov: string) {
  return `province:${prov}`;
}
function rowIdCity(prov: string, city: string) {
  return `city:${prov}:${city}`;
}

function safeNum(v: string, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return n;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).map((x) => x.trim()).filter(Boolean);
}

// city -> province（按本期白名单）
const CITY_TO_PROVINCE: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const [prov, cities] of Object.entries(PROVINCE_CITIES)) {
    for (const c of cities) {
      if (!m[c]) m[c] = prov;
    }
  }
  return m;
})();

function readCond(s: PricingSchemeSurcharge): Record<string, unknown> {
  return isRecord(s.condition_json) ? s.condition_json : {};
}
function readAmt(s: PricingSchemeSurcharge): Record<string, unknown> {
  return isRecord(s.amount_json) ? s.amount_json : {};
}

function parseExistingSurcharges(existing: PricingSchemeSurcharge[]) {
  const provinceSet = new Set<string>();
  const cityList: string[] = [];
  const amountById: Record<string, string> = {};

  for (const s of existing ?? []) {
    if (!s.active) continue;

    const amt = readAmt(s);
    const kind = String(amt["kind"] ?? "flat").toLowerCase();
    if (kind !== "flat") continue;

    const rawAmount = amt["amount"];
    const amount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount);

    const cond = readCond(s);
    const destRaw = cond["dest"];
    const dest = isRecord(destRaw) ? destRaw : {};

    const provArr = asStringArray(dest["province"]);
    const cityArr = asStringArray(dest["city"]);

    // 省：dest.province 且没有 city
    if (provArr.length === 1 && cityArr.length === 0) {
      const p = provArr[0];
      provinceSet.add(p);
      amountById[rowIdProvince(p)] = Number.isFinite(amount) ? String(amount) : "";
      continue;
    }

    // 城市：dest.city（带不带 province 都算）
    if (cityArr.length === 1) {
      const c = cityArr[0];
      cityList.push(c);
      const prov = provArr[0] ?? CITY_TO_PROVINCE[c] ?? "未知省份";
      amountById[rowIdCity(prov, c)] = Number.isFinite(amount) ? String(amount) : "";
    }
  }

  return {
    provinceSaved: Array.from(provinceSet),
    citySaved: cityList,
    amountById,
  };
}

export function useSurchargeDraft(params: { schemeId: number; existingSurcharges: PricingSchemeSurcharge[] }) {
  const { schemeId, existingSurcharges } = params;

  const [hydrated, setHydrated] = useState(false);

  // 省（全省收费）
  const [provinceDraft, setProvinceDraft] = useState<string[]>([]);
  const [provinceSaved, setProvinceSaved] = useState<string[]>([]);
  const [provinceEditing, setProvinceEditing] = useState(false);
  const [provinceCollapsed, setProvinceCollapsed] = useState(false);

  // 城市（省内点名收费）
  const [cityDraft, setCityDraft] = useState<string[]>([]);
  const [citySaved, setCitySaved] = useState<string[]>([]);
  const [cityEditing, setCityEditing] = useState(false);
  const [cityCollapsed, setCityCollapsed] = useState(false);

  // CityPicker 展开省（UI-only）
  const [cityPickerProvinces, setCityPickerProvinces] = useState<string[]>([]);

  // 第三表金额 + 锁定
  const [amountById, setAmountById] = useState<Record<string, string>>({});
  const [tableEditing, setTableEditing] = useState(true);

  // 初始化：localStorage 优先，否则从后端解析恢复
  useEffect(() => {
    const key = storageKey(schemeId);
    const raw = localStorage.getItem(key);

    if (raw) {
      try {
        const st = JSON.parse(raw) as PersistedState;
        const pSaved = st.provinceSaved ?? [];
        const cSaved = st.citySaved ?? [];

        setProvinceSaved(pSaved);
        setCitySaved(cSaved);
        setAmountById(st.amountById ?? {});
        setProvinceCollapsed(!!st.provinceCollapsed);
        setCityCollapsed(!!st.cityCollapsed);
        setTableEditing(st.tableEditing ?? true);

        // 进来默认锁定选择（符合你的主数据心智）
        setProvinceDraft(pSaved);
        setCityDraft(cSaved);
        setProvinceEditing(false);
        setCityEditing(false);

        setHydrated(true);
        return;
      } catch {
        // fallthrough
      }
    }

    const parsed = parseExistingSurcharges(existingSurcharges ?? []);
    setProvinceSaved(parsed.provinceSaved);
    setCitySaved(parsed.citySaved);
    setAmountById(parsed.amountById);

    setProvinceDraft(parsed.provinceSaved);
    setCityDraft(parsed.citySaved);

    setProvinceEditing(false);
    setCityEditing(false);
    setTableEditing(true);

    setHydrated(true);
  }, [schemeId, existingSurcharges]);

  // 写回 localStorage（hydrated 后才允许写，避免覆盖）
  useEffect(() => {
    if (!hydrated) return;
    const key = storageKey(schemeId);
    const st: PersistedState = {
      provinceSaved,
      citySaved,
      amountById,
      provinceCollapsed,
      cityCollapsed,
      tableEditing,
    };
    localStorage.setItem(key, JSON.stringify(st));
  }, [hydrated, schemeId, provinceSaved, citySaved, amountById, provinceCollapsed, cityCollapsed, tableEditing]);

  // 省：保存 / 修改
  function saveProvinces() {
    setProvinceSaved(provinceDraft);
    setProvinceEditing(false);
    setProvinceCollapsed(true);
  }
  function editProvinces() {
    setProvinceDraft(provinceSaved);
    setProvinceEditing(true);
    setProvinceCollapsed(false);
  }

  // 城市：保存 / 修改（保存时互斥移除同省“全省收费”）
  function saveCities() {
    setCitySaved(cityDraft);
    setCityEditing(false);
    setCityCollapsed(true);

    const cityProvs = new Set<string>();
    for (const c of cityDraft) {
      const p = CITY_TO_PROVINCE[c];
      if (p) cityProvs.add(p);
    }
    if (cityProvs.size > 0) {
      setProvinceSaved((prev) => prev.filter((p) => !cityProvs.has(p)));
      setProvinceDraft((prev) => prev.filter((p) => !cityProvs.has(p)));
    }
  }
  function editCities() {
    setCityDraft(citySaved);
    setCityEditing(true);
    setCityCollapsed(false);
  }

  // 第三表：保存 / 修改
  function saveTable() {
    setTableEditing(false);
  }
  function editTable() {
    setTableEditing(true);
  }

  // 第三表 rows：只看 saved（城市 label 只显示城市名）
  const scopeRows: ScopeRow[] = useMemo(() => {
    const rows: ScopeRow[] = [];
    for (const p of provinceSaved) {
      rows.push({ id: rowIdProvince(p), scope: "province", province: p, label: p });
    }
    for (const c of citySaved) {
      const prov = CITY_TO_PROVINCE[c] ?? "未知省份";
      rows.push({ id: rowIdCity(prov, c), scope: "city", province: prov, city: c, label: c });
    }
    return rows;
  }, [provinceSaved, citySaved]);

  // 补齐 amount key（不强行填默认值）
  useEffect(() => {
    if (!hydrated) return;
    setAmountById((prev) => {
      const next: Record<string, string> = {};
      for (const r of scopeRows) next[r.id] = prev[r.id] ?? "";
      return next;
    });
  }, [hydrated, scopeRows]);

  function setAmountForId(id: string, v: string) {
    setAmountById((prev) => ({ ...prev, [id]: v }));
  }

  const rowAmountErrors: Record<string, string> = useMemo(() => {
    const errs: Record<string, string> = {};
    for (const r of scopeRows) {
      const t = (amountById[r.id] ?? "").trim();
      if (!t) {
        errs[r.id] = "必填";
        continue;
      }
      const n = safeNum(t, Number.NaN);
      if (!Number.isFinite(n)) errs[r.id] = "必须是数字";
      else if (n < 0) errs[r.id] = "必须 >= 0";
    }
    return errs;
  }, [scopeRows, amountById]);

  return {
    // province card
    provinceDraft,
    setProvinceDraft,
    provinceSaved,
    provinceEditing,
    saveProvinces,
    editProvinces,
    provinceCollapsed,
    setProvinceCollapsed,

    // city card
    cityDraft,
    setCityDraft,
    citySaved,
    cityEditing,
    saveCities,
    editCities,
    cityPickerProvinces,
    setCityPickerProvinces,
    cityCollapsed,
    setCityCollapsed,

    // table card
    scopeRows,
    amountById,
    setAmountForId,
    rowAmountErrors,
    tableEditing,
    saveTable,
    editTable,
  };
}
