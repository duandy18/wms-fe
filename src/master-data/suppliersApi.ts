// src/master-data/suppliersApi.ts
import { apiGet } from "../lib/api";

export interface SupplierBasic {
  id: number;
  name: string;
  code: string | null;
  active: boolean;
}

/**
 * 统一的供应商基础数据接口（给采购 / 商品管理用）：
 *
 * 后端 /suppliers 可能返回：
 * 1) 直接数组：Supplier[]
 * 2) 包装结构：{ ok, data: Supplier[] }
 *
 * 这里做兼容解包，并映射成精简的 SupplierBasic。
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

  const res = await apiGet<ListResponseCompat>("/suppliers");

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
