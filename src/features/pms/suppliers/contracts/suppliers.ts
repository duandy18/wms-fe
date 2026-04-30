// src/features/pms/suppliers/contracts/suppliers.ts

/**
 * 联系人角色。
 *
 * 当前后端 contract 仍按 string 接收，因此前端本刀只做合同归属拆分，
 * 不收紧为封闭枚举，避免扩大到后端与历史数据治理。
 */
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

export type SupplierListParams = {
  active?: boolean;
  q?: string;
};

export type SupplierCreateInput = {
  name: string;
  code: string;
  website?: string | null;
  active: boolean;
};

export type SupplierUpdateInput = Partial<{
  name: string;
  code: string;
  website: string | null;
  active: boolean;
}>;

export type SupplierContactCreateInput = {
  name: string;
  phone?: string | null;
  email?: string | null;
  wechat?: string | null;
  role?: SupplierContactRole;
  is_primary?: boolean;
  active?: boolean;
};

export type SupplierContactUpdateInput = Partial<{
  name: string;
  phone: string | null;
  email: string | null;
  wechat: string | null;
  role: SupplierContactRole;
  is_primary: boolean;
  active: boolean;
}>;
