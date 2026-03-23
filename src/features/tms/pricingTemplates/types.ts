// src/features/tms/pricingTemplates/types.ts

export interface ListResponse<T> {
  ok: boolean;
  data: T[];
}

export interface OneResponse<T> {
  ok: boolean;
  data: T;
}

export type PricingTemplateStatus = "draft" | "archived";

export type PricingTemplateValidationStatus =
  | "not_validated"
  | "passed"
  | "failed";

export type PricingTemplateConfigStatus = "empty" | "incomplete" | "ready";

export type PricingTemplatePricingMode =
  | "flat"
  | "linear_total"
  | "step_over"
  | "manual_quote";

export type PricingTemplateReadonlyReason =
  | "validated_template"
  | "archived_template"
  | "cloned_template_structure_locked"
  | null;

export interface PricingTemplateCapabilities {
  can_edit_structure: boolean;
  can_submit_validation: boolean;
  can_clone: boolean;
  can_archive: boolean;
  readonly_reason: PricingTemplateReadonlyReason;
}

export interface PricingTemplateRange {
  id: number;
  template_id: number;
  min_kg: number;
  max_kg: number | null;
  sort_order: number;
  default_pricing_mode: PricingTemplatePricingMode;
}

export interface PricingTemplateMatrixRow {
  id: number;
  group_id: number;
  module_range_id: number;
  pricing_mode: PricingTemplatePricingMode;
  flat_amount: number | null;
  base_amount: number | null;
  rate_per_kg: number | null;
  base_kg: number | null;
  active: boolean;
  module_range?: PricingTemplateRange | null;
}

export interface PricingTemplateDestinationGroupProvince {
  id: number;
  group_id: number;
  province_code: string | null;
  province_name: string | null;
}

export interface PricingTemplateDestinationGroup {
  id: number;
  template_id: number;
  name: string;
  sort_order: number;
  active: boolean;
  members: PricingTemplateDestinationGroupProvince[];
  matrix_rows: PricingTemplateMatrixRow[];
}

export interface PricingTemplateSurchargeConfigCity {
  id: number;
  config_id: number;
  city_code: string;
  city_name: string | null;
  fixed_amount: number;
  active: boolean;
}

export interface PricingTemplateSurchargeConfig {
  id: number;
  template_id: number;
  province_code: string;
  province_name: string | null;
  province_mode: "province" | "cities";
  fixed_amount: number;
  active: boolean;
  cities: PricingTemplateSurchargeConfigCity[];
}

export interface PricingTemplate {
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

  capabilities: PricingTemplateCapabilities;
}

export interface PricingTemplateDetail extends PricingTemplate {
  destination_groups: PricingTemplateDestinationGroup[];
  surcharge_configs: PricingTemplateSurchargeConfig[];

  // 兼容前端当前可能残留的旧读取点，统一映射到 destination_groups
  zones?: PricingTemplateDestinationGroup[];
}

export interface PricingTemplateListQuery {
  shipping_provider_id?: number;
  status?: PricingTemplateStatus;
  include_archived?: boolean;
}

export interface PricingTemplateCreateInput {
  shipping_provider_id: number;
  name: string;
  expected_ranges_count: number;
  expected_groups_count: number;
}

export interface PricingTemplateCloneInput {
  name?: string;
}

export type PricingTemplateListResponse = ListResponse<PricingTemplate>;
export type PricingTemplateDetailResponse = OneResponse<PricingTemplateDetail>;
