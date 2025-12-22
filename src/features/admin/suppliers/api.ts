// src/features/admin/suppliers/api.ts
import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/api";

/** 联系人角色（先用 string，后端也是 string） */
export type SupplierContactRole =
  | "purchase"
  | "billing"
  | "shipping"
  | "after_sales"
  | "other"
  | string;

export interface SupplierContact {
  id: number;
  supplier_id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  wechat?: string | null;
  role: SupplierContactRole;
  is_primary: boolean;
  active: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  code: string;
  website?: string | null;
  active: boolean;
  contacts: SupplierContact[];
}

/** 兼容后端两种返回：数组 or {ok,data} */
type ListRespCompat =
  | Supplier[]
  | {
      ok: boolean;
      data: Supplier[];
    };

type OneRespCompat =
  | Supplier
  | {
      ok: boolean;
      data: Supplier;
    };

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function isSupplier(v: unknown): v is Supplier {
  if (!isRecord(v)) return false;
  return typeof v.id === "number" && typeof v.name === "string" && typeof v.code === "string" && typeof v.active === "boolean";
}

function unwrapList(res: ListRespCompat): Supplier[] {
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

function unwrapOne(res: OneRespCompat): Supplier {
  // 1) 后端直接返回 Supplier
  if (isSupplier(res)) return res;

  // 2) 后端返回 { ok, data }
  if (isRecord(res)) {
    const data = res["data"];
    if (isSupplier(data)) return data;
  }

  throw new Error("Unexpected response shape");
}

export async function fetchSuppliers(params?: { active?: boolean; q?: string }): Promise<Supplier[]> {
  const qs = new URLSearchParams();
  if (params?.active !== undefined) qs.set("active", String(params.active));
  if (params?.q) qs.set("q", params.q.trim());
  const query = qs.toString();
  const path = query ? `/suppliers?${query}` : "/suppliers";

  const res = await apiGet<ListRespCompat>(path);
  return unwrapList(res);
}

export async function createSupplier(payload: {
  name: string;
  code: string;
  website?: string | null;
  active: boolean;
}): Promise<Supplier> {
  const res = await apiPost<OneRespCompat>("/suppliers", payload);
  return unwrapOne(res);
}

export async function updateSupplier(
  supplierId: number,
  payload: Partial<{
    name: string;
    code: string;
    website: string | null;
    active: boolean;
  }>,
): Promise<Supplier> {
  const res = await apiPatch<OneRespCompat>(`/suppliers/${supplierId}`, payload);
  return unwrapOne(res);
}

export async function createSupplierContact(
  supplierId: number,
  payload: {
    name: string;
    phone?: string | null;
    email?: string | null;
    wechat?: string | null;
    role?: SupplierContactRole;
    is_primary?: boolean;
    active?: boolean;
  },
): Promise<SupplierContact> {
  return apiPost<SupplierContact>(`/suppliers/${supplierId}/contacts`, payload);
}

export async function updateSupplierContact(
  contactId: number,
  payload: Partial<{
    name: string;
    phone: string | null;
    email: string | null;
    wechat: string | null;
    role: SupplierContactRole;
    is_primary: boolean;
    active: boolean;
  }>,
): Promise<SupplierContact> {
  return apiPatch<SupplierContact>(`/supplier-contacts/${contactId}`, payload);
}

export async function deleteSupplierContact(contactId: number): Promise<void> {
  await apiDelete(`/supplier-contacts/${contactId}`);
}
