// src/features/admin/items/itemsStore.ts
import { create } from "zustand";
import { fetchItems } from "./api";
import type { Item } from "./api";
import { fetchItemBarcodes } from "./barcodesApi";

export type EnabledFilter = "all" | "enabled" | "disabled";

type ItemsState = {
  items: Item[];
  loading: boolean;
  error: string | null;

  scannedBarcode: string | null;
  selectedItem: Item | null;

  // 控制右侧条码面板展开
  panelOpen: boolean;

  // item → 主条码
  primaryBarcodes: Record<number, string>;

  // item → 条码数量
  barcodeCounts: Record<number, number>;

  // barcode → [item_ids]
  barcodeOwners: Record<string, number[]>;

  // barcode → item_id（唯一绑定时）
  barcodeIndex: Record<string, number>;

  filter: EnabledFilter;

  // 体检：后端 /scan probe 结果
  probeResult: any | null;
  probeLoading: boolean;
  probeError: string | null;

  // setters
  setScannedBarcode: (code: string | null) => void;
  setSelectedItem: (item: Item | null) => void;
  setPanelOpen: (v: boolean) => void;

  setProbeState: (data: {
    result?: any | null;
    loading?: boolean;
    error?: string | null;
  }) => void;

  setPrimaryBarcodeLocal: (itemId: number, barcode: string | null) => void;

  setError: (msg: string | null) => void;
  setFilter: (f: EnabledFilter) => void;

  loadItems: () => Promise<void>;
};

export const useItemsStore = create<ItemsState>((set, get) => ({
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
      probeResult: result ?? s.probeResult,
      probeLoading: loading ?? s.probeLoading,
      probeError: error ?? s.probeError,
    })),

  setScannedBarcode: (code) => set({ scannedBarcode: code }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setPanelOpen: (v) => set({ panelOpen: v }),

  setPrimaryBarcodeLocal: (itemId, barcode) =>
    set((state) => {
      const next = { ...state.primaryBarcodes };
      if (barcode && barcode.trim()) next[itemId] = barcode.trim();
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

      // 构建所有条码绑定
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

      // barcodeIndex（唯一绑定）
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
    } catch (e: any) {
      set({ error: e?.message || "加载商品失败" });
    } finally {
      set({ loading: false });
    }
  },
}));
