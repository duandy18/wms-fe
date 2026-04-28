import { apiPost } from "../../../../lib/api";

import type { OmsPlatformKey } from "./platformOrderMirrors";

export interface FulfillmentOrderConversionResult {
  ok: boolean;
  platform: OmsPlatformKey;
  mirror_id: number;
  order_id: number | null;
  ref: string;
  status: string;
  store_id: number;
  store_code: string;
  ext_order_no: string;
  lines_count: number;
  item_lines_count: number;
  fulfillment_status?: string | null;
  blocked_reasons?: unknown;
  risk_flags: string[];
}

export async function convertPlatformMirrorToFulfillmentOrder(
  platform: OmsPlatformKey,
  mirrorId: number,
): Promise<FulfillmentOrderConversionResult> {
  const result = await apiPost<FulfillmentOrderConversionResult>(
    `/oms/${platform}/fulfillment-order-conversion/convert`,
    {
      mirror_id: mirrorId,
    },
  );

  if (result.ok !== true) {
    throw new Error(
      `合同不匹配：POST /oms/${platform}/fulfillment-order-conversion/convert.ok 非 true`,
    );
  }

  return result;
}
