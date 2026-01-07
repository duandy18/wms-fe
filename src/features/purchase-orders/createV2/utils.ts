// src/features/purchase-orders/createV2/utils.ts

type ApiErrorShape = {
  message?: string;
};

export const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

export const nowIsoMinuteForDatetimeLocal = (): string => {
  const d = new Date();
  const iso = d.toISOString();
  return iso.slice(0, 16);
};

export function datetimeLocalToIsoOrThrow(v: string): string {
  const t = v.trim();
  if (!t) throw new Error("采购时间不能为空");
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) throw new Error("采购时间格式非法");
  return d.toISOString();
}
