// src/features/admin/shipping-providers/api/schemes.ts
import { apiGet, apiPost, apiPatch } from "../../../../lib/api";
import type {
  PricingScheme,
  PricingSchemeDetail,
  SchemeListResponse,
  SchemeDetailResponse,
  SchemeDefaultPricingMode,
  SchemeWeightSegment,
  SegmentTemplateListResponse,
  SegmentTemplateDetailResponse,
  SegmentTemplateOut,
} from "./types";

export async function fetchPricingSchemes(providerId: number, params?: { active?: boolean }): Promise<PricingScheme[]> {
  const qs = new URLSearchParams();
  if (params?.active !== undefined) qs.set("active", String(params.active));
  const query = qs.toString();
  const path = query ? `/shipping-providers/${providerId}/pricing-schemes?${query}` : `/shipping-providers/${providerId}/pricing-schemes`;
  const res = await apiGet<SchemeListResponse>(path);
  return res.data;
}

export async function fetchPricingSchemeDetail(schemeId: number): Promise<PricingSchemeDetail> {
  const res = await apiGet<SchemeDetailResponse>(`/pricing-schemes/${schemeId}`);
  return res.data;
}

export async function createPricingScheme(
  providerId: number,
  payload: {
    name: string;
    active?: boolean;
    priority?: number;
    currency?: string;
    default_pricing_mode?: SchemeDefaultPricingMode;
    effective_from?: string | null;
    effective_to?: string | null;
    billable_weight_rule?: Record<string, unknown> | null;
    segments_json?: SchemeWeightSegment[] | null;
  },
): Promise<PricingSchemeDetail> {
  const res = await apiPost<SchemeDetailResponse>(`/shipping-providers/${providerId}/pricing-schemes`, payload);
  return res.data;
}

export async function patchPricingScheme(
  schemeId: number,
  payload: Partial<{
    name: string;
    active: boolean;
    priority: number;
    currency: string;
    default_pricing_mode: SchemeDefaultPricingMode;
    effective_from: string | null;
    effective_to: string | null;
    billable_weight_rule: Record<string, unknown> | null;
    segments_json: SchemeWeightSegment[] | null;
  }>,
): Promise<PricingSchemeDetail> {
  const res = await apiPatch<SchemeDetailResponse>(`/pricing-schemes/${schemeId}`, payload);
  return res.data;
}

// ============================================================
// Segment Templates API（路线 1）
// ============================================================

export async function fetchSegmentTemplates(schemeId: number): Promise<SegmentTemplateOut[]> {
  const res = await apiGet<SegmentTemplateListResponse>(`/pricing-schemes/${schemeId}/segment-templates`);
  return res.data;
}

export async function fetchSegmentTemplateDetail(templateId: number): Promise<SegmentTemplateOut> {
  const res = await apiGet<SegmentTemplateDetailResponse>(`/segment-templates/${templateId}`);
  return res.data;
}

export async function createSegmentTemplate(
  schemeId: number,
  payload: { name?: string; effective_from?: string | null } = {},
): Promise<SegmentTemplateOut> {
  const res = await apiPost<SegmentTemplateDetailResponse>(`/pricing-schemes/${schemeId}/segment-templates`, payload);
  return res.data;
}

export async function publishSegmentTemplate(templateId: number): Promise<SegmentTemplateOut> {
  const res = await apiPost<SegmentTemplateDetailResponse>(`/segment-templates/${templateId}:publish`, {});
  return res.data;
}

export async function activateSegmentTemplate(templateId: number): Promise<SegmentTemplateOut> {
  const res = await apiPost<SegmentTemplateDetailResponse>(`/segment-templates/${templateId}:activate`, {});
  return res.data;
}

export async function patchSegmentTemplateItemActive(itemId: number, active: boolean): Promise<SegmentTemplateOut> {
  const res = await apiPatch<SegmentTemplateDetailResponse>(`/segment-template-items/${itemId}`, { active });
  return res.data;
}

// 旧接口仍保留：切 scheme_segments.active（兼容旧页；模板工作台不再使用它）
export async function patchPricingSchemeSegmentActive(
  schemeId: number,
  segmentId: number,
  active: boolean,
): Promise<PricingSchemeDetail> {
  const res = await apiPatch<SchemeDetailResponse>(`/pricing-schemes/${schemeId}/segments/${segmentId}`, { active });
  return res.data;
}
