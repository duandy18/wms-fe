import { apiPost } from "../../../lib/api";

export interface CountCommitRequest {
  item_id: number;
  warehouse_id: number;
  qty: number; // 盘点后的绝对量
  ref: string;
  lot_code?: string | null;
  batch_code?: string | null;
  occurred_at?: string;
  production_date?: string;
  expiry_date?: string;
}

export interface CountCommitResponse {
  ok: boolean;
  after: number;
  ref: string;
  item_id: number;
  warehouse_id: number;
  lot_code?: string | null;
  batch_code?: string | null;
  occurred_at: string;
}

export async function submitCount(
  payload: CountCommitRequest,
): Promise<CountCommitResponse> {
  return apiPost<CountCommitResponse>("/count", payload);
}
