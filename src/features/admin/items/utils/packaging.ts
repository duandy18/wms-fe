// src/features/admin/items/utils/packaging.ts
import type { Item } from "@/contracts/item/contract";

const DEFAULT_CASE_UOM = "箱";

function normText(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

function normRatio(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  const n = Math.trunc(v);
  if (n < 1) return null;
  return n;
}

/**
 * 包装结构摘要：用于列表列展示
 *
 * 语义：1 case_uom = case_ratio × uom（最小单位）
 * 展示：`12袋/箱`，无则 `—`
 */
export function formatPackagingSummary(item: Item): string {
  const ratio = normRatio(item.case_ratio);
  if (ratio === null) return "—";

  const base = normText(item.uom) ?? "—";
  const caseUom = normText(item.case_uom) ?? DEFAULT_CASE_UOM;
  return `${ratio}${base}/${caseUom}`;
}

/**
 * 包装换算表达：用于编辑器区块标题行/说明行
 * 展示：`1箱 = 12袋`
 */
export function formatPackagingEquation(item: Pick<Item, "case_ratio" | "case_uom" | "uom">): string | null {
  const ratio = normRatio(item.case_ratio);
  if (ratio === null) return null;

  const base = normText(item.uom) ?? "—";
  const caseUom = normText(item.case_uom) ?? DEFAULT_CASE_UOM;
  return `1${caseUom} = ${ratio}${base}`;
}
