// src/features/operations/inbound/supplement/types.ts

export type SupplementSourceType = "PURCHASE" | "RETURN" | "MISC";

export type ViewStatus = "MISSING" | "DONE" | "ALL";

export const SOURCE_LABEL: Record<SupplementSourceType, string> = {
  PURCHASE: "采购收货",
  RETURN: "退货收货",
  MISC: "样品 / 零星",
};

export const STATUS_LABEL: Record<ViewStatus, string> = {
  MISSING: "仅阻断项（需补录）",
  DONE: "仅已补录（暂不支持）",
  ALL: "包含建议补录",
};

export type ReceiveSupplementMissingField =
  | "batch_code"
  | "production_date"
  | "expiry_date"
  | (string & {});

export const MISSING_FIELD_LABEL: Record<string, string> = {
  batch_code: "批次号",
  production_date: "生产日期",
  expiry_date: "到期日期",
};

export function formatMissingFields(fields: string[]): string {
  if (!fields || fields.length === 0) return "";
  const labels = fields.map((f) => MISSING_FIELD_LABEL[f] ?? f);
  return labels.join("、");
}

export type ReceiveSupplementLine = {
  task_id: number;
  po_id: number | null;
  source_type: string | null;
  source_id: number | null;
  warehouse_id: number;

  item_id: number;
  item_name: string | null;

  scanned_qty: number;
  batch_code: string | null;
  production_date: string | null;
  expiry_date: string | null;

  missing_fields: string[];
};
