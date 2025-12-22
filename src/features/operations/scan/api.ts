// src/features/operations/scan/api.ts
import { apiGet, apiPost } from "../../../lib/api";

// --- 通用响应结构，对应后端 ScanResponse ---

export interface ScanResponse {
  ok: boolean;
  committed: boolean;
  scan_ref: string;
  event_id: number | null;
  source: string;
  item_id?: number | null;
  location_id?: number | null;
  qty?: number | null;
  batch_code?: string | null;

  // v2：承接 scan_orchestrator.ingest 的统一返回结构
  evidence?: Array<Record<string, unknown>>;
  errors?: Array<Record<string, unknown>>;
}

// --- v2: 通用 ScanRequest（与后端 scan_orchestrator 完全一致） ---

export interface ScanRequest {
  mode: "receive" | "pick" | "count";

  item_id?: number;
  qty?: number; // orchestrator 若未传会兜底为 1
  barcode?: string;

  warehouse_id?: number; // v2 不再使用 location_id

  batch_code?: string;
  production_date?: string;
  expiry_date?: string;

  task_line_id?: number;

  probe?: boolean;

  ctx?: {
    device_id?: string;
    operator?: string;
    [k: string]: unknown;
  };
}

// --- v2 /scan (mode=count) ---

/**
 * v2 盘点（mode=count）
 */
export async function scanCountV2(req: ScanRequest): Promise<ScanResponse> {
  const body: ScanRequest = {
    ...req,
    mode: "count",
  };
  return apiPost<ScanResponse>("/scan", body);
}

// --- v2 /scan (mode=pick) ---

/**
 * v2 拣货（mode=pick）
 */
export async function scanPickV2(req: ScanRequest): Promise<ScanResponse> {
  const body: ScanRequest = {
    ...req,
    mode: "pick",
  };
  return apiPost<ScanResponse>("/scan", body);
}

// =======================
// Legacy: count（即将退休）
// =======================

export interface ScanCountPayload {
  item_id: number;
  location_id: number;
  qty: number;
  ref: string;
  batch_code: string;
  occurred_at?: string;
  production_date?: string;
  expiry_date?: string;
}

/**
 * 旧合同 /scan/count/commit（仅用于遗留页面）
 */
export async function scanCountCommit(
  payload: ScanCountPayload,
): Promise<ScanResponse> {
  return apiPost<ScanResponse>("/scan/count/commit", payload);
}

// =======================
// Items 主数据（作业区 / Cockpit / 调试台统一使用）
// =======================

export interface ItemMeta {
  id: number;
  sku: string;
  name: string;
  spec?: string | null;
  uom?: string | null;
  enabled?: boolean;
  // 其他字段不限制
  [key: string]: unknown;
}

/**
 * 按 item_id 查询主数据（统一路径）
 *
 * ✅ /items/{id}
 */
export async function fetchItemMeta(itemId: number): Promise<ItemMeta> {
  if (!itemId || itemId <= 0) {
    throw new Error("invalid item_id");
  }
  return apiGet<ItemMeta>(`/items/${itemId}`);
}
