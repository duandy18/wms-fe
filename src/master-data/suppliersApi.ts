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
 * 后端 /suppliers 返回结构为 { ok, data: Supplier[] }，
 * 这里做一层解包，并映射成精简的 SupplierBasic。
 */
export async function fetchSuppliersBasic(): Promise<SupplierBasic[]> {
  type ListResponse = {
    ok: boolean;
    data: {
      id: number;
      name: string;
      code?: string | null;
      active: boolean;
      [key: string]: unknown;
    }[];
  };

  const res = await apiGet<ListResponse>("/suppliers");
  const list = Array.isArray(res?.data) ? res.data : [];

  return list.map((it) => ({
    id: Number(it.id),
    name: String(it.name ?? ""),
    code: it.code ?? null,
    active: Boolean(it.active),
  }));
}
