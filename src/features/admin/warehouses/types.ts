// src/features/admin/warehouses/types.ts

export interface WarehouseListItem {
  id: number;
  name: string;
  code: string | null;
  active: boolean;

  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  area_sqm: number | null;
}

export interface WarehouseListResponse {
  ok: boolean;
  data: WarehouseListItem[];
}

export interface WarehouseDetailResponse {
  ok: boolean;
  data: WarehouseListItem;
}

/**
 * Phase 3 延展：新建=完整事实输入
 * - 与列表列尽量一致（除机器生成字段：id/时间戳）
 */
export interface WarehouseCreatePayload {
  name: string;
  code: string; // ✅ 作为稳定引用编码：创建时必须有

  active: boolean;

  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  area_sqm: number | null;
}

export interface WarehouseUpdatePayload {
  name?: string | null;
  code?: string | null;
  active?: boolean;

  address?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  area_sqm?: number | null;
}
