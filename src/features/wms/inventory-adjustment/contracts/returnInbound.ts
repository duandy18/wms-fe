export interface ReturnOrderRefItemOut {
  order_ref: string;
  warehouse_id: number | null;
  last_ship_at: string;
  total_lines: number;
  remaining_qty: number;
}

export interface ReturnOrderRefSummaryLineOut {
  warehouse_id: number;
  item_id: number;
  item_name: string | null;
  lot_code_snapshot: string;
  shipped_qty: number;
}

export interface ReturnOrderRefSummaryOut {
  order_ref: string;
  ship_reasons: string[];
  lines: ReturnOrderRefSummaryLineOut[];
}

export interface ReturnOrderRefReceiverOut {
  name: string | null;
  phone: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  detail: string | null;
}

export interface ReturnOrderRefShippingOut {
  tracking_no: string | null;
  carrier_code: string | null;
  carrier_name: string | null;
  status: string | null;
  shipped_at: string | null;
  gross_weight_kg: number | null;
  cost_estimated: number | null;
  receiver: ReturnOrderRefReceiverOut | null;
  meta: Record<string, unknown> | null;
}

export interface ReturnOrderRefDetailOut {
  order_ref: string;
  platform: string | null;
  shop_id: string | null;
  ext_order_no: string | null;
  remaining_qty: number | null;
  shipping: ReturnOrderRefShippingOut | null;
  summary: ReturnOrderRefSummaryOut;
}
