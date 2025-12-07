// src/features/return-tasks/api.ts
import { apiGet, apiPost } from "../../lib/api";

export interface ReturnTaskLine {
  id: number;
  task_id: number;

  po_line_id: number | null;
  item_id: number;
  item_name: string | null;
  batch_code: string | null;

  expected_qty: number | null;
  picked_qty: number;
  committed_qty: number | null;

  status: string;
  remark: string | null;
}

export interface ReturnTask {
  id: number;
  po_id: number | null;
  supplier_id: number | null;
  supplier_name: string | null;
  warehouse_id: number;
  status: string;
  remark: string | null;
  created_at: string;
  updated_at: string;

  lines: ReturnTaskLine[];
}

export interface ReturnTaskCreateFromPoPayload {
  warehouse_id?: number | null;
  include_zero_received?: boolean;
}

export interface ReturnTaskPickPayload {
  item_id: number;
  qty: number;
  batch_code?: string | null;
}

export interface ReturnTaskCommitPayload {
  trace_id?: string | null;
}

/** 从采购单创建退货任务 */
export async function createReturnTaskFromPo(
  poId: number,
  payload: ReturnTaskCreateFromPoPayload = {},
): Promise<ReturnTask> {
  return apiPost<ReturnTask>(
    `/return-tasks/from-po/${poId}`,
    payload,
  );
}

/** 获取退货任务详情 */
export async function fetchReturnTask(
  taskId: number,
): Promise<ReturnTask> {
  return apiGet<ReturnTask>(`/return-tasks/${taskId}`);
}

/** 在退货任务上记录一次拣货（准备退货），只更新 picked_qty */
export async function recordReturnPick(
  taskId: number,
  payload: ReturnTaskPickPayload,
): Promise<ReturnTask> {
  return apiPost<ReturnTask>(
    `/return-tasks/${taskId}/pick`,
    payload,
  );
}

/** commit 退货任务：真正出库 */
export async function commitReturnTask(
  taskId: number,
  payload: ReturnTaskCommitPayload = {},
): Promise<ReturnTask> {
  return apiPost<ReturnTask>(
    `/return-tasks/${taskId}/commit`,
    payload,
  );
}
