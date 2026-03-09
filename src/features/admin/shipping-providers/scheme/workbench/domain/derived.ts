// src/features/admin/shipping-providers/scheme/workbench/domain/derived.ts
//
// 运价工作台（新主线）纯函数与派生逻辑。

import type {
  GroupProvinceRow,
  GroupRow,
  MatrixCellDraft,
  MatrixCellView,
  MatrixColumn,
  MatrixRowView,
  ModuleCode,
  ModuleEditorState,
  PricingMode,
  RangeRow,
  SurchargeRuleRow,
  WorkbenchBlocker,
  WorkbenchDerivedState,
  WorkbenchWarning,
} from "./types";

export function newClientId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}:${Date.now()}:${rand}`;
}

export function moduleLabel(moduleCode: ModuleCode): string {
  return moduleCode === "standard" ? "标准区域" : "其他区域";
}

export function buildCellKey(groupId: number, moduleRangeId: number): string {
  return `${groupId}::${moduleRangeId}`;
}

export function formatRangeLabel(minKg: string, maxKg: string): string {
  const min = minKg.trim();
  const max = maxKg.trim();
  if (!min) return "-";
  if (!max) return `${min}kg+`;
  return `${min}-${max}kg`;
}

export function summarizeProvinceNames(provinceNames: string[]): string {
  const cleaned = provinceNames.map((x) => x.trim()).filter(Boolean);
  return cleaned.join(" / ");
}

export function buildGroupInternalName(provinces: GroupProvinceRow[], index: number): string {
  const names = provinces.map((p) => p.provinceName.trim()).filter(Boolean);
  if (names.length === 0) return `区域组${index + 1}`;
  return summarizeProvinceNames(names);
}

export function textFromNumber(v: number | string | null | undefined): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

export function parseOptionalNumber(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function parseRequiredNumber(text: string): number | null {
  const n = parseOptionalNumber(text);
  if (n === null) return null;
  return n;
}

export function createEmptyCellDraft(
  groupId: number,
  moduleRangeId: number,
  pricingMode: PricingMode = "flat",
): MatrixCellDraft {
  return {
    key: buildCellKey(groupId, moduleRangeId),
    groupId,
    moduleRangeId,
    pricingMode,
    flatAmount: "",
    baseAmount: "",
    ratePerKg: "",
    baseKg: "",
    active: true,
    isDirty: false,
  };
}

export function normalizeCellDraftMode(prev: MatrixCellDraft, nextMode: PricingMode): MatrixCellDraft {
  if (nextMode === "flat") {
    return {
      ...prev,
      pricingMode: "flat",
      baseAmount: "",
      ratePerKg: "",
      baseKg: "",
    };
  }
  if (nextMode === "linear_total") {
    return {
      ...prev,
      pricingMode: "linear_total",
      flatAmount: "",
      baseKg: "",
    };
  }
  if (nextMode === "step_over") {
    return {
      ...prev,
      pricingMode: "step_over",
      flatAmount: "",
      baseKg: prev.baseKg.trim() || "1",
    };
  }
  return {
    ...prev,
    pricingMode: "manual_quote",
    flatAmount: "",
    baseAmount: "",
    ratePerKg: "",
    baseKg: "",
  };
}

export function validateRangeRows(rows: RangeRow[]): string[] {
  const items = rows.filter((r) => !r.isDeleted);
  if (items.length === 0) return ["至少需要 1 条重量段"];

  const errors: string[] = [];

  items.forEach((r, idx) => {
    const min = parseRequiredNumber(r.minKg);
    const max = parseOptionalNumber(r.maxKg);

    if (min === null || min < 0) {
      errors.push(`第 ${idx + 1} 条重量段最小重量不合法`);
      return;
    }

    if (max !== null) {
      if (max === 0) {
        errors.push(`第 ${idx + 1} 条重量段最大重量不能为 0，空值表示无上限`);
      } else if (max <= min) {
        errors.push(`第 ${idx + 1} 条重量段最大重量必须大于最小重量`);
      }
    }
  });

  if (errors.length > 0) return errors;

  const sorted = [...items].sort((a, b) => {
    const aMin = parseRequiredNumber(a.minKg) ?? 0;
    const bMin = parseRequiredNumber(b.minKg) ?? 0;
    return aMin - bMin;
  });

  for (let i = 0; i < sorted.length; i += 1) {
    const current = sorted[i];
    const currentMin = parseRequiredNumber(current.minKg) ?? 0;
    const currentMax = parseOptionalNumber(current.maxKg);

    for (let j = i + 1; j < sorted.length; j += 1) {
      const next = sorted[j];
      const nextMin = parseRequiredNumber(next.minKg) ?? 0;
      const nextMax = parseOptionalNumber(next.maxKg);

      const currentEnd = currentMax ?? Number.POSITIVE_INFINITY;
      const nextEnd = nextMax ?? Number.POSITIVE_INFINITY;

      if (currentMin < nextEnd && nextMin < currentEnd) {
        errors.push(`重量段存在重叠：${formatRangeLabel(current.minKg, current.maxKg)} 与 ${formatRangeLabel(next.minKg, next.maxKg)}`);
      }
    }
  }

  return errors;
}

export function validateGroupRows(rows: GroupRow[]): string[] {
  const items = rows.filter((g) => !g.isDeleted);
  if (items.length === 0) return ["至少需要 1 条区域行"];

  const errors: string[] = [];
  const owner = new Map<string, string>();

  items.forEach((g, idx) => {
    const provinces = (g.provinces ?? []).filter((p) => p.provinceName.trim() || p.provinceCode.trim());
    if (provinces.length === 0) {
      errors.push(`第 ${idx + 1} 条区域行至少需要 1 个省份`);
      return;
    }

    const seen = new Set<string>();
    provinces.forEach((p) => {
      const key = `${p.provinceCode.trim()}::${p.provinceName.trim()}`;
      if (seen.has(key)) {
        errors.push(`区域行 ${idx + 1} 内存在重复省份：${p.provinceName || p.provinceCode}`);
        return;
      }
      seen.add(key);

      const prev = owner.get(key);
      if (prev && prev !== g.clientId) {
        errors.push(`省份 ${p.provinceName || p.provinceCode} 出现在多个区域行里`);
        return;
      }
      owner.set(key, g.clientId);
    });
  });

  return errors;
}

export function validateMatrixCellDraft(cell: MatrixCellDraft): string | null {
  if (cell.pricingMode === "flat") {
    const flat = parseRequiredNumber(cell.flatAmount);
    if (flat === null || flat < 0) return "固定价格模式必须填写非负固定价";
    return null;
  }

  if (cell.pricingMode === "linear_total") {
    const base = parseRequiredNumber(cell.baseAmount);
    const rate = parseRequiredNumber(cell.ratePerKg);
    if (base === null || base < 0) return "面单费+总重费率模式必须填写非负面单费";
    if (rate === null || rate < 0) return "面单费+总重费率模式必须填写非负费率";
    return null;
  }

  if (cell.pricingMode === "step_over") {
    const baseKg = parseRequiredNumber(cell.baseKg);
    const base = parseRequiredNumber(cell.baseAmount);
    const rate = parseRequiredNumber(cell.ratePerKg);
    if (baseKg === null || baseKg < 0) return "首重续重模式必须填写非负首重重量";
    if (base === null || base < 0) return "首重续重模式必须填写非负首重价";
    if (rate === null || rate < 0) return "首重续重模式必须填写非负续重费率";
    return null;
  }

  return null;
}

export function displayTextOfCell(cell: MatrixCellDraft): string {
  if (cell.pricingMode === "flat") {
    return cell.flatAmount.trim() ? `¥${cell.flatAmount.trim()}` : "未填";
  }
  if (cell.pricingMode === "linear_total") {
    const base = cell.baseAmount.trim() || "-";
    const rate = cell.ratePerKg.trim() || "-";
    return `面单¥${base} + ¥${rate}/kg`;
  }
  if (cell.pricingMode === "step_over") {
    const kg = cell.baseKg.trim() || "-";
    const base = cell.baseAmount.trim() || "-";
    const rate = cell.ratePerKg.trim() || "-";
    return `首${kg}kg ¥${base}，续¥${rate}/kg`;
  }
  return "人工报价";
}

export function sortRanges(rows: RangeRow[]): RangeRow[] {
  return [...rows].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    const aMin = parseRequiredNumber(a.minKg) ?? 0;
    const bMin = parseRequiredNumber(b.minKg) ?? 0;
    return aMin - bMin;
  });
}

export function sortGroups(rows: GroupRow[]): GroupRow[] {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function deriveMatrixColumns(ranges: RangeRow[]): MatrixColumn[] {
  return sortRanges(ranges)
    .filter((r) => !r.isDeleted && typeof r.id === "number")
    .map((r) => ({
      moduleRangeId: r.id as number,
      sortOrder: r.sortOrder,
      minKgText: r.minKg,
      maxKgText: r.maxKg,
      label: formatRangeLabel(r.minKg, r.maxKg),
    }));
}

export function deriveMatrixRows(args: {
  groups: GroupRow[];
  columns: MatrixColumn[];
  cellMap: Record<string, MatrixCellDraft>;
}): MatrixRowView[] {
  const { groups, columns, cellMap } = args;

  return sortGroups(groups)
    .filter((g) => !g.isDeleted && typeof g.id === "number")
    .map((g) => {
      const groupId = g.id as number;
      const provinceNames = (g.provinces ?? []).map((p) => p.provinceName).filter(Boolean);

      const cells: MatrixCellView[] = columns.map((col) => {
        const key = buildCellKey(groupId, col.moduleRangeId);
        const draft = cellMap[key] ?? createEmptyCellDraft(groupId, col.moduleRangeId);
        const isValid = validateMatrixCellDraft(draft) === null;

        return {
          key,
          groupId,
          moduleRangeId: col.moduleRangeId,
          pricingMode: draft.pricingMode,
          flatAmount: draft.flatAmount,
          baseAmount: draft.baseAmount,
          ratePerKg: draft.ratePerKg,
          baseKg: draft.baseKg,
          active: draft.active,
          isDirty: draft.isDirty,
          isMissing: !(key in cellMap),
          isValid,
          displayText: displayTextOfCell(draft),
        };
      });

      return {
        groupId,
        sortOrder: g.sortOrder,
        provinceNames,
        cells,
      };
    });
}

function moduleHasAllCells(module: ModuleEditorState): boolean {
  const groups = module.groups.filter((g) => !g.isDeleted && typeof g.id === "number");
  const ranges = module.ranges.filter((r) => !r.isDeleted && typeof r.id === "number");
  if (groups.length === 0 || ranges.length === 0) return false;

  for (const g of groups) {
    for (const r of ranges) {
      const key = buildCellKey(g.id as number, r.id as number);
      if (!module.cells[key]) return false;
      if (validateMatrixCellDraft(module.cells[key]) !== null) return false;
    }
  }
  return true;
}

function moduleHasDirty(module: ModuleEditorState): boolean {
  const rangesDirty = module.ranges.some((r) => r.isDirty || r.isNew || r.isDeleted);
  const groupsDirty = module.groups.some((g) => g.isDirty || g.isNew || g.isDeleted);
  const cellsDirty = Object.values(module.cells).some((c) => c.isDirty);
  return rangesDirty || groupsDirty || cellsDirty;
}

export function deriveWorkbenchState(args: {
  activeModuleCode: ModuleCode;
  standard: ModuleEditorState;
  other: ModuleEditorState;
  surcharges: SurchargeRuleRow[];
}): WorkbenchDerivedState {
  const { activeModuleCode, standard, other, surcharges } = args;
  const active = activeModuleCode === "standard" ? standard : other;

  const activeModuleRangesReady = active.ranges.filter((r) => !r.isDeleted && typeof r.id === "number").length > 0;
  const activeModuleGroupsReady = active.groups.filter((g) => !g.isDeleted && typeof g.id === "number").length > 0;
  const activeModuleMatrixReady = moduleHasAllCells(active);
  const canEditActiveMatrix = activeModuleRangesReady && activeModuleGroupsReady;

  const standardReady = moduleHasAllCells(standard);

  const otherUsed =
    other.ranges.filter((r) => !r.isDeleted).length > 0 ||
    other.groups.filter((g) => !g.isDeleted).length > 0 ||
    Object.keys(other.cells).length > 0;

  const otherReady = !otherUsed || moduleHasAllCells(other);

  const surchargeDirty = surcharges.some((s) => s.isDirty || s.isNew || s.isDeleted);
  const hasUnsavedChanges = moduleHasDirty(standard) || moduleHasDirty(other) || surchargeDirty;

  const blockers: WorkbenchBlocker[] = [];
  const warnings: WorkbenchWarning[] = [];

  if (!standardReady) {
    blockers.push({
      code: "STANDARD_INCOMPLETE",
      message: "标准区域未完成：需先保存重量段、区域范围，并补齐价格矩阵。",
      scope: "standard",
    });
  }

  if (otherUsed && !otherReady) {
    blockers.push({
      code: "OTHER_INCOMPLETE",
      message: "其他区域已开始配置，但尚未补齐完整矩阵。",
      scope: "other",
    });
  }

  if (hasUnsavedChanges) {
    blockers.push({
      code: "UNSAVED_CHANGES",
      message: "当前存在未保存修改，请先保存后再发布。",
      scope: "scheme",
    });
  }

  if (!otherUsed) {
    warnings.push({
      code: "OTHER_UNUSED",
      message: "当前未启用“其他区域”模块；仅标准区域参与报价。",
      scope: "other",
    });
  }

  if (!activeModuleMatrixReady && canEditActiveMatrix) {
    warnings.push({
      code: "ACTIVE_MATRIX_PENDING",
      message: `${moduleLabel(activeModuleCode)}：已可录入矩阵，但当前尚未完成保存。`,
      scope: "active-module",
    });
  }

  if (hasUnsavedChanges) {
    warnings.push({
      code: "QUOTE_BASED_ON_SAVED_VERSION",
      message: "当前存在未保存修改，试算结果基于最近一次保存版本。",
      scope: "quote-explain",
    });
  }

  const canPublish =
    standardReady &&
    !hasUnsavedChanges &&
    blockers.length === 0 &&
    (!otherUsed || otherReady);

  return {
    activeModuleCode,
    activeModuleRangesReady,
    activeModuleGroupsReady,
    activeModuleMatrixReady,
    canEditActiveMatrix,
    standardReady,
    otherUsed,
    otherReady,
    hasUnsavedChanges,
    canPublish,
    blockers,
    warnings,
    quoteBasedOnSavedVersion: !hasUnsavedChanges,
  };
}
