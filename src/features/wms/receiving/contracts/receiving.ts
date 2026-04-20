export type ReceivingSourceType =
  | "PURCHASE_ORDER"
  | "RETURN_ORDER"
  | "MANUAL";

export type ReceivingStatus =
  | "DRAFT"
  | "RELEASED"
  | "COMPLETED"
  | "VOIDED";

export type ReceivingExpiryPolicy = "NONE" | "REQUIRED";
export type ReceivingLotSourcePolicy = "INTERNAL_ONLY" | "SUPPLIER_ONLY";
export type ReceivingShelfLifeUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";

export interface ReceivingTaskListItemOut {
  receipt_id: number;
  receipt_no: string;
  source_type: ReceivingSourceType;
  source_doc_no_snapshot: string | null;
  warehouse_id: number;
  warehouse_name_snapshot: string | null;
  supplier_id: number | null;
  counterparty_name_snapshot: string | null;
  status: ReceivingStatus;
  released_at: string | null;
  last_operated_at: string | null;
  line_count: number;
  total_planned_qty: string;
  total_received_qty: string;
  total_remaining_qty: string;
  remark: string | null;
}

export interface ReceivingTaskListOut {
  items: ReceivingTaskListItemOut[];
  total: number;
}

export interface ReceivingTaskLineOut {
  line_no: number;
  item_id: number;
  item_uom_id: number;
  planned_qty: string;
  planned_qty_base: string;
  item_name_snapshot: string | null;
  item_spec_snapshot: string | null;
  uom_name_snapshot: string | null;
  ratio_to_base_snapshot: string;

  expiry_policy: ReceivingExpiryPolicy;
  lot_source_policy: ReceivingLotSourcePolicy;
  derivation_allowed: boolean;
  shelf_life_value: number | null;
  shelf_life_unit: ReceivingShelfLifeUnit | null;

  received_qty: string;
  remaining_qty: string;
  received_qty_base: string;
  remaining_qty_base: string;
  remark: string | null;
}

export interface ReceivingTaskReadOut {
  receipt_id: number;
  receipt_no: string;
  source_type: ReceivingSourceType;
  source_doc_no_snapshot: string | null;
  warehouse_id: number;
  warehouse_name_snapshot: string | null;
  supplier_id: number | null;
  counterparty_name_snapshot: string | null;
  status: ReceivingStatus;
  remark: string | null;
  lines: ReceivingTaskLineOut[];
}

export type ReceivingTaskProbeStatus =
  | "MATCHED"
  | "UNBOUND"
  | "UNMATCHED"
  | "AMBIGUOUS";

export interface ReceivingTaskProbeIn {
  barcode: string;
}

export interface ReceivingTaskProbeOut {
  ok: boolean;
  status: ReceivingTaskProbeStatus;
  barcode: string;
  item_id: number | null;
  item_uom_id: number | null;
  ratio_to_base: number | null;
  matched_line_no: number | null;
  item_name_snapshot: string | null;
  uom_name_snapshot: string | null;
  message: string | null;
}

export interface ReceivingActualUomOption {
  actual_item_uom_id: number;
  actual_uom_name_snapshot: string;
  actual_ratio_to_base_snapshot: number;
  is_base: boolean;
  is_inbound_default: boolean;
}

export interface ReceivingEntryDraft {
  qty_inbound: string;
  barcode_input: string;
  actual_item_uom_id: number | null;
  actual_uom_name_snapshot: string;
  actual_ratio_to_base_snapshot: number | null;
  batch_no: string;
  production_date: string;
  expiry_date: string;
  remark: string;
}

export interface ReceivingEntryIn {
  qty_inbound: number;
  barcode_input?: string | null;
  actual_item_uom_id?: number | null;
  batch_no?: string | null;
  production_date?: string | null;
  expiry_date?: string | null;
  remark?: string | null;
}

export interface ReceivingLineIn {
  receipt_line_no: number;
  entries: ReceivingEntryIn[];
}

export interface ReceivingSubmitIn {
  receipt_no: string;
  remark?: string | null;
  lines: ReceivingLineIn[];
}

export interface ReceivingLineOut {
  id: number;
  receipt_line_no_snapshot: number;
  item_id: number;
  item_name_snapshot: string | null;
  item_spec_snapshot: string | null;
  actual_item_uom_id: number;
  actual_uom_name_snapshot: string | null;
  actual_ratio_to_base_snapshot: string;
  actual_qty_input: string;
  qty_base: string;
  batch_no: string | null;
  production_date: string | null;
  expiry_date: string | null;
  lot_id: number | null;
  remark: string | null;
}

export interface ReceivingSubmitOut {
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
  lines: ReceivingLineOut[];
}

export function createEmptyReceivingEntryDraft(): ReceivingEntryDraft {
  return {
    qty_inbound: "",
    barcode_input: "",
    actual_item_uom_id: null,
    actual_uom_name_snapshot: "",
    actual_ratio_to_base_snapshot: null,
    batch_no: "",
    production_date: "",
    expiry_date: "",
    remark: "",
  };
}

export function receivingLineShowsDateFields(
  line: Pick<ReceivingTaskLineOut, "expiry_policy">,
): boolean {
  return line.expiry_policy === "REQUIRED";
}

export function receivingLineShowsBatchField(
  line: Pick<ReceivingTaskLineOut, "expiry_policy" | "lot_source_policy">,
): boolean {
  return (
    line.expiry_policy === "REQUIRED" ||
    line.lot_source_policy === "SUPPLIER_ONLY"
  );
}

export function receivingLineRequiresBatchField(
  line: Pick<ReceivingTaskLineOut, "lot_source_policy">,
): boolean {
  return line.lot_source_policy === "SUPPLIER_ONLY";
}

export function formatReceivingSourceType(sourceType: ReceivingSourceType): string {
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

export function formatReceivingStatus(status: ReceivingStatus): string {
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
