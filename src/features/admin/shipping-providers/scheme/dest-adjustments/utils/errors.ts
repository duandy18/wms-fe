// src/features/admin/shipping-providers/scheme/dest-adjustments/utils/errors.ts
type ApiConflict = { id?: unknown };
type ApiDetailShape = { conflicts?: unknown; message?: unknown; code?: unknown };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function safeText(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function readDetailFromUnknown(e: unknown): unknown {
  // 兼容常见形态：
  // 1) { detail: {...} }
  // 2) { response: { data: { detail: {...} } } }（如 axios）
  if (!isRecord(e)) return null;

  const directDetail = e["detail"];
  if (directDetail != null) return directDetail;

  const resp = e["response"];
  if (!isRecord(resp)) return null;

  const data = resp["data"];
  if (!isRecord(data)) return null;

  const nestedDetail = data["detail"];
  return nestedDetail ?? null;
}

export function extractConflictIds(e: unknown): number[] {
  // 后端 409 detail 形态：
  // { detail: { code, conflicts: [{id,...}] } }
  const detail = readDetailFromUnknown(e);
  if (!isRecord(detail)) return [];

  const conflictsUnknown = (detail as ApiDetailShape).conflicts;
  if (!Array.isArray(conflictsUnknown)) return [];

  const ids: number[] = [];
  for (const c of conflictsUnknown as ApiConflict[]) {
    const n = Number((isRecord(c) ? c.id : undefined) ?? NaN);
    if (Number.isFinite(n) && n > 0) ids.push(n);
  }
  return ids;
}

export function extractGeoErrorMessage(e: unknown): string | null {
  const detail = readDetailFromUnknown(e);
  if (!isRecord(detail)) return null;

  const code = safeText((detail as ApiDetailShape).code);
  const msg = safeText((detail as ApiDetailShape).message);

  if (!code) return null;
  if (code === "geo_invalid_province" || code === "geo_invalid_city" || code === "geo_missing_code") {
    return msg || "地理字典校验失败";
  }
  return null;
}
