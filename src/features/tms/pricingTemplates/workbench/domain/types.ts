// src/features/tms/pricingTemplates/workbench/domain/types.ts
//
// 运价工作台（单 template 主线）领域类型。
// 说明：
// - 输入态金额/重量统一用 string，提交前再 parse
// - matrix 只使用后端真实 id，不依赖未保存 group/range 临时键
// - group.name 为内部辅助字段；UI 主线不展示
// - 为兼容当前卡片组件入参，保留 ModuleEditorState 名称，但其语义已不再代表“双模块”

import type { PricingMode } from "../api/types";

export type { PricingMode };

export type SaveFeedback = {
  error: string | null;
  success: string | null;
};

export type CitySaveFeedbackMap = Record<string, SaveFeedback | undefined>;

export type RangeRow = {
  id?: number;
  clientId: string;

  minKg: string;
  maxKg: string;
  defaultPricingMode: PricingMode;

  sortOrder: number;

  isNew: boolean;
  isDirty: boolean;
  isDeleted: boolean;
};

export type GroupMemberRow = {
  provinceCode: string;
  provinceName: string;
};

export type GroupRow = {
  id?: number;
  clientId: string;

  name: string;
  members: GroupMemberRow[];

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

export type SurchargeConfigCityRow = {
  id?: number;
  clientId: string;

  cityCode: string;
  cityName: string;
  fixedAmount: string;
  active: boolean;

  isNew: boolean;
  isDirty: boolean;
  isDeleted: boolean;
};

export type SurchargeConfigRow = {
  id?: number;
  clientId: string;

  provinceCode: string;
  provinceName: string;
  provinceMode: "province" | "cities";
  fixedAmount: string;
  active: boolean;

  cities: SurchargeConfigCityRow[];

  isNew: boolean;
  isDirty: boolean;
  isDeleted: boolean;
};

// 为减少本轮连锁爆炸，暂时沿用旧名字给下游组件。
export type SurchargeRuleRow = SurchargeConfigRow;

export type MatrixColumn = {
  moduleRangeId: number;
  sortOrder: number;
  minKgText: string;
  maxKgText: string;
  label: string;
  defaultPricingMode: PricingMode;
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

// 兼容当前各卡片组件 props 的单份资源态。
// 注意：这里已经不是“module editor”，只是沿用旧名字避免本轮未审卡片文件同时爆炸。
export type ModuleEditorState = {
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
  scope: "template" | "ranges" | "groups" | "matrix" | "surcharges";
};

export type WorkbenchWarning = {
  code: string;
  message: string;
  scope: "template" | "matrix" | "quote-explain";
};

export type WorkbenchDerivedState = {
  rangesReady: boolean;
  groupsReady: boolean;
  matrixReady: boolean;
  canEditMatrix: boolean;

  expectedCellCount: number;
  actualCellCount: number;
  missingCellCount: number;

  hasUnsavedChanges: boolean;
  canPublish: boolean;

  blockers: WorkbenchBlocker[];
  warnings: WorkbenchWarning[];

  quoteBasedOnSavedVersion: boolean;
};
