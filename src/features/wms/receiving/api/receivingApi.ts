import { apiGet, apiPost } from "../../../../lib/api";
import type {
  ReceivingSubmitIn,
  ReceivingSubmitOut,
  ReceivingTaskListOut,
  ReceivingTaskProbeIn,
  ReceivingTaskProbeOut,
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

export async function probeReceivingTaskBarcode(
  receiptNo: string,
  payload: ReceivingTaskProbeIn,
): Promise<ReceivingTaskProbeOut> {
  return apiPost<ReceivingTaskProbeOut>(
    `/wms/receiving/tasks/${encodeURIComponent(receiptNo)}/probe`,
    payload,
  );
}

export async function submitReceiving(
  payload: ReceivingSubmitIn,
): Promise<ReceivingSubmitOut> {
  return apiPost<ReceivingSubmitOut>("/wms/receiving", payload);
}
