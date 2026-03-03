// src/contracts/item/contract.ts
/**
 * Item 主数据合同（稳定入口）
 *
 * Phase M-5：终态收口原则
 * - 业务模块只从 "@/contracts/item/contract" 导入类型
 * - 不在前端引入 zod schema 作为“第二真相源”
 * - 后端可以返回额外字段（展示/兼容），但业务代码只依赖终态字段
 */

export type ShelfLifeUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";

/**
 * 终态 Item（items 表为主）
 *
 * 终态合同红线：
 * - Items 不承载“条码事实 / 单位事实”
 * - 条码真相：item_barcodes
 * - 单位真相：item_uoms
 *
 * 若后端响应中仍出现 barcode/primary_barcode/requires_* 等历史字段：
 * - 前端业务逻辑不得依赖其语义
 * - 仅允许作为展示冗余（read-only）并逐步移除
 */
export type Item = {
  id: number;
  sku: string;
  name: string;

  spec?: string | null;
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

  is_test?: boolean;
};

export type ItemCreateInput = {
  name: string;

  spec?: string | null;
  brand?: string | null;
  category?: string | null;

  enabled?: boolean;

  supplier_id?: number | null;
  weight_kg?: number | null;

  lot_source_policy: string;
  expiry_policy: string;
  derivation_allowed: boolean;
  uom_governance_enabled: boolean;

  shelf_life_value?: number | null;
  shelf_life_unit?: ShelfLifeUnit | null;
};

export type ItemUpdateInput = Partial<ItemCreateInput>;
