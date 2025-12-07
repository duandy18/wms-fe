// src/features/operations/outbound-pick/api_v2.ts
import { apiPost } from "../../../lib/api";

export interface OutboundV2LineIn {
  warehouse_id: number;
  item_id: number;
  batch_code: string;
  qty: number;
}

export interface OutboundV2CommitPayload {
  platform: string;       // 必填
  shop_id: string;        // 必填
  ref: string;            // 必填
  external_order_ref?: string | null;
  occurred_at?: string | null;
  lines: OutboundV2LineIn[];
}

export interface OutboundV2ShipOut {
  status: string;
  commit_id: number | null;
  total_qty: number;
  trace_id: string;
  idempotent: boolean;
}

export async function outboundV2Commit(payload: OutboundV2CommitPayload) {
  return apiPost<OutboundV2ShipOut>("/outbound/ship/commit", payload);
}
