// src/features/operations/inbound/lines/lineUtils.ts

import type { ReceiveTaskLine } from "../../../receive-tasks/api";

type ApiErrorShape = {
  message?: string;
};

export const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

export function needsBatch(line: ReceiveTaskLine): boolean {
  const scanned = line.scanned_qty ?? 0;
  if (scanned === 0) return false;
  const noBatch = !line.batch_code || !line.batch_code.trim();
  return noBatch;
}

export function hasAnyDate(line: ReceiveTaskLine): boolean {
  return !!(line.production_date || line.expiry_date);
}

/**
 * 把单位体系翻译成人话：
 * - 有 purchase_uom + base_uom + units_per_case: "件(12/袋)"
 * - 有 purchase_uom 但没有 base_uom/units: 直接显示 purchase_uom
 * - 否则退回 base_uom 或 "-"
 */
export function formatUnitExpr(line: ReceiveTaskLine): string {
  const p = line.purchase_uom?.trim() || "";
  const b = line.base_uom?.trim() || "";
  const n = line.units_per_case ?? null;

  if (p && b && n && n > 0) {
    return `${p}(${n}/${b})`;
  }
  if (p) return p;
  if (b) return b;
  return "-";
}
