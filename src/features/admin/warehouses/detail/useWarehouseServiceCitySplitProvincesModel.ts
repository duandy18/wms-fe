// src/features/admin/warehouses/detail/useWarehouseServiceCitySplitProvincesModel.ts
import { useEffect, useMemo, useState } from "react";
import {
  fetchWarehouseServiceCitySplitProvinces,
  putWarehouseServiceCitySplitProvinces,
} from "../api";
import type {
  WarehouseServiceCitySplitProvincesOut,
  WarehouseServiceCitySplitProvincesPutIn,
} from "../types";

type UnknownRecord = Record<string, unknown>;
function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}
function toHumanError(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  if (isRecord(e) && typeof e.message === "string") return e.message;
  return fallback;
}
function normalize(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of list || []) {
    const s = (x || "").trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  out.sort((a, b) => a.localeCompare(b, "zh"));
  return out;
}

export function useWarehouseServiceCitySplitProvincesModel(args: { canWrite: boolean }) {
  const { canWrite } = args;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  const [provinces, setProvinces] = useState<string[]>([]);

  const provinceSet = useMemo(() => new Set(provinces), [provinces]);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const res: WarehouseServiceCitySplitProvincesOut = await fetchWarehouseServiceCitySplitProvinces();
      setProvinces(normalize(res.provinces ?? []));
    } catch (e) {
      setError(toHumanError(e, "加载“按城市细分的省份”失败"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
     
  }, []);

  async function save(next: WarehouseServiceCitySplitProvincesPutIn) {
    if (!canWrite) return;
    setSaving(true);
    setError(null);
    setSaveOk(false);
    try {
      const payload = { provinces: normalize(next.provinces ?? []) };
      const res: WarehouseServiceCitySplitProvincesOut = await putWarehouseServiceCitySplitProvinces(payload);
      setProvinces(normalize(res.provinces ?? []));
      setSaveOk(true);
    } catch (e) {
      setError(toHumanError(e, "保存“按城市细分的省份”失败"));
    } finally {
      setSaving(false);
    }
  }

  async function add(list: string[]) {
    const next = normalize([...(provinces ?? []), ...(list ?? [])]);
    await save({ provinces: next });
  }

  async function removeOne(province: string) {
    const p = (province || "").trim();
    if (!p) return;
    const next = normalize((provinces ?? []).filter((x) => x !== p));
    await save({ provinces: next });
  }

  return {
    loading,
    saving,
    error,
    saveOk,

    provinces,
    provinceSet,

    reload,
    save,
    add,
    removeOne,
  };
}
