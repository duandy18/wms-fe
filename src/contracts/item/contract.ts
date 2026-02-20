// src/contracts/item/contract.ts

import { z } from "zod";
import { schemas } from "../generated/api";

/**
 * Item 主数据合同（稳定入口）
 *
 * 规则：
 * - 业务代码只允许从 "@/contracts/item/contract" 导入 Item / ItemCreateInput / ItemUpdateInput
 * - 本文件只做“桥接”：从 OpenAPI 自动生成物（generated/api.ts）提取 schema，并导出类型
 * - 禁止在业务模块里直接 import "../generated/api"（否则生成物会扩散）
 */

// -----------------------
// Response: ItemOut
// -----------------------
export const ItemSchema = schemas.ItemOut;
export type Item = z.infer<typeof ItemSchema>;

// -----------------------
// Request: Create (POST /items)
// -----------------------
export const ItemCreateInputSchema = schemas.ItemCreate;
export type ItemCreateInput = z.infer<typeof ItemCreateInputSchema>;

// -----------------------
// Request: Update (PATCH /items/{id})
// -----------------------
export const ItemUpdateInputSchema = schemas.ItemUpdate;
export type ItemUpdateInput = z.infer<typeof ItemUpdateInputSchema>;
