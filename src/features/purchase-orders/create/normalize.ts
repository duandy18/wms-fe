// src/features/purchase-orders/create/normalize.ts

import type { SupplierBasic } from "../../../domains/partners/export/contracts/supplierBasic";

export function normalizeSupplierOptions(
  list: SupplierBasic[],
  opts?: { activeOnly?: boolean },
): SupplierBasic[] {
  const activeOnly = opts?.activeOnly ?? true;
  const cleaned = list
    .filter((s) => (activeOnly ? s.active : true))
    .filter((s) => (s.name ?? "").trim().length > 0)
    .map((s) => ({
      ...s,
      name: String(s.name ?? "").trim(),
    }));

  cleaned.sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));
  return cleaned;
}
