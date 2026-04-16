import type { PurchaseOrderCompletionListItem } from "../api";
import type { StatusFilter } from "./types";

type ApiErrorShape = {
  message?: string;
};

export const PURCHASE_ORDER_STATUS_OPTIONS: Array<{
  value: StatusFilter;
  label: string;
}> = [
  { value: "ALL", label: "全部状态" },
  { value: "NOT_RECEIVED", label: "未收" },
  { value: "PARTIAL", label: "部分完成" },
  { value: "RECEIVED", label: "已完成" },
];

export function getPurchaseOrdersPageErrorMessage(
  err: unknown,
  fallback: string,
): string {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
}

export function matchesCompletionStatus(
  row: PurchaseOrderCompletionListItem,
  statusFilter: StatusFilter,
): boolean {
  if (statusFilter === "ALL") return true;
  return String(row.line_completion_status) === statusFilter;
}
