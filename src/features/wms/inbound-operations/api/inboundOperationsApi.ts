import { apiGet, apiPost } from "../../../../lib/api";
import type {
  InboundOperationSubmitIn,
  InboundOperationSubmitOut,
  InboundTaskReadOut,
} from "../contracts/inboundOperation";

export async function fetchInboundTask(receiptNo: string): Promise<InboundTaskReadOut> {
  return apiGet<InboundTaskReadOut>(
    `/wms/inbound-operations/tasks/${encodeURIComponent(receiptNo)}`,
  );
}

export async function submitInboundOperation(
  payload: InboundOperationSubmitIn,
): Promise<InboundOperationSubmitOut> {
  return apiPost<InboundOperationSubmitOut>("/wms/inbound-operations", payload);
}
