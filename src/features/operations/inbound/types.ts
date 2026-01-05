// src/features/operations/inbound/types.ts

import type { PurchaseOrderWithLines } from "../../purchase-orders/api";
import type { ReceiveTaskLine, ReceiveTask } from "../../receive-tasks/api";
import type { ParsedBarcode } from "../scan/barcodeParser";

export type InboundTabKey =
  | "PURCHASE_MANUAL"
  | "PURCHASE_SCAN"
  | "RETURN"
  | "MISC";

export type InboundVarianceSummary = {
  totalExpected: number;
  totalScanned: number;
  totalVariance: number;
};

export type InboundScanHistoryEntry = {
  id: number;
  ts: string;
  barcode: string;
  item_id: number | null;
  qty: number;
  ok: boolean;
  error?: string;
};

export type InboundParsedScan = ParsedBarcode;

export interface InboundCockpitController {
  // ===== state =====
  poIdInput: string;
  currentPo: PurchaseOrderWithLines | null;
  loadingPo: boolean;
  poError: string | null;

  taskIdInput: string;
  currentTask: ReceiveTask | null;
  loadingTask: boolean;
  creatingTask: boolean;
  taskError: string | null;

  lastParsed: ParsedBarcode | null;
  history: InboundScanHistoryEntry[];

  committing: boolean;
  commitError: string | null;

  varianceSummary: InboundVarianceSummary;

  traceId: string;
  activeItemId: number | null;

  // ===== setters =====
  setPoIdInput: (v: string) => void;
  setTaskIdInput: (v: string) => void;
  setTraceId: (v: string) => void;
  setActiveItemId: (v: number | null) => void;

  // ===== actions =====
  loadPoById: () => Promise<void>;
  createTaskFromPo: () => Promise<void>;
  bindTaskById: () => Promise<void>;
  reloadTask: () => Promise<void>;

  handleScan: (barcode: string) => void;
  handleScanParsed: (parsed: ParsedBarcode) => Promise<void>;

  updateLineMeta: (
    itemId: number,
    meta: {
      batch_code?: string | undefined;
      production_date?: string | undefined;
      expiry_date?: string | undefined;
    },
  ) => Promise<void>;

  manualReceiveLine: (itemId: number, qty: number) => Promise<void>;
  commit: () => Promise<boolean>;

  // 兼容：如果别的组件仍在用 scanHistory（你现在 return 里没有）
  // 先留成可选，避免未来有人再引入时炸编译
  scanHistory?: InboundScanHistoryEntry[];
}

export type { ReceiveTaskLine };
