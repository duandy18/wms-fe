// src/features/tms/pricingTemplates/api.ts

import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../../../lib/api";
import type {
  PricingTemplate,
  PricingTemplateCloneInput,
  PricingTemplateCreateInput,
  PricingTemplateDetail,
  PricingTemplateDetailResponse,
  PricingTemplateListQuery,
  PricingTemplateListResponse,
  PricingTemplateSurchargeConfig,
  PricingTemplateStatus,
  PricingTemplateValidationStatus,
  PricingTemplateConfigStatus,
} from "./types";

export type PricingMode = "flat" | "linear_total" | "step_over" | "manual_quote";

export interface TemplateRangeApi {
  id: number;
  min_kg: number;
  max_kg: number | null;
  sort_order: number;
  label?: string;
  default_pricing_mode?: PricingMode;
}

export interface TemplateRangesResponse {
  ok: boolean;
  ranges: TemplateRangeApi[];
}

export interface TemplateRangePutItem {
  min_kg: number;
  max_kg: number | null;
  default_pricing_mode: PricingMode;
  sort_order?: number | null;
}

export interface TemplateRangesPutPayload {
  ranges: TemplateRangePutItem[];
}

export interface TemplateGroupProvinceApi {
  id: number;
  group_id: number;
  province_code: string | null;
  province_name: string | null;
}

export interface TemplateGroupApi {
  id: number;
  template_id: number;
  name: string;
  sort_order: number;
  active: boolean;
  provinces: TemplateGroupProvinceApi[];
}

export interface TemplateGroupsResponse {
  ok: boolean;
  groups: TemplateGroupApi[];
}

export interface TemplateGroupWritePayload {
  name?: string;
  sort_order?: number | null;
  active?: boolean;
  provinces: Array<{
    province_code?: string | null;
    province_name?: string | null;
  }>;
}

export interface TemplateGroupSingleResponse {
  ok: boolean;
  group: TemplateGroupApi;
}

export interface TemplateGroupDeleteResponse {
  ok: boolean;
  deleted_group_id: number;
}

export interface TemplateMatrixCellApi {
  id: number;
  group_id: number;
  module_range_id: number;
  pricing_mode: PricingMode;
  flat_amount: number | null;
  base_amount: number | null;
  rate_per_kg: number | null;
  base_kg: number | null;
  active: boolean;
}

export interface TemplateMatrixCellsResponse {
  ok: boolean;
  cells: TemplateMatrixCellApi[];
}

export interface TemplateMatrixCellPutItem {
  group_id: number;
  module_range_id: number;
  pricing_mode: PricingMode;
  flat_amount?: number | null;
  base_amount?: number | null;
  rate_per_kg?: number | null;
  base_kg?: number | null;
  active?: boolean;
}

export interface TemplateMatrixCellsPutPayload {
  cells: TemplateMatrixCellPutItem[];
}

export type SurchargeConfigCityWritePayload = {
  city_code: string;
  city_name?: string | null;
  fixed_amount: number;
  active?: boolean;
};

export type SurchargeConfigCreatePayload = {
  province_code: string;
  province_name?: string | null;
  province_mode: "province" | "cities";
  fixed_amount: number;
  active?: boolean;
  cities?: SurchargeConfigCityWritePayload[];
};

export type SurchargeConfigUpdatePayload = Partial<{
  province_code: string;
  province_name: string | null;
  province_mode: "province" | "cities";
  fixed_amount: number;
  active: boolean;
  cities: SurchargeConfigCityWritePayload[];
}>;

export type SurchargeBatchProvinceItemPayload = {
  province_code: string;
  province_name?: string | null;
  fixed_amount: number;
  active?: boolean;
};

export type SurchargeBatchProvinceCreatePayload = {
  items: SurchargeBatchProvinceItemPayload[];
};

export type SurchargeBatchProvinceSkipped = {
  province_code: string;
  province_name?: string | null;
  reason: "already_exists" | "duplicate_in_payload";
};

export type SurchargeBatchProvinceCreateResult = {
  created: PricingTemplateSurchargeConfig[];
  skipped: SurchargeBatchProvinceSkipped[];
};

export type SurchargeCityContainerCreatePayload = {
  province_code: string;
  province_name?: string | null;
  active?: boolean;
};

function normalizeTemplateStatus(value: unknown): PricingTemplateStatus {
  return String(value || "").toLowerCase() === "archived" ? "archived" : "draft";
}

function normalizeValidationStatus(
  value: unknown,
): PricingTemplateValidationStatus {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "passed") {
    return "passed";
  }
  if (normalized === "failed") {
    return "failed";
  }
  return "not_validated";
}

function normalizeConfigStatus(value: unknown): PricingTemplateConfigStatus {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "ready") {
    return "ready";
  }
  if (normalized === "incomplete") {
    return "incomplete";
  }
  return "empty";
}

function normalizePricingTemplateRow(row: PricingTemplate): PricingTemplate {
  return {
    id: Number(row.id),
    shipping_provider_id: Number(row.shipping_provider_id),
    shipping_provider_name: String(row.shipping_provider_name || ""),
    name: String(row.name || ""),
    status: normalizeTemplateStatus(row.status),
    archived_at: row.archived_at ?? null,
    validation_status: normalizeValidationStatus(row.validation_status),
    created_at: String(row.created_at || ""),
    updated_at: String(row.updated_at || ""),
    used_binding_count: Number(row.used_binding_count ?? 0),
    config_status: normalizeConfigStatus(row.config_status),
    ranges_count: Number(row.ranges_count ?? 0),
    groups_count: Number(row.groups_count ?? 0),
    matrix_cells_count: Number(row.matrix_cells_count ?? 0),
  };
}

function normalizePricingTemplateDetail(row: PricingTemplateDetail): PricingTemplateDetail {
  const destinationGroups = Array.isArray(row.destination_groups) ? row.destination_groups : [];
  const surchargeConfigs = Array.isArray(row.surcharge_configs) ? row.surcharge_configs : [];

  return {
    ...normalizePricingTemplateRow(row),
    destination_groups: destinationGroups,
    surcharge_configs: surchargeConfigs,
    zones: destinationGroups,
  };
}

function buildTemplateListQuery(query?: PricingTemplateListQuery): string {
  const params = new URLSearchParams();

  if (query?.shipping_provider_id != null) {
    params.set("shipping_provider_id", String(query.shipping_provider_id));
  }
  if (query?.status) {
    params.set("status", String(query.status));
  }
  if (query?.include_archived) {
    params.set("include_archived", "true");
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function normalizeCreateInput(
  payload: PricingTemplateCreateInput,
): PricingTemplateCreateInput {
  return {
    shipping_provider_id: Number(payload.shipping_provider_id),
    name: String(payload.name || "").trim(),
  };
}

function normalizeCloneInput(
  payload?: PricingTemplateCloneInput,
): PricingTemplateCloneInput {
  const name = payload?.name == null ? undefined : String(payload.name).trim();
  return name ? { name } : {};
}

function normalizeCityPayload(
  payload: SurchargeConfigCityWritePayload,
): SurchargeConfigCityWritePayload {
  return {
    city_code: String(payload.city_code || "").trim(),
    city_name: payload.city_name == null ? null : String(payload.city_name).trim() || null,
    fixed_amount: Number(payload.fixed_amount),
    active: typeof payload.active === "boolean" ? payload.active : true,
  };
}

function normalizeCreatePayload(
  payload: SurchargeConfigCreatePayload,
): SurchargeConfigCreatePayload {
  return {
    province_code: String(payload.province_code || "").trim(),
    province_name: payload.province_name == null ? null : String(payload.province_name).trim() || null,
    province_mode: payload.province_mode,
    fixed_amount: Number(payload.fixed_amount),
    active: typeof payload.active === "boolean" ? payload.active : true,
    cities: Array.isArray(payload.cities) ? payload.cities.map(normalizeCityPayload) : [],
  };
}

function normalizeUpdatePayload(
  payload: SurchargeConfigUpdatePayload,
): SurchargeConfigUpdatePayload {
  const next: SurchargeConfigUpdatePayload = { ...payload };

  if ("province_code" in next && next.province_code !== undefined) {
    next.province_code = String(next.province_code || "").trim();
  }

  if ("province_name" in next) {
    next.province_name =
      next.province_name == null ? null : String(next.province_name).trim() || null;
  }

  if ("fixed_amount" in next && next.fixed_amount !== undefined) {
    next.fixed_amount = Number(next.fixed_amount);
  }

  if ("cities" in next && Array.isArray(next.cities)) {
    next.cities = next.cities.map(normalizeCityPayload);
  }

  return next;
}

function normalizeBatchProvincePayload(
  payload: SurchargeBatchProvinceCreatePayload,
): SurchargeBatchProvinceCreatePayload {
  return {
    items: Array.isArray(payload.items)
      ? payload.items.map((item) => ({
          province_code: String(item.province_code || "").trim(),
          province_name:
            item.province_name == null ? null : String(item.province_name).trim() || null,
          fixed_amount: Number(item.fixed_amount),
          active: typeof item.active === "boolean" ? item.active : true,
        }))
      : [],
  };
}

function normalizeCityContainerPayload(
  payload: SurchargeCityContainerCreatePayload,
): SurchargeCityContainerCreatePayload {
  return {
    province_code: String(payload.province_code || "").trim(),
    province_name: payload.province_name == null ? null : String(payload.province_name).trim() || null,
    active: typeof payload.active === "boolean" ? payload.active : true,
  };
}

export async function fetchPricingTemplates(
  query?: PricingTemplateListQuery,
): Promise<PricingTemplate[]> {
  const res = await apiGet<PricingTemplateListResponse>(
    `/tms/pricing/templates${buildTemplateListQuery(query)}`,
  );
  return Array.isArray(res.data) ? res.data.map(normalizePricingTemplateRow) : [];
}

export async function createPricingTemplate(
  payload: PricingTemplateCreateInput,
): Promise<PricingTemplateDetail> {
  const res = await apiPost<PricingTemplateDetailResponse>(
    "/tms/pricing/templates",
    normalizeCreateInput(payload),
  );
  return normalizePricingTemplateDetail(res.data);
}

export async function fetchPricingTemplateDetail(
  templateId: number,
): Promise<PricingTemplateDetail> {
  const res = await apiGet<PricingTemplateDetailResponse>(
    `/tms/pricing/templates/${templateId}`,
  );
  return normalizePricingTemplateDetail(res.data);
}

export async function fetchPricingTemplateRanges(
  templateId: number,
): Promise<TemplateRangesResponse> {
  return apiGet<TemplateRangesResponse>(
    `/tms/pricing/templates/${templateId}/ranges`,
  );
}

export async function putPricingTemplateRanges(
  templateId: number,
  payload: TemplateRangesPutPayload,
): Promise<TemplateRangesResponse> {
  return apiPut<TemplateRangesResponse>(
    `/tms/pricing/templates/${templateId}/ranges`,
    payload,
  );
}

export async function fetchPricingTemplateGroups(
  templateId: number,
): Promise<TemplateGroupsResponse> {
  return apiGet<TemplateGroupsResponse>(
    `/tms/pricing/templates/${templateId}/groups`,
  );
}

export async function createPricingTemplateGroup(
  templateId: number,
  payload: TemplateGroupWritePayload,
): Promise<TemplateGroupSingleResponse> {
  return apiPost<TemplateGroupSingleResponse>(
    `/tms/pricing/templates/${templateId}/groups`,
    payload,
  );
}

export async function updatePricingTemplateGroup(
  templateId: number,
  groupId: number,
  payload: TemplateGroupWritePayload,
): Promise<TemplateGroupSingleResponse> {
  return apiPut<TemplateGroupSingleResponse>(
    `/tms/pricing/templates/${templateId}/groups/${groupId}`,
    payload,
  );
}

export async function deletePricingTemplateGroup(
  templateId: number,
  groupId: number,
): Promise<TemplateGroupDeleteResponse> {
  return apiDelete<TemplateGroupDeleteResponse>(
    `/tms/pricing/templates/${templateId}/groups/${groupId}`,
  );
}

export async function fetchPricingTemplateMatrixCells(
  templateId: number,
): Promise<TemplateMatrixCellsResponse> {
  return apiGet<TemplateMatrixCellsResponse>(
    `/tms/pricing/templates/${templateId}/matrix-cells`,
  );
}

export async function putPricingTemplateMatrixCells(
  templateId: number,
  payload: TemplateMatrixCellsPutPayload,
): Promise<TemplateMatrixCellsResponse> {
  return apiPut<TemplateMatrixCellsResponse>(
    `/tms/pricing/templates/${templateId}/matrix-cells`,
    payload,
  );
}

export async function createPricingTemplateSurchargeConfig(
  templateId: number,
  payload: SurchargeConfigCreatePayload,
): Promise<PricingTemplateSurchargeConfig> {
  return apiPost<PricingTemplateSurchargeConfig>(
    `/tms/pricing/templates/${templateId}/surcharge-configs`,
    normalizeCreatePayload(payload),
  );
}

export async function batchCreatePricingTemplateProvinceSurchargeConfigs(
  templateId: number,
  payload: SurchargeBatchProvinceCreatePayload,
): Promise<SurchargeBatchProvinceCreateResult> {
  return apiPost<SurchargeBatchProvinceCreateResult>(
    `/tms/pricing/templates/${templateId}/surcharge-configs/batch-province`,
    normalizeBatchProvincePayload(payload),
  );
}

export async function createPricingTemplateSurchargeCityContainer(
  templateId: number,
  payload: SurchargeCityContainerCreatePayload,
): Promise<PricingTemplateSurchargeConfig> {
  return apiPost<PricingTemplateSurchargeConfig>(
    `/tms/pricing/templates/${templateId}/surcharge-configs/city-container`,
    normalizeCityContainerPayload(payload),
  );
}

export async function patchPricingTemplateSurchargeConfig(
  configId: number,
  payload: SurchargeConfigUpdatePayload,
): Promise<PricingTemplateSurchargeConfig> {
  return apiPatch<PricingTemplateSurchargeConfig>(
    `/tms/pricing/surcharge-configs/${configId}`,
    normalizeUpdatePayload(payload),
  );
}

export async function deletePricingTemplateSurchargeConfig(
  configId: number,
): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(
    `/tms/pricing/surcharge-configs/${configId}`,
  );
}

export async function clonePricingTemplate(
  templateId: number,
  payload?: PricingTemplateCloneInput,
): Promise<PricingTemplateDetail> {
  const res = await apiPost<PricingTemplateDetailResponse>(
    `/tms/pricing/templates/${templateId}/clone`,
    normalizeCloneInput(payload),
  );
  return normalizePricingTemplateDetail(res.data);
}
