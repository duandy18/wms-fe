// src/features/operations/inbound/supplement/panel/normalizeSaveError.ts

export function normalizeSaveError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const msg = raw || "保存失败";

  if (msg.includes("任务已入库") || msg.includes("COMMITTED")) {
    return "该收货任务已入库，不能再修改批次/日期。";
  }
  if (msg.includes("ReceiveTask not found")) {
    return "收货任务不存在（可能已被删除或无权限）。";
  }
  if (msg.includes("ReceiveTaskLine not found")) {
    return "收货任务行不存在（可能已被删除或数据已变化）。";
  }
  if (msg.includes("mode must be hard or soft")) {
    return "补录清单模式参数不合法（hard/soft）。";
  }

  return msg;
}
