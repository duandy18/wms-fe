export type InboundReceiptSourceType =
  | "PURCHASE_ORDER"
  | "RETURN_ORDER"
  | "MANUAL";

export type InboundReceiptStatus =
  | "DRAFT"
  | "RELEASED"
  | "COMPLETED"
  | "VOIDED";

export interface InboundReceiptLineReadOut {
  id: number;
  line_no: number;
  source_line_id: number | null;
  item_id: number;
  item_uom_id: number;
  planned_qty: string;
  item_name_snapshot: string | null;
  item_spec_snapshot: string | null;
  uom_name_snapshot: string | null;
  ratio_to_base_snapshot: string;
  remark: string | null;
}

export interface InboundReceiptReadOut {
  id: number;
  receipt_no: string;
  source_type: InboundReceiptSourceType;
  source_doc_id: number | null;
  source_doc_no_snapshot: string | null;
  warehouse_id: number;
  warehouse_name_snapshot: string | null;
  supplier_id: number | null;
  counterparty_name_snapshot: string | null;
  status: InboundReceiptStatus;
  remark: string | null;
  created_by: number | null;
  released_at: string | null;
  lines: InboundReceiptLineReadOut[];
}

export interface InboundReceiptListItemOut {
  id: number;
  receipt_no: string;
  source_type: InboundReceiptSourceType;
  source_doc_no_snapshot: string | null;
  warehouse_id: number;
  warehouse_name_snapshot: string | null;
  supplier_id: number | null;
  counterparty_name_snapshot: string | null;
  status: InboundReceiptStatus;
  remark: string | null;
  released_at: string | null;
  last_operated_at: string | null;
  line_count: number;
  total_planned_qty: string;
  total_received_qty: string;
  total_remaining_qty: string;
}

export interface InboundReceiptListOut {
  items: InboundReceiptListItemOut[];
  total: number;
}

export interface InboundReceiptProgressLineOut {
  line_no: number;
  planned_qty: string;
  received_qty: string;
  remaining_qty: string;
}

export interface InboundReceiptProgressOut {
  receipt_id: number;
  receipt_no: string;
  lines: InboundReceiptProgressLineOut[];
}

export interface InboundReceiptReleaseOut {
  receipt_id: number;
  receipt_no: string;
  status: "RELEASED";
  released_at: string;
}

export interface InboundReceiptReturnSourceLineOut {
  order_line_id: number;
  item_id: number;
  item_name_snapshot: string | null;
  item_spec_snapshot: string | null;
  item_uom_id: number;
  uom_name_snapshot: string | null;
  ratio_to_base_snapshot: string;
  qty_ordered: string;
  qty_shipped: string;
  qty_returned: string;
  qty_remaining_refundable: string;
  suggested_planned_qty: string;
}

export interface InboundReceiptReturnSourceOut {
  order_id: number;
  order_ref: string;
  platform: string | null;
  shop_id: string | null;
  ext_order_no: string | null;
  warehouse_id: number;
  warehouse_name_snapshot: string | null;
  remaining_qty: string;
  existing_receipt_id: number | null;
  existing_receipt_no: string | null;
  existing_receipt_status: InboundReceiptStatus | null;
  lines: InboundReceiptReturnSourceLineOut[];
}

export function formatInboundSourceType(sourceType: InboundReceiptSourceType): string {
  switch (sourceType) {
    case "PURCHASE_ORDER":
      return "采购";
    case "RETURN_ORDER":
      return "退货";
    case "MANUAL":
      return "手动";
    default:
      return sourceType;
  }
}

export function formatInboundStatus(status: InboundReceiptStatus): string {
  switch (status) {
    case "DRAFT":
      return "草稿";
    case "RELEASED":
      return "已发布";
    case "COMPLETED":
      return "已完成";
    case "VOIDED":
      return "已作废";
    default:
      return status;
  }
}
