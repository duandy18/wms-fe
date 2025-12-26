// src/features/admin/shipping-providers/scheme/surcharges/create/surchargeDraftPersist.ts
//
// useSurchargeDraft 的 localStorage 持久化协议（纯函数/类型）
// - 统一 storage key
// - 统一 row id 生成

export type PersistedState = {
  provinceSaved: string[];
  citySaved: string[];
  amountById: Record<string, string>;
  provinceCollapsed: boolean;
  cityCollapsed: boolean;
  tableEditing: boolean;
};

export function storageKey(schemeId: number) {
  return `WMS_SCHEME_SURCHARGES_UI_V2_${schemeId}`;
}

export function rowIdProvince(prov: string) {
  return `province:${prov}`;
}

export function rowIdCity(prov: string, city: string) {
  return `city:${prov}:${city}`;
}
