export interface JdOrderLedgerRow {
  id: number;
  store_id: number;
  order_id: string;
  order_state?: string | null;
  order_type?: string | null;
  order_start_time?: string | null;
  modified?: string | null;
  order_total_price?: string | null;
  order_seller_price?: string | null;
  pulled_at?: string | null;
  last_synced_at?: string | null;
}

export interface JdOrderLedgerItem {
  id: number;
  jd_order_id: number;
  order_id: string;
  sku_id?: string | null;
  outer_sku_id?: string | null;
  ware_id?: string | null;
  item_name?: string | null;
  item_total: number;
  item_price?: string | null;
  sku_name?: string | null;
  gift_point?: number | null;
  raw_item_payload?: unknown;
}

export interface JdOrderLedgerDetail {
  id: number;
  store_id: number;
  order_id: string;
  vender_id?: string | null;
  order_type?: string | null;
  order_state?: string | null;
  buyer_pin?: string | null;
  consignee_name?: string | null;
  consignee_mobile?: string | null;
  consignee_phone?: string | null;
  consignee_province?: string | null;
  consignee_city?: string | null;
  consignee_county?: string | null;
  consignee_town?: string | null;
  consignee_address?: string | null;
  order_remark?: string | null;
  seller_remark?: string | null;
  order_total_price?: string | null;
  order_seller_price?: string | null;
  freight_price?: string | null;
  payment_confirm?: string | null;
  order_start_time?: string | null;
  order_end_time?: string | null;
  modified?: string | null;
  raw_summary_payload?: unknown;
  raw_detail_payload?: unknown;
  pulled_at?: string | null;
  last_synced_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  items: JdOrderLedgerItem[];
}
