// src/features/wms/scan/api.ts
import { apiGet, apiPost } from "../../../lib/api";

// 仅保留：拣货驾驶舱用的 pick probe 客户端。
// 语义：调用后端 /scan，但只用于 probe=true 的商品/包装识别，不承担落账。

export interface PickProbeResponse {
  ok: boolean;
  committed: boolean;
  scan_ref: string;
  event_id: number | null;
  source: string;
  item_id?: number | null;
  item_uom_id?: number | null;
  ratio_to_base?: number | null;
  qty?: number | null;
  qty_base?: number | null;
  batch_code?: string | null;
  production_date?: string | null;
  expiry_date?: string | null;
  evidence?: Array<Record<string, unknown>>;
  errors?: Array<Record<string, unknown>>;
}

export interface PickProbeRequest {
  item_id?: number;
  qty?: number;
  barcode?: string;
  warehouse_id?: number;
  batch_code?: string;
  task_line_id?: number;
  probe?: boolean;
  ctx?: {
    device_id?: string;
    operator?: string;
    [k: string]: unknown;
  };
}

export async function probePickBarcode(
  req: PickProbeRequest,
): Promise<PickProbeResponse> {
  return apiPost<PickProbeResponse>("/scan", {
    mode: "pick",
    probe: true,
    ...req,
  });
}

// =======================
// Items 主数据（驾驶舱统一使用）
// =======================

export interface ItemMeta {
  id: number;
  sku: string;
  name: string;
  spec?: string | null;
  uom?: string | null;
  enabled?: boolean;
  [key: string]: unknown;
}

export async function fetchItemMeta(itemId: number): Promise<ItemMeta> {
  if (!itemId || itemId <= 0) {
    throw new Error("invalid item_id");
  }
  return apiGet<ItemMeta>(`/items/${itemId}`);
}
