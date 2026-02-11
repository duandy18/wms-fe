// admin/shop-bundles/api_platform_bindings.ts
import type { Platform, PlatformMirror, PlatformSkuBinding } from "./types";
import { apiFetchJson, qs } from "./http";

// -------- Platform mirror --------

export async function apiFetchPlatformMirror(args: { platform: Platform; shop_id: number; platform_sku_id: string }): Promise<PlatformMirror> {
  return apiFetchJson<PlatformMirror>("/platform-skus/mirror", {
    method: "POST",
    body: JSON.stringify(args),
  });
}

// -------- Bindings (platform_sku_id -> FSKU) --------

type CurrentBindingResp = { current: PlatformSkuBinding | null };

export async function apiGetCurrentBinding(args: { platform: Platform; shop_id: number; platform_sku_id: string }): Promise<PlatformSkuBinding | null> {
  // ✅ 合同：GET /current -> { current: {...} }
  const res = await apiFetchJson<CurrentBindingResp>(`/platform-sku-bindings/current${qs(args)}`, { method: "GET" });
  return res.current ?? null;
}

type HistoryResp = { items: PlatformSkuBinding[] };

export async function apiGetBindingHistory(args: {
  platform: Platform;
  shop_id: number;
  platform_sku_id: string;
  limit?: number;
  offset?: number;
}): Promise<PlatformSkuBinding[]> {
  // ✅ 合同：GET /history -> { items:[...] }，并支持 limit/offset
  const q = qs({
    platform: args.platform,
    shop_id: args.shop_id,
    platform_sku_id: args.platform_sku_id,
    limit: args.limit ?? 50,
    offset: args.offset ?? 0,
  });
  const res = await apiFetchJson<HistoryResp>(`/platform-sku-bindings/history${q}`, { method: "GET" });
  return res.items ?? [];
}

export async function apiUpsertBinding(args: {
  platform: Platform;
  shop_id: number;
  platform_sku_id: string;
  fsku_id: number;
  reason: string;
}): Promise<unknown> {
  // ✅ 合同：POST /platform-sku-bindings -> 201（测试断言 status_code=201，但未断言 body）
  return apiFetchJson<unknown>("/platform-sku-bindings", {
    method: "POST",
    body: JSON.stringify({
      platform: args.platform,
      shop_id: args.shop_id,
      platform_sku_id: args.platform_sku_id,
      fsku_id: args.fsku_id,
      reason: args.reason,
    }),
  });
}
