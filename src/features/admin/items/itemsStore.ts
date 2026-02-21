// src/features/admin/items/itemsStore.ts
import { create } from "zustand";
import type { Item } from "@/contracts/item/contract";
import { disableItemTest, enableItemTest, fetchItems } from "./api";
import type { ItemsState, ApiErrorShape } from "./store/types";
import { buildBarcodeMaps } from "./store/buildBarcodeMaps";

export type { EnabledFilter } from "./store/types";

function replaceItem(rows: Item[], updated: Item): Item[] {
  const idx = rows.findIndex((x) => x.id === updated.id);
  if (idx < 0) return rows;
  const next = rows.slice();
  next[idx] = updated;
  return next;
}

export const useItemsStore = create<ItemsState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  scannedBarcode: null,
  selectedItem: null,

  primaryBarcodes: {},
  barcodeCounts: {},
  barcodeOwners: {},
  barcodeIndex: {},

  filter: "all",

  probeResult: null,
  probeLoading: false,
  probeError: null,

  setProbeState: ({ result, loading, error }) =>
    set((s) => ({
      probeResult: result !== undefined ? result : s.probeResult,
      probeLoading: loading !== undefined ? loading : s.probeLoading,
      probeError: error !== undefined ? error : s.probeError,
    })),

  setScannedBarcode: (code) => set({ scannedBarcode: code }),
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

      set({
        items: data,
        primaryBarcodes: maps.primaryBarcodes,
        barcodeCounts: maps.barcodeCounts,
        barcodeOwners: maps.barcodeOwners,
        barcodeIndex: maps.barcodeIndex,
      });
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      set({ error: err?.message ?? "加载商品失败" });
    } finally {
      set({ loading: false });
    }
  },

  toggleItemTest: async ({ itemId, next }) => {
    const st = get();
    // ✅ 基础防御：必须先加载出该商品
    const exists = st.items.find((x) => x.id === itemId);
    if (!exists) {
      set({ error: `未知商品：item_id=${String(itemId)}` });
      return;
    }

    try {
      set({ error: null });
      const updated = next ? await enableItemTest(itemId) : await disableItemTest(itemId);

      // ✅ 回写 items（保持列表单一真相）
      set((s) => ({
        items: replaceItem(s.items, updated),
        // 如果当前选中的是该商品，同步更新 selectedItem（避免条码面板拿旧状态）
        selectedItem: s.selectedItem?.id === updated.id ? updated : s.selectedItem,
      }));
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      set({ error: err?.message ?? "切换测试集合失败" });
    }
  },
}));
