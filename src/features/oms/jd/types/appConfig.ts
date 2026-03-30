export interface JdAppConfigCurrent {
  id: number | null;
  client_id: string;
  client_secret_present: boolean;
  client_secret_masked: string;
  callback_url: string;
  gateway_url: string;
  sign_method: string;
  is_enabled: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface SaveJdAppConfigInput {
  client_id: string;
  client_secret: string;
  callback_url: string;
  gateway_url: string;
  sign_method: string;
}

export interface JdConnectionStatus {
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

export interface JdAuthorizeStartResult {
  platform: string;
  store_id: number;
  authorize_url: string;
  state: string;
}
