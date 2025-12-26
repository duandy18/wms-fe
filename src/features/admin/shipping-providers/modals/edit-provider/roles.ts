// src/features/admin/shipping-providers/modals/edit-provider/roles.ts
//
// 联系人角色：选项与展示文案（纯函数/常量）

export type RoleKey = "shipping" | "billing" | "after_sales" | "other";

export const ROLE_OPTIONS: Array<{ value: RoleKey; label: string }> = [
  { value: "shipping", label: "发货对接" },
  { value: "billing", label: "对账/结算" },
  { value: "after_sales", label: "售后/异常处理" },
  { value: "other", label: "其他" },
];

export function renderText(v: string | null | undefined): string {
  return v && v.trim() ? v : "—";
}

export function roleLabel(v: string | null | undefined): string {
  const key = (v ?? "").trim().toLowerCase();
  const hit = ROLE_OPTIONS.find((x) => x.value === (key as RoleKey));
  return hit ? hit.label : renderText(v ?? null);
}
