// src/features/purchase-orders/createV2/linesEditor/calc.ts

export function safeNum(raw: string, fallback: number): number {
  const n = Number(raw);
  return Number.isNaN(n) ? fallback : n;
}

export function calcQtyBase(args: { qtyOrdered: string; unitsPerCase: string }): number | null {
  const qty = safeNum(args.qtyOrdered || "0", 0);
  const units = safeNum(args.unitsPerCase || "1", 1);
  if (Number.isNaN(qty) || Number.isNaN(units)) return null;
  return qty * units;
}

export function calcEstAmount(args: { qtyBase: number | null; supplyPrice: string }): number {
  const price = safeNum(args.supplyPrice || "0", 0);
  if (args.qtyBase == null || Number.isNaN(price)) return 0;
  return args.qtyBase * price;
}
