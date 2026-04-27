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
