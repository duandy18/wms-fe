// src/features/admin/suppliers/api.ts
import { apiGet, apiPost, apiPatch } from "../../../lib/api";

export interface Supplier {
  id: number;
  name: string;
  code?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  wechat?: string | null;
  active: boolean;
}

interface ListResponse {
  ok: boolean;
  data: Supplier[];
}

interface OneResponse {
  ok: boolean;
  data: Supplier;
}

export async function fetchSuppliers(params?: {
  active?: boolean;
  q?: string;
}): Promise<Supplier[]> {
  const qs = new URLSearchParams();
  if (params?.active !== undefined) {
    qs.set("active", String(params.active));
  }
  if (params?.q) {
    qs.set("q", params.q);
  }
  const query = qs.toString();
  const path = query ? `/suppliers?${query}` : "/suppliers";
  const res = await apiGet<ListResponse>(path);
  return res.data;
}

export async function createSupplier(payload: {
  name: string;
  code?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  wechat?: string;
  active?: boolean;
}): Promise<Supplier> {
  const res = await apiPost<OneResponse>("/suppliers", payload);
  return res.data;
}

export async function updateSupplier(
  id: number,
  payload: Partial<{
    name: string;
    code: string;
    contact_name: string;
    phone: string;
    email: string;
    wechat: string;
    active: boolean;
  }>,
): Promise<Supplier> {
  const res = await apiPatch<OneResponse>(`/suppliers/${id}`, payload);
  return res.data;
}
