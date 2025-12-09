// src/features/dev/inbound/types.ts

import type { ReceiveTask } from "../../receive-tasks/api";
import type { PurchaseOrderWithLines } from "../../purchase-orders/api";
import type { TraceEvent } from "../../diagnostics/trace/types";
import type { LedgerRow } from "../../diagnostics/ledger-tool/types";
import type { ItemDetailResponse } from "../../inventory/snapshot/api";
import type { ParsedBarcode } from "../../operations/scan/barcodeParser";

/**
 * 单次扫码历史记录（Inbound）
 */
export interface InboundScanHistoryEntry {
  id: number;
  ts: string;
  barcode: string;
  item_id: number | null;
  qty: number;
  ok: boolean;
  error?: string | null;
}

/**
 * 收货任务整体差异汇总
 */
export interface InboundVarianceSummary {
  totalExpected: number;
  totalScanned: number;
  totalVariance: number;
}

/**
 * commit 后情报：Trace / Ledger / Snapshot
 */
export interface InboundPostCommitInfo {
  traceEvents: TraceEvent[];
  ledgerRows: LedgerRow[];
  snapshot: ItemDetailResponse | null; // snapshot v2 单品详情
}

/**
 * Demo 收货场景配置
 * 与 createReceiveTaskDemoFromPo 的枚举保持一致
 */
export type InboundDemoScenario = "normal" | "under" | "over";

/**
 * Inbound 调试中控：暴露给 DevInboundPanel 用的接口
 */
export interface DevInboundController {
  // PO 输入与状态
  poIdInput: string;
  currentPo: PurchaseOrderWithLines | null;
  loadingPo: boolean;
  poError: string | null;

  // 收货任务
  taskIdInput: string;
  currentTask: ReceiveTask | null;
  loadingTask: boolean;
  creatingTask: boolean;
  taskError: string | null;

  // 最近一次条码解析结果 + 历史
  lastParsed: ParsedBarcode | null;
  history: InboundScanHistoryEntry[];

  // commit 状态
  committing: boolean;
  commitError: string | null;
  traceId: string;

  varianceSummary: InboundVarianceSummary;

  // commit 后情报
  postCommit: InboundPostCommitInfo | null;
  loadingPostCommit: boolean;

  // --- 输入控制 ---
  setPoIdInput: (v: string) => void;
  setTaskIdInput: (v: string) => void;
  setTraceId: (v: string) => void;

  // --- 行为 ---
  loadPoById: () => Promise<void>;
  createTaskFromPo: () => Promise<void>;
  bindTaskById: () => Promise<void>;
  reloadTask: () => Promise<void>;

  createDemoTask: (scenario: InboundDemoScenario) => Promise<void>;
  createDemoPoAndTask: () => Promise<void>;

  handleScan: (barcode: string) => void;
  handleScanParsed: (parsed: ParsedBarcode) => Promise<void>;

  commit: () => Promise<void>;
}
