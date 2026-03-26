// src/features/tms/waybillConfigs/types.ts

export interface ListResponse<T> {
  ok: boolean;
  data: T[];
}

export interface OneResponse<T> {
  ok: boolean;
  data: T;
}

export interface WaybillConfig {
  id: number;
  platform: string;
  shop_id: string;
  shipping_provider_id: number;
  shipping_provider_name?: string | null;
  customer_code: string;

  sender_name?: string | null;
  sender_mobile?: string | null;
  sender_phone?: string | null;
  sender_province?: string | null;
  sender_city?: string | null;
  sender_district?: string | null;
  sender_address?: string | null;

  active: boolean;
}
