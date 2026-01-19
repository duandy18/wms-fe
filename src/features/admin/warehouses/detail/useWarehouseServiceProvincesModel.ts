// src/features/admin/warehouses/detail/useWarehouseServiceProvincesModel.ts
import { useEffect, useMemo, useState } from "react";
import {
  fetchWarehouseServiceProvinceOccupancy,
  fetchWarehouseServiceProvinces,
  putWarehouseServiceProvinces,
} from "../api";
import type { WarehouseServiceProvinceOccupancyOut } from "../types";

export type ServiceProvinceConflict = { province: string; owner_warehouse_id: number };

type UnknownRecord = Record<string, unknown>;
function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}

function normalizeProvinceLines(raw: string): string[] {
  const xs = (raw || "")
    .split(/\r?\n/g)
    .map((x) => x.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of xs) {
    if (seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  out.sort((a, b) => a.localeCompare(b, "zh"));
  return out;
}

function stringifyProvinces(list: string[]): string {
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
): { message: string; conflicts: ServiceProvinceConflict[] } | null {
  const detail = pickDetailFromUnknown(e);
  if (!isRecord(detail)) return null;

  const msgRaw = detail.message;
  const msg =
    typeof msgRaw === "string" && msgRaw.trim() ? msgRaw : "省份互斥冲突：部分省份已属于其他仓库。";

  const conflictsRaw = detail.conflicts;
  if (!Array.isArray(conflictsRaw)) return null;

  const conflicts: ServiceProvinceConflict[] = [];
  for (const x of conflictsRaw) {
    if (!isRecord(x)) continue;
    const province = typeof x.province === "string" ? x.province : "";
    const owner =
      typeof x.owner_warehouse_id === "number" ? x.owner_warehouse_id : Number(x.owner_warehouse_id);
    if (!province) continue;
    if (!Number.isFinite(owner) || owner <= 0) continue;
    conflicts.push({ province, owner_warehouse_id: owner });
  }

  return conflicts.length ? { message: msg, conflicts } : null;
}

function buildOwnerByProvince(occ: WarehouseServiceProvinceOccupancyOut | null): Record<string, number> {
  const m: Record<string, number> = {};
  if (!occ || !Array.isArray(occ.rows)) return m;

  for (const row of occ.rows) {
    const prov = typeof row.province_code === "string" ? row.province_code.trim() : "";
    const wid = typeof row.warehouse_id === "number" ? row.warehouse_id : Number(row.warehouse_id);
    if (!prov) continue;
    if (!Number.isFinite(wid) || wid <= 0) continue;
    m[prov] = wid;
  }
  return m;
}

export function useWarehouseServiceProvincesModel(args: { warehouseId: number; canWrite: boolean }) {
  const { warehouseId, canWrite } = args;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  const [text, setText] = useState("");
  const [conflicts, setConflicts] = useState<ServiceProvinceConflict[]>([]);

  const [occupancy, setOccupancy] = useState<WarehouseServiceProvinceOccupancyOut | null>(null);

  const normalizedPreview = useMemo(() => normalizeProvinceLines(text), [text]);
  const ownerByProvince = useMemo(() => buildOwnerByProvince(occupancy), [occupancy]);

  async function reload() {
    if (!warehouseId) return;
    setLoading(true);
    setError(null);
    setSaveOk(false);
    setConflicts([]);
    try {
      const [svc, occ] = await Promise.all([
        fetchWarehouseServiceProvinces(warehouseId),
        fetchWarehouseServiceProvinceOccupancy(),
      ]);
      setText(stringifyProvinces(svc.provinces ?? []));
      setOccupancy(occ);
    } catch (err) {
      setError(toHumanError(err, "加载服务省份失败"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const provinces = normalizeProvinceLines(text);
      const res = await putWarehouseServiceProvinces(warehouseId, { provinces });
      setText(stringifyProvinces(res.provinces ?? []));

      try {
        const occ = await fetchWarehouseServiceProvinceOccupancy();
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
        setError(toHumanError(err, "保存服务省份失败"));
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

    ownerByProvince,

    save,
    reload,
  };
}
