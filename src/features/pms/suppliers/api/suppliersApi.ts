// src/features/pms/suppliers/api/suppliersApi.ts
import { apiDelete, apiGet, apiPatch, apiPost } from "../../../../lib/api";

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

export async function fetchSuppliers(params?: { active?: boolean; q?: string }): Promise<Supplier[]> {
  const qs = new URLSearchParams();
  if (params?.active !== undefined) qs.set("active", String(params.active));
  if (params?.q) qs.set("q", params.q.trim());
  const query = qs.toString();
  const path = query ? `/suppliers?${query}` : "/suppliers";

  return apiGet<Supplier[]>(path);
}

export async function createSupplier(payload: {
  name: string;
  code: string;
  website?: string | null;
  active: boolean;
}): Promise<Supplier> {
  return apiPost<Supplier>("/suppliers", payload);
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
  return apiPatch<Supplier>(`/suppliers/${supplierId}`, payload);
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
