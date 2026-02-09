// src/features/admin/psku/api/_common.ts

export type JsonObj = Record<string, unknown>;

export function isObj(x: unknown): x is JsonObj {
  return !!x && typeof x === "object";
}

export function asStr(x: unknown): string | null {
  return typeof x === "string" ? x : null;
}

export function asNum(x: unknown): number | null {
  return typeof x === "number" && Number.isFinite(x) ? x : null;
}

export function pickStr(o: JsonObj, keys: string[]): string | null {
  for (const k of keys) {
    const v = o[k];
    const s = asStr(v);
    if (s != null) return s;
  }
  return null;
}

export function pickNum(o: JsonObj, keys: string[]): number | null {
  for (const k of keys) {
    const v = o[k];
    const n = asNum(v);
    if (n != null) return n;
  }
  return null;
}
