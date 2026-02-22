// src/features/purchase-orders/createV2/linesEditor/calc.ts

/**
 * Phase2 数量口径（写模型 UI）：
 * - qtyOrdered：订购数量（case_input）
 * - unitsPerCase：倍率（case_ratio）
 * - qtyBase：base 事实 = case_input × case_ratio
 *
 * 说明：为避免牵动历史调用方，保留旧参数名（qtyOrdered/unitsPerCase），但语义已对齐。
 */

export function safeNum(raw: string, fallback: number): number {
  const n = Number(raw);
  return Number.isNaN(n) ? fallback : n;
}

export function calcQtyBase(args: { qtyOrdered: string; unitsPerCase: string }): number | null {
  const caseInput = safeNum(args.qtyOrdered || "0", 0);
  const ratio = safeNum(args.unitsPerCase || "1", 1);
  if (Number.isNaN(caseInput) || Number.isNaN(ratio)) return null;
  return caseInput * ratio;
}

export function calcEstAmount(args: { qtyBase: number | null; supplyPrice: string }): number {
  const price = safeNum(args.supplyPrice || "0", 0);
  if (args.qtyBase == null || Number.isNaN(price)) return 0;
  return args.qtyBase * price;
}
