// src/features/admin/items/quality/itemQuality.ts
import type { Item } from "../../../../contracts/item/contract";

type UnknownRecord = Record<string, unknown>;

/**
 * Quality Layer v1（提示层）
 * - 只做“提示/观察”，不做阻断
 * - 不落库、不评分
 * - 将“原本可视为阻断”的问题标为 severity=high（用于更醒目的提示），但仍不阻断保存
 */
export type QualitySeverity = "high" | "normal";

export type QualityIssue = {
  code: string;
  message: string;
  severity: QualitySeverity;
};

export type ItemQualityReport = {
  issues: QualityIssue[];
};

function asRecord(v: unknown): UnknownRecord {
  return (v ?? {}) as UnknownRecord;
}

function getString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function getNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function hasText(s: string | null): boolean {
  return !!(s && s.trim());
}

function add(arr: QualityIssue[], code: string, message: string, severity: QualitySeverity): void {
  arr.push({ code, message, severity });
}

export function computeItemQuality(args: { item: Item; primaryBarcode: string | null }): ItemQualityReport {
  const { item, primaryBarcode } = args;
  const r = asRecord(item);

  const issues: QualityIssue[] = [];

  const supplierId = r["supplier_id"];
  const uom = getString(r["uom"]);
  const weightKgRaw = r["weight_kg"];

  const caseRatio = (() => {
    const n = getNumber(r["case_ratio"]);
    if (n == null) return null;
    const t = Math.trunc(n);
    return Number.isFinite(t) ? t : null;
  })();

  const caseUom = getString(r["case_uom"]);

  // it.has_shelf_life 在 generated schema 里可能是 optional/nullable
  const hasShelfLife = Boolean((item as UnknownRecord)["has_shelf_life"]);
  const shelfValueRaw = r["shelf_life_value"];
  const shelfUnitRaw = r["shelf_life_unit"];

  // ---- 1) uom（高风险提示：事实口径缺失）----
  if (!hasText(uom)) {
    add(issues, "UOM_MISSING", "最小单位缺失", "high");
  }

  // ---- 2) weight_kg（兼容 number/string；只提示，不阻断）----
  const wParsed = (() => {
    if (typeof weightKgRaw === "number" && Number.isFinite(weightKgRaw)) return weightKgRaw;
    if (typeof weightKgRaw === "string") {
      const s = weightKgRaw.trim();
      if (!s) return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  })();

  if (wParsed == null) {
    add(issues, "WEIGHT_MISSING", "单位净重缺失", "high");
  } else if (wParsed <= 0) {
    add(issues, "WEIGHT_INVALID", "单位净重不合法（需 > 0）", "high");
  } else {
    // 极端值：提示（不阻断）
    if (wParsed < 0.001) {
      add(issues, "WEIGHT_TOO_SMALL", "单位净重偏小（<0.001kg），请确认单位是否正确", "normal");
    }
    if (wParsed > 100) {
      add(issues, "WEIGHT_TOO_LARGE", "单位净重偏大（>100kg），请确认录入是否异常", "normal");
    }
  }

  // ---- 3) shelf life（启用但不完整：高风险提示）----
  if (hasShelfLife) {
    const sv = shelfValueRaw == null ? null : Number(shelfValueRaw);
    const su = shelfUnitRaw == null ? null : String(shelfUnitRaw).trim();
    const svOk = sv != null && Number.isFinite(sv);
    const suOk = !!(su && su.length > 0);
    if (!svOk || !suOk) {
      add(issues, "SHELF_LIFE_INCOMPLETE", "已启用有效期，但默认保质期未完整配置", "high");
    }
  } else {
    // shelf 字段冲突：提示（不阻断）
    const svHas = shelfValueRaw != null && String(shelfValueRaw).trim().length > 0;
    const suHas = shelfUnitRaw != null && String(shelfUnitRaw).trim().length > 0;
    if (svHas || suHas) {
      add(issues, "SHELF_LIFE_CONFLICT", "未启用有效期，但保质期字段存在残留值", "normal");
    }
  }

  // ---- 4) case_ratio / case_uom（结构提示）----
  if (caseRatio != null && caseRatio >= 1) {
    if (!hasText(caseUom)) {
      add(issues, "CASE_UOM_MISSING", "已配置箱装倍率，但包装单位缺失", "high");
    }
  } else {
    add(issues, "CASE_RATIO_MISSING", "箱装结构未配置（可提升录入效率与一致性）", "normal");
  }

  // ---- 5) 主条码（高风险提示：扫码链路）----
  if (!hasText(primaryBarcode)) {
    add(issues, "PRIMARY_BARCODE_MISSING", "主条码缺失", "high");
  }

  // ---- 6) supplier_id（提示）----
  const supplierOk =
    (typeof supplierId === "number" && Number.isFinite(supplierId) && supplierId > 0) ||
    (typeof supplierId === "string" && supplierId.trim().length > 0);
  if (!supplierOk) {
    add(issues, "SUPPLIER_MISSING", "供货商未配置", "normal");
  }

  return { issues };
}
