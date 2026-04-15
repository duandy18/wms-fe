import { apiGet, apiPost } from "../../lib/api";

export type PurchaseOrderStatus = "CREATED" | "CLOSED" | "CANCELED" | string;

// ----------------------
// 计划合同（/purchase-orders/ 与 /purchase-orders/{id}）
// ----------------------

export interface PurchaseOrderPlanLine {
  id: number;
  po_id: number;
  line_no: number;
  item_id: number;

  item_name: string | null;
  item_sku: string | null;
  spec_text: string | null;

  qty_ordered_input: number;
  purchase_ratio_to_base_snapshot: number;
  qty_ordered_base: number;

  supply_price: string | null;
  discount_amount: string;
  discount_note: string | null;

  remark: string | null;

  created_at: string;
  updated_at: string;
}

// 旧组件内部仍在使用这些类型名；这里只做前端内部同义收敛，不代表后端合同回退
export type PurchaseOrderListLine = PurchaseOrderPlanLine;
export type PurchaseOrderDetailLine = PurchaseOrderPlanLine;

export interface PurchaseOrderListItem {
  id: number;
  po_no: string;

  warehouse_id: number;
  warehouse_name?: string | null;

  supplier_id: number;
  supplier_name: string;
  total_amount: string | null;

  purchaser: string;
  purchase_time: string;

  remark: string | null;
  status: PurchaseOrderStatus;

  created_at: string;
  updated_at: string;
  last_received_at: string | null;
  closed_at: string | null;

  close_reason?: string | null;
  close_note?: string | null;
  closed_by?: number | null;

  canceled_at?: string | null;
  canceled_reason?: string | null;
  canceled_by?: number | null;

  lines: PurchaseOrderPlanLine[];
}

export interface PurchaseOrderListParams {
  skip?: number;
  limit?: number;
  supplier?: string;
  status?: string;
}

export async function fetchPurchaseOrders(
  params: PurchaseOrderListParams = {},
): Promise<PurchaseOrderListItem[]> {
  const qs = new URLSearchParams();
  if (params.skip != null) qs.set("skip", String(params.skip));
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.supplier) qs.set("supplier", params.supplier);
  if (params.status) qs.set("status", params.status);

  const query = qs.toString();
  const path = query ? `/purchase-orders/?${query}` : "/purchase-orders/";
  return apiGet<PurchaseOrderListItem[]>(path);
}

export interface PurchaseOrderDetail {
  id: number;
  po_no: string;

  warehouse_id: number;
  warehouse_name?: string | null;

  supplier_id: number;
  supplier_name: string;
  total_amount: string | null;

  purchaser: string;
  purchase_time: string;

  remark: string | null;
  status: PurchaseOrderStatus;

  created_at: string;
  updated_at: string;
  last_received_at: string | null;
  closed_at: string | null;

  close_reason?: string | null;
  close_note?: string | null;
  closed_by?: number | null;

  canceled_at?: string | null;
  canceled_reason?: string | null;
  canceled_by?: number | null;

  lines: PurchaseOrderPlanLine[];
}

export async function fetchPurchaseOrderV2(id: number): Promise<PurchaseOrderDetail> {
  return apiGet<PurchaseOrderDetail>(`/purchase-orders/${id}`);
}

// ----------------------
// Create（终态合同：头表 + 行商业字段）
// ----------------------

export interface PurchaseOrderLineCreatePayload {
  line_no: number;
  item_id: number;
  uom_id: number;
  qty_input: number;

  supply_price?: string | null;
  discount_amount?: string | null;
  discount_note?: string | null;
  remark?: string | null;
}

export interface PurchaseOrderCreatePayload {
  supplier_id: number;
  warehouse_id: number;

  purchaser: string;
  purchase_time: string;

  remark?: string | null;

  lines: PurchaseOrderLineCreatePayload[];
}

export async function createPurchaseOrder(
  payload: PurchaseOrderCreatePayload,
): Promise<PurchaseOrderDetail> {
  return apiPost<PurchaseOrderDetail>("/purchase-orders/", payload);
}

// ----------------------
// Completion（/purchase-orders/completion*）
// ----------------------

export type PurchaseOrderCompletionStatus =
  | "NOT_RECEIVED"
  | "PARTIAL"
  | "RECEIVED"
  | string;

export interface PurchaseOrderCompletionLine {
  po_line_id: number;
  line_no: number;

  item_id: number;
  item_name: string | null;
  item_sku: string | null;
  spec_text: string | null;

  purchase_uom_id_snapshot: number;
  purchase_uom_name_snapshot: string;
  purchase_ratio_to_base_snapshot: number;
  qty_ordered_input: number;
  qty_ordered_base: number;

  qty_received_base: number;
  qty_remaining_base: number;
  line_completion_status: PurchaseOrderCompletionStatus;
  last_received_at: string | null;
}

export interface PurchaseOrderCompletionListItem {
  po_id: number;
  po_no: string;
  po_status: string;

  warehouse_id: number;
  supplier_id: number;
  supplier_name: string;
  purchaser: string;
  purchase_time: string;
  total_amount: string | null;

  po_line_id: number;
  line_no: number;

  item_id: number;
  item_name: string | null;
  item_sku: string | null;
  spec_text: string | null;

  purchase_uom_id_snapshot: number;
  purchase_uom_name_snapshot: string;
  purchase_ratio_to_base_snapshot: number;
  qty_ordered_input: number;
  qty_ordered_base: number;

  qty_received_base: number;
  qty_remaining_base: number;
  line_completion_status: PurchaseOrderCompletionStatus;
  last_received_at: string | null;
}

export interface PurchaseOrderCompletionSummary {
  po_id: number;
  po_no: string;
  po_status: string;

  warehouse_id: number;
  supplier_id: number;
  supplier_name: string;
  purchaser: string;
  purchase_time: string;
  total_amount: string | null;

  total_ordered_base: number;
  total_received_base: number;
  total_remaining_base: number;
  completion_status: PurchaseOrderCompletionStatus;
  last_received_at: string | null;
}

export interface PurchaseOrderCompletionEvent {
  event_id: number;
  event_no: string;
  trace_id: string;
  source_ref: string | null;
  occurred_at: string;

  po_line_id: number;
  line_no: number;
  item_id: number;

  qty_base: number;
  lot_code: string | null;
  production_date: string | null;
  expiry_date: string | null;
}

export interface PurchaseOrderCompletionDetail {
  summary: PurchaseOrderCompletionSummary;
  lines: PurchaseOrderCompletionLine[];
  receipt_events: PurchaseOrderCompletionEvent[];
}

export interface PurchaseOrderCompletionListParams {
  skip?: number;
  limit?: number;
  supplier_id?: number;
  po_status?: string;
  q?: string;
}

export async function fetchPurchaseOrdersCompletion(
  params: PurchaseOrderCompletionListParams = {},
): Promise<PurchaseOrderCompletionListItem[]> {
  const qs = new URLSearchParams();
  if (params.skip != null) qs.set("skip", String(params.skip));
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.supplier_id != null) qs.set("supplier_id", String(params.supplier_id));
  if (params.po_status) qs.set("po_status", params.po_status);
  if (params.q) qs.set("q", params.q);

  const query = qs.toString();
  const path = query ? `/purchase-orders/completion?${query}` : "/purchase-orders/completion";
  return apiGet<PurchaseOrderCompletionListItem[]>(path);
}

export async function fetchPurchaseOrderCompletionDetail(
  poId: number,
): Promise<PurchaseOrderCompletionDetail> {
  return apiGet<PurchaseOrderCompletionDetail>(`/purchase-orders/${poId}/completion`);
}
