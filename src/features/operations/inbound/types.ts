// src/features/operations/inbound/types.ts

import type { PurchaseOrderWithLines } from "../../purchase-orders/api";
import type {
  ReceiveTaskLine,
  ReceiveTask,
  ReceiveTaskCreateFromPoSelectedLinePayload,
} from "../../receive-tasks/api";
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
  loadPoById: (poId?: string) => Promise<void>;

  /** 旧：整单/剩余应收创建（保留备用） */
  createTaskFromPo: () => Promise<void>;

  /** 新：选择式创建（本次到货批次） */
  createTaskFromPoSelected: (
    lines: ReceiveTaskCreateFromPoSelectedLinePayload[],
  ) => Promise<void>;

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

  scanHistory?: InboundScanHistoryEntry[];
}

export type { ReceiveTaskLine };
