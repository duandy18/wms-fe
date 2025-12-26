// src/features/admin/items/sku-builder/types.ts

export const LS_KEY = "wmsdu_sku_builder_last_v1";

export type Props = {
  currentSku?: string | null;
  onApplySku: (sku: string) => void;
};

export type LastState = {
  brand: string;
  species: string;
  flavor: string;
  weight: string;
  unit: string;
  seq: string;
};

export const DEFAULT_STATE: LastState = {
  brand: "",
  species: "",
  flavor: "",
  weight: "",
  unit: "G",
  seq: "B01",
};
