// src/contracts/item/contract.ts

import { z } from "zod";

/**
 * Item 主数据合同（前端暂行版：自洽可编译）
 *
 * 下一阶段（你要的终局）：
 * - 用 openapi-* 从 /openapi.json 生成 src/contracts/schemas.ts
 * - 然后本文件仅 re-export schemas 里的 Item/ItemCreateInput/ItemUpdateInput
 *
 * 当前阶段：contracts 必须与后端真实响应/请求形状一致，
 *           否则“契约单一”只会变成“类型噪音”。
 */

// =======================
// Response: Item
// =======================
export const ItemSchema = z.object({
  id: z.number(),
  sku: z.string(),

  name: z.string(),
  spec: z.string().nullable().optional(),
  uom: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),

  // 品牌/品类（可为空）
  brand: z.string().nullable().optional(),
  category: z.string().nullable().optional(),

  enabled: z.boolean(),

  // DB NOT NULL
  supplier_id: z.number(),
  supplier_name: z.string().nullable().optional(),
  supplier: z.string().nullable().optional(),

  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),

  weight_kg: z.number().nullable().optional(),

  has_shelf_life: z.boolean().nullable().optional(),
  shelf_life_value: z.number().nullable().optional(),
  shelf_life_unit: z.enum(["DAY", "MONTH"]).nullable().optional(),

  // 批次/日期（收货侧策略字段）
  requires_batch: z.boolean().optional(),
  requires_dates: z.boolean().optional(),
  default_batch_code: z.string().nullable().optional(),

  // DEFAULT Test Set membership
  is_test: z.boolean(),
});

export type Item = z.infer<typeof ItemSchema>;

// =======================
// Request: Create
// =======================
export const ItemCreateInputSchema = z.object({
  // SKU 由后端生成：前端不传 sku
  name: z.string(),

  spec: z.string().optional(),
  uom: z.string(),
  barcode: z.string(),

  brand: z.string().nullable().optional(),
  category: z.string().nullable().optional(),

  enabled: z.boolean(),

  supplier_id: z.number(),

  weight_kg: z.number(),

  has_shelf_life: z.boolean(),
  shelf_life_value: z.number().nullable(),
  shelf_life_unit: z.enum(["DAY", "MONTH"]).nullable(),
});

export type ItemCreateInput = z.infer<typeof ItemCreateInputSchema>;

// =======================
// Request: Update (PATCH)
// =======================
export const ItemUpdateInputSchema = z.object({
  name: z.string().nullable().optional(),
  spec: z.string().nullable().optional(),
  uom: z.string().nullable().optional(),

  brand: z.string().nullable().optional(),
  category: z.string().nullable().optional(),

  enabled: z.boolean().optional(),

  supplier_id: z.number().optional(),

  weight_kg: z.number().nullable().optional(),

  has_shelf_life: z.boolean().nullable().optional(),
  shelf_life_value: z.number().nullable().optional(),
  shelf_life_unit: z.enum(["DAY", "MONTH"]).nullable().optional(),
});

export type ItemUpdateInput = z.infer<typeof ItemUpdateInputSchema>;
