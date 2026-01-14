// src/features/inventory/ledger/utils.ts

export function parsePositiveInt(v: string | null): number | null {
  if (!v) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return null;
  const x = Math.floor(n);
  return x > 0 ? x : null;
}

export function cleanStr(v: string | null): string | null {
  const x = String(v ?? "").trim();
  return x ? x : null;
}

export function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "未知错误";
  }
}
