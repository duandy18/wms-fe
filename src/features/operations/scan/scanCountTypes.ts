// src/features/operations/scan/scanCountTypes.ts

// v2 盘点本地表单状态（与 makeCountScanRequest 对齐）
export type FormState = {
  item_id: number;
  actual: number; // 盘点后的最终数量
  warehouse_id?: number;
  batch_code: string;
  production_date?: string;
  expiry_date?: string;
};
