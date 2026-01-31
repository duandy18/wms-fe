// src/features/admin/shipping-providers/scheme/surcharges/create/draft/storage.ts

export function storageKey(schemeId: number) {
  return `WMS_SCHEME_SURCHARGES_UI_V2_${schemeId}`;
}

export function rowIdProvince(prov: string) {
  return `province:${prov}`;
}

export function rowIdCity(prov: string, city: string) {
  return `city:${prov}:${city}`;
}
