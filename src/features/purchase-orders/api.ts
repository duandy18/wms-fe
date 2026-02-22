// src/features/purchase-orders/api.ts
import { apiGet, apiPost } from "../../lib/api";

export type PurchaseOrderStatus = "CREATED" | "CLOSED" | "CANCELED" | string;

// ----------------------
// ✅ 列表态：轻量类型（/purchase-orders/）
// ----------------------

export interface PurchaseOrderListLine {
  id: number;
  po_id: number;
  line_no: number;
  item_id: number;

  // ✅ Phase2：快照解释器
  uom_snapshot?: string | null;
  case_ratio_snapshot?: number | null;
  case_uom_snapshot?: string | null;
  qty_ordered_case_input?: number | null;

  // ✅ Phase2：事实口径（兼容旧数据允许可选）
  qty_ordered_base?: number | null;
  qty_received_base?: number | null;
  qty_remaining_base?: number | null;

  // 展示辅助
  base_uom?: string | null;

  status?: PurchaseOrderStatus;

  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderListItem {
  id: number;
  supplier: string;
  warehouse_id: number;

  warehouse_name?: string | null;

  supplier_id: number | null;
  supplier_name: string | null;
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

  lines: PurchaseOrderListLine[];
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

// ----------------------
// ✅ 详情态：强合同类型（/purchase-orders/{id}）
// ----------------------

export interface PurchaseOrderDetailLine {
  id: number;
  po_id: number;
  line_no: number;

  item_id: number;

  item_name: string | null;
  item_sku: string | null;

  biz_category: string | null;

  spec_text: string | null;
  base_uom: string | null;

  // enrich
  sku: string | null;
  primary_barcode: string | null;

  brand: string | null;
  category: string | null;

  supplier_id: number | null;
  supplier_name: string | null;

  weight_kg: string | null;
  uom: string | null;

  has_shelf_life: boolean | null;
  shelf_life_value: number | null;
  shelf_life_unit: string | null;
  enabled: boolean | null;

  // 合同字段
  supply_price: string | null;
  retail_price: string | null;
  promo_price: string | null;
  min_price: string | null;

  // ✅ Phase2：快照解释器（第一公民）
  uom_snapshot?: string | null;
  case_ratio_snapshot?: number | null;
  case_uom_snapshot?: string | null;
  qty_ordered_case_input?: number | null;

  // ✅ Phase2：事实口径（唯一真相）
  qty_ordered_base: number;
  qty_received_base: number;
  qty_remaining_base: number;

  line_amount: string | null;
  status: PurchaseOrderStatus;
  remark: string | null;

  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderDetail {
  id: number;
  supplier: string;
  warehouse_id: number;

  supplier_id: number | null;
  supplier_name: string | null;
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

  lines: PurchaseOrderDetailLine[];
}

export async function fetchPurchaseOrderV2(id: number): Promise<PurchaseOrderDetail> {
  return apiGet<PurchaseOrderDetail>(`/purchase-orders/${id}`);
}

// ----------------------
// Create / receive（保持不变）
// ----------------------

export interface PurchaseOrderLineCreatePayload {
  line_no?: number;
  item_id: number;

  category?: string | null;

  spec_text?: string | null;
  base_uom?: string | null;

  // ✅ 兼容旧入参（后端当前仍接收）
  purchase_uom?: string | null;
  units_per_case?: number | null;
  qty_ordered: number;

  // 合同/价格
  supply_price?: number | null;
  retail_price?: number | null;
  promo_price?: number | null;
  min_price?: number | null;
  qty_cases?: number | null;

  remark?: string | null;

  // ✅ Phase2 forward fields（可选）
  uom_snapshot?: string | null;
  case_uom_snapshot?: string | null;
  case_ratio_snapshot?: number | null;
  qty_ordered_case_input?: number | null;
  qty_ordered_base?: number | null;
}

export interface PurchaseOrderCreateV2Payload {
  supplier: string;
  warehouse_id: number;
  supplier_id?: number | null;
  supplier_name?: string | null;

  purchaser: string;
  purchase_time: string;

  remark?: string | null;

  lines: PurchaseOrderLineCreatePayload[];
}

export interface PurchaseOrderReceiveLinePayload {
  line_id?: number;
  line_no?: number;
  qty: number;

  production_date?: string | null;
  expiry_date?: string | null;
}

export async function createPurchaseOrderV2(
  payload: PurchaseOrderCreateV2Payload,
): Promise<PurchaseOrderDetail> {
  return apiPost<PurchaseOrderDetail>("/purchase-orders/", payload);
}

export async function receivePurchaseOrderLine(
  poId: number,
  payload: PurchaseOrderReceiveLinePayload,
): Promise<PurchaseOrderDetail> {
  return apiPost<PurchaseOrderDetail>(`/purchase-orders/${poId}/receive-line`, payload);
}

export async function createDemoPurchaseOrder(): Promise<PurchaseOrderDetail> {
  return apiPost<PurchaseOrderDetail>("/purchase-orders/dev-demo", {});
}

// ----------------------
// Receipts（事实历史）
// ----------------------

export interface PurchaseOrderReceiptEvent {
  ref: string;
  ref_line: number;

  warehouse_id: number;
  item_id: number;
  line_no: number | null;

  batch_code: string;
  qty: number;
  after_qty: number;

  occurred_at: string;
  production_date: string | null;
  expiry_date: string | null;
}

export async function fetchPurchaseOrderReceipts(
  poId: number,
): Promise<PurchaseOrderReceiptEvent[]> {
  return apiGet<PurchaseOrderReceiptEvent[]>(`/purchase-orders/${poId}/receipts`);
}
