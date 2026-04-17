import { apiGet, apiPost } from "../../../lib/api";
import type {
  InboundReceiptListOut,
  InboundReceiptProgressOut,
  InboundReceiptReadOut,
  InboundReceiptReleaseOut,
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
