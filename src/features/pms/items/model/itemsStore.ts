// src/features/pms/items/itemsStore.ts
import { create } from "zustand";
import type { Item } from "@/contracts/item/contract";
import { fetchItems } from "../api/itemsOwnerApi";
import { fetchItemListRows } from "../api/itemListOwnerApi";
import type { ItemsState, ApiErrorShape } from "./types";

export type { EnabledFilter } from "./types";

export const useItemsStore = create<ItemsState>((set) => ({
  items: [],
  listRows: [],
  loading: false,
  error: null,

  selectedItem: null,

  filter: "all",

  setSelectedItem: (item) => set({ selectedItem: item }),

  setError: (msg) => set({ error: msg }),
  setFilter: (f) => set({ filter: f }),

  loadItems: async () => {
    set({ loading: true, error: null });
    try {
      const [listRows, items]: [Awaited<ReturnType<typeof fetchItemListRows>>, Item[]] =
        await Promise.all([
          fetchItemListRows({ limit: 500 }),
          fetchItems(),
        ]);

      set((state) => {
        const selectedId = state.selectedItem?.id;
        const refreshedSelected =
          selectedId == null
            ? state.selectedItem
            : items.find((item) => item.id === selectedId) ?? null;

        return {
          items,
          listRows,
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
