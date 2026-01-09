// src/features/inventory/snapshot/api.ts
import { apiGet, apiPost } from "../../../lib/api";

// 首页 Snapshot 列表里的每一行
export interface InventoryRow {
  item_id: number;

  // ✅ 新增：商品主数据（由后端 /snapshot/inventory 扩展返回）
  // 都是 optional：后端没给时前端展示 "-"
  item_code?: string | null; // 商品编码（稳定可复制）
  uom?: string | null; // 单位（件/箱/...）
  spec?: string | null; // 规格（如 1.5kg / 12罐/箱）
  main_barcode?: string | null; // 主条码（只展示一个）
  brand?: string | null; // 品牌（可选）
  category?: string | null; // 品类（可选）
  days_to_expiry?: number | null; // 最早到期剩余天数（后端算；前端不推导）

  item_name: string;
  total_qty: number;
  top2_locations: {
    warehouse_id: number;
    batch_code: string;
    qty: number;
  }[];
  earliest_expiry: string | null;
  near_expiry: boolean;
}

export interface InventorySnapshotResponse {
  total: number;
  offset: number;
  limit: number;
  rows: InventoryRow[];
}

// Drawer 用的单品详情
export interface ItemSlice {
  warehouse_id: number;
  warehouse_name: string;
  pool: string;
  batch_code: string;
  production_date: string | null;
  expiry_date: string | null;
  on_hand_qty: number;
  reserved_qty: number;
  available_qty: number;
  near_expiry: boolean;
  is_top: boolean;
}

export interface ItemDetailResponse {
  item_id: number;
  item_name: string;
  totals: {
    on_hand_qty: number;
    reserved_qty: number;
    available_qty: number;
  };
  slices: ItemSlice[];
}

// ---------------- API 函数 ----------------

// 首页 Snapshot 列表
export async function fetchInventorySnapshot(q: string, offset = 0, limit = 20) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("offset", String(offset));
  params.set("limit", String(limit));
  return apiGet<InventorySnapshotResponse>(`/snapshot/inventory?${params.toString()}`);
}

// 单品详情（Drawer）
export async function fetchItemDetail(
  itemId: number,
  pools = "MAIN",
): Promise<ItemDetailResponse> {
  return apiGet<ItemDetailResponse>(
    `/snapshot/item-detail/${itemId}?pools=${encodeURIComponent(pools)}`,
  );
}

// 写 snapshot（运维按钮用）
export async function runSnapshot(date: string) {
  return apiPost(`/snapshot/run?date=${encodeURIComponent(date)}`, {});
}

// 趋势图（暂时不在 UI 用，可以保留）
export async function fetchTrends(itemId: number, frm: string, to: string) {
  return apiGet(`/snapshot/trends?item_id=${itemId}&frm=${frm}&to=${to}`);
}
