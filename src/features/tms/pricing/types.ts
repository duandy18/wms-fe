// src/features/tms/pricing/types.ts

export type PricingStatus =
  | "active"
  | "scheduled"
  | "no_active_template"
  | "binding_disabled"
  | "provider_disabled";

export type PricingTemplateStatus = "draft" | "archived";
export type PricingTemplateValidationStatus =
  | "not_validated"
  | "passed"
  | "failed";
export type PricingTemplateConfigStatus = "empty" | "incomplete" | "ready";

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

  effective_from: string | null;
  disabled_at: string | null;

  pricing_status: PricingStatus;
}

export interface PricingBindingTemplateCandidate {
  id: number;
  shipping_provider_id: number;
  shipping_provider_name: string;
  source_template_id: number | null;
  name: string;
  status: PricingTemplateStatus;
  archived_at: string | null;
  validation_status: PricingTemplateValidationStatus;
  created_at: string;
  updated_at: string;
  used_binding_count: number;
  config_status: PricingTemplateConfigStatus;
  ranges_count: number;
  groups_count: number;
  matrix_cells_count: number;
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
