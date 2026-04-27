import type { JsonRecord, NullableString } from "./common";

export interface PlatformOrderIngestionStore {
  id: number;
  platform: string;
  store_code: string;
  store_name: string;
  active: boolean;
}

export interface PlatformOrderIngestionApp {
  configured: boolean;
  enabled_count: number;
  status: string;
}

export interface PlatformOrderIngestionCredential {
  present: boolean;
  credential_type: NullableString;
  credential_status: string;
  expires_at: NullableString;
  expired: boolean;
  scope: NullableString;
  granted_identity_type: NullableString;
  granted_identity_value: NullableString;
  granted_identity_display: NullableString;
}

export interface PlatformOrderIngestionConnection {
  present: boolean;
  auth_source: string;
  connection_status: string;
  credential_status: string;
  reauth_required: boolean;
  pull_ready: boolean;
  status: string;
  status_reason: NullableString;
  last_authorized_at: NullableString;
  last_pull_checked_at: NullableString;
  last_error_at: NullableString;
}

export interface PlatformOrderIngestionLatestRun {
  id: number;
  status: string;
  page: number;
  page_size: number;
  has_more: boolean;
  orders_count: number;
  success_count: number;
  failed_count: number;
  started_at: NullableString;
  finished_at: NullableString;
  error_message: NullableString;
}

export interface PlatformOrderIngestionLatestJob {
  id: number;
  job_type: string;
  status: string;
  time_from: NullableString;
  time_to: NullableString;
  order_status: number | null;
  page_size: number;
  cursor_page: number;
  last_run_at: NullableString;
  last_success_at: NullableString;
  last_error_at: NullableString;
  last_error_message: NullableString;
  created_at: NullableString;
  latest_run: PlatformOrderIngestionLatestRun | null;
}

export interface PlatformOrderIngestionStoreStatus {
  platform: string;
  store: PlatformOrderIngestionStore;
  app: PlatformOrderIngestionApp;
  credential: PlatformOrderIngestionCredential;
  connection: PlatformOrderIngestionConnection;
  latest_job: PlatformOrderIngestionLatestJob | null;
  pull_ready: boolean;
  blocked_reasons: string[];
  meta: JsonRecord | null;
}
