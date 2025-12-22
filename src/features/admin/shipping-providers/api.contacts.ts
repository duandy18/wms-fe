// src/features/admin/shipping-providers/api.contacts.ts
import { apiPost, apiPatch, apiDelete } from "../../../lib/api";
import type { ShippingProviderContact } from "./api.types";

export async function createShippingProviderContact(
  providerId: number,
  payload: {
    name: string;
    phone?: string | null;
    email?: string | null;
    wechat?: string | null;
    role?: string;
    is_primary?: boolean;
    active?: boolean;
  },
): Promise<ShippingProviderContact> {
  return apiPost<ShippingProviderContact>(`/shipping-providers/${providerId}/contacts`, payload);
}

export async function updateShippingProviderContact(
  contactId: number,
  payload: Partial<{
    name: string;
    phone: string | null;
    email: string | null;
    wechat: string | null;
    role: string;
    is_primary: boolean;
    active: boolean;
  }>,
): Promise<ShippingProviderContact> {
  return apiPatch<ShippingProviderContact>(`/shipping-provider-contacts/${contactId}`, payload);
}

export async function deleteShippingProviderContact(contactId: number): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/shipping-provider-contacts/${contactId}`);
}
