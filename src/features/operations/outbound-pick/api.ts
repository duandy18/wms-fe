// src/features/operations/outbound-pick/api.ts

import { apiPost } from "../../../lib/api";

// 出库明细行
export interface ShipLine {
  item_id: number;
  qty: number;
}

// /outbound/ship/commit 的请求体
export interface ShipCommitPayload {
  platform: string; // 必填，例如 "PDD"
  shop_id: string;  // 必填，例如 "123456"
  ref: string;      // 幂等 key
  warehouse_id: number; // 必填
  lines: ShipLine[];    // 出库明细列表

  ts?: string | null;
  occurred_at?: string | null;
  carrier?: string | null;
  tracking_no?: string | null;
}

// 调用 /outbound/ship/commit 的 API 封装
export async function shipCommit(payload: ShipCommitPayload) {
  return apiPost("/outbound/ship/commit", payload);
}
