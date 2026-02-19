// src/features/operations/inbound/receipts/api.ts

import { apiGet, apiPost } from "../../../../lib/api";
import type { InboundReceiptConfirmOut, PurchaseOrderReceiveLineIn, PurchaseOrderReceiveWorkbenchOut } from "./types";

// ----------------------
// Phase5+：Receive Workbench（页面唯一数据源）
// ----------------------

export async function fetchPoReceiveWorkbench(poId: number): Promise<PurchaseOrderReceiveWorkbenchOut> {
  return apiGet<PurchaseOrderReceiveWorkbenchOut>(`/purchase-orders/${poId}/receive-workbench`);
}

/**
 * 显式开始收货：POST /purchase-orders/{po_id}/receipts/draft
 * 后端返回 InboundReceiptOut（不是 workbench），前端以 refresh workbench 为准。
 */
export async function startPoReceiveDraft(poId: number): Promise<unknown> {
  return apiPost<unknown>(`/purchase-orders/${poId}/receipts/draft`, {});
}

/**
 * 行级录入：POST /purchase-orders/{po_id}/receive-line
 * 后端直接返回 workbench（response_model=PurchaseOrderReceiveWorkbenchOut）
 * - 未显式开始收货会 409
 */
export async function receivePoLineWorkbench(poId: number, payload: PurchaseOrderReceiveLineIn): Promise<PurchaseOrderReceiveWorkbenchOut> {
  return apiPost<PurchaseOrderReceiveWorkbenchOut>(`/purchase-orders/${poId}/receive-line`, payload);
}

// ----------------------
// Confirm：库存唯一写入口
// ----------------------

export async function confirmInboundReceipt(receiptId: number): Promise<InboundReceiptConfirmOut> {
  return apiPost<InboundReceiptConfirmOut>(`/inbound-receipts/${receiptId}/confirm`, {});
}
