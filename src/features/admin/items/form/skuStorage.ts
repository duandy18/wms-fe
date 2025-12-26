// src/features/admin/items/form/skuStorage.ts
//
// SKU parts localStorage 持久化（纯函数）

import type { SkuParts } from "./types";
import { EMPTY_SKU_PARTS, SKU_PARTS_LS_KEY } from "./types";

export function loadSkuPartsFromStorage(): SkuParts {
  if (typeof window === "undefined") return { ...EMPTY_SKU_PARTS };
  try {
    const raw = window.localStorage.getItem(SKU_PARTS_LS_KEY);
    if (!raw) return { ...EMPTY_SKU_PARTS };
    const parsed = JSON.parse(raw) as Partial<SkuParts>;
    return {
      category: parsed.category ?? EMPTY_SKU_PARTS.category,
      target: parsed.target ?? EMPTY_SKU_PARTS.target,
      brand: parsed.brand ?? EMPTY_SKU_PARTS.brand,
      specCode: parsed.specCode ?? EMPTY_SKU_PARTS.specCode,
      serial: parsed.serial ?? EMPTY_SKU_PARTS.serial,
    };
  } catch {
    return { ...EMPTY_SKU_PARTS };
  }
}

export function saveSkuPartsToStorage(parts: SkuParts) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SKU_PARTS_LS_KEY, JSON.stringify(parts));
  } catch {
    // 忽略（无痕模式等）
  }
}
