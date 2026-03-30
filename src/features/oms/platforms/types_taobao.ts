// src/features/oms/platforms/types_taobao.ts

export interface TaobaoAppConfigCurrent {
  id: number | null;
  app_key: string;
  app_secret_present: boolean;
  app_secret_masked: string;
  callback_url: string;
  api_base_url: string;
  sign_method: string;
  is_enabled: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface SaveTaobaoAppConfigInput {
  app_key: string;
  app_secret: string;
  callback_url: string;
  api_base_url: string;
  sign_method: string;
}

export interface TaobaoConnectionStatus {
  store_id: number;
  platform: string;
  credential_present: boolean;
  credential_expires_at: string | null;
  granted_identity_type: string | null;
  granted_identity_value: string | null;
  granted_identity_display: string | null;
  auth_source: string;
  connection_status: string;
  credential_status: string;
  reauth_required: boolean;
  pull_ready: boolean;
  status: string;
  status_reason: string | null;
  last_authorized_at: string | null;
  last_pull_checked_at: string | null;
  last_error_at: string | null;
}

export interface TaobaoPullCheckResult {
  store_id: number;
  platform: string;
  executed_real_pull: boolean;
  pull_ready: boolean;
  status: string;
  status_reason: string | null;
}
