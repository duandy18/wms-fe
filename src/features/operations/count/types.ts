// src/features/operations/count/types.ts
// =====================================================
//  Count Cockpit - 数据结构定义
// =====================================================

import type { ScanResponse } from "../scan/api";

export interface CountCockpitFormState {
  item_id: number | null;
  warehouse_id: number | null;
  qty: number | null;
  batch_code: string;
  production_date?: string;
  expiry_date?: string;
}

export interface CountCockpitHistoryEntry {
  id: number;
  ts: string;
  req: CountCockpitFormState;
  resp: ScanResponse | null;
  ok: boolean;
  error?: string | null;
}

export interface CountCockpitState {
  form: CountCockpitFormState;
  loading: boolean;
  error: string | null;
  lastResult: ScanResponse | null;
  history: CountCockpitHistoryEntry[];
}

export interface CountCockpitController extends CountCockpitState {
  updateForm<K extends keyof CountCockpitFormState>(
    key: K,
    value: CountCockpitFormState[K],
  ): void;
  resetForm(): void;
  submit(): Promise<void>;
}
