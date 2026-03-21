// src/features/tms/pricing/types.ts

export type PricingStatus =
  | "ready"
  | "no_active_template"
  | "binding_disabled"
  | "provider_disabled"
  | "template_archived";

export interface PricingListRow {
  provider_id: number;
  provider_code: string;
  provider_name: string;
  provider_active: boolean;

  warehouse_id: number;
  warehouse_name: string;

  binding_active: boolean;

  active_template_id: number | null;
  active_template_name: string | null;

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
