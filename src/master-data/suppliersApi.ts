// src/master-data/suppliersApi.ts
import { apiGet } from "../lib/api";

export interface SupplierBasic {
  id: number;
  name: string;
  code: string | null;
  active: boolean;
}

/**
 * 采购/收货用：供应商基础数据接口（轻量，不带 contacts）
 *
 * 后端：GET /suppliers/basic
 * 返回：SupplierBasic[]（数组）
 *
 * 为兼容潜在的 {ok,data} 包装，这里同时支持两种形态。
 */
export async function fetchSuppliersBasic(): Promise<SupplierBasic[]> {
  type SupplierRaw = {
    id: number;
    name: string;
    code?: string | null;
    active: boolean;
    [key: string]: unknown;
  };

  type ListResponseCompat =
    | SupplierRaw[]
    | {
        ok: boolean;
        data: SupplierRaw[];
      };

  const res = await apiGet<ListResponseCompat>("/suppliers/basic?active=true");

  const list: SupplierRaw[] = Array.isArray(res)
    ? res
    : Array.isArray(res?.data)
    ? res.data
    : [];

  return list.map((it) => ({
    id: Number(it.id),
    name: String(it.name ?? ""),
    code: it.code ?? null,
    active: Boolean(it.active),
  }));
}
