import { apiGet, apiPost } from "../../../../lib/api";
import type {
  ReceivingSubmitIn,
  ReceivingSubmitOut,
  ReceivingTaskListOut,
  ReceivingTaskReadOut,
} from "../contracts/receiving";

export async function fetchReceivingTasks(): Promise<ReceivingTaskListOut> {
  return apiGet<ReceivingTaskListOut>("/wms/receiving/tasks");
}

export async function fetchReceivingTask(receiptNo: string): Promise<ReceivingTaskReadOut> {
  return apiGet<ReceivingTaskReadOut>(
    `/wms/receiving/tasks/${encodeURIComponent(receiptNo)}`,
  );
}

export async function submitReceiving(
  payload: ReceivingSubmitIn,
): Promise<ReceivingSubmitOut> {
  return apiPost<ReceivingSubmitOut>("/wms/receiving", payload);
}
