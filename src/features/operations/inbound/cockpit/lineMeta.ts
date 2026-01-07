// src/features/operations/inbound/cockpit/lineMeta.ts

import { recordReceiveScan, type ReceiveTask } from "../../../receive-tasks/api";
import { getErrMsg } from "./utils";

export async function updateLineMeta(args: {
  itemId: number;
  meta: { batch_code?: string; production_date?: string; expiry_date?: string };

  currentTask: ReceiveTask | null;
  setCurrentTask: (v: ReceiveTask | null) => void;
  setTaskError: (v: string | null) => void;
}) {
  const { itemId, meta, currentTask, setCurrentTask, setTaskError } = args;

  if (!currentTask) {
    setTaskError("请先绑定收货任务");
    return;
  }
  if (currentTask.status === "COMMITTED") {
    setTaskError("任务已 COMMITTED，不能修改批次信息");
    return;
  }

  try {
    const updated = await recordReceiveScan(currentTask.id, {
      item_id: itemId,
      qty: 0,
      batch_code: meta.batch_code,
      production_date: meta.production_date,
      expiry_date: meta.expiry_date,
    });
    setCurrentTask(updated);
    setTaskError(null);
  } catch (err: unknown) {
    console.error("updateLineMeta (recordReceiveScan) failed", err);
    setTaskError(getErrMsg(err, "更新批次信息失败"));
  }
}
