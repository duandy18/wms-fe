// src/domains/pms/export/contracts/barcodeProbe.ts
import type { ItemBasic } from "./itemBasic";

export type BarcodeProbeStatus = "BOUND" | "UNBOUND" | "ERROR";

export type BarcodeProbeError = {
  stage: string;
  error: string;
};

export interface BarcodeProbeResponse {
  ok: boolean;
  status: BarcodeProbeStatus;
  barcode: string;

  item_id?: number | null;
  item_uom_id?: number | null;
  ratio_to_base?: number | null;

  symbology?: string | null;
  active?: boolean | null;

  item_basic?: ItemBasic | null;

  errors?: BarcodeProbeError[];
}
