// src/features/operations/inbound/types.ts
// Inbound Cockpit 相关类型定义

import type { ParsedBarcode } from "../scan/barcodeParser";
import type { PurchaseOrderWithLines } from "../../purchase-orders/api";
import type { ReceiveTask } from "../../receive-tasks/api";

export interface InboundScanHistoryEntry {
  id: number;
  ts: string; // 本地时间字符串
  barcode: string;
  item_id: number | null;
  qty: number;
  ok: boolean;
  error?: string;
}

export interface InboundVarianceSummary {
  totalExpected: number;
  totalScanned: number;
  totalVariance: number;
}

export interface InboundCockpitController {
  // PO 部分
  poIdInput: string;
  currentPo: PurchaseOrderWithLines | null;
  loadingPo: boolean;
  poError: string | null;

  // 收货任务部分
  taskIdInput: string;
  currentTask: ReceiveTask | null;
  loadingTask: boolean;
  creatingTask: boolean;
  taskError: string | null;

  // 扫码与解析
  lastParsed: ParsedBarcode | null;
  history: InboundScanHistoryEntry[];

  // commit 状态
  committing: boolean;
  commitError: string | null;

  // 差异汇总
  varianceSummary: InboundVarianceSummary;

  // trace 维度（Cockpit 也可以写 trace_id）
  traceId: string;

  // 当前高亮的 item（最近一次成功扫码 / 操作的行）
  activeItemId: number | null;

  // setters
  setPoIdInput: (v: string) => void;
  setTaskIdInput: (v: string) => void;
  setTraceId: (v: string) => void;
  setActiveItemId: (id: number | null) => void;

  // actions - PO / 任务
  loadPoById: () => Promise<void> | void;
  createTaskFromPo: () => Promise<void> | void;
  bindTaskById: () => Promise<void> | void;
  reloadTask: () => Promise<void> | void;

  // actions - 扫码
  handleScan: (barcode: string) => void;
  handleScanParsed: (parsed: ParsedBarcode) => Promise<void> | void;

  // actions - 行内批次元数据更新（批次 / 日期）
  updateLineMeta: (
    itemId: number,
    meta: {
      batch_code?: string;
      production_date?: string;
      expiry_date?: string;
    },
  ) => Promise<void> | void;

  // actions - 采购单行收货（手工录入）
  manualReceiveLine: (itemId: number, qty: number) => Promise<void> | void;

  // actions - commit
  // 返回 true 表示提交成功，可用于后续自动跳转 Trace
  commit: () => Promise<boolean>;
}
