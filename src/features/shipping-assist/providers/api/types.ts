// src/features/shipping-assist/providers/api/types.ts

// ======================================================
// Common response wrappers
// ======================================================

export interface ListResponse<T> {
  ok: boolean;
  data: T[];
}

export interface OneResponse<T> {
  ok: boolean;
  data: T;
}

// ======================================================
// Shipping Provider
// ======================================================

export interface ShippingProviderContact {
  id: number;
  shipping_provider_id: number;

  name?: string | null;
  phone?: string | null;
  email?: string | null;

  // UI 使用字段（历史存在）
  role?: string | null;
  wechat?: string | null;

  active?: boolean;
  is_primary?: boolean;
}

export interface ShippingProvider {
  id: number;
  name: string;

  // 基础状态
  active?: boolean;

  // 历史 / UI 使用字段
  code?: string | null;
  company_code?: string | null;
  resource_code?: string | null;
  address?: string | null;
  warehouse_id?: number | null;
  priority?: number | null;

  contacts?: ShippingProviderContact[];
}
