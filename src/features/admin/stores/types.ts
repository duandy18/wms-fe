// src/features/admin/stores/types.ts

export type RouteMode = "STRICT_TOP" | "FALLBACK" | string;

// 商铺列表项
export interface StoreListItem {
  id: number;
  platform: string;
  shop_id: string;
  name: string;
  active: boolean;
  route_mode: RouteMode;

  // 主数据扩展字段
  email: string | null;
  contact_name: string | null;
  contact_phone: string | null;
}

export interface StoreListResponse {
  ok: boolean;
  data: StoreListItem[];
}

// =============================================
// 新版 StoreBinding：对齐后端返回字段
// =============================================
export interface StoreBinding {
  warehouse_id: number;

  // 从后端获取的扩展字段（v2）
  warehouse_name: string; // 仓库名称
  warehouse_code?: string | null; // 仓库编码
  warehouse_active?: boolean; // 仓库是否启用

  is_top: boolean;
  is_default: boolean;
  priority: number;
}

// 商铺详情数据
export interface StoreDetailData {
  store_id: number;
  platform: string;
  shop_id: string;
  name: string;

  // 主数据扩展字段（详情页可编辑）
  email: string | null;
  contact_name: string | null;
  contact_phone: string | null;

  bindings: StoreBinding[];
}

export interface StoreDetailResponse {
  ok: boolean;
  data: StoreDetailData;
}

// 创建 / 更新商铺
export interface StoreCreatePayload {
  platform: string;
  shop_id: string;
  name?: string | null;
}

export interface StoreUpdatePayload {
  name?: string | null;
  active?: boolean;
  route_mode?: RouteMode;

  email?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
}

// 新增绑定 payload
export interface BindWarehousePayload {
  warehouse_id: number;
  is_default?: boolean;
  priority?: number;
  is_top?: boolean | null;
}

// 更新绑定 payload
export interface UpdateBindingPayload {
  is_default?: boolean;
  priority?: number;
  is_top?: boolean;
}

// 默认仓解析
export interface DefaultWarehouseResponse {
  ok: boolean;
  data: { warehouse_id: number | null };
}

// 平台授权
export interface StorePlatformAuthStatus {
  store_id: number;
  platform: string;
  shop_id: string;
  auth_source: "NONE" | "MANUAL" | "OAUTH";
  expires_at: string | null;
  mall_id: string | null;
}
