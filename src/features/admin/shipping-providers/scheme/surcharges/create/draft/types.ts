// src/features/admin/shipping-providers/scheme/surcharges/create/draft/types.ts

export type ScopeRow =
  | { id: string; scope: "province"; province: string; label: string }
  | { id: string; scope: "city"; province: string; city: string; label: string };

export type PersistedState = {
  provinceSaved: string[];
  citySaved: string[];
  amountById: Record<string, string>;
  provinceCollapsed: boolean;
  cityCollapsed: boolean;
  tableEditing: boolean;
};
