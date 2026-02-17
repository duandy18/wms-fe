// src/features/purchase-orders/api.ts
import { apiGet, apiPost } from "../../lib/api";

export type PurchaseOrderStatus =
  | "CREATED"
  | "PARTIAL"
  | "RECEIVED"
  | "CLOSED"
  | string;

// ----------------------
// ✅ 列表态：轻量类型（/purchase-orders/）
// ----------------------

export interface PurchaseOrderListLine {
  id: number;
  po_id: number;
  line_no: number;
  item_id: number;

  // 采购单位口径（箱/件/托…）
  qty_ordered: number;
  qty_received: number;
  status: PurchaseOrderStatus;

  // ✅ 可选：若后端列表态返回 base 字段（不强制）
  qty_ordered_base?: number;
  qty_received_base?: number;

  // ✅ 为“最小单位口径”显示准备
  units_per_case?: number | null; // 每采购单位包含的最小单位数量
  base_uom?: string | null; // 最小单位名称（袋/个…）
  purchase_uom?: string | null; // 采购单位名称（件/箱…）

  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderListItem {
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

  lines: PurchaseOrderListLine[];
}

/** 列表查询参数（v2 列表） */
export interface PurchaseOrderListParams {
  skip?: number;
  limit?: number;
  supplier?: string;
  status?: string;
}

/** 查询采购单列表（列表态：轻量） */
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
  purchase_uom: string | null;

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

  supply_price: string | null;
  retail_price: string | null;
  promo_price: string | null;
  min_price: string | null;

  qty_cases: number | null;
  units_per_case: number | null;

  // 采购单位口径（展示用）
  qty_ordered: number;

  // ✅ base 口径（唯一真相，前端判断/创建任务只能用它）
  qty_ordered_base: number;
  qty_received_base: number;
  qty_remaining_base: number;

  // 采购单位口径（展示/兼容；不要用于判断）
  qty_received: number;
  qty_remaining: number;

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
  purchase_uom?: string | null;
  supply_price?: number | null;
  retail_price?: number | null;
  promo_price?: number | null;
  min_price?: number | null;
  qty_cases?: number | null;
  units_per_case?: number | null;
  qty_ordered: number;
  remark?: string | null;
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
