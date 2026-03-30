// src/features/oms/platforms/types_pdd.ts

export interface PddAppConfigCurrent {
  id: number | null;
  client_id: string;
  client_secret_present: boolean;
  client_secret_masked: string;
  redirect_uri: string;
  api_base_url: string;
  sign_method: string;
  is_enabled: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface SavePddAppConfigInput {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  api_base_url: string;
  sign_method: string;
}

export interface PddConnectionStatus {
  platform: string;
  store_id: number;
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
  credential: {
    credential_type: string;
    access_token_present: boolean;
    refresh_token_present: boolean;
    expires_at: string | null;
    scope: string | null;
    granted_identity_type: string | null;
    granted_identity_value: string | null;
    granted_identity_display: string | null;
    updated_at: string | null;
  } | null;
}

export interface PddAuthorizeStartResult {
  platform: string;
  store_id: number;
  authorize_url: string;
  state: string;
}
