export type CountDocStatus = "DRAFT" | "FROZEN" | "COUNTED" | "POSTED" | "VOIDED";

export interface CountDocExecutionLineOut {
  id: number;
  line_no: number;

  item_id: number;
  item_name_snapshot: string | null;
  item_spec_snapshot: string | null;

  snapshot_qty_base: number;

  base_item_uom_id: number | null;
  base_uom_name: string | null;

  counted_qty_input: number | null;
  counted_qty_base: number | null;
  diff_qty_base: number | null;
}

export interface CountDocOut {
  id: number;
  count_no: string;
  warehouse_id: number;
  snapshot_at: string;
  status: CountDocStatus;

  posted_event_id: number | null;
  created_by: number | null;

  counted_by_name_snapshot: string | null;
  reviewed_by_name_snapshot: string | null;

  remark: string | null;

  created_at: string;
  counted_at: string | null;
  posted_at: string | null;

  line_count: number;
  diff_line_count: number;
  diff_qty_base_total: number;

  posted_event_no: string | null;
  posted_event_type: string | null;
  posted_source_type: string | null;
  posted_event_kind: string | null;
  posted_event_status: string | null;
}

export interface CountDocExecutionDetailOut {
  id: number;
  count_no: string;
  warehouse_id: number;
  snapshot_at: string;
  status: CountDocStatus;

  counted_by_name_snapshot: string | null;
  reviewed_by_name_snapshot: string | null;

  created_at: string;
  counted_at: string | null;
  posted_at: string | null;

  line_count: number;
  diff_line_count: number;
  diff_qty_base_total: number;

  lines: CountDocExecutionLineOut[];
}

export interface CountDocListOut {
  total: number;
  items: CountDocOut[];
}

export interface CountDocCreateIn {
  warehouse_id: number;
  snapshot_at: string;
  remark?: string | null;
}

export interface CountDocFreezeOut {
  doc_id: number;
  status: CountDocStatus;
  snapshot_at: string;
  line_count: number;
  lot_snapshot_count: number;
}

export interface CountDocLineCountPatch {
  line_id: number;
  counted_qty_input: number;
}

export interface CountDocLinesUpdateIn {
  counted_by_name_snapshot: string;
  lines: CountDocLineCountPatch[];
}

export interface CountDocLinesUpdateOut {
  doc_id: number;
  status: CountDocStatus;
  updated_count: number;
  lines: CountDocExecutionLineOut[];
}

export interface CountDocPostIn {
  reviewed_by_name_snapshot: string;
}

export interface CountDocPostOut {
  doc_id: number;
  status: CountDocStatus;
  posted_event_id: number;
  posted_at: string;
}

export interface CountDocListQuery {
  warehouse_id?: number | null;
  active_only?: boolean;
  limit?: number;
  offset?: number;
}

export function formatCountDocStatus(status: CountDocStatus): string {
  switch (status) {
    case "DRAFT":
      return "草稿";
    case "FROZEN":
      return "已冻结";
    case "COUNTED":
      return "已盘点";
    case "POSTED":
      return "已过账";
    case "VOIDED":
      return "已作废";
    default:
      return status;
  }
}

export function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

export function formatQty(value: number | string | null | undefined): string {
  if (value == null) return "-";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "-";
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return n.toFixed(6).replace(/\.?0+$/, "");
}

export function formatQtyWithUnit(
  value: number | string | null | undefined,
  unit: string | null | undefined,
): string {
  const qty = formatQty(value);
  if (qty === "-") return "-";
  const u = (unit ?? "").trim();
  return u ? `${qty} ${u}` : qty;
}
