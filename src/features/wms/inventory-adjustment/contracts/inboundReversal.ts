import { formatDateTimeMinute } from "../../../../lib/dateTime";
export type InboundReversalRangeDays = 1 | 3 | 7 | 15 | 30;
export type InboundReversalSourceType = "PURCHASE_ORDER" | "MANUAL" | "RETURN";

export const INBOUND_REVERSAL_RANGE_OPTIONS: Array<{
  value: InboundReversalRangeDays;
  label: string;
}> = [
  { value: 1, label: "最近1天" },
  { value: 3, label: "最近3天" },
  { value: 7, label: "最近7天" },
  { value: 15, label: "最近15天" },
  { value: 30, label: "最近30天" },
];

export interface InboundReversalOptionsQuery {
  days?: InboundReversalRangeDays;
  limit?: number;
  source_type?: InboundReversalSourceType | null;
}

export interface InboundReversalOptionOut {
  event_id: number;
  event_no: string;
  warehouse_id: number;
  source_type: string;
  source_ref: string | null;
  occurred_at: string;
  committed_at: string | null;
  remark: string | null;
  line_count: number;
  qty_base_total: number;
  reversible: boolean;
  non_reversible_reason: string | null;
}

export interface InboundReversalOptionsOut {
  items: InboundReversalOptionOut[];
}

export interface InboundReversalDetailLineOut {
  line_no: number;
  item_id: number;
  item_name_snapshot: string | null;
  item_spec_snapshot: string | null;
  actual_uom_id: number;
  actual_uom_name_snapshot: string | null;
  actual_qty_input: number;
  actual_ratio_to_base_snapshot: number;
  qty_base: number;
  lot_id: number | null;
  lot_code_input: string | null;
  production_date: string | null;
  expiry_date: string | null;
  remark: string | null;
}

export interface InboundReversalDetailOut {
  event_id: number;
  event_no: string;
  warehouse_id: number;
  source_type: string;
  source_ref: string | null;
  occurred_at: string;
  committed_at: string | null;
  status: string;
  remark: string | null;
  line_count: number;
  qty_base_total: number;
  reversible: boolean;
  non_reversible_reason: string | null;
  lines: InboundReversalDetailLineOut[];
}

export interface InboundReversalIn {
  occurred_at?: string;
  operator_name_snapshot: string;
  remark?: string | null;
}

export interface InboundReversalRowOut {
  line_no: number;
  item_id: number;
  lot_id: number;
  qty_base: number;
}

export interface InboundReversalOut {
  ok: boolean;
  event_id: number;
  event_no: string;
  trace_id: string;
  target_event_id: number;
  warehouse_id: number;
  source_type: string;
  source_ref: string | null;
  occurred_at: string;
  operator_name_snapshot: string;
  remark: string | null;
  rows: InboundReversalRowOut[];
}

export function formatDateTime(value: string | null): string {
  return formatDateTimeMinute(value);
}

export function formatQty(value: number | string | null | undefined): string {
  if (value == null) return "-";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "-";
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return n.toFixed(6).replace(/\.?0+$/, "");
}

export function formatInboundReversalSourceType(value: string | null | undefined): string {
  switch ((value ?? "").trim()) {
    case "PURCHASE_ORDER":
      return "采购入库";
    case "MANUAL":
      return "手动入库";
    case "RETURN":
      return "退货入库";
    default:
      return value?.trim() || "-";
  }
}

export function buildInboundReversalOptionLabel(option: InboundReversalOptionOut): string {
  const at = formatDateTime(option.committed_at ?? option.occurred_at);
  const sourceType = formatInboundReversalSourceType(option.source_type);
  const sourceRef = (option.source_ref ?? "").trim();
  return sourceRef ? `${at} · ${sourceType} · ${sourceRef}` : `${at} · ${sourceType}`;
}

export function parseInboundReversalRangeDays(
  value: string | null | undefined,
): InboundReversalRangeDays {
  switch (Number(value)) {
    case 1:
      return 1;
    case 3:
      return 3;
    case 15:
      return 15;
    case 30:
      return 30;
    case 7:
    default:
      return 7;
  }
}

export function parseInboundReversalSourceType(
  value: string | null | undefined,
): InboundReversalSourceType | null {
  const text = (value ?? "").trim();
  switch (text) {
    case "PURCHASE_ORDER":
      return "PURCHASE_ORDER";
    case "MANUAL":
      return "MANUAL";
    case "RETURN":
      return "RETURN";
    default:
      return null;
  }
}
