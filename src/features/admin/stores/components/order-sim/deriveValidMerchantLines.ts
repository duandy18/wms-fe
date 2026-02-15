// src/features/admin/stores/components/order-sim/deriveValidMerchantLines.ts

import { isBlank } from "./textUtils";

export type MerchantOrderLineInput = {
  filled_code: string;
  title: string;
  spec: string;
};

export type MerchantOrderLineOut = {
  filled_code: string;
  title: string | null;
  spec: string | null;
};

export function deriveValidMerchantLines(rows: MerchantOrderLineInput[]): MerchantOrderLineOut[] {
  const out: MerchantOrderLineOut[] = [];

  for (const r of rows) {
    const filled = r.filled_code ?? "";
    const titleText = r.title ?? "";
    const specText = r.spec ?? "";

    const isEmptyRow = isBlank(filled) && isBlank(titleText) && isBlank(specText);
    if (isEmptyRow) continue;

    out.push({
      filled_code: filled.trim(),
      title: isBlank(titleText) ? null : titleText.trim(),
      spec: isBlank(specText) ? null : specText.trim(),
    });
  }

  return out.slice(0, 6);
}

export function hasAnyNonEmptyMerchantLine(rows: MerchantOrderLineInput[]): boolean {
  return rows.some((r) => !isBlank(r.filled_code) || !isBlank(r.title) || !isBlank(r.spec));
}
