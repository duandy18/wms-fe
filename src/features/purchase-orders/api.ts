import { apiGet, apiPost } from "../../lib/api";

export type PurchaseOrderStatus =
  | "CREATED"
  | "PARTIAL"
  | "RECEIVED"
  | "CLOSED"
  | string;

// ----------------------
// Phase 2：多行 PO 模型
// ----------------------

export interface PurchaseOrderLine {
  id: number;
  po_id: number;
  line_no: number;

  item_id: number;
  item_name: string | null;
  item_sku: string | null;
  category: string | null;

  // 规格 & 单位
  spec_text: string | null;
  base_uom: string | null;
  purchase_uom: string | null;

  // 价格体系
  supply_price: string | null;
  retail_price: string | null;
  promo_price: string | null;
  min_price: string | null;

  // 数量体系
  qty_cases: number | null;
  units_per_case: number | null;
  qty_ordered: number;
  qty_received: number;

  // 金额 & 状态
  line_amount: string | null;
  status: PurchaseOrderStatus;
  remark: string | null;

  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderWithLines {
  id: number;
  supplier: string;
  warehouse_id: number;

  supplier_id: number | null;
  supplier_name: string | null;
  total_amount: string | null;
  remark: string | null;

  status: PurchaseOrderStatus;

  created_at: string;
  updated_at: string;
  last_received_at: string | null;
  closed_at: string | null;

  lines: PurchaseOrderLine[];
}

/** 列表查询参数（v2 列表） */
export interface PurchaseOrderListParams {
  skip?: number;
  limit?: number;
  supplier?: string;
  status?: string;
}

/** 查询采购单列表（v2：头 + 行，轻量版） */
export async function fetchPurchaseOrders(
  params: PurchaseOrderListParams = {},
): Promise<PurchaseOrderWithLines[]> {
  const qs = new URLSearchParams();
  if (params.skip != null) qs.set("skip", String(params.skip));
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.supplier) qs.set("supplier", params.supplier);
  if (params.status) qs.set("status", params.status);

  const query = qs.toString();
  const path = query ? `/purchase-orders/?${query}` : "/purchase-orders/";
  return apiGet<PurchaseOrderWithLines[]>(path);
}

/** 创建多行 PO 的行请求体 */
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

/** 创建多行 PO 的请求体（头 + 行） */
export interface PurchaseOrderCreateV2Payload {
  supplier: string;
  warehouse_id: number;
  supplier_id?: number | null;
  supplier_name?: string | null;
  remark?: string | null;
  lines: PurchaseOrderLineCreatePayload[];
}

/** 行级收货请求体（Phase 2） */
export interface PurchaseOrderReceiveLinePayload {
  line_id?: number;
  line_no?: number;
  qty: number;
}

/** 获取多行 PO 详情（头 + 行） */
export async function fetchPurchaseOrderV2(
  id: number,
): Promise<PurchaseOrderWithLines> {
  return apiGet<PurchaseOrderWithLines>(`/purchase-orders/${id}`);
}

/** 创建多行 PO（头 + 行） */
export async function createPurchaseOrderV2(
  payload: PurchaseOrderCreateV2Payload,
): Promise<PurchaseOrderWithLines> {
  return apiPost<PurchaseOrderWithLines>("/purchase-orders/", payload);
}

/** 行级收货（Phase 2） */
export async function receivePurchaseOrderLine(
  poId: number,
  payload: PurchaseOrderReceiveLinePayload,
): Promise<PurchaseOrderWithLines> {
  return apiPost<PurchaseOrderWithLines>(
    `/purchase-orders/${poId}/receive-line`,
    payload,
  );
}

/** Dev：创建 Demo 采购单（头 + 行） */
export async function createDemoPurchaseOrder(): Promise<PurchaseOrderWithLines> {
  return apiPost<PurchaseOrderWithLines>("/purchase-orders/dev-demo", {});
}
