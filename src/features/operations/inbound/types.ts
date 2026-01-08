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

export type InboundManualDraftSummary = {
  /** 是否存在“已输入但未记录”的手工收货草稿 */
  dirty: boolean;
  /** 草稿涉及行数（仅统计用户有输入的行） */
  touchedLines: number;
  /** 草稿合计数量（仅统计用户有输入的行） */
  totalQty: number;
};

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

  /** 手工收货：未落地输入摘要（用于提交入库前的刚性防呆） */
  manualDraft: InboundManualDraftSummary;

  // ===== setters =====
  setPoIdInput: (v: string) => void;
  setTaskIdInput: (v: string) => void;
  setTraceId: (v: string) => void;
  setActiveItemId: (v: number | null) => void;

  /** 手工收货：上报/更新草稿摘要 */
  setManualDraft: (v: InboundManualDraftSummary) => void;

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

  /** ✅ 作业闭环：提交入库成功后，解绑当前任务并清空执行态残留 */
  endTaskSession: () => void;

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
