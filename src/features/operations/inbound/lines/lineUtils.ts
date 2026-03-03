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
 * 单位展示函数已移除：
 * - 终态合同：收货任务行不再承载“文本单位结构”
 * - 若业务需要展示单位，应在上层通过 item_uoms 映射/补齐
 */
