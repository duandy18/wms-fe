import { formatDateTimeMinute } from "../../../../lib/dateTime";
export type OutboundSourceType = "ORDER" | "MANUAL";

export interface OutboundSummaryRowOut {
  event_id: number;
  event_no: string;
  event_type: string;
  source_type: OutboundSourceType | string;
  source_ref: string | null;
  warehouse_id: number;
  occurred_at: string;
  committed_at: string;
  trace_id: string;
  status: string;
  created_by: number | null;
  remark: string | null;
  lines_count: number;
  total_qty_outbound: number;
}

export interface OutboundSummaryLineOut {
  id: number;
  event_id: number;
  ref_line: number;
  item_id: number;
  qty_outbound: number;
  lot_id: number;
  lot_code_snapshot: string | null;
  order_line_id: number | null;
  manual_doc_line_id: number | null;
  item_name_snapshot: string | null;
  item_sku_snapshot: string | null;
  item_spec_snapshot: string | null;
  remark: string | null;
  created_at: string;
}

export interface OutboundSummaryListOut {
  items: OutboundSummaryRowOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface OutboundSummaryDetailOut {
  event: OutboundSummaryRowOut;
  lines: OutboundSummaryLineOut[];
}

export interface OrderOutboundViewOrderOut {
  id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  buyer_name: string | null;
  buyer_phone: string | null;
  order_amount: number | string | null;
  pay_amount: number | string | null;
}

export interface OrderOutboundViewLineOut {
  id: number;
  order_id: number;
  item_id: number;
  req_qty: number;
  item_sku: string | null;
  item_name: string | null;
  item_spec: string | null;
  base_uom_id: number | null;
  base_uom_name: string | null;
}

export interface OrderOutboundViewResponse {
  ok: boolean;
  order: OrderOutboundViewOrderOut;
  lines: OrderOutboundViewLineOut[];
}

export interface OutboundLotCandidateOut {
  lot_id: number;
  lot_code: string | null;
  production_date: string | null;
  expiry_date: string | null;
  available_qty: number;
}

export interface OutboundLotCandidatesOut {
  warehouse_id: number;
  item_id: number;
  candidates: OutboundLotCandidateOut[];
}

export interface PublicSupplierBasicOut {
  id: number;
  name: string;
  code?: string | null;
  active: boolean;
}

export interface PublicItemBasicOut {
  id: number;
  sku: string;
  name: string;
  spec?: string | null;
  enabled: boolean;
  supplier_id?: number | null;
  brand?: string | null;
  category?: string | null;
}

export interface PublicItemAggregateUomOut {
  id: number;
  uom: string;
  ratio_to_base: number;
  display_name?: string | null;
}

export interface PublicItemAggregateItemOut {
  id: number;
  sku: string;
  name: string;
  spec?: string | null;
}

export interface PublicItemAggregateOut {
  item: PublicItemAggregateItemOut;
  uoms: PublicItemAggregateUomOut[];
  barcodes: Array<{
    id: number;
    item_id: number;
    item_uom_id: number;
    barcode: string;
    symbology: string;
    active: boolean;
    is_primary: boolean;
  }>;
}

export interface OrderOutboundSubmitLineIn {
  order_line_id: number;
  item_id: number;
  qty_outbound: number;
  lot_id: number;
  remark?: string | null;
}

export interface OrderOutboundSubmitIn {
  warehouse_id: number;
  remark?: string | null;
  lines: OrderOutboundSubmitLineIn[];
}

export interface OrderOutboundSubmitOut {
  status: string;
  event_id: number;
  trace_id: string;
  event_type: string;
  source_type: string;
  source_ref: string;
  warehouse_id: number;
  occurred_at: string;
  lines_count: number;
}

export type ManualOutboundDocStatus = "DRAFT" | "RELEASED" | "COMPLETED" | "VOIDED";

export interface ManualOutboundDocLineOut {
  id: number;
  line_no: number;
  item_id: number;
  item_uom_id: number;
  requested_qty: number;
  item_name_snapshot: string | null;
  item_sku_snapshot: string | null;
  item_spec_snapshot: string | null;
  uom_name_snapshot: string | null;
}

export interface ManualOutboundDocOut {
  id: number;
  warehouse_id: number;
  doc_no: string;
  doc_type: string;
  status: ManualOutboundDocStatus | string;
  recipient_name: string | null;
  recipient_id: number | null;
  remark: string | null;
  created_by: number | null;
  created_at: string;
  released_by: number | null;
  released_at: string | null;
  voided_by: number | null;
  voided_at: string | null;
  lines: ManualOutboundDocLineOut[];
}

export interface ManualOutboundDocCreateLineIn {
  item_id: number;
  item_uom_id: number;
  requested_qty: number;
  item_name_snapshot?: string | null;
  item_sku_snapshot?: string | null;
  item_spec_snapshot?: string | null;
  uom_name_snapshot?: string | null;
}

export interface ManualOutboundDocCreateIn {
  warehouse_id: number;
  doc_type: string;
  recipient_name: string;
  remark?: string | null;
  lines: ManualOutboundDocCreateLineIn[];
}

export interface ManualOutboundSubmitLineIn {
  manual_doc_line_id: number;
  item_id: number;
  qty_outbound: number;
  lot_id: number;
  remark?: string | null;
}

export interface ManualOutboundSubmitIn {
  remark?: string | null;
  lines: ManualOutboundSubmitLineIn[];
}

export interface ManualOutboundSubmitOut {
  status: string;
  event_id: number;
  trace_id: string;
  event_type: string;
  source_type: string;
  source_ref: string;
  warehouse_id: number;
  occurred_at: string;
  lines_count: number;
}

export function formatOutboundSourceType(value: string): string {
  switch (value) {
    case "ORDER":
      return "订单";
    case "MANUAL":
      return "手动";
    default:
      return value || "-";
  }
}

export function formatManualOutboundDocStatus(value: string): string {
  switch (value) {
    case "DRAFT":
      return "草稿";
    case "RELEASED":
      return "已发布";
    case "COMPLETED":
      return "已完成";
    case "VOIDED":
      return "已作废";
    default:
      return value || "-";
  }
}

export function formatOutboundStatus(value: string): string {
  switch (value) {
    case "COMMITTED":
      return "已提交";
    case "COMMIT":
      return "提交中";
    case "OK":
      return "成功";
    default:
      return value || "-";
  }
}

export function formatDateTime(value: string | null): string {
  return formatDateTimeMinute(value);
}

export function formatDate(value: string | null): string {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

export function formatMaybeMoney(value: number | string | null): string {
  if (value == null || value === "") return "-";
  return String(value);
}
