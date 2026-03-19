// src/features/tms/pricing/types.ts

export type PricingStatus =
  | "provider_disabled"
  | "binding_disabled"
  | "no_active_scheme"
  | "ready";

export interface PricingListRow {
  provider_id: number;
  provider_code: string;
  provider_name: string;
  provider_active: boolean;

  warehouse_id: number;
  warehouse_name: string;

  binding_active: boolean;

  active_scheme_id: number | null;
  active_scheme_name: string | null;
  active_scheme_status: string | null;

  pricing_status: PricingStatus;
}

export interface PricingListResponse {
  ok: boolean;
  rows: PricingListRow[];
}

export interface PricingFiltersState {
  keyword: string;
  warehouse_id: string;
  pricing_status: "" | PricingStatus;
}
