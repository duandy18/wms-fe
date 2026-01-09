// src/features/operations/inbound/return-receive/workbench/utils.ts

export function toInt(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.trunc(n);
}

export function parseIntSafe(raw: string): number | null {
  const t = String(raw ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export function formatErr(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback;
}
