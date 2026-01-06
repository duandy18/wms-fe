// src/features/operations/inbound/supplement/api.ts

import { apiGet, apiPatch } from "../../../../lib/api";
import type { ReceiveTask } from "../../../receive-tasks/api";
import type { ReceiveSupplementLine, SupplementSourceType } from "./types";

// 将前端补录类型转换为后端接口所需要的类型
function toBackendSource(sourceType: SupplementSourceType): string | null {
  if (sourceType === "PURCHASE") return "PO";
  if (sourceType === "RETURN") return "ORDER";
  return null; // MISC 暂未接入 receive_tasks
}

export type SupplementMode = "hard" | "soft";

// 获取补录清单数据，传入不同的查询条件
export async function fetchReceiveSupplements(args: {
  sourceType: SupplementSourceType;
  warehouseId?: number;
  poId?: number;
  limit?: number;
  mode?: SupplementMode;
}): Promise<ReceiveSupplementLine[]> {
  const st = toBackendSource(args.sourceType);
  if (!st) return [];

  return await apiGet<ReceiveSupplementLine[]>("/receive-tasks/supplements", {
    warehouse_id: args.warehouseId ?? 1,
    source_type: st,
    po_id: args.poId,
    limit: args.limit ?? 200,
    mode: args.mode ?? "hard",
  });
}

// 更新收货任务行的补录信息（如批次、生产日期、到期日期）
export async function patchReceiveTaskLineMeta(args: {
  taskId: number;
  itemId: number;
  batch_code?: string | null;
  production_date?: string | null; // 格式 YYYY-MM-DD
  expiry_date?: string | null; // 格式 YYYY-MM-DD
}): Promise<ReceiveTask> {
  const payload: Record<string, unknown> = {};

  if (args.batch_code !== undefined) payload["batch_code"] = args.batch_code;
  if (args.production_date !== undefined)
    payload["production_date"] = args.production_date;
  if (args.expiry_date !== undefined) payload["expiry_date"] = args.expiry_date;

  return await apiPatch<ReceiveTask>(
    `/receive-tasks/${args.taskId}/lines/${args.itemId}/meta`,
    payload
  );
}
