// src/features/operations/outbound-pick/platformOrderMirror/jsonPick.ts

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function getStr(r: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return null;
}

export function getNum(r: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export function getObj(r: Record<string, unknown>, keys: string[]): Record<string, unknown> | null {
  for (const k of keys) {
    const v = r[k];
    if (isRecord(v)) return v;
  }
  return null;
}

export function getArr(r: Record<string, unknown>, keys: string[]): unknown[] | null {
  for (const k of keys) {
    const v = r[k];
    if (Array.isArray(v)) return v;
  }
  return null;
}

export function safeJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return '"<unserializable>"';
  }
}
