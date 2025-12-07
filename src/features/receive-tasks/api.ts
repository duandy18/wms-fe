// src/features/receive-tasks/api.ts
//
// 收货任务 API（含 dev demo）
//

import { apiGet, apiPost } from "../../lib/api";

/** 收货任务行 */
export interface ReceiveTaskLine {
  id: number;
  task_id: number;

  po_line_id: number | null;
  item_id: number;
  item_name: string | null;
  item_sku?: string | null;
  category?: string | null;
  spec_text?: string | null;
  base_uom?: string | null;
  purchase_uom?: string | null;
  units_per_case?: number | null;

  batch_code: string | null;
  production_date?: string | null;
  expiry_date?: string | null;

  expected_qty: number | null;
  scanned_qty: number;
  committed_qty: number | null;

  status: string;
  remark: string | null;
}

/** 收货任务头 + 行 */
export interface ReceiveTask {
  id: number;
  source_type?: string;
  source_id?: number | null;

  po_id: number | null;
  supplier_id: number | null;
  supplier_name: string | null;
  warehouse_id: number;
  status: string;
  remark: string | null;
  created_at: string;
  updated_at: string;

  lines: ReceiveTaskLine[];
}

/** 从采购单创建收货任务的请求体（目前只用默认参数） */
export interface ReceiveTaskCreateFromPoPayload {
  warehouse_id?: number | null;
  include_fully_received?: boolean;
}

/** 客户退货行（from-order 用） */
export interface OrderReturnLineIn {
  item_id: number;
  qty: number;
  item_name?: string | null;
  batch_code?: string | null;
}

/** 从订单创建收货任务（RMA）请求体 */
export interface ReceiveTaskCreateFromOrderPayload {
  warehouse_id?: number | null;
  lines: OrderReturnLineIn[];
}

/** 扫码/实收录入请求体 */
export interface ReceiveTaskScanPayload {
  item_id: number;
  qty: number;
  batch_code?: string | null;
  production_date?: string | null;
  expiry_date?: string | null;
}

/** commit 请求体 */
export interface ReceiveTaskCommitPayload {
  trace_id?: string | null;
}

/** 列表查询参数 */
export interface ReceiveTaskListParams {
  skip?: number;
  limit?: number;
  status?: string;
  po_id?: number;
  warehouse_id?: number;
}

/** 从采购单创建收货任务 */
export async function createReceiveTaskFromPo(
  poId: number,
  payload: ReceiveTaskCreateFromPoPayload = {},
): Promise<ReceiveTask> {
  return apiPost<ReceiveTask>(`/receive-tasks/from-po/${poId}`, payload);
}

/** 从订单创建收货任务（客户退货 / RMA） */
export async function createReceiveTaskFromOrder(
  orderId: number,
  payload: ReceiveTaskCreateFromOrderPayload,
): Promise<ReceiveTask> {
  return apiPost<ReceiveTask>(
    `/receive-tasks/from-order/${orderId}`,
    payload,
  );
}

/** 获取收货任务详情 */
export async function fetchReceiveTask(taskId: number): Promise<ReceiveTask> {
  return apiGet<ReceiveTask>(`/receive-tasks/${taskId}`);
}

/** 在任务上记录一次实收（正数=增加，负数=回退） */
export async function recordReceiveScan(
  taskId: number,
  payload: ReceiveTaskScanPayload,
): Promise<ReceiveTask> {
  return apiPost<ReceiveTask>(`/receive-tasks/${taskId}/scan`, payload);
}

/** commit 收货任务：真正入库 */
export async function commitReceiveTask(
  taskId: number,
  payload: ReceiveTaskCommitPayload = {},
): Promise<ReceiveTask> {
  return apiPost<ReceiveTask>(`/receive-tasks/${taskId}/commit`, payload);
}

/** 收货任务列表（用于下拉） */
export async function listReceiveTasks(
  params: ReceiveTaskListParams = {},
): Promise<ReceiveTask[]> {
  const qs = new URLSearchParams();
  if (params.skip != null) qs.set("skip", String(params.skip));
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.po_id != null) qs.set("po_id", String(params.po_id));
  if (params.warehouse_id != null) {
    qs.set("warehouse_id", String(params.warehouse_id));
  }

  const query = qs.toString();
  const path = query ? `/receive-tasks?${query}` : "/receive-tasks";
  return apiGet<ReceiveTask[]>(path);
}

/** Dev 场景：基于 PO 生成 demo 收货任务（normal / under / over） */
export type ReceiveTaskDemoScenario = "normal" | "under" | "over";

export async function createReceiveTaskDemoFromPo(
  poId: number,
  scenario: ReceiveTaskDemoScenario = "normal",
): Promise<ReceiveTask> {
  const qs = new URLSearchParams();
  qs.set("scenario", scenario);
  const path = `/receive-tasks/dev-demo/from-po/${poId}?${qs.toString()}`;
  return apiPost<ReceiveTask>(path, {});
}
