// src/features/admin/items/form/skuUtils.ts
//
// SKU 计算与序号递增（纯函数）

import type { SkuParts } from "./types";

/**
 * 序号自动递增：
 * - "001" -> "002"
 * - "009" -> "010"
 * - "123" -> "124"
 * - 非纯数字则原样返回
 */
export function nextSerial(serial: string): string {
  const s = (serial || "").trim();
  if (!s) return "001";
  const digits = s.replace(/\D/g, "");
  if (!digits) return s;
  const n = Number(digits);
  if (!Number.isFinite(n)) return s;
  const width = digits.length;
  return String(n + 1).padStart(width, "0");
}

export function buildSkuPrefix(parts: SkuParts): string {
  const { category, target, brand, specCode } = parts;
  if (!category || !target || !brand || !specCode) return "";
  return (
    category.trim().toUpperCase() +
    "-" +
    target.trim().toUpperCase() +
    "-" +
    brand.trim().toUpperCase() +
    "-" +
    specCode.trim().toUpperCase()
  );
}

export function buildPreviewSku(prefix: string, serial: string): string {
  if (!prefix) return "";
  const n = serial.trim();
  const digits = n.replace(/\D/g, "");
  const padded = digits ? digits.padStart(3, "0") : "";
  return padded ? `${prefix}-${padded}` : prefix;
}

export function buildFinalSkuOrError(prefix: string, serial: string): { sku?: string; error?: string } {
  if (!prefix) return { error: "请先选择/填写 分类 + 对象 + 品牌 + 规格编码" };

  const n = serial.trim();
  if (!n) return { error: "请填写序号（3 位）" };

  const digits = n.replace(/\D/g, "");
  if (!digits) return { error: "序号必须是数字" };

  const padded = digits.padStart(3, "0");
  return { sku: `${prefix}-${padded}` };
}
