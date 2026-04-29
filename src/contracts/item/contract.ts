// src/contracts/item/contract.ts
/**
 * Item 主数据合同（稳定入口）
 *
 * 终态收口原则：
 * - item_id 是商品内部身份真相
 * - items.sku 是当前主 SKU 投影
 * - item_sku_codes 是 SKU 编码治理真相
 * - brand_id/category_id 是 PMS 主数据引用
 * - brand/category 是只读展示投影
 */

export type ShelfLifeUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";

export type Item = {
  id: number;
  sku: string;
  name: string;

  spec?: string | null;

  brand_id?: number | null;
  category_id?: number | null;

  brand?: string | null;
  category?: string | null;

  enabled: boolean;

  supplier_id?: number | null;
  supplier_name?: string | null;

  weight_kg?: number | null;

  lot_source_policy: string;
  expiry_policy: string;
  derivation_allowed: boolean;
  uom_governance_enabled: boolean;

  shelf_life_value?: number | null;
  shelf_life_unit?: ShelfLifeUnit | null;

  created_at?: string | null;
  updated_at?: string | null;
};

export type ItemCreateInput = {
  sku: string;
  name: string;

  spec?: string | null;

  brand_id?: number | null;
  category_id?: number | null;

  enabled?: boolean;

  supplier_id?: number | null;

  lot_source_policy: string;
  expiry_policy: string;
  derivation_allowed: boolean;
  uom_governance_enabled: boolean;

  shelf_life_value?: number | null;
  shelf_life_unit?: ShelfLifeUnit | null;
};

export type ItemUpdateInput = Partial<Omit<ItemCreateInput, "sku">>;
