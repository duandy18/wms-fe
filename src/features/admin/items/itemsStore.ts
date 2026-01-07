// src/features/admin/items/itemsStore.ts
import { create } from "zustand";
import { fetchItems } from "./api";
import type { Item } from "./api";
import type { ItemsState, ApiErrorShape } from "./store/types";
import { buildBarcodeMaps } from "./store/buildBarcodeMaps";

export type { EnabledFilter } from "./store/types";

export const useItemsStore = create<ItemsState>((set) => ({
  items: [],
  loading: false,
  error: null,

  scannedBarcode: null,
  selectedItem: null,

  panelOpen: false,

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
  setPanelOpen: (v) => set({ panelOpen: v }),

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
}));
