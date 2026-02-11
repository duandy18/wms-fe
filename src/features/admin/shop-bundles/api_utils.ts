// admin/shop-bundles/api_utils.ts
export function kindOf(x: unknown): string {
  if (x === null) return "null";
  if (Array.isArray(x)) return "array";
  return typeof x;
}

export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function asInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) {
    const i = Math.trunc(v);
    return i > 0 ? i : null;
  }
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    const i = Math.trunc(n);
    return i > 0 ? i : null;
  }
  return null;
}

export function asStr(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export function asStrOrNull(v: unknown): string | null {
  if (v === null) return null;
  return typeof v === "string" ? v : null;
}
