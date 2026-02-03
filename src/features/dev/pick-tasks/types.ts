// src/features/dev/pick-tasks/types.ts

// ---------- 扫码 / commit 表单状态 ----------

export type ScanFormState = {
  itemId: string;
  qty: string; // 本次动作要拣的数量（例如 5 = 本次拣 5 件）
  batchCode: string;
};

export type CommitFormState = {
  platform: string;
  shopId: string;
  traceId: string;
  allowDiff: boolean;
};

// ---------- 批次查询类型（对应 /stock/batch/query 输出） ----------

export interface StockBatchRow {
  batch_id: number | null;
  item_id: number;
  warehouse_id: number;
  batch_code: string | null;
  qty: number;
  production_date?: string | null;
  expiry_date?: string | null;
  days_to_expiry?: number | null;
}

export interface StockBatchQueryOut {
  total: number;
  page: number;
  page_size: number;
  items: StockBatchRow[];
}

// 统一错误信息提取，避免到处写 any / as Error
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "未知错误";
  }
};
