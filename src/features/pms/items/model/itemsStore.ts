// src/features/pms/items/itemsStore.ts
import { create } from "zustand";
import type { Item } from "@/contracts/item/contract";
import { fetchItems } from "../api/itemsOwnerApi";
import type { ItemsState, ApiErrorShape } from "./types";
import { buildBarcodeMaps } from "./buildBarcodeMaps";

export type { EnabledFilter } from "./types";

export const useItemsStore = create<ItemsState>((set) => ({
  items: [],
  loading: false,
  error: null,

  selectedItem: null,

  primaryBarcodes: {},

  filter: "all",

  setSelectedItem: (item) => set({ selectedItem: item }),

  setPrimaryBarcodeLocal: (itemId, barcode) =>
    set((state) => {
      const next = { ...state.primaryBarcodes };
      const trimmed = barcode?.trim();
      if (trimmed) next[itemId] = trimmed;
      else delete next[itemId];
      return { primaryBarcodes: next };
    }),

  setError: (msg) => set({ error: msg }),
  setFilter: (f) => set({ filter: f }),

  loadItems: async () => {
    set({ loading: true, error: null });
    try {
      const data: Item[] = await fetchItems();

      const maps = await buildBarcodeMaps(data);

      set((state) => {
        const selectedId = state.selectedItem?.id;
        const refreshedSelected =
          selectedId == null
            ? state.selectedItem
            : data.find((item) => item.id === selectedId) ?? state.selectedItem;

        return {
          items: data,
          primaryBarcodes: maps.primaryBarcodes,
          selectedItem: refreshedSelected,
        };
      });
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      set({ error: err?.message ?? "加载商品失败" });
    } finally {
      set({ loading: false });
    }
  },
}));
