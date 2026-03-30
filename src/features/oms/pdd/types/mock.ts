export type PddMockScenario = "normal" | "address_missing" | "item_abnormal" | "mixed";

export interface PddMockAuthorizeResponse {
  store_id: number;
  shop_id: string;
  platform: string;
  access_token: string;
  expires_at: string;
  connection_status: string;
  credential_status: string;
  pull_ready: boolean;
  status: string;
  status_reason: string;
}

export interface PddMockIngestRow {
  order_sn: string;
  pdd_order_id: number;
  scenario: string;
}

export interface PddMockIngestResponse {
  store_id: number;
  shop_id: string;
  scenario: string;
  count: number;
  rows: PddMockIngestRow[];
}

export interface PddMockClearResponse {
  store_id: number;
  deleted_orders: number;
  deleted_items: number;
  deleted_connection_rows: number;
  deleted_credential_rows: number;
}
