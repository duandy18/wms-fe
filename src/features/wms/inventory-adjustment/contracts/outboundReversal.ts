import { formatDateTimeMinute } from "../../../../lib/dateTime";
export type OutboundReversalRangeDays = 1 | 3 | 7 | 15 | 30;
export type OutboundReversalSourceType = "ORDER" | "MANUAL";

export const OUTBOUND_REVERSAL_RANGE_OPTIONS: Array<{
  value: OutboundReversalRangeDays;
  label: string;
}> = [
  { value: 1, label: "最近1天" },
  { value: 3, label: "最近3天" },
  { value: 7, label: "最近7天" },
  { value: 15, label: "最近15天" },
  { value: 30, label: "最近30天" },
];

export interface OutboundReversalOptionsQuery {
  days?: OutboundReversalRangeDays;
  limit?: number;
  source_type?: OutboundReversalSourceType | null;
}

export interface OutboundReversalOptionOut {
  event_id: number;
  event_no: string;
  warehouse_id: number;
  source_type: string;
  source_ref: string | null;
  occurred_at: string;
  committed_at: string | null;
  remark: string | null;
  line_count: number;
  qty_outbound_total: number;
  reversible: boolean;
  non_reversible_reason: string | null;
}

export interface OutboundReversalOptionsOut {
  items: OutboundReversalOptionOut[];
}

export interface OutboundReversalDetailLineOut {
  ref_line: number;
  item_id: number;
  item_name_snapshot: string | null;
  item_sku_snapshot: string | null;
  item_spec_snapshot: string | null;
  qty_outbound: number;
  lot_id: number;
  lot_code_snapshot: string | null;
  order_line_id: number | null;
  manual_doc_line_id: number | null;
  remark: string | null;
}

export interface OutboundReversalDetailOut {
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
  qty_outbound_total: number;
  reversible: boolean;
  non_reversible_reason: string | null;
  lines: OutboundReversalDetailLineOut[];
}

export interface OutboundReversalIn {
  occurred_at?: string;
  operator_name_snapshot: string;
  remark?: string | null;
}

export interface OutboundReversalRowOut {
  ref_line: number;
  item_id: number;
  lot_id: number;
  qty_outbound: number;
}

export interface OutboundReversalOut {
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
  rows: OutboundReversalRowOut[];
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

export function formatOutboundReversalSourceType(value: string | null | undefined): string {
  switch ((value ?? "").trim()) {
    case "ORDER":
      return "订单出库";
    case "MANUAL":
      return "手动出库";
    default:
      return value?.trim() || "-";
  }
}

export function buildOutboundReversalOptionLabel(option: OutboundReversalOptionOut): string {
  const at = formatDateTime(option.committed_at ?? option.occurred_at);
  const sourceType = formatOutboundReversalSourceType(option.source_type);
  const sourceRef = (option.source_ref ?? "").trim();
  return sourceRef ? `${at} · ${sourceType} · ${sourceRef}` : `${at} · ${sourceType}`;
}

export function parseOutboundReversalRangeDays(
  value: string | null | undefined,
): OutboundReversalRangeDays {
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

export function parseOutboundReversalSourceType(
  value: string | null | undefined,
): OutboundReversalSourceType | null {
  const text = (value ?? "").trim();
  switch (text) {
    case "ORDER":
      return "ORDER";
    case "MANUAL":
      return "MANUAL";
    default:
      return null;
  }
}
