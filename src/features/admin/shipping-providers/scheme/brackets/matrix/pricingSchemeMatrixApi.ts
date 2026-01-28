// src/features/admin/shipping-providers/scheme/brackets/matrix/pricingSchemeMatrixApi.ts

import { apiGet } from "@/lib/api";
import type { ZoneBracketsMatrixOut } from "./types";

/**
 * ✅ 兼容两种后端返回形状：
 * 1) 裸对象：{ ok, scheme_id, groups, unbound_zones }
 * 2) 包装对象：{ data: { ok, scheme_id, groups, unbound_zones } }
 *
 * 原因：现有 fetchPricingSchemeDetail 走 OneResponse（res.data），
 * 但 matrix 接口很可能直接返回事实对象。为避免前端“读错层 => groups=[]”，这里做自动拆包。
 */
type Wrapped<T> = { data: T };

function isWrapped<T>(x: unknown): x is Wrapped<T> {
  return typeof x === "object" && x !== null && "data" in x;
}

export async function fetchPricingSchemeZoneBracketsMatrix(schemeId: number): Promise<ZoneBracketsMatrixOut> {
  const res = await apiGet<ZoneBracketsMatrixOut | Wrapped<ZoneBracketsMatrixOut>>(
    `/pricing-schemes/${schemeId}/zone-brackets-matrix`,
  );

  return isWrapped<ZoneBracketsMatrixOut>(res) ? res.data : res;
}
