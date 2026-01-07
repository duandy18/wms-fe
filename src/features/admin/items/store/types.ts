// src/features/admin/items/store/types.ts

import type { Item } from "../api";

export type EnabledFilter = "all" | "enabled" | "disabled";

export type ScanProbeError = {
  stage?: string;
  error?: string;
};

export type ScanProbeResult =
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

export type ItemsState = {
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

export type ApiErrorShape = {
  message?: string;
};
