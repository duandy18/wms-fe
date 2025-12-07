// src/features/dev/count/types.ts
// =====================================================
//  Count Debug Panel - 数据结构定义
// =====================================================

import type { ScanResponse } from "../../operations/scan/api";

// 盘点表单
export interface CountFormState {
  item_id: number | null;
  warehouse_id: number | null;
  qty: number | null;
  batch_code: string;
  production_date?: string;
  expiry_date?: string;
}

// 历史记录
export interface CountHistoryEntry {
  id: number;
  ts: string;
  req: CountFormState;
  resp: ScanResponse | null;
  ok: boolean;
  error?: string | null;
}

// 中控状态
export interface DevCountState {
  form: CountFormState;
  loading: boolean;
  error: string | null;
  lastResult: ScanResponse | null;
  history: CountHistoryEntry[];
}

// 中控控制器
export interface DevCountController extends DevCountState {
  updateForm<K extends keyof CountFormState>(
    key: K,
    value: CountFormState[K],
  ): void;
  resetForm(): void;
  submit(): Promise<void>;
}
