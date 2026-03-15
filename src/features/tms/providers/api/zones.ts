// src/features/tms/providers/api/zones.ts
import { apiPost, apiPut, apiDelete } from "../../../../lib/api";
import type { PricingSchemeZone, PricingSchemeZoneMember } from "../api/types";

// ✅ 原子接口：替换某个 zone 的省份 members（level=province）
export async function replaceZoneProvinceMembers(
  zoneId: number,
  payload: { provinces: string[] },
): Promise<PricingSchemeZone> {
  return apiPut<PricingSchemeZone>(`/zones/${zoneId}/province-members`, {
    provinces: payload.provinces ?? [],
  });
}

// ✅ 新合同：归档-释放省份（释放排他资源）
// - 后端：POST /zones/{zone_id}/archive-release-provinces
export async function archiveReleaseZoneProvinces(zoneId: number): Promise<PricingSchemeZone> {
  return apiPost<PricingSchemeZone>(`/zones/${zoneId}/archive-release-provinces`, {});
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
