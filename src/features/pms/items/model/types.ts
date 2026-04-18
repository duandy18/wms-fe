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

  // ✅ 新增：切换测试集合标记（调用后端 /items/{id}/test:enable|disable）
  toggleItemTest: (args: { itemId: number; next: boolean }) => Promise<void>;
};

export type ApiErrorShape = {
  message?: string;
};
