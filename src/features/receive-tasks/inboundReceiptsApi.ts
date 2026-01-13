// src/features/receive-tasks/inboundReceiptsApi.ts
import { apiGet } from "../../lib/api";

export type InboundReceiptLine = {
  id: number;
  receipt_id: number;
  line_no: number;

  po_line_id: number | null;
  item_id: number;
  item_name: string | null;
  item_sku: string | null;

  batch_code: string;
  production_date: string | null;
  expiry_date: string | null;

  qty_received: number;
  units_per_case: number;
  qty_units: number;

  unit_cost: string | null;
  line_amount: string | null;

  remark: string | null;

  created_at: string;
  updated_at: string;
};

export type InboundReceipt = {
  id: number;
  warehouse_id: number;
  supplier_id: number | null;
  supplier_name: string | null;

  source_type: string;
  source_id: number | null;
  receive_task_id: number | null;

  ref: string;
  trace_id: string | null;

  status: string;
  remark: string | null;

  occurred_at: string;
  created_at: string;
  updated_at: string;

  lines: InboundReceiptLine[];
};

export async function fetchInboundReceiptsByTaskId(taskId: number): Promise<InboundReceipt[]> {
  return apiGet<InboundReceipt[]>(`/inbound-receipts?receive_task_id=${encodeURIComponent(String(taskId))}`);
}

export async function fetchInboundReceiptDetail(receiptId: number): Promise<InboundReceipt> {
  return apiGet<InboundReceipt>(`/inbound-receipts/${encodeURIComponent(String(receiptId))}`);
}
