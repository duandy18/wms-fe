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
