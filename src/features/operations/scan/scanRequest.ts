// src/features/operations/scan/scanRequest.ts

// 与后端 ScanRequest 对齐的类型定义
export type ScanMode = "receive" | "pick" | "count";

export interface ScanContext {
  device_id?: string;
  operator?: string;
  [key: string]: unknown;
}

export interface ScanRequest {
  mode: ScanMode;
  item_id?: number;
  qty?: number;
  warehouse_id?: number;
  batch_code?: string;
  production_date?: string; // "YYYY-MM-DD" or "YYYYMMDD"
  expiry_date?: string;
  barcode?: string;
  task_line_id?: number;
  probe?: boolean;
  ctx?: ScanContext;
}

// === 小工具：默认 device_id ===

function defaultDeviceId(source: string): string {
  return source || "web-ui";
}

// === receive ===

export interface ReceiveParams {
  item_id: number;
  qty: number;
  warehouse_id?: number;
  batch_code: string;
  production_date?: string;
  expiry_date?: string;
  ctx?: ScanContext;
}

/**
 * 构造 /scan(mode=receive) 的 ScanRequest
 */
export function makeReceiveScanRequest(
  params: ReceiveParams,
  source: string = "inbound-page",
): ScanRequest {
  const {
    item_id,
    qty,
    warehouse_id,
    batch_code,
    production_date,
    expiry_date,
    ctx,
  } = params;

  return {
    mode: "receive",
    item_id,
    qty,
    warehouse_id,
    batch_code,
    production_date,
    expiry_date,
    ctx: {
      device_id: defaultDeviceId(source),
      ...(ctx || {}),
    },
  };
}

// === count ===

export interface CountParams {
  item_id: number;
  actual: number;
  warehouse_id?: number;
  batch_code: string;
  production_date?: string;
  expiry_date?: string;
  ctx?: ScanContext;
}

/**
 * 构造 /scan(mode=count) 的 ScanRequest
 */
export function makeCountScanRequest(
  params: CountParams,
  source: string = "count-page",
): ScanRequest {
  const {
    item_id,
    actual,
    warehouse_id,
    batch_code,
    production_date,
    expiry_date,
    ctx,
  } = params;

  return {
    mode: "count",
    item_id,
    // orchestrator 里把 qty 当成 actual
    qty: actual,
    warehouse_id,
    batch_code,
    production_date,
    expiry_date,
    ctx: {
      device_id: defaultDeviceId(source),
      ...(ctx || {}),
    },
  };
}

// === pick ===

export interface PickParams {
  item_id: number;
  qty: number;
  warehouse_id?: number;
  batch_code: string;
  task_line_id?: number;
  ctx?: ScanContext;
}

/**
 * 构造 /scan(mode=pick) 的 ScanRequest
 */
export function makePickScanRequest(
  params: PickParams,
  source: string = "pick-page",
): ScanRequest {
  const {
    item_id,
    qty,
    warehouse_id,
    batch_code,
    task_line_id,
    ctx,
  } = params;

  return {
    mode: "pick",
    item_id,
    qty,
    warehouse_id,
    batch_code,
    task_line_id,
    ctx: {
      device_id: defaultDeviceId(source),
      ...(ctx || {}),
    },
  };
}
