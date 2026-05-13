import { apiGet, apiPost } from "../../../lib/api";
import type {
  InboundReceiptListOut,
  InboundReceiptProgressOut,
  InboundReceiptReadOut,
  InboundReceiptReleaseOut,
  InboundReceiptReturnSourceOut,
} from "../contracts/inboundReceipt";

export interface InboundReceiptCreateFromPurchaseIn {
  source_doc_id: number;
  warehouse_id: number;
  remark?: string | null;
}

export interface InboundReceiptCreateManualLineIn {
  item_id: number;
  item_uom_id: number;
  planned_qty: string;
  item_name_snapshot?: string | null;
  item_spec_snapshot?: string | null;
  uom_name_snapshot?: string | null;
  remark?: string | null;
}

export interface InboundReceiptCreateManualIn {
  warehouse_id: number;
  supplier_id?: number | null;
  remark?: string | null;
  lines: InboundReceiptCreateManualLineIn[];
}

export interface InboundReceiptCreateFromReturnOrderLineIn {
  order_line_id: number;
  item_id: number;
  planned_qty: string;
  remark?: string | null;
}

export interface InboundReceiptCreateFromReturnOrderIn {
  order_key: string;
  remark?: string | null;
  lines: InboundReceiptCreateFromReturnOrderLineIn[];
}

export async function createInboundReceiptFromPurchase(
  payload: InboundReceiptCreateFromPurchaseIn,
): Promise<InboundReceiptReadOut> {
  return apiPost<InboundReceiptReadOut>("/inbound-receipts/from-purchase", payload);
}

export async function createInboundReceiptManual(
  payload: InboundReceiptCreateManualIn,
): Promise<InboundReceiptReadOut> {
  return apiPost<InboundReceiptReadOut>("/inbound-receipts/manual", payload);
}

export async function fetchInboundReceiptReturnSource(
  orderKey: string,
): Promise<InboundReceiptReturnSourceOut> {
  return apiGet<InboundReceiptReturnSourceOut>(
    `/inbound-receipts/return-source/${encodeURIComponent(orderKey)}`,
  );
}

export async function createInboundReceiptFromReturnOrder(
  payload: InboundReceiptCreateFromReturnOrderIn,
): Promise<InboundReceiptReadOut> {
  return apiPost<InboundReceiptReadOut>("/inbound-receipts/from-return-order", payload);
}

export async function fetchInboundReceipts(): Promise<InboundReceiptListOut> {
  return apiGet<InboundReceiptListOut>("/inbound-receipts");
}

export async function fetchInboundReceiptDetail(
  receiptId: number,
): Promise<InboundReceiptReadOut> {
  return apiGet<InboundReceiptReadOut>(`/inbound-receipts/${receiptId}`);
}

export async function fetchInboundReceiptProgress(
  receiptId: number,
): Promise<InboundReceiptProgressOut> {
  return apiGet<InboundReceiptProgressOut>(`/inbound-receipts/${receiptId}/progress`);
}

export async function releaseInboundReceipt(
  receiptId: number,
): Promise<InboundReceiptReleaseOut> {
  return apiPost<InboundReceiptReleaseOut>(`/inbound-receipts/${receiptId}/release`, {});
}


export type InboundReceiptPurchaseSourceCompletionStatus =
  | "NOT_RECEIVED"
  | "PARTIAL"
  | "RECEIVED";

export interface InboundReceiptPurchaseSourceOptionOut {
  po_id: number;
  po_no: string;
  target_warehouse_id: number;
  target_warehouse_code_snapshot: string | null;
  target_warehouse_name_snapshot: string | null;
  supplier_id: number;
  supplier_code_snapshot: string;
  supplier_name_snapshot: string;
  purchase_time: string;
  order_status: string;
  completion_status: InboundReceiptPurchaseSourceCompletionStatus;
  last_received_at: string | null;
}

export interface InboundReceiptPurchaseSourceOptionsOut {
  items: InboundReceiptPurchaseSourceOptionOut[];
}

export interface FetchInboundReceiptPurchaseSourceOptionsParams {
  target_warehouse_id?: number | null;
  q?: string | null;
  limit?: number;
}

export async function fetchInboundReceiptPurchaseSourceOptions(
  params: FetchInboundReceiptPurchaseSourceOptionsParams = {},
): Promise<InboundReceiptPurchaseSourceOptionsOut> {
  const qs = new URLSearchParams();

  if (
    params.target_warehouse_id != null &&
    Number.isFinite(params.target_warehouse_id) &&
    params.target_warehouse_id > 0
  ) {
    qs.set("target_warehouse_id", String(Math.trunc(params.target_warehouse_id)));
  }

  const queryText = params.q?.trim();
  if (queryText) {
    qs.set("q", queryText);
  }

  if (params.limit != null && Number.isFinite(params.limit) && params.limit > 0) {
    qs.set("limit", String(Math.trunc(params.limit)));
  }

  const query = qs.toString();
  const path = query
    ? `/inbound-receipts/purchase-source-options?${query}`
    : "/inbound-receipts/purchase-source-options";

  return apiGet<InboundReceiptPurchaseSourceOptionsOut>(path);
}
