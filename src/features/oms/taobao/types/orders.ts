export interface TaobaoOrderLedgerRow {
  id: number;
  store_id: number;
  tid: string;
  status: string | null;
  type: string | null;
  created: string | null;
  pay_time: string | null;
  payment: string | number | null;
  total_fee: string | number | null;
  pulled_at: string | null;
  last_synced_at: string | null;
}

export interface TaobaoOrderLedgerItem {
  id: number;
  taobao_order_id: number;
  tid: string;
  oid: string;
  num_iid: string | null;
  sku_id: string | null;
  outer_iid: string | null;
  outer_sku_id: string | null;
  title: string | null;
  price: string | number | null;
  num: number;
  payment: string | number | null;
  total_fee: string | number | null;
  sku_properties_name: string | null;
  raw_item_payload: unknown;
}

export interface TaobaoOrderLedgerDetail {
  id: number;
  store_id: number;
  tid: string;
  status: string | null;
  type: string | null;
  buyer_nick: string | null;
  buyer_open_uid: string | null;
  receiver_name: string | null;
  receiver_mobile: string | null;
  receiver_phone: string | null;
  receiver_state: string | null;
  receiver_city: string | null;
  receiver_district: string | null;
  receiver_town: string | null;
  receiver_address: string | null;
  receiver_zip: string | null;
  buyer_memo: string | null;
  buyer_message: string | null;
  seller_memo: string | null;
  seller_flag: number | null;
  payment: string | number | null;
  total_fee: string | number | null;
  post_fee: string | number | null;
  coupon_fee: string | number | null;
  created: string | null;
  pay_time: string | null;
  modified: string | null;
  raw_summary_payload: unknown;
  raw_detail_payload: unknown;
  pulled_at: string | null;
  last_synced_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  items: TaobaoOrderLedgerItem[];
}
