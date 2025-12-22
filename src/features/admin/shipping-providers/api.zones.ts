// src/features/admin/shipping-providers/api.zones.ts
import { apiPost, apiPatch, apiDelete } from "../../../lib/api";
import type { PricingSchemeZone, PricingSchemeZoneMember } from "./api.types";

export async function createZone(
  schemeId: number,
  payload: { name: string; priority?: number; active?: boolean },
): Promise<PricingSchemeZone> {
  return apiPost<PricingSchemeZone>(`/pricing-schemes/${schemeId}/zones`, {
    name: payload.name,
    priority: payload.priority ?? 100,
    active: payload.active ?? true,
  });
}

// ✅ 原子接口：创建 Zone + 一次性写入 provinces members（后端事务保证，不会“成功一半”）
export async function createZoneAtomic(
  schemeId: number,
  payload: { name: string; provinces: string[]; priority?: number; active?: boolean },
): Promise<PricingSchemeZone> {
  return apiPost<PricingSchemeZone>(`/pricing-schemes/${schemeId}/zones-atomic`, {
    name: payload.name,
    priority: payload.priority ?? 100,
    active: payload.active ?? true,
    provinces: payload.provinces ?? [],
  });
}

export async function patchZone(
  zoneId: number,
  payload: Partial<{ name: string; priority: number; active: boolean }>,
): Promise<PricingSchemeZone> {
  return apiPatch<PricingSchemeZone>(`/zones/${zoneId}`, payload);
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
