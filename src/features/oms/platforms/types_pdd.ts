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
