// src/features/operations/inbound/receipts/types.ts

/**
 * Phase5+：采购收货 Workbench（前端唯一真相）
 * 后端合同：app/schemas/purchase_order_receive_workbench.py
 *
 * - po_summary
 * - receipt（当前 DRAFT 或 null）
 * - rows（计划 + 已确认 + 草稿 + remaining + 批次）
 * - explain（可能为 null）
 * - caps（can_confirm / can_start_draft / receipt_id）
 */

export interface PoSummaryOut {
  po_id: number;
  warehouse_id: number;
  supplier_id: number | null;
  supplier_name: string | null;
  status: string | null;
  occurred_at: string | null; // UTC ISO string or null
}

export interface ReceiptSummaryOut {
  receipt_id: number;
  ref: string;
  status: string;
  occurred_at: string; // UTC ISO string
}

export interface WorkbenchBatchRowOut {
  batch_code: string;
  production_date: string | null; // date ISO (yyyy-mm-dd)
  expiry_date: string | null; // date ISO (yyyy-mm-dd)
  qty_received: number;
}

export interface WorkbenchRowOut {
  po_line_id: number;
  line_no: number;
  item_id: number;
  item_name: string | null;
  item_sku: string | null;

  // base 口径（后端已保证）
  ordered_qty: number;
  confirmed_received_qty: number;
  draft_received_qty: number;
  remaining_qty: number;

  // 批次（已按后端聚合/排序）
  batches: WorkbenchBatchRowOut[];
  confirmed_batches: WorkbenchBatchRowOut[];
  all_batches: WorkbenchBatchRowOut[];
}

export interface WorkbenchExplainOut {
  confirmable: boolean;
  blocking_errors: Record<string, unknown>[]; // 后端是 List[dict]，前端不推导结构
  normalized_lines_preview: Record<string, unknown>[]; // 后端是 List[dict]
}

export interface WorkbenchCapsOut {
  can_confirm: boolean;
  can_start_draft: boolean;
  receipt_id: number | null;
}

export interface PurchaseOrderReceiveWorkbenchOut {
  po_summary: PoSummaryOut;
  receipt: ReceiptSummaryOut | null;
  rows: WorkbenchRowOut[];
  explain: WorkbenchExplainOut | null;
  caps: WorkbenchCapsOut;
}

/**
 * POST /purchase-orders/{po_id}/receive-line
 * 后端入参：PurchaseOrderReceiveLineIn
 * - line_id / line_no 至少一个
 * - qty 必填
 * - production_date / expiry_date 可选
 * - barcode 可选
 */
export interface PurchaseOrderReceiveLineIn {
  line_id?: number | null;
  line_no?: number | null;
  qty: number;
  production_date?: string | null;
  expiry_date?: string | null;
  barcode?: string | null;
}

/**
 * POST /inbound-receipts/{receipt_id}/confirm
 * 这里只用来触发 confirm + 刷新 workbench；返回结构无需前端强依赖
 */
export interface InboundReceiptConfirmOut {
  receipt: {
    id: number;
    status: string;
    ref: string;
  };
  ledger_written: number;
  ledger_refs: unknown[];
}
