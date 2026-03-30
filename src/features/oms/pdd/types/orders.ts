export interface PddOrderLedgerRow {
  id: number;
  store_id: number;
  order_sn: string;
  order_status: string | null;
  confirm_at: string | null;
  goods_amount: string | number | null;
  pay_amount: string | number | null;
  pulled_at: string | null;
  last_synced_at: string | null;
}

export interface PddOrderLedgerItem {
  id: number;
  pdd_order_id: number;
  order_sn: string;
  platform_goods_id: string | null;
  platform_sku_id: string | null;
  outer_id: string | null;
  goods_name: string | null;
  goods_count: number;
  goods_price: string | number | null;
  raw_item_payload: unknown;
}

export interface PddOrderLedgerDetail {
  id: number;
  store_id: number;
  order_sn: string;
  order_status: string | null;
  receiver_name: string | null;
  receiver_phone: string | null;
  receiver_province: string | null;
  receiver_city: string | null;
  receiver_district: string | null;
  receiver_address: string | null;
  buyer_memo: string | null;
  remark: string | null;
  confirm_at: string | null;
  goods_amount: string | number | null;
  pay_amount: string | number | null;
  raw_summary_payload: unknown;
  raw_detail_payload: unknown;
  pulled_at: string | null;
  last_synced_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  items: PddOrderLedgerItem[];
}
