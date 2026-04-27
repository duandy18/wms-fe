import type { MockScenario, PlatformCode } from "./common";

export interface MockAuthorizeInput {
  platform: PlatformCode;
  granted_identity_display?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_in_days: number;
  pull_ready: boolean;
}

export interface MockAuthorizeResult {
  store_id: number;
  platform: string;
  access_token: string | null;
  expires_at: string | null;
  connection_status: string;
  credential_status: string;
  pull_ready: boolean;
  status: string;
  status_reason: string | null;
}

export interface MockIngestInput {
  platform: PlatformCode;
  scenario: MockScenario;
  count: number;
}

export interface MockIngestRow {
  platform_order_no: string;
  native_order_id: number;
  scenario: string;
}

export interface MockIngestResult {
  store_id: number;
  platform: string;
  scenario: string;
  count: number;
  rows: MockIngestRow[];
}

export interface MockClearInput {
  platform: PlatformCode;
  clear_connection: boolean;
  clear_credential: boolean;
}

export interface MockClearResult {
  store_id: number;
  platform: string;
  deleted_orders: number;
  deleted_items: number;
  deleted_connection_rows: number;
  deleted_credential_rows: number;
}
