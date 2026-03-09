// src/features/admin/shipping-providers/scheme/workbench/domain/types.ts
//
// 运价工作台（新主线）领域类型。
// 说明：
// - 输入态金额/重量统一用 string，提交前再 parse
// - matrix 只使用后端真实 id，不依赖未保存 group/range 临时键
// - group.name 为内部辅助字段；UI 主线不展示

import type { ModuleCode, PricingMode } from "../api/types";

export type { ModuleCode, PricingMode };

export type RangeRow = {
  id?: number;
  clientId: string;

  minKg: string;
  maxKg: string;

  sortOrder: number;

  isNew: boolean;
  isDirty: boolean;
  isDeleted: boolean;
};

export type GroupProvinceRow = {
  provinceCode: string;
  provinceName: string;
};

export type GroupRow = {
  id?: number;
  clientId: string;

  name: string;
  provinces: GroupProvinceRow[];

  sortOrder: number;
  active: boolean;

  isNew: boolean;
  isDirty: boolean;
  isDeleted: boolean;
};

export type MatrixCellDraft = {
  id?: number;
  key: string;

  groupId: number;
  moduleRangeId: number;

  pricingMode: PricingMode;

  flatAmount: string;
  baseAmount: string;
  ratePerKg: string;
  baseKg: string;

  active: boolean;

  isDirty: boolean;
};

export type SurchargeScope = "province" | "city";

export type SurchargeRuleRow = {
  id?: number;
  clientId: string;
  originalKey: string | null;

  name: string;
  active: boolean;

  scope: SurchargeScope;

  provinceCode: string;
  provinceName: string;

  cityName: string;

  fixedAmount: string;

  isNew: boolean;
  isDirty: boolean;
  isDeleted: boolean;
};

export type MatrixColumn = {
  moduleRangeId: number;
  sortOrder: number;
  minKgText: string;
  maxKgText: string;
  label: string;
};

export type MatrixCellView = {
  key: string;
  groupId: number;
  moduleRangeId: number;

  pricingMode: PricingMode;

  flatAmount: string;
  baseAmount: string;
  ratePerKg: string;
  baseKg: string;

  active: boolean;

  isDirty: boolean;
  isMissing: boolean;
  isValid: boolean;

  displayText: string;
};

export type MatrixRowView = {
  groupId: number;
  sortOrder: number;
  provinceNames: string[];
  cells: MatrixCellView[];
};

export type ModuleEditorState = {
  moduleCode: ModuleCode;

  loading: boolean;

  savingRanges: boolean;
  savingGroups: boolean;
  savingCells: boolean;

  error: string | null;

  ranges: RangeRow[];
  groups: GroupRow[];
  cells: Record<string, MatrixCellDraft>;
};

export type WorkbenchBlocker = {
  code: string;
  message: string;
  scope: "scheme" | "standard" | "other" | "active-module";
};

export type WorkbenchWarning = {
  code: string;
  message: string;
  scope: "scheme" | "standard" | "other" | "active-module" | "quote-explain";
};

export type WorkbenchDerivedState = {
  activeModuleCode: ModuleCode;
  activeModuleRangesReady: boolean;
  activeModuleGroupsReady: boolean;
  activeModuleMatrixReady: boolean;
  canEditActiveMatrix: boolean;

  standardReady: boolean;
  otherUsed: boolean;
  otherReady: boolean;

  hasUnsavedChanges: boolean;
  canPublish: boolean;

  blockers: WorkbenchBlocker[];
  warnings: WorkbenchWarning[];

  quoteBasedOnSavedVersion: boolean;
};
