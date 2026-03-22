// src/features/tms/pricingTemplates/pages/templatesPage/types.ts
//
// 分拆说明：
// - 本文件承接 TemplatesPage 分拆后的“页面私有类型与展示辅助函数”。
// - 负责：
//   1) CreateFormState / SuccessState
//   2) 页面私有默认值
//   3) 列表展示文案 / badge class / 时间格式化
//   4) 模板 provider 反查等纯函数
// - 不负责：
//   1) React 组件
//   2) API 调用
//   3) 页面状态管理
// - 维护约束：
//   - 仅放纯类型与纯函数
//   - 不引入 React

import type {
  PricingTemplate,
  PricingTemplateConfigStatus,
  PricingTemplateStatus,
  PricingTemplateValidationStatus,
} from "../../types";

export type CreateMode = "create" | "clone";

export type CreateFormState = {
  mode: CreateMode;
  shipping_provider_id: string;
  source_template_id: string;
  name: string;
  ranges_count: string;
  groups_count: string;
};

export type SuccessState = {
  templateId: number;
  templateName: string;
  action: "create" | "clone";
} | null;

export const DEFAULT_CREATE_FORM: CreateFormState = {
  mode: "create",
  shipping_provider_id: "",
  source_template_id: "",
  name: "",
  ranges_count: "",
  groups_count: "",
};

export function formatTemplateStatusLabel(status: PricingTemplateStatus): string {
  switch (status) {
    case "draft":
      return "草稿";
    case "archived":
      return "已归档";
    default:
      return status;
  }
}

export function templateStatusBadgeClass(status: PricingTemplateStatus): string {
  switch (status) {
    case "draft":
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
    case "archived":
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
  }
}

export function formatUsageStatusLabel(usedBindingCount: number): string {
  return usedBindingCount > 0 ? `已使用（${usedBindingCount}）` : "未使用";
}

export function usageStatusBadgeClass(usedBindingCount: number): string {
  return usedBindingCount > 0
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
    : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
}

export function formatConfigStatusLabel(status: PricingTemplateConfigStatus): string {
  switch (status) {
    case "empty":
      return "未配置";
    case "incomplete":
      return "未完成";
    case "ready":
      return "已完整";
    default:
      return status;
  }
}

export function configStatusBadgeClass(status: PricingTemplateConfigStatus): string {
  switch (status) {
    case "empty":
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    case "incomplete":
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
    case "ready":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
  }
}

export function formatValidationStatusLabel(
  status: PricingTemplateValidationStatus,
): string {
  switch (status) {
    case "not_validated":
      return "未验证";
    case "passed":
      return "已通过";
    case "failed":
      return "未通过";
    default:
      return status;
  }
}

export function validationStatusBadgeClass(
  status: PricingTemplateValidationStatus,
): string {
  switch (status) {
    case "not_validated":
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    case "passed":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    case "failed":
      return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
  }
}

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("zh-CN", {
    hour12: false,
  });
}

export function findTemplateProviderId(
  rows: PricingTemplate[],
  templateId: number,
): number | null {
  const row = rows.find((item) => item.id === templateId);
  return row ? row.shipping_provider_id : null;
}
