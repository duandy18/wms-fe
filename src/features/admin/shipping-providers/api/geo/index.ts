// src/features/admin/shipping-providers/api/geo/index.ts
import { apiGet } from "../../../../../lib/api";

export type GeoItem = {
  code: string;
  name: string;
};

export async function fetchGeoProvinces(): Promise<GeoItem[]> {
  return apiGet<GeoItem[]>("/geo/provinces");
}

export async function fetchGeoCities(provinceCode: string): Promise<GeoItem[]> {
  const pc = (provinceCode || "").trim();
  if (!pc) return [];
  return apiGet<GeoItem[]>(`/geo/provinces/${pc}/cities`);
}
