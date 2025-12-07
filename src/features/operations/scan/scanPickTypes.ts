// src/features/operations/scan/scanPickTypes.ts

// v2 拣货本地表单状态（与 makePickScanRequest 对齐）
export type FormState = {
  item_id: number;
  qty: number;
  warehouse_id?: number;
  batch_code: string;
};
