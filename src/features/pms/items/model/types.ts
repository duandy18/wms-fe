// src/features/pms/items/store/types.ts

import type { Item } from "../../../../contracts/item/contract";

export type EnabledFilter = "all" | "enabled" | "disabled";

export type ItemsState = {
  items: Item[];
  loading: boolean;
  error: string | null;

  selectedItem: Item | null;

  primaryBarcodes: Record<number, string>;

  filter: EnabledFilter;

  setSelectedItem: (item: Item | null) => void;

  setPrimaryBarcodeLocal: (itemId: number, barcode: string | null) => void;

  setError: (msg: string | null) => void;
  setFilter: (f: EnabledFilter) => void;

  loadItems: () => Promise<void>;
};

export type ApiErrorShape = {
  message?: string;
};
