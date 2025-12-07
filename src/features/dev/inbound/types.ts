// src/features/dev/inbound/types.ts
// ================================================================
//  Inbound Debug Panel - 数据结构定义（v2）
//  目标：统一使用核心类型层级（TraceEvent / LedgerRow / SnapshotRow）
// ================================================================

import type { ReceiveTask } from "../../receive-tasks/api";
import type { PurchaseOrderWithLines } from "../../purchase-orders/api";
import type { ParsedBarcode } from "../../operations/scan/barcodeParser";

import type { TraceEvent } from "../../diagnostics/trace/types";
import type { LedgerRow } from "../../diagnostics/ledger-tool/types";
import type { SnapshotRow } from "../../inventory/snapshot/types";

// 扫码历史记录
export interface InboundScanHistoryEntry {
  id: number;
  ts: string;
  barcode: string;
  item_id: number | null;
  qty: number;
  ok: boolean;
  error?: string | null;
}

// 差异汇总
export interface InboundVarianceSummary {
  totalExpected: number;
  totalScanned: number;
  totalVariance: number;
}

// commit 后的 trace/ledger/snapshot 汇总展示
export interface InboundPostCommitInfo {
  // 对齐 Diagnostics 统一模型
  traceEvents: TraceEvent[]; // 来自 /debug/trace
  ledgerRows: LedgerRow[]; // stock_ledger 行
  snapshot: SnapshotRow | null; // snapshot v2 单品详情
}

// Demo 场景类型
export type InboundDemoScenario = "normal" | "under" | "over";

// 中控状态
export interface DevInboundState {
  // PO
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

  // 扫码
  lastParsed: ParsedBarcode | null;
  history: InboundScanHistoryEntry[];

  // commit
  committing: boolean;
  commitError: string | null;
  traceId: string;

  // diff
  varianceSummary: InboundVarianceSummary;

  // post-commit 情报
  postCommit: InboundPostCommitInfo | null;
  loadingPostCommit: boolean;
}

// 中控方法（controller）
export interface DevInboundController extends DevInboundState {
  setPoIdInput(v: string): void;
  setTaskIdInput(v: string): void;
  setTraceId(v: string): void;

  loadPoById(): Promise<void>;
  createTaskFromPo(): Promise<void>;
  bindTaskById(): Promise<void>;
  reloadTask(): Promise<void>;

  // Dev：基于当前 PO 生成 demo 收货任务
  createDemoTask(s: InboundDemoScenario): Promise<void>;

  // Dev：一键生成 demo PO + 收货任务（normal 场景）
  createDemoPoAndTask(): Promise<void>;

  handleScan(barcode: string): void;
  handleScanParsed(parsed: ParsedBarcode): Promise<void>;

  commit(): Promise<void>;
}
