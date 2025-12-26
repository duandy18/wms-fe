// src/features/admin/items/sku-builder/storage.ts
//
// localStorage 读写（纯函数）

import type { LastState } from "./types";
import { DEFAULT_STATE, LS_KEY } from "./types";

export function loadLastState(): LastState {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<LastState>;
    return {
      brand: parsed.brand ?? DEFAULT_STATE.brand,
      species: parsed.species ?? DEFAULT_STATE.species,
      flavor: parsed.flavor ?? DEFAULT_STATE.flavor,
      weight: parsed.weight ?? DEFAULT_STATE.weight,
      unit: parsed.unit ?? DEFAULT_STATE.unit,
      seq: parsed.seq ?? DEFAULT_STATE.seq,
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveLastState(state: LastState) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // 忽略存储错误（无痕模式等）
  }
}
