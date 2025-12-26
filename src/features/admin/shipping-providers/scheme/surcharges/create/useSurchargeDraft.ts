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

import { CITY_TO_PROVINCE } from "./cityProvinceMap";
import type { PersistedState } from "./surchargeDraftPersist";
import { storageKey } from "./surchargeDraftPersist";
import { parseExistingSurcharges } from "./surchargeDraftHydrate";
import { buildScopeRows } from "./surchargeDraftRows";
import { computeRowAmountErrors } from "./surchargeDraftValidation";

export type ScopeRow =
  | { id: string; scope: "province"; province: string; label: string }
  | { id: string; scope: "city"; province: string; city: string; label: string };

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

    const parsed = parseExistingSurcharges(existingSurcharges ?? [], CITY_TO_PROVINCE);
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
    return buildScopeRows(provinceSaved, citySaved, CITY_TO_PROVINCE);
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
    return computeRowAmountErrors(scopeRows, amountById);
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
