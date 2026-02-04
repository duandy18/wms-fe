// src/features/operations/outbound-pick/pickTasksApi.ts
import { apiGet, apiPost } from "../../../lib/api";

export interface PickTaskLine {
  id: number;
  task_id: number;
  order_id: number | null;
  order_line_id: number | null;
  item_id: number;
  req_qty: number;
  picked_qty: number;
  batch_code: string | null;
  status: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrintJobOut {
  id: number;
  kind: string;
  ref_type: string;
  ref_id: number;
  status: string; // queued | printed | failed
  payload: Record<string, unknown>;
  requested_at: string;
  printed_at: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface PickTask {
  id: number;
  warehouse_id: number;
  ref: string | null;
  source: string | null;
  priority: number;
  status: string;
  assigned_to: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  lines: PickTaskLine[];

  // ✅ 可观测闭环：最近一次 pick_list print_job（若存在）
  print_job?: PrintJobOut | null;
}

export interface PickTaskDiffLine {
  item_id: number;
  req_qty: number;
  picked_qty: number;
  delta: number;
  status: string; // "OK" | "UNDER" | "OVER"
}

export interface PickTaskDiffSummary {
  task_id: number;
  has_over: boolean;
  has_under: boolean;
  lines: PickTaskDiffLine[];
}

export interface PickTaskScanPayload {
  item_id: number;
  qty: number;
  batch_code?: string | null;
}

// Phase 2：删除确认码（handoff_code）
export interface PickTaskCommitPayload {
  platform: string;
  shop_id: string;
  trace_id?: string | null;
  allow_diff: boolean;
}

export interface PickTaskCommitResult {
  status: string;

  // ✅ 蓝皮书合同字段（后端已返回；前端接住更稳）
  idempotent?: boolean;
  trace_id?: string | null;
  committed_at?: string | null;

  task_id: number;
  warehouse_id: number;
  platform: string;
  shop_id: string;
  ref: string;
  diff: PickTaskDiffSummary;
}

export async function listPickTasks(
  opts: {
    warehouse_id?: number;
    status?: string;
    limit?: number;
  } = {},
): Promise<PickTask[]> {
  const params = new URLSearchParams();
  if (opts.warehouse_id) params.set("warehouse_id", String(opts.warehouse_id));
  if (opts.status) params.set("status", opts.status);
  if (opts.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  const url = `/pick-tasks${qs ? `?${qs}` : ""}`;
  return apiGet<PickTask[]>(url);
}

export async function getPickTask(taskId: number): Promise<PickTask> {
  return apiGet<PickTask>(`/pick-tasks/${taskId}`);
}

export async function getPickTaskDiff(taskId: number): Promise<PickTaskDiffSummary> {
  return apiGet<PickTaskDiffSummary>(`/pick-tasks/${taskId}/diff`);
}

export async function scanPickTask(taskId: number, payload: PickTaskScanPayload): Promise<PickTask> {
  return apiPost<PickTask>(`/pick-tasks/${taskId}/scan`, payload);
}

export async function commitPickTask(taskId: number, payload: PickTaskCommitPayload): Promise<PickTaskCommitResult> {
  return apiPost<PickTaskCommitResult>(`/pick-tasks/${taskId}/commit`, payload);
}

// 从订单创建拣货任务（用于 Cockpit & DevConsole PickTask 调试）
export interface PickTaskCreateFromOrderPayload {
  // Phase 2：不再由前端选择仓库；后端解析执行仓
  warehouse_id?: number | null;

  source?: string;
  priority?: number;
}

/**
 * createPickTaskFromOrder（方案 1）：
 * - 只走 /pick-tasks/from-order/{order_id}
 * - body 可以为空或仅带 source/priority（warehouse_id 由后端解析）
 */
export async function createPickTaskFromOrder(
  orderId: number,
  payload: PickTaskCreateFromOrderPayload = {},
): Promise<PickTask> {
  const endpoint = `/pick-tasks/from-order/${orderId}`;
  return apiPost<PickTask>(endpoint, payload);
}
