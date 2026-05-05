import { apiGet } from "../../../../lib/api";

import type { OmsPlatformKey } from "./platformOrderMirrors";

export type OrderSkuResolutionStatus = "resolved" | "needs_mapping";
export type OrderSkuResolutionSource =
  | "direct_fsku_code"
  | "code_mapping"
  | "unresolved";

export type OrderSkuResolutionIdentityKind =
  | "merchant_code"
  | "platform_sku_id"
  | "platform_item_sku";

export interface OrderSkuResolutionNextAction {
  action: string;
  label: string;
  route_path: string;
  payload: Record<string, string | number | null>;
}

export interface OrderSkuResolutionComponent {
  item_id: number;
  item_sku_code_id?: number | null;
  item_uom_id?: number | null;
  sku_code: string;
  item_name: string;
  uom: string;
  qty: string;
  alloc_unit_price: string;
  sort_order: number;
}

export interface OrderSkuResolutionLine {
  platform: string;
  mirror_id: number;
  line_id: number;
  collector_order_id: number;
  collector_line_id: number;
  store_code: string;
  platform_order_no: string;

  merchant_code?: string | null;
  platform_item_id?: string | null;
  platform_sku_id?: string | null;
  title?: string | null;
  quantity: string;
  line_amount?: string | null;

  resolution_status: OrderSkuResolutionStatus;
  resolution_source: OrderSkuResolutionSource;

  resolved_identity_kind?: OrderSkuResolutionIdentityKind | null;
  resolved_identity_value?: string | null;

  fsku_id?: number | null;
  fsku_code?: string | null;
  fsku_name?: string | null;

  unresolved_reason?: string | null;
  next_actions: OrderSkuResolutionNextAction[];
  components: OrderSkuResolutionComponent[];
}

export interface OrderSkuResolutionData {
  platform: string;
  mirror_id: number;
  platform_order_no: string;
  store_code: string;
  status: OrderSkuResolutionStatus;
  lines: OrderSkuResolutionLine[];
}

interface OrderSkuResolutionEnvelope {
  ok: boolean;
  data: OrderSkuResolutionData;
}

export async function getOrderSkuResolution(
  platform: OmsPlatformKey,
  mirrorId: number,
): Promise<OrderSkuResolutionData> {
  const result = await apiGet<OrderSkuResolutionEnvelope>(
    `/oms/${platform}/platform-order-mirrors/${Math.trunc(mirrorId)}/sku-resolution`,
  );

  if (result.ok !== true) {
    throw new Error(
      `合同不匹配：GET /oms/${platform}/platform-order-mirrors/{mirror_id}/sku-resolution.ok 非 true`,
    );
  }

  return result.data;
}
