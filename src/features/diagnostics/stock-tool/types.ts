// src/features/diagnostics/stock-tool/types.ts

export type StockBatchRow = {
  batch_id: number;
  item_id: number;
  warehouse_id: number;
  batch_code: string;
  qty: number;
  production_date?: string | null;
  expiry_date?: string | null;
  days_to_expiry?: number | null;
};

export type StockBatchQueryOut = {
  total: number;
  page: number;
  page_size: number;
  items: StockBatchRow[];
};

export const BATCH_PAGE_SIZE = 500;
