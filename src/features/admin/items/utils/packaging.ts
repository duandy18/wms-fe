// src/features/admin/items/utils/packaging.ts

/**
 * Phase M-5 终态收口：
 *
 * - items 表不再持有 uom / case_uom / case_ratio 等字段
 * - 单位真相来自 item_uoms 子表
 * - 包装展示逻辑应迁移到单位治理模块
 *
 * 当前函数保留占位实现。
 */

export function formatPackagingEquation(): string | null {
  return null;
}
