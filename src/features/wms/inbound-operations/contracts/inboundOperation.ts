export type InboundTaskSourceType =
  | "PURCHASE_ORDER"
  | "RETURN_ORDER"
  | "MANUAL";

export type InboundTaskStatus =
  | "DRAFT"
  | "RELEASED"
  | "VOIDED";

export interface InboundTaskLineOut {
  line_no: number;
  item_id: number;
  item_uom_id: number;
  planned_qty: string;
  item_name_snapshot: string | null;
  item_spec_snapshot: string | null;
  uom_name_snapshot: string | null;
  ratio_to_base_snapshot: string;
  received_qty: string;
  remaining_qty: string;
  remark: string | null;
}

export interface InboundTaskReadOut {
  receipt_id: number;
  receipt_no: string;
  source_type: InboundTaskSourceType;
  source_doc_no_snapshot: string | null;
  warehouse_id: number;
  warehouse_name_snapshot: string | null;
  supplier_id: number | null;
  counterparty_name_snapshot: string | null;
  status: InboundTaskStatus;
  remark: string | null;
  lines: InboundTaskLineOut[];
}

export interface InboundOperationEntryDraft {
  qty_inbound: string;
  batch_no: string;
  production_date: string;
  expiry_date: string;
  remark: string;
}

export interface InboundOperationEntryIn {
  qty_inbound: number;
  batch_no?: string | null;
  production_date?: string | null;
  expiry_date?: string | null;
  remark?: string | null;
}

export interface InboundOperationLineIn {
  receipt_line_no: number;
  entries: InboundOperationEntryIn[];
}

export interface InboundOperationSubmitIn {
  receipt_no: string;
  remark?: string | null;
  lines: InboundOperationLineIn[];
}

export interface InboundOperationLineOut {
  id: number;
  receipt_line_no_snapshot: number;
  item_id: number;
  item_name_snapshot: string | null;
  item_spec_snapshot: string | null;
  item_uom_id: number;
  uom_name_snapshot: string | null;
  ratio_to_base_snapshot: string;
  qty_inbound: string;
  qty_base: string;
  batch_no: string | null;
  production_date: string | null;
  expiry_date: string | null;
  lot_id: number | null;
  remark: string | null;
}

export interface InboundOperationSubmitOut {
  id: number;
  receipt_no_snapshot: string;
  warehouse_id: number;
  warehouse_name_snapshot: string | null;
  supplier_id: number | null;
  supplier_name_snapshot: string | null;
  operator_id: number | null;
  operator_name_snapshot: string | null;
  operated_at: string;
  remark: string | null;
  lines: InboundOperationLineOut[];
}

export function createEmptyInboundOperationEntryDraft(): InboundOperationEntryDraft {
  return {
    qty_inbound: "",
    batch_no: "",
    production_date: "",
    expiry_date: "",
    remark: "",
  };
}

export function formatInboundTaskSourceType(sourceType: InboundTaskSourceType): string {
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
