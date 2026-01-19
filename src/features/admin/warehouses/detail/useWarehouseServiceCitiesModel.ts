// src/features/admin/warehouses/detail/useWarehouseServiceCitiesModel.ts
import { useEffect, useMemo, useState } from "react";
import {
  fetchWarehouseServiceCities,
  fetchWarehouseServiceCityOccupancy,
  putWarehouseServiceCities,
} from "../api";
import type { WarehouseServiceCityOccupancyOut } from "../types";

export type ServiceCityConflict = { city: string; owner_warehouse_id: number };

type UnknownRecord = Record<string, unknown>;

function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}

function normalizeCityLines(raw: string): string[] {
  const xs = (raw || "")
    .split(/\r?\n/g)
    .map((x) => x.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of xs) {
    if (seen.has(c)) continue;
    seen.add(c);
    out.push(c);
  }
  out.sort((a, b) => a.localeCompare(b, "zh"));
  return out;
}

function stringify(list: string[]): string {
  return (list || []).join("\n");
}

function toHumanError(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  if (isRecord(e) && typeof e.message === "string") return e.message;
  return fallback;
}

function pickDetailFromUnknown(err: unknown): unknown {
  if (!isRecord(err)) return null;
  if ("detail" in err) return err.detail;

  const resp = err.response;
  if (isRecord(resp) && isRecord(resp.data) && "detail" in resp.data) return resp.data.detail;

  const data = err.data;
  if (isRecord(data) && "detail" in data) return data.detail;

  return null;
}

function extractConflictFromError(
  e: unknown,
): { message: string; conflicts: ServiceCityConflict[] } | null {
  const detail = pickDetailFromUnknown(e);
  if (!isRecord(detail)) return null;

  const msgRaw = detail.message;
  const msg =
    typeof msgRaw === "string" && msgRaw.trim()
      ? msgRaw
      : "城市互斥冲突：部分城市已属于其他仓库。";

  const conflictsRaw = detail.conflicts;
  if (!Array.isArray(conflictsRaw)) return null;

  const conflicts: ServiceCityConflict[] = [];
  for (const x of conflictsRaw) {
    if (!isRecord(x)) continue;
    const city = typeof x.city === "string" ? x.city : "";
    const owner =
      typeof x.owner_warehouse_id === "number" ? x.owner_warehouse_id : Number(x.owner_warehouse_id);
    if (!city) continue;
    if (!Number.isFinite(owner) || owner <= 0) continue;
    conflicts.push({ city, owner_warehouse_id: owner });
  }

  return conflicts.length ? { message: msg, conflicts } : null;
}

function buildOwnerByCity(occ: WarehouseServiceCityOccupancyOut | null): Record<string, number> {
  const m: Record<string, number> = {};
  if (!occ || !Array.isArray(occ.rows)) return m;

  for (const row of occ.rows) {
    const city = typeof row.city_code === "string" ? row.city_code.trim() : "";
    const wid = typeof row.warehouse_id === "number" ? row.warehouse_id : Number(row.warehouse_id);
    if (!city) continue;
    if (!Number.isFinite(wid) || wid <= 0) continue;
    m[city] = wid;
  }
  return m;
}

export function useWarehouseServiceCitiesModel(args: { warehouseId: number; canWrite: boolean }) {
  const { warehouseId, canWrite } = args;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  const [text, setText] = useState("");
  const [conflicts, setConflicts] = useState<ServiceCityConflict[]>([]);

  const [occupancy, setOccupancy] = useState<WarehouseServiceCityOccupancyOut | null>(null);

  const normalizedPreview = useMemo(() => normalizeCityLines(text), [text]);
  const ownerByCity = useMemo(() => buildOwnerByCity(occupancy), [occupancy]);

  useEffect(() => {
    if (!warehouseId) return;

    setLoading(true);
    setError(null);
    setSaveOk(false);
    setConflicts([]);

    Promise.all([fetchWarehouseServiceCities(warehouseId), fetchWarehouseServiceCityOccupancy()])
      .then(([svc, occ]) => {
        setText(stringify(svc.cities ?? []));
        setOccupancy(occ);
      })
      .catch((err: unknown) => {
        setError(toHumanError(err, "加载服务城市失败"));
      })
      .finally(() => setLoading(false));
  }, [warehouseId]);

  useEffect(() => {
    if (saveOk) setSaveOk(false);
    if (error) setError(null);
    if (conflicts.length) setConflicts([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  async function save() {
    if (!warehouseId) return;
    if (!canWrite) return;

    setSaving(true);
    setError(null);
    setSaveOk(false);
    setConflicts([]);

    try {
      const cities = normalizeCityLines(text);
      const res = await putWarehouseServiceCities(warehouseId, { cities });
      setText(stringify(res.cities ?? []));

      try {
        const occ = await fetchWarehouseServiceCityOccupancy();
        setOccupancy(occ);
      } catch {
        // ignore
      }

      setSaveOk(true);
    } catch (err: unknown) {
      const conflict = extractConflictFromError(err);
      if (conflict) {
        setError(conflict.message);
        setConflicts(conflict.conflicts);
      } else {
        setError(toHumanError(err, "保存服务城市失败"));
      }
    } finally {
      setSaving(false);
    }
  }

  return {
    loading,
    saving,
    error,
    saveOk,

    text,
    setText,

    conflicts,
    normalizedPreview,

    ownerByCity,

    save,
  };
}
