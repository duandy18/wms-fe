// src/features/admin/warehouses/types.ts

// 仓库列表项 / 详情项
export interface WarehouseListItem {
  id: number;
  name: string;
  code: string | null;
  active: boolean;

  // 扩展字段（v2）
  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  area_sqm: number | null;
}

// /warehouses 列表响应
export interface WarehouseListResponse {
  ok: boolean;
  data: WarehouseListItem[];
}

// /warehouses/{id} / POST / PATCH 返回的统一结构
export interface WarehouseDetailResponse {
  ok: boolean;
  data: WarehouseListItem;
}

// 创建 payload
export interface WarehouseCreatePayload {
  name: string;
  code?: string | null;
  // 目前创建表单只填 name/code，其余字段可在详情页补充；
  // 若以后需要在创建时录入，可在此加上：
  // address?: string | null;
  // contact_name?: string | null;
  // contact_phone?: string | null;
  // area_sqm?: number | null;
}

// 更新 payload（字段名与后端 Pydantic 保持一致：snake_case）
export interface WarehouseUpdatePayload {
  name?: string | null;
  code?: string | null;
  active?: boolean;

  address?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  area_sqm?: number | null;
}
