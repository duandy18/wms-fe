// src/features/admin/shipping-providers/scheme/table/utils/pricePreview.ts

import type { ZoneBracketsMatrixGroup, ZoneBracketsMatrixZone, ZoneBracketsMatrixBracket } from "../../brackets/matrix/types";

type MatrixLike = {
  groups?: ZoneBracketsMatrixGroup[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function readNum(v: unknown, k: string): number | null {
  if (!isRecord(v)) return null;
  const x = v[k];
  return typeof x === "number" && Number.isFinite(x) ? x : null;
}

function readText(v: unknown, k: string): string | null {
  if (!isRecord(v)) return null;
  const x = v[k];
  return typeof x === "string" ? x : null;
}

function fmt2(v: string): string {
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

function segLabel(minKg: string, maxKg: string | null): string {
  const mn = fmt2(minKg);
  const mx = maxKg == null ? "" : fmt2(maxKg);
  if (!mx) return `≥ ${mn}kg`;
  return `${mn}–${mx}kg`;
}

function toStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return String(v);
}

function summarizeCell(b: unknown): string {
  if (!isRecord(b)) return "未设";
  const mode = readText(b, "pricing_mode") ?? "";
  if (mode === "flat") {
    const v = b["flat_amount"];
    const n = typeof v === "number" ? v : Number(toStr(v));
    return Number.isFinite(n) ? `¥ ${n.toFixed(2)}` : "已设";
  }
  if (mode === "linear_total") return "票费+单价";
  if (mode === "manual_quote") return "需人工";
  if (mode) return `已设(${mode})`;
  return "已设";
}

function findGroupByZoneId(groups: ZoneBracketsMatrixGroup[], zoneId: number): ZoneBracketsMatrixGroup | null {
  for (const g of groups) {
    const zones = (g.zones ?? []) as ZoneBracketsMatrixZone[];
    const hit = zones.some((z) => readNum(z, "id") === zoneId);
    if (hit) return g;
  }
  return null;
}

function findZoneInGroup(g: ZoneBracketsMatrixGroup, zoneId: number): ZoneBracketsMatrixZone | null {
  const zones = (g.zones ?? []) as ZoneBracketsMatrixZone[];
  for (const z of zones) {
    if (readNum(z, "id") === zoneId) return z;
  }
  return null;
}

function findBracket(brackets: ZoneBracketsMatrixBracket[], min: string, max: string | null): ZoneBracketsMatrixBracket | null {
  const wantMin = min;
  const wantMax = max ?? "";
  for (const b of brackets) {
    const bMin = toStr((isRecord(b) ? b["min_kg"] : "") ?? "");
    const bMax = toStr((isRecord(b) ? b["max_kg"] : "") ?? "");
    if (bMin === wantMin && bMax === wantMax) return b;
  }
  return null;
}

export function buildZonePricePreview(args: { mx: MatrixLike | null; selectedZoneId: number | null }) {
  const { mx, selectedZoneId } = args;

  if (!selectedZoneId) return { title: "未选择 Zone", rows: [] as Array<{ seg: string; value: string }> };

  const groups = (mx?.groups ?? []) as ZoneBracketsMatrixGroup[];
  const g = findGroupByZoneId(groups, selectedZoneId);
  if (!g) return { title: "暂无价格表分组", rows: [] as Array<{ seg: string; value: string }> };

  const z = findZoneInGroup(g, selectedZoneId);
  const brackets = (z?.brackets ?? []) as ZoneBracketsMatrixBracket[];

  const rows: Array<{ seg: string; value: string }> = [];
  for (const s of (g.segments ?? []) as Array<Record<string, unknown>>) {
    const min = toStr(s["min_kg"]);
    const maxRaw = s["max_kg"];
    const max = maxRaw == null ? null : toStr(maxRaw);
    const hit = findBracket(brackets, min, max);
    rows.push({ seg: segLabel(min, max), value: summarizeCell(hit) });
  }

  const tname = (readText(g, "template_name") ?? "").trim();
  const head = tname ? `模板：${tname}` : "模板：—";
  return { title: head, rows };
}
