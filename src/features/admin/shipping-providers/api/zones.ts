// src/features/admin/shipping-providers/api/zones.ts
import { apiPost, apiPatch, apiPut, apiDelete } from "../../../../lib/api";
import type { PricingSchemeZone, PricingSchemeZoneMember } from "../api/types";

export async function createZone(
  schemeId: number,
  payload: { name: string; priority?: number; active?: boolean; segment_template_id?: number | null },
): Promise<PricingSchemeZone> {
  return apiPost<PricingSchemeZone>(`/pricing-schemes/${schemeId}/zones`, {
    name: payload.name,
    priority: payload.priority ?? 100,
    active: payload.active ?? true,
    segment_template_id: payload.segment_template_id ?? null,
  });
}

// ✅ 原子接口：创建 Zone + 一次性写入 provinces members（后端事务保证，不会“成功一半”）
export async function createZoneAtomic(
  schemeId: number,
  payload: {
    name: string;
    provinces: string[];
    priority?: number;
    active?: boolean;
    segment_template_id?: number | null;
  },
): Promise<PricingSchemeZone> {
  return apiPost<PricingSchemeZone>(`/pricing-schemes/${schemeId}/zones-atomic`, {
    name: payload.name,
    priority: payload.priority ?? 100,
    active: payload.active ?? true,
    provinces: payload.provinces ?? [],
    segment_template_id: payload.segment_template_id ?? null,
  });
}

export async function patchZone(
  zoneId: number,
  payload: Partial<{ name: string; priority: number; active: boolean; segment_template_id: number | null }>,
): Promise<PricingSchemeZone> {
  return apiPatch<PricingSchemeZone>(`/zones/${zoneId}`, payload);
}

// ✅ 原子接口：替换某个 zone 的省份 members（level=province）
export async function replaceZoneProvinceMembers(
  zoneId: number,
  payload: { provinces: string[] },
): Promise<PricingSchemeZone> {
  return apiPut<PricingSchemeZone>(`/zones/${zoneId}/province-members`, {
    provinces: payload.provinces ?? [],
  });
}

export async function deleteZone(zoneId: number): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/zones/${zoneId}`);
}

export async function createZoneMember(
  zoneId: number,
  payload: { level: "province" | "city" | "district" | "text"; value: string },
): Promise<PricingSchemeZoneMember> {
  return apiPost<PricingSchemeZoneMember>(`/zones/${zoneId}/members`, payload);
}

export async function deleteZoneMember(memberId: number): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/zone-members/${memberId}`);
}
