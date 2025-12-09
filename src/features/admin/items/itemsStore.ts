// src/features/admin/items/itemsStore.ts
import { create } from "zustand";
import { fetchItems } from "./api";
import type { Item } from "./api";
import { fetchItemBarcodes } from "./barcodesApi";

export type EnabledFilter = "all" | "enabled" | "disabled";

type ScanProbeError = {
  stage?: string;
  error?: string;
};

type ScanProbeResult =
  | {
      ok: boolean;
      committed: boolean;
      scan_ref: string;
      event_id?: number | null;
      source?: string | null;
      item_id?: number | null;
      qty?: number | null;
      batch_code?: string | null;
      evidence?: Array<Record<string, unknown>>;
      errors?: ScanProbeError[];
    }
  | null;

type ItemsState = {
  items: Item[];
  loading: boolean;
  error: string | null;

  scannedBarcode: string | null;
  selectedItem: Item | null;

  panelOpen: boolean;

  primaryBarcodes: Record<number, string>;
  barcodeCounts: Record<number, number>;
  barcodeOwners: Record<string, number[]>;
  barcodeIndex: Record<string, number>;

  filter: EnabledFilter;

  probeResult: ScanProbeResult;
  probeLoading: boolean;
  probeError: string | null;

  setScannedBarcode: (code: string | null) => void;
  setSelectedItem: (item: Item | null) => void;
  setPanelOpen: (v: boolean) => void;

  setProbeState: (data: {
    result?: ScanProbeResult;
    loading?: boolean;
    error?: string | null;
  }) => void;

  setPrimaryBarcodeLocal: (itemId: number, barcode: string | null) => void;

  setError: (msg: string | null) => void;
  setFilter: (f: EnabledFilter) => void;

  loadItems: () => Promise<void>;
};

type ApiErrorShape = {
  message?: string;
};

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
      probeResult:
        result !== undefined ? result : s.probeResult,
      probeLoading:
        loading !== undefined ? loading : s.probeLoading,
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
      const data = await fetchItems();

      const primaryMap: Record<number, string> = {};
      const countMap: Record<number, number> = {};
      const ownersMap: Record<string, number[]> = {};

      for (const it of data) {
        try {
          const bcs = await fetchItemBarcodes(it.id);

          countMap[it.id] = bcs.length;

          const primary = bcs.find((b) => b.is_primary);
          if (primary) primaryMap[it.id] = primary.barcode;

          for (const b of bcs) {
            const code = b.barcode.trim();
            if (!code) continue;
            const arr = ownersMap[code] || (ownersMap[code] = []);
            if (!arr.includes(it.id)) arr.push(it.id);
          }
        } catch {
          countMap[it.id] = 0;
        }
      }

      const idx: Record<string, number> = {};
      for (const [code, owners] of Object.entries(ownersMap)) {
        if (owners.length === 1) idx[code] = owners[0];
      }

      set({
        items: data,
        primaryBarcodes: primaryMap,
        barcodeCounts: countMap,
        barcodeOwners: ownersMap,
        barcodeIndex: idx,
      });
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      set({ error: err?.message ?? "加载商品失败" });
    } finally {
      set({ loading: false });
    }
  },
}));
