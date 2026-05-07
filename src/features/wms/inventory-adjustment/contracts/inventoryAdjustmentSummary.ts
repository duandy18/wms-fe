import { formatDateTimeMinute } from "../../../../lib/dateTime";
export type InventoryAdjustmentSummaryType =
  | "COUNT"
  | "INBOUND_REVERSAL"
  | "OUTBOUND_REVERSAL";

export interface InventoryAdjustmentSummaryQuery {
  adjustment_type?: InventoryAdjustmentSummaryType | null;
  warehouse_id?: number | null;
  limit?: number;
  offset?: number;
}

export interface InventoryAdjustmentSummaryRowOut {
  adjustment_type: InventoryAdjustmentSummaryType;
  object_id: number;
  object_no: string;
  warehouse_id: number;
  status: string;
  source_type: string | null;
  source_ref: string | null;
  event_type: string | null;
  event_kind: string | null;
  target_event_id: number | null;
  occurred_at: string | null;
  committed_at: string | null;
  created_at: string;
  line_count: number;
  qty_total: number;

  ledger_row_count: number;
  ledger_reason: string | null;
  ledger_reason_canon: string | null;
  ledger_sub_reason: string | null;
  delta_total: number;
  abs_delta_total: number;
  direction: string;
  action_title: string;
  action_summary: string;

  remark: string | null;
  detail_route: string;
}

export interface InventoryAdjustmentSummaryLedgerRowOut {
  id: number;
  event_id: number | null;

  ref: string | null;
  ref_line: number | null;
  trace_id: string | null;

  warehouse_id: number;
  item_id: number;
  item_name: string | null;

  lot_id: number | null;
  lot_code: string | null;

  base_item_uom_id: number | null;
  base_uom_name: string | null;

  reason: string;
  reason_canon: string | null;
  sub_reason: string | null;

  delta: number;
  after_qty: number;

  occurred_at: string;
  created_at: string;
}

export interface InventoryAdjustmentSummaryDetailOut {
  row: InventoryAdjustmentSummaryRowOut;
  ledger_rows: InventoryAdjustmentSummaryLedgerRowOut[];
}

export interface InventoryAdjustmentSummaryListOut {
  items: InventoryAdjustmentSummaryRowOut[];
  total: number;
  limit: number;
  offset: number;
}

export const INVENTORY_ADJUSTMENT_TYPE_OPTIONS: Array<{
  value: InventoryAdjustmentSummaryType | "";
  label: string;
}> = [
  { value: "", label: "全部" },
  { value: "COUNT", label: "盘点" },
  { value: "INBOUND_REVERSAL", label: "入库冲回" },
  { value: "OUTBOUND_REVERSAL", label: "出库冲回" },
];

export function parseInventoryAdjustmentSummaryType(
  value: string | null | undefined,
): InventoryAdjustmentSummaryType | null {
  switch ((value ?? "").trim()) {
    case "COUNT":
      return "COUNT";
    case "INBOUND_REVERSAL":
      return "INBOUND_REVERSAL";
    case "OUTBOUND_REVERSAL":
      return "OUTBOUND_REVERSAL";
    default:
      return null;
  }
}

export function formatInventoryAdjustmentType(
  value: InventoryAdjustmentSummaryType | string | null | undefined,
): string {
  switch ((value ?? "").trim()) {
    case "COUNT":
      return "盘点";
    case "INBOUND_REVERSAL":
      return "入库冲回";
    case "OUTBOUND_REVERSAL":
      return "出库冲回";
    default:
      return value?.trim() || "-";
  }
}

export function formatInventoryAdjustmentStatus(value: string | null | undefined): string {
  switch ((value ?? "").trim()) {
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
    case "COMMITTED":
      return "已提交";
    case "SUPERSEDED":
      return "已被冲回";
    default:
      return value?.trim() || "-";
  }
}

export function formatInventoryAdjustmentSourceType(
  value: string | null | undefined,
): string {
  switch ((value ?? "").trim()) {
    case "MANUAL_COUNT":
      return "手工盘点";
    case "PURCHASE_ORDER":
      return "采购入库";
    case "MANUAL":
      return "手动";
    case "RETURN":
      return "退货入库";
    case "ORDER":
      return "订单出库";
    default:
      return value?.trim() || "-";
  }
}

export function formatLedgerAction(value: string | null | undefined): string {
  switch ((value ?? "").trim()) {
    case "COUNT_CONFIRM":
      return "盘点确认";
    case "COUNT_ADJUST":
      return "盘点调整";
    case "INBOUND_REVERSAL":
      return "入库冲回";
    case "OUTBOUND_REVERSAL":
      return "出库冲回";
    default:
      return value?.trim() || "-";
  }
}

export function formatDateTime(value: string | null | undefined): string {
  return formatDateTimeMinute(value);
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
