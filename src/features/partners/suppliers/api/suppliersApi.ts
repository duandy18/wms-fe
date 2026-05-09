// src/features/partners/suppliers/api/suppliersApi.ts
import { apiDelete, apiGet, apiPatch, apiPost } from "../../../../lib/api";
import type {
  Supplier,
  SupplierContact,
  SupplierContactCreateInput,
  SupplierContactUpdateInput,
  SupplierCreateInput,
  SupplierListParams,
  SupplierUpdateInput,
} from "../contracts/suppliers";

export async function fetchSuppliers(params?: SupplierListParams): Promise<Supplier[]> {
  const qs = new URLSearchParams();
  if (params?.active !== undefined) qs.set("active", String(params.active));
  if (params?.q) qs.set("q", params.q.trim());
  const query = qs.toString();
  const path = query ? `/partners/suppliers?${query}` : "/partners/suppliers";

  return apiGet<Supplier[]>(path);
}

export async function createSupplier(payload: SupplierCreateInput): Promise<Supplier> {
  return apiPost<Supplier>("/partners/suppliers", payload);
}

export async function updateSupplier(
  supplierId: number,
  payload: SupplierUpdateInput,
): Promise<Supplier> {
  return apiPatch<Supplier>(`/partners/suppliers/${supplierId}`, payload);
}

export async function createSupplierContact(
  supplierId: number,
  payload: SupplierContactCreateInput,
): Promise<SupplierContact> {
  return apiPost<SupplierContact>(`/partners/suppliers/${supplierId}/contacts`, payload);
}

export async function updateSupplierContact(
  contactId: number,
  payload: SupplierContactUpdateInput,
): Promise<SupplierContact> {
  return apiPatch<SupplierContact>(`/partners/supplier-contacts/${contactId}`, payload);
}

export async function deleteSupplierContact(contactId: number): Promise<void> {
  await apiDelete(`/partners/supplier-contacts/${contactId}`);
}
