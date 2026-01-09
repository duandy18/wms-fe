// src/features/return-tasks/api.ts
import { apiGet, apiPost } from "../../lib/api";

export interface ReturnTaskLine {
  id: number;
  task_id: number;

  order_line_id: number | null;

  item_id: number;
  item_name: string | null;

  batch_code: string; // ✅ 必填（系统自动回原批次）
  expected_qty: number | null;

  picked_qty: number;
  committed_qty: number | null;

  status: string;
  remark: string | null;
}

export interface ReturnTask {
  id: number;

  // ⚠️ 字段名仍叫 order_id，但语义是 order_ref（字符串键，例如 UT-OUT-2 / ORD:PDD:1:xxx）
  order_id: string;

  warehouse_id: number;
  status: string;
  remark: string | null;
  created_at: string;
  updated_at: string;

  lines: ReturnTaskLine[];
}

export interface ReturnTaskCreateFromOrderPayload {
  warehouse_id?: number | null;
  include_zero_shipped?: boolean;
}

export interface ReturnTaskReceivePayload {
  item_id: number;
  qty: number; // 可正可负：撤销误扫
}

export interface ReturnTaskCommitPayload {
  trace_id?: string | null;
}

/** 从订单来源键（order_ref）创建退货回仓任务 */
export async function createReturnTaskFromOrder(
  orderRef: string,
  payload: ReturnTaskCreateFromOrderPayload = {},
): Promise<ReturnTask> {
  return apiPost<ReturnTask>(
    `/return-tasks/from-order/${encodeURIComponent(orderRef)}`,
    payload,
  );
}

/** 获取退货任务详情 */
export async function fetchReturnTask(taskId: number): Promise<ReturnTask> {
  return apiGet<ReturnTask>(`/return-tasks/${taskId}`);
}

/** 退货回仓：记录一次数量（推荐走 /receive） */
export async function recordReturnReceive(
  taskId: number,
  payload: ReturnTaskReceivePayload,
): Promise<ReturnTask> {
  return apiPost<ReturnTask>(`/return-tasks/${taskId}/receive`, payload);
}

/** commit 退货回仓任务：真正入库 */
export async function commitReturnTask(
  taskId: number,
  payload: ReturnTaskCommitPayload = {},
): Promise<ReturnTask> {
  return apiPost<ReturnTask>(`/return-tasks/${taskId}/commit`, payload);
}

/* =========================================================
 * 左侧上下文（台账驱动，只读）
 * ========================================================= */

export interface ReturnOrderRefItem {
  order_ref: string;
  warehouse_id: number | null;
  last_ship_at: string;
  total_lines: number;
  /** 剩余可退数量（shipped - returned） */
  remaining_qty: number;
}

export interface ReturnOrderRefSummaryLine {
  warehouse_id: number;
  item_id: number;
  /** ✅ 作业人员视角：商品名（后端 join items.name 得到；可能为空） */
  item_name?: string | null;
  batch_code: string;
  shipped_qty: number;
}

export interface ReturnOrderRefSummaryOut {
  order_ref: string;
  ship_reasons: string[];
  lines: ReturnOrderRefSummaryLine[];
}

export interface ReturnOrderRefReceiverOut {
  name?: string | null;
  phone?: string | null;
  province?: string | null;
  city?: string | null;
  district?: string | null;
  detail?: string | null;
}

export interface ReturnOrderRefShippingOut {
  tracking_no?: string | null;
  carrier_code?: string | null;
  carrier_name?: string | null;
  status?: string | null;
  shipped_at?: string | null;
  gross_weight_kg?: number | null;
  cost_estimated?: number | null;
  receiver?: ReturnOrderRefReceiverOut | null;
  meta?: Record<string, unknown> | null;
}

export interface ReturnOrderRefDetailOut {
  order_ref: string;
  platform?: string | null;
  shop_id?: string | null;
  ext_order_no?: string | null;
  remaining_qty?: number | null;
  shipping?: ReturnOrderRefShippingOut | null;
  summary: ReturnOrderRefSummaryOut;
}

export interface ReturnOrderRefsListParams {
  limit?: number;
  days?: number;
  warehouse_id?: number;
}

export async function listReturnOrderRefs(
  params: ReturnOrderRefsListParams = {},
): Promise<ReturnOrderRefItem[]> {
  const qs = new URLSearchParams();
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.days != null) qs.set("days", String(params.days));
  if (params.warehouse_id != null) qs.set("warehouse_id", String(params.warehouse_id));

  const query = qs.toString();
  const path = query ? `/return-tasks/order-refs?${query}` : `/return-tasks/order-refs`;
  return apiGet<ReturnOrderRefItem[]>(path);
}

export async function fetchReturnOrderRefSummary(
  orderRef: string,
  params: { warehouse_id?: number } = {},
): Promise<ReturnOrderRefSummaryOut> {
  const qs = new URLSearchParams();
  if (params.warehouse_id != null) qs.set("warehouse_id", String(params.warehouse_id));
  const query = qs.toString();
  const path = query
    ? `/return-tasks/order-refs/${encodeURIComponent(orderRef)}/summary?${query}`
    : `/return-tasks/order-refs/${encodeURIComponent(orderRef)}/summary`;
  return apiGet<ReturnOrderRefSummaryOut>(path);
}

export async function fetchReturnOrderRefDetail(
  orderRef: string,
  params: { warehouse_id?: number } = {},
): Promise<ReturnOrderRefDetailOut> {
  const qs = new URLSearchParams();
  if (params.warehouse_id != null) qs.set("warehouse_id", String(params.warehouse_id));
  const query = qs.toString();
  const path = query
    ? `/return-tasks/order-refs/${encodeURIComponent(orderRef)}/detail?${query}`
    : `/return-tasks/order-refs/${encodeURIComponent(orderRef)}/detail`;
  return apiGet<ReturnOrderRefDetailOut>(path);
}
