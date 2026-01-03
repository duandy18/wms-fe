// src/features/admin/shipping-providers/edit-provider/contactRoles.ts

export type ContactRoleCode = "shipping" | "billing" | "after_sales" | "other" | (string & {});

export const CONTACT_ROLE_OPTIONS: Array<{ value: ContactRoleCode; label: string }> = [
  { value: "shipping", label: "发货" },
  { value: "billing", label: "结算" },
  { value: "after_sales", label: "售后" },
  { value: "other", label: "其他" },
];

export function roleLabel(code: string | null | undefined): string {
  const v = (code ?? "").trim();
  if (!v) return "—";
  const hit = CONTACT_ROLE_OPTIONS.find((x) => x.value === v);
  return hit ? hit.label : `未知（${v}）`;
}
