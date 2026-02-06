// src/features/admin/stores/platform-skus/api.ts

import { apiGet } from "@/lib/api";
import type { PlatformSkuListOut } from "./types";

export type PlatformSkuListQuery = {
  with_binding?: 0 | 1;
  limit?: number;
  offset?: number;
  q?: string;
};

function buildQueryString(q: PlatformSkuListQuery): string {
  const p = new URLSearchParams();
  p.set("with_binding", String(q.with_binding ?? 1));
  p.set("limit", String(q.limit ?? 50));
  p.set("offset", String(q.offset ?? 0));
  if (q.q) p.set("q", q.q);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export async function fetchStorePlatformSkus(
  storeId: number,
  query: PlatformSkuListQuery,
): Promise<PlatformSkuListOut> {
  // 后端：GET /stores/{store_id}/platform-skus
  // 返回：{ items, total, limit, offset }
  const resp = await apiGet<PlatformSkuListOut>(`/stores/${storeId}/platform-skus${buildQueryString(query)}`);
  return resp;
}

