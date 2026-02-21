/* eslint-disable @typescript-eslint/no-empty-object-type */
import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type AlertsResponse = {
  alerts?: Array<AlertItem> | undefined;
  day: string;
  platform?: ((string | null) | Array<string | null>) | undefined;
};
type AlertItem = {
  code: string;
  count: number;
  domain: string;
  message: string;
  meta?: {} | undefined;
  severity: string;
  threshold?: ((number | null) | Array<number | null>) | undefined;
  title: string;
};
type CleanupShellSchemesOut = {
  candidates?: Array<ShellSchemeRow> | undefined;
  candidates_n: number;
  deleted_n?: number | undefined;
  dry_run: boolean;
  include_surcharge_only: boolean;
  limit: number;
  ok?: boolean | undefined;
};
type ShellSchemeRow = {
  active: boolean;
  name: string;
  scheme_id: number;
  seg_n?: number | undefined;
  surcharge_n?: number | undefined;
  tpl_n?: number | undefined;
  wh_n?: number | undefined;
  zone_n?: number | undefined;
};
type CopyZoneBracketsOut = {
  active_policy: string;
  conflict_policy: string;
  created?: Array<ZoneBracketOut> | undefined;
  failed?: Array<{}> | undefined;
  ok?: boolean | undefined;
  skipped?: Array<ZoneBracketOut> | undefined;
  source_zone_id: number;
  summary: CopyZoneBracketsSummary;
  target_zone_id: number;
  updated?: Array<ZoneBracketOut> | undefined;
};
type ZoneBracketOut = {
  active: boolean;
  base_amount?: ((string | null) | Array<string | null>) | undefined;
  base_kg?: ((string | null) | Array<string | null>) | undefined;
  flat_amount?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  max_kg?: ((string | null) | Array<string | null>) | undefined;
  min_kg: string;
  price_json?: {} | undefined;
  pricing_mode: string;
  rate_per_kg?: ((string | null) | Array<string | null>) | undefined;
  zone_id: number;
};
type CopyZoneBracketsSummary = {
  created_count: number;
  failed_count: number;
  skipped_count: number;
  source_count: number;
  updated_count: number;
};
type DevFakeOrdersGenerateIn = {
  generate?: FakeGenerateParams | undefined;
  seed: {};
};
type FakeGenerateParams = Partial<{
  count: number;
  lines_max: number;
  lines_min: number;
  qty_max: number;
  qty_min: number;
  rng_seed: number;
}>;
type DevFakeOrdersRunIn = {
  generate?: FakeGenerateParams | undefined;
  seed: {};
  watch_filled_codes?: Array<string> | undefined;
  with_replay?: boolean | undefined;
};
type DevOrderFacts = {
  items?: Array<DevOrderItemFact> | undefined;
  order: DevOrderInfo;
};
type DevOrderItemFact = {
  item_id: number;
  qty_ordered: number;
  qty_remaining_refundable: number;
  qty_returned: number;
  qty_shipped: number;
  sku_id?: ((string | null) | Array<string | null>) | undefined;
  title?: ((string | null) | Array<string | null>) | undefined;
};
type DevOrderInfo = {
  created_at: string;
  ext_order_no: string;
  id: number;
  order_amount?: ((number | null) | Array<number | null>) | undefined;
  pay_amount?: ((number | null) | Array<number | null>) | undefined;
  platform: string;
  shop_id: string;
  status?: ((string | null) | Array<string | null>) | undefined;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
  updated_at?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id?: ((number | null) | Array<number | null>) | undefined;
};
type DevOrderReconcileResultModel = {
  ext_order_no: string;
  issues?: Array<string> | undefined;
  lines?: Array<DevOrderReconcileLine> | undefined;
  order_id: number;
  platform: string;
  shop_id: string;
};
type DevOrderReconcileLine = {
  item_id: number;
  qty_ordered: number;
  qty_returned: number;
  qty_shipped: number;
  remaining_refundable: number;
  sku_id?: ((string | null) | Array<string | null>) | undefined;
  title?: ((string | null) | Array<string | null>) | undefined;
};
type DevOrderView = {
  order: DevOrderInfo;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
};
type ExplainPurchaseOrder = {
  closed_at?: ((string | null) | Array<string | null>) | undefined;
  created_at: string;
  id: number;
  last_received_at?: ((string | null) | Array<string | null>) | undefined;
  lines?: Array<ExplainPurchaseOrderLine> | undefined;
  purchase_time: string;
  purchaser: string;
  remark?: ((string | null) | Array<string | null>) | undefined;
  status: string;
  supplier_id?: ((number | null) | Array<number | null>) | undefined;
  supplier_name?: ((string | null) | Array<string | null>) | undefined;
  updated_at: string;
  warehouse_id: number;
};
type ExplainPurchaseOrderLine = {
  base_uom?: ((string | null) | Array<string | null>) | undefined;
  category?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  item_id: number;
  item_name?: ((string | null) | Array<string | null>) | undefined;
  item_sku?: ((string | null) | Array<string | null>) | undefined;
  line_no: number;
  po_id: number;
  purchase_uom?: ((string | null) | Array<string | null>) | undefined;
  qty_ordered: number;
  qty_received: number;
  remark?: ((string | null) | Array<string | null>) | undefined;
  spec_text?: ((string | null) | Array<string | null>) | undefined;
  status: string;
  units_per_case?: ((number | null) | Array<number | null>) | undefined;
};
type FefoRiskMetricsResponse = {
  as_of: string;
  items: Array<FefoItemRisk>;
};
type FefoItemRisk = {
  fefo_hit_rate_7d: number;
  item_id: number;
  name: string;
  near_expiry_batches: number;
  risk_score: number;
  sku: string;
};
type FskuComponentsReplaceIn = {
  components: Array<FskuComponentIn>;
};
type FskuComponentIn = {
  item_id: number;
  qty: number;
  role: "primary" | "gift";
};
type FskuDetailOut = {
  code: string;
  components: Array<FskuComponentOut>;
  created_at: string;
  id: number;
  name: string;
  published_at: (string | null) | Array<string | null>;
  retired_at: (string | null) | Array<string | null>;
  shape: "single" | "bundle";
  status: string;
  updated_at: string;
};
type FskuComponentOut = {
  item_id: number;
  qty: number;
  role: "primary" | "gift";
};
type FskuListOut = {
  items: Array<FskuListItem>;
  limit: number;
  offset: number;
  total: number;
};
type FskuListItem = {
  code: string;
  components_summary: string;
  components_summary_name: string;
  id: number;
  name: string;
  published_at: (string | null) | Array<string | null>;
  retired_at: (string | null) | Array<string | null>;
  shape: "single" | "bundle";
  status: string;
  updated_at: string;
};
type FulfillmentDebugOut = {
  address?: FulfillmentDebugAddress | undefined;
  ext_order_no?: ((string | null) | Array<string | null>) | undefined;
  order_id: number;
  platform: string;
  service?: FulfillmentServiceDebug | undefined;
  shop_id: string;
  summary?: {} | undefined;
  version?: string | undefined;
};
type FulfillmentDebugAddress = Partial<{
  city: (string | null) | Array<string | null>;
  detail: (string | null) | Array<string | null>;
  district: (string | null) | Array<string | null>;
  province: (string | null) | Array<string | null>;
}>;
type FulfillmentServiceDebug = Partial<{
  city_code: (string | null) | Array<string | null>;
  hit: boolean;
  province_code: (string | null) | Array<string | null>;
  reason: (string | null) | Array<string | null>;
  service_warehouse_id: (number | null) | Array<number | null>;
}>;
type FulfillmentScanWarehouseOut = {
  missing?: Array<FulfillmentMissingLineOut> | undefined;
  status: string;
  warehouse_id: number;
};
type FulfillmentMissingLineOut = {
  available: number;
  item_id: number;
  need: number;
};
type HTTPValidationError = Partial<{
  detail: Array<ValidationError>;
}>;
type ValidationError = {
  ctx?: {} | undefined;
  input?: unknown | undefined;
  loc: Array<(string | number) | Array<string | number>>;
  msg: string;
  type: string;
};
type InboundReceiptConfirmOut = {
  ledger_refs?: Array<InboundReceiptConfirmLedgerRef> | undefined;
  ledger_written: number;
  receipt: InboundReceiptOut;
};
type InboundReceiptConfirmLedgerRef = {
  applied?: ((boolean | null) | Array<boolean | null>) | undefined;
  idempotent?: ((boolean | null) | Array<boolean | null>) | undefined;
  item_id: number;
  qty_delta: number;
  ref: string;
  ref_line: number;
  source_line_key: string;
};
type InboundReceiptOut = {
  created_at: string;
  id: number;
  lines?: Array<InboundReceiptLineOut> | undefined;
  occurred_at: string;
  ref: string;
  remark?: ((string | null) | Array<string | null>) | undefined;
  source_id?: ((number | null) | Array<number | null>) | undefined;
  source_type: string;
  status: string;
  supplier_id?: ((number | null) | Array<number | null>) | undefined;
  supplier_name?: ((string | null) | Array<string | null>) | undefined;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
  updated_at: string;
  warehouse_id: number;
};
type InboundReceiptLineOut = {
  barcode?: ((string | null) | Array<string | null>) | undefined;
  batch_code: string;
  created_at: string;
  expiry_date?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  item_id: number;
  item_name?: ((string | null) | Array<string | null>) | undefined;
  item_sku?: ((string | null) | Array<string | null>) | undefined;
  line_amount?: ((string | null) | Array<string | null>) | undefined;
  line_no: number;
  po_line_id?: ((number | null) | Array<number | null>) | undefined;
  production_date?: ((string | null) | Array<string | null>) | undefined;
  qty_received: number;
  qty_units: number;
  receipt_id: number;
  remark?: ((string | null) | Array<string | null>) | undefined;
  unit_cost?: ((string | null) | Array<string | null>) | undefined;
  units_per_case: number;
  updated_at: string;
};
type InboundReceiptExplainOut = {
  blocking_errors?: Array<ProblemItem> | undefined;
  confirmable: boolean;
  ledger_preview?: Array<LedgerPreviewOut> | undefined;
  normalized_lines_preview?: Array<NormalizedLinePreviewOut> | undefined;
  receipt_summary: InboundReceiptSummaryOut;
};
type ProblemItem = {
  field: string;
  index?: ((number | null) | Array<number | null>) | undefined;
  message: string;
  scope: "header" | "line";
};
type LedgerPreviewOut = {
  action: string;
  item_id: number;
  qty_delta: number;
  source_line_key: string;
  warehouse_id: number;
};
type NormalizedLinePreviewOut = {
  batch_code: string;
  item_id: number;
  line_key: string;
  po_line_id?: ((number | null) | Array<number | null>) | undefined;
  production_date?: ((string | null) | Array<string | null>) | undefined;
  qty_total: number;
  source_line_indexes?: Array<number> | undefined;
};
type InboundReceiptSummaryOut = {
  id: number;
  occurred_at?: ((string | null) | Array<string | null>) | undefined;
  ref?: ((string | null) | Array<string | null>) | undefined;
  source_id?: ((number | null) | Array<number | null>) | undefined;
  source_type?: ((string | null) | Array<string | null>) | undefined;
  status: string;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id?: ((number | null) | Array<number | null>) | undefined;
};
type InternalOutboundDocOut = {
  canceled_at?: ((string | null) | Array<string | null>) | undefined;
  canceled_by?: ((number | null) | Array<number | null>) | undefined;
  confirmed_at?: ((string | null) | Array<string | null>) | undefined;
  confirmed_by?: ((number | null) | Array<number | null>) | undefined;
  created_at: string;
  created_by?: ((number | null) | Array<number | null>) | undefined;
  doc_no: string;
  doc_type: string;
  extra_meta?: (({} | null) | Array<{} | null>) | undefined;
  id: number;
  lines?: Array<InternalOutboundLineOut> | undefined;
  note?: ((string | null) | Array<string | null>) | undefined;
  recipient_id?: ((number | null) | Array<number | null>) | undefined;
  recipient_name?: ((string | null) | Array<string | null>) | undefined;
  recipient_note?: ((string | null) | Array<string | null>) | undefined;
  recipient_type?: ((string | null) | Array<string | null>) | undefined;
  status: string;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id: number;
};
type InternalOutboundLineOut = {
  batch_code?: ((string | null) | Array<string | null>) | undefined;
  confirmed_qty?: ((number | null) | Array<number | null>) | undefined;
  doc_id: number;
  extra_meta?: (({} | null) | Array<{} | null>) | undefined;
  id: number;
  item_id: number;
  line_no: number;
  note?: ((string | null) | Array<string | null>) | undefined;
  requested_qty: number;
  uom?: ((string | null) | Array<string | null>) | undefined;
};
type InventorySnapshotResponse = {
  limit: number;
  offset: number;
  rows?: Array<InventoryRow> | undefined;
  total: number;
};
type InventoryRow = {
  batch_code?: ((string | null) | Array<string | null>) | undefined;
  brand?: ((string | null) | Array<string | null>) | undefined;
  category?: ((string | null) | Array<string | null>) | undefined;
  days_to_expiry?: ((number | null) | Array<number | null>) | undefined;
  expiry_date?: ((string | null) | Array<string | null>) | undefined;
  item_code?: ((string | null) | Array<string | null>) | undefined;
  item_id: number;
  item_name: string;
  main_barcode?: ((string | null) | Array<string | null>) | undefined;
  near_expiry?: boolean | undefined;
  qty: number;
  spec?: ((string | null) | Array<string | null>) | undefined;
  uom?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id: number;
};
type ItemDetailResponse = {
  item_id: number;
  item_name: string;
  slices: Array<ItemDetailSlice>;
  totals: ItemDetailTotals;
};
type ItemDetailSlice = {
  available_qty: number;
  batch_code: string;
  expiry_date?: ((string | null) | Array<string | null>) | undefined;
  is_top?: boolean | undefined;
  near_expiry?: boolean | undefined;
  on_hand_qty: number;
  pool: string;
  production_date?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id: number;
  warehouse_name: string;
};
type ItemDetailTotals = {
  available_qty: number;
  on_hand_qty: number;
};
type LedgerEnums = Partial<{
  reason_canons: Array<ReasonCanon>;
  sub_reasons: Array<SubReason>;
}>;
type ReasonCanon = "RECEIPT" | "SHIPMENT" | "ADJUSTMENT";
type SubReason =
  | "PO_RECEIPT"
  | "ORDER_SHIP"
  | "COUNT_ADJUST"
  | "RETURN_RECEIPT"
  | "INTERNAL_SHIP"
  | "RETURN_TO_VENDOR";
type LedgerExplainOut = {
  anchor: ExplainAnchor;
  ledger: Array<ExplainLedgerRow>;
  purchase_order?:
    | ((ExplainPurchaseOrder | null) | Array<ExplainPurchaseOrder | null>)
    | undefined;
  receipt: ExplainReceipt;
  receipt_lines: Array<ExplainReceiptLine>;
};
type ExplainAnchor = {
  ref: string;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
};
type ExplainLedgerRow = {
  after_qty: number;
  batch_code: string;
  created_at: string;
  delta: number;
  expiry_date?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  item_id: number;
  occurred_at: string;
  production_date?: ((string | null) | Array<string | null>) | undefined;
  reason: string;
  reason_canon?: ((string | null) | Array<string | null>) | undefined;
  ref: string;
  ref_line: number;
  sub_reason?: ((string | null) | Array<string | null>) | undefined;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id: number;
};
type ExplainReceipt = {
  created_at: string;
  id: number;
  occurred_at: string;
  ref: string;
  remark?: ((string | null) | Array<string | null>) | undefined;
  source_id?: ((number | null) | Array<number | null>) | undefined;
  source_type: string;
  status: string;
  supplier_id?: ((number | null) | Array<number | null>) | undefined;
  supplier_name?: ((string | null) | Array<string | null>) | undefined;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
  updated_at: string;
  warehouse_id: number;
};
type ExplainReceiptLine = {
  base_uom?: ((string | null) | Array<string | null>) | undefined;
  batch_code: string;
  category?: ((string | null) | Array<string | null>) | undefined;
  created_at: string;
  expiry_date?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  item_id: number;
  item_name?: ((string | null) | Array<string | null>) | undefined;
  item_sku?: ((string | null) | Array<string | null>) | undefined;
  line_amount?: ((string | null) | Array<string | null>) | undefined;
  line_no: number;
  po_line_id?: ((number | null) | Array<number | null>) | undefined;
  production_date?: ((string | null) | Array<string | null>) | undefined;
  purchase_uom?: ((string | null) | Array<string | null>) | undefined;
  qty_received: number;
  qty_units: number;
  receipt_id: number;
  remark?: ((string | null) | Array<string | null>) | undefined;
  spec_text?: ((string | null) | Array<string | null>) | undefined;
  unit_cost?: ((string | null) | Array<string | null>) | undefined;
  units_per_case: number;
  updated_at: string;
};
type LedgerList = {
  items?: Array<LedgerRow> | undefined;
  total: number;
};
type LedgerRow = {
  after_qty: number;
  batch_code: string;
  created_at: string;
  delta: number;
  id: number;
  item_id: number;
  item_name?: ((string | null) | Array<string | null>) | undefined;
  movement_type?: ((string | null) | Array<string | null>) | undefined;
  occurred_at: string;
  reason: string;
  reason_canon?: ((string | null) | Array<string | null>) | undefined;
  ref?: ((string | null) | Array<string | null>) | undefined;
  ref_line: number;
  sub_reason?: ((string | null) | Array<string | null>) | undefined;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id: number;
};
type LedgerQuery = Partial<{
  batch_code: (string | null) | Array<string | null>;
  item_id: (number | null) | Array<number | null>;
  item_keyword: (string | null) | Array<string | null>;
  limit: number;
  offset: number;
  reason: (string | null) | Array<string | null>;
  reason_canon: (ReasonCanon | null) | Array<ReasonCanon | null>;
  ref: (string | null) | Array<string | null>;
  sub_reason: (SubReason | null) | Array<SubReason | null>;
  time_from: (string | null) | Array<string | null>;
  time_to: (string | null) | Array<string | null>;
  trace_id: (string | null) | Array<string | null>;
  warehouse_id: (number | null) | Array<number | null>;
}>;
type LedgerReconcileResult = Partial<{
  rows: Array<LedgerReconcileRow>;
}>;
type LedgerReconcileRow = {
  batch_code: string;
  diff: number;
  item_id: number;
  ledger_sum_delta: number;
  stock_qty: number;
  warehouse_id: number;
};
type LedgerSummary = {
  by_reason?: Array<LedgerReasonStat> | undefined;
  filters: LedgerQuery;
  net_delta: number;
};
type LedgerReasonStat = {
  count: number;
  reason: string;
  total_delta: number;
};
type ManualDecisionOrderOut = {
  batch_id: string;
  created_at: string;
  ext_order_no: string;
  manual_decisions?: Array<ManualDecisionLineOut> | undefined;
  manual_reason?: ((string | null) | Array<string | null>) | undefined;
  order_id: number;
  platform: string;
  ref: string;
  risk_flags?: Array<string> | undefined;
  shop_id: string;
  store_id: number;
};
type ManualDecisionLineOut = Partial<{
  fact_qty: (number | null) | Array<number | null>;
  filled_code: (string | null) | Array<string | null>;
  item_id: (number | null) | Array<number | null>;
  line_key: (string | null) | Array<string | null>;
  line_no: (number | null) | Array<number | null>;
  locator_kind: (string | null) | Array<string | null>;
  locator_value: (string | null) | Array<string | null>;
  note: (string | null) | Array<string | null>;
  qty: (number | null) | Array<number | null>;
}>;
type ManualDecisionOrdersOut = {
  items?: Array<ManualDecisionOrderOut> | undefined;
  limit: number;
  offset: number;
  total: number;
};
type MerchantCodeBindingListDataOut = {
  items: Array<MerchantCodeBindingRowOut>;
  limit: number;
  offset: number;
  total: number;
};
type MerchantCodeBindingRowOut = {
  created_at: string;
  fsku: FskuLiteOut;
  fsku_id: number;
  id: number;
  merchant_code: string;
  platform: string;
  reason: (string | null) | Array<string | null>;
  shop_id: string;
  store: StoreLiteOut;
  updated_at: string;
};
type FskuLiteOut = {
  code: string;
  id: number;
  name: string;
  status: string;
};
type StoreLiteOut = {
  id: number;
  name: string;
};
type MerchantCodeBindingListOut = {
  data: MerchantCodeBindingListDataOut;
  ok?: boolean | undefined;
};
type MerchantCodeBindingOut = {
  data: MerchantCodeBindingRowOut;
  ok?: boolean | undefined;
};
type MetaPlatformsOut = {
  data: Array<MetaPlatformItem>;
  ok?: boolean | undefined;
};
type MetaPlatformItem = {
  enabled?: boolean | undefined;
  label: string;
  platform: string;
};
type OpsActiveSchemesOut = Partial<{
  data: Array<OpsActiveSchemeRow>;
  ok: boolean;
}>;
type OpsActiveSchemeRow = {
  scheme_id: number;
  scheme_name: string;
  shipping_provider_id: number;
  shipping_provider_name: string;
};
type OrderCreateIn = {
  address?: ((OrderAddrIn | null) | Array<OrderAddrIn | null>) | undefined;
  buyer_name?: ((string | null) | Array<string | null>) | undefined;
  buyer_phone?: ((string | null) | Array<string | null>) | undefined;
  ext_order_no: string;
  lines?: Array<OrderLineIn> | undefined;
  occurred_at?: ((string | null) | Array<string | null>) | undefined;
  order_amount?: ((number | null) | Array<number | null>) | undefined;
  pay_amount?: ((number | null) | Array<number | null>) | undefined;
  platform: string;
  shop_id: string;
  store_name?: ((string | null) | Array<string | null>) | undefined;
};
type OrderAddrIn = Partial<{
  city: (string | null) | Array<string | null>;
  detail: (string | null) | Array<string | null>;
  district: (string | null) | Array<string | null>;
  province: (string | null) | Array<string | null>;
  receiver_name: (string | null) | Array<string | null>;
  receiver_phone: (string | null) | Array<string | null>;
  zipcode: (string | null) | Array<string | null>;
}>;
type OrderLineIn = Partial<{
  amount: (number | null) | Array<number | null>;
  discount: (number | null) | Array<number | null>;
  item_id: (number | null) | Array<number | null>;
  price: (number | null) | Array<number | null>;
  qty: number;
  sku_id: (string | null) | Array<string | null>;
  title: (string | null) | Array<string | null>;
}>;
type OrderCreateOut = {
  fulfillment?:
    | ((OrderFulfillmentOut | null) | Array<OrderFulfillmentOut | null>)
    | undefined;
  id?: ((number | null) | Array<number | null>) | undefined;
  ref: string;
  status: string;
};
type OrderFulfillmentOut = Partial<{
  auto_assign_status: (string | null) | Array<string | null>;
  fulfillment_status: (string | null) | Array<string | null>;
  ingest_state: (string | null) | Array<string | null>;
  route_status: (string | null) | Array<string | null>;
  service_warehouse_id: (number | null) | Array<number | null>;
  warehouse_id: (number | null) | Array<number | null>;
}>;
type OrderFactsResponse = {
  items: Array<OrderFactItemOut>;
  ok?: boolean | undefined;
};
type OrderFactItemOut = {
  item_id: number;
  qty_ordered?: number | undefined;
  sku_id?: ((string | null) | Array<string | null>) | undefined;
  title?: ((string | null) | Array<string | null>) | undefined;
};
type OrderSimCartPutIn = Partial<{
  items: Array<CartLineItemIn>;
}>;
type CartLineItemIn = {
  checked?: boolean | undefined;
  city?: ((string | null) | Array<string | null>) | undefined;
  detail?: ((string | null) | Array<string | null>) | undefined;
  district?: ((string | null) | Array<string | null>) | undefined;
  if_version?: ((number | null) | Array<number | null>) | undefined;
  province?: ((string | null) | Array<string | null>) | undefined;
  qty?: number | undefined;
  receiver_name?: ((string | null) | Array<string | null>) | undefined;
  receiver_phone?: ((string | null) | Array<string | null>) | undefined;
  row_no: number;
  zipcode?: ((string | null) | Array<string | null>) | undefined;
};
type OrderSimFilledCodeOptionsData = Partial<{
  items: Array<OrderSimFilledCodeOptionOut>;
}>;
type OrderSimFilledCodeOptionOut = {
  components_summary: string;
  filled_code: string;
  suggested_title: string;
};
type OrderSimFilledCodeOptionsOut = {
  data: OrderSimFilledCodeOptionsData;
  ok: boolean;
};
type OrderSimMerchantLinesPutIn = Partial<{
  items: Array<MerchantLineItemIn>;
}>;
type MerchantLineItemIn = {
  filled_code?: ((string | null) | Array<string | null>) | undefined;
  if_version?: ((number | null) | Array<number | null>) | undefined;
  row_no: number;
  spec?: ((string | null) | Array<string | null>) | undefined;
  title?: ((string | null) | Array<string | null>) | undefined;
};
type OrderViewResponse = {
  ok?: boolean | undefined;
  order: PlatformOrderOut;
};
type PlatformOrderOut = {
  address?:
    | ((PlatformOrderAddressOut | null) | Array<PlatformOrderAddressOut | null>)
    | undefined;
  buyer_name?: ((string | null) | Array<string | null>) | undefined;
  buyer_phone?: ((string | null) | Array<string | null>) | undefined;
  created_at: string;
  ext_order_no: string;
  id: number;
  items?: Array<PlatformOrderLineOut> | undefined;
  order_amount?: ((number | null) | Array<number | null>) | undefined;
  pay_amount?: ((number | null) | Array<number | null>) | undefined;
  platform: string;
  raw?: (({} | null) | Array<{} | null>) | undefined;
  shop_id: string;
  status?: ((string | null) | Array<string | null>) | undefined;
  updated_at?: ((string | null) | Array<string | null>) | undefined;
};
type PlatformOrderAddressOut = Partial<{
  city: (string | null) | Array<string | null>;
  detail: (string | null) | Array<string | null>;
  district: (string | null) | Array<string | null>;
  province: (string | null) | Array<string | null>;
  receiver_name: (string | null) | Array<string | null>;
  receiver_phone: (string | null) | Array<string | null>;
  zipcode: (string | null) | Array<string | null>;
}>;
type PlatformOrderLineOut = Partial<{
  amount: (number | null) | Array<number | null>;
  discount: (number | null) | Array<number | null>;
  extras: ({} | null) | Array<{} | null>;
  item_id: (number | null) | Array<number | null>;
  price: (number | null) | Array<number | null>;
  qty: number;
  sku: (string | null) | Array<string | null>;
  spec: (string | null) | Array<string | null>;
  title: (string | null) | Array<string | null>;
}>;
type OrderWarehouseAvailabilityResponse = {
  lines: Array<AvailabilityLineOut>;
  matrix: Array<AvailabilityCellOut>;
  ok?: boolean | undefined;
  order_id: number;
  scope: string;
  warehouses: Array<WarehouseBriefOut>;
};
type AvailabilityLineOut = {
  item_id: number;
  req_qty: number;
  sku_id?: ((string | null) | Array<string | null>) | undefined;
  title?: ((string | null) | Array<string | null>) | undefined;
};
type AvailabilityCellOut = {
  available: number;
  item_id: number;
  shortage: number;
  status: string;
  warehouse_id: number;
};
type WarehouseBriefOut = {
  code?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  name?: ((string | null) | Array<string | null>) | undefined;
};
type OrdersSummaryResponse = {
  data: Array<OrderSummaryOut>;
  ok?: boolean | undefined;
  warehouses: Array<WarehouseOptionOut>;
};
type OrderSummaryOut = {
  can_manual_assign_execution_warehouse?: boolean | undefined;
  created_at: string;
  ext_order_no: string;
  fulfillment_status?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  manual_assign_hint?: ((string | null) | Array<string | null>) | undefined;
  order_amount?: ((number | null) | Array<number | null>) | undefined;
  pay_amount?: ((number | null) | Array<number | null>) | undefined;
  platform: string;
  service_warehouse_id?: ((number | null) | Array<number | null>) | undefined;
  shop_id: string;
  status?: ((string | null) | Array<string | null>) | undefined;
  store_id?: ((number | null) | Array<number | null>) | undefined;
  updated_at?: ((string | null) | Array<string | null>) | undefined;
  warehouse_assign_mode?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id?: ((number | null) | Array<number | null>) | undefined;
};
type WarehouseOptionOut = {
  active?: ((boolean | null) | Array<boolean | null>) | undefined;
  code?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  name?: ((string | null) | Array<string | null>) | undefined;
};
type OrdersTrendResponseModel = Partial<{
  days: Array<OrdersDailyTrendItem>;
}>;
type OrdersDailyTrendItem = {
  date: string;
  orders_created: number;
  orders_returned: number;
  orders_shipped: number;
  return_rate: number;
};
type OutboundFailuresMetricsResponse = {
  day: string;
  details?: Array<OutboundFailureDetail> | undefined;
  inventory_failures_by_code?: {} | undefined;
  inventory_insufficient: number;
  pick_failed: number;
  pick_failures_by_code?: {} | undefined;
  platform: string;
  routing_failed: number;
  routing_failures_by_code?: {} | undefined;
  ship_failed: number;
  ship_failures_by_code?: {} | undefined;
};
type OutboundFailureDetail = {
  fail_point: string;
  message?: ((string | null) | Array<string | null>) | undefined;
  ref: string;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
};
type OutboundMetricsV2 = {
  day: string;
  distribution?: Array<OutboundDistributionPoint> | undefined;
  fallback_rate: number;
  fallback_times: number;
  fefo_hit_rate: number;
  platform: string;
  success_orders: number;
  success_rate: number;
  total_orders: number;
};
type OutboundDistributionPoint = {
  hour: string;
  orders: number;
  pick_qty: number;
};
type OutboundRangeMetricsResponse = {
  days: Array<OutboundDaySummary>;
  platform: string;
};
type OutboundDaySummary = {
  day: string;
  fallback_rate: number;
  fefo_hit_rate: number;
  success_rate: number;
  total_orders: number;
};
type OutboundShipIn = {
  external_order_ref?: ((string | null) | Array<string | null>) | undefined;
  lines: Array<OutboundLineIn>;
  occurred_at?: ((string | null) | Array<string | null>) | undefined;
  platform: string;
  ref: string;
  shop_id: string;
};
type OutboundLineIn = {
  batch_code?: ((string | null) | Array<string | null>) | undefined;
  item_id: number;
  qty: number;
  warehouse_id: number;
};
type OutboundShopMetricsResponse = {
  day: string;
  platform: string;
  shops: Array<OutboundShopMetric>;
};
type OutboundShopMetric = {
  fallback_rate: number;
  fallback_times: number;
  shop_id: string;
  success_orders: number;
  success_rate: number;
  total_orders: number;
};
type OutboundWarehouseMetricsResponse = {
  day: string;
  platform: string;
  warehouses: Array<OutboundWarehouseMetric>;
};
type OutboundWarehouseMetric = {
  pick_qty: number;
  success_orders: number;
  success_rate: number;
  total_orders: number;
  warehouse_id: number;
};
type PickRequest = {
  batch_code?: ((string | null) | Array<string | null>) | undefined;
  lines?: Array<PickLineIn> | undefined;
  occurred_at?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id: number;
};
type PickLineIn = {
  item_id: number;
  qty: number;
};
type PickTaskCommitDiffOut = {
  has_over: boolean;
  has_temp_lines: boolean;
  has_under: boolean;
  lines: Array<PickTaskCommitDiffLineOut>;
  task_id: number;
  temp_lines_n: number;
};
type PickTaskCommitDiffLineOut = {
  delta: number;
  item_id: number;
  picked_qty: number;
  req_qty: number;
  status: string;
};
type PickTaskCommitResult = {
  committed_at?: ((string | null) | Array<string | null>) | undefined;
  diff: PickTaskCommitDiffOut;
  idempotent?: boolean | undefined;
  next_actions?: Array<{}> | undefined;
  platform: string;
  ref: string;
  shop_id: string;
  status: string;
  task_id: number;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id: number;
};
type PickTaskDiffSummaryOut = {
  has_over: boolean;
  has_under: boolean;
  lines: Array<PickTaskDiffLineOut>;
  task_id: number;
};
type PickTaskDiffLineOut = {
  delta: number;
  item_id: number;
  picked_qty: number;
  req_qty: number;
  status: string;
};
type PickTaskOut = {
  assigned_to: (string | null) | Array<string | null>;
  commit_gate: GateOut;
  created_at: string;
  has_over: boolean;
  has_under: boolean;
  id: number;
  lines?: Array<PickTaskLineOut> | undefined;
  note: (string | null) | Array<string | null>;
  picked_total: number;
  print_job?: ((PrintJobOut | null) | Array<PrintJobOut | null>) | undefined;
  priority: number;
  ref: (string | null) | Array<string | null>;
  remain_total: number;
  req_total: number;
  scan_gate: GateOut;
  source: (string | null) | Array<string | null>;
  status: string;
  updated_at: string;
  warehouse_id: number;
};
type GateOut = {
  allowed: boolean;
  details?: Array<{}> | undefined;
  error_code?: ((string | null) | Array<string | null>) | undefined;
  message?: ((string | null) | Array<string | null>) | undefined;
  next_actions?: Array<{}> | undefined;
};
type PickTaskLineOut = {
  batch_code: (string | null) | Array<string | null>;
  created_at: string;
  delta: number;
  diff_status: string;
  id: number;
  item_id: number;
  note: (string | null) | Array<string | null>;
  order_id: (number | null) | Array<number | null>;
  order_line_id: (number | null) | Array<number | null>;
  picked_qty: number;
  remain_qty: number;
  req_qty: number;
  status: string;
  task_id: number;
  updated_at: string;
};
type PrintJobOut = {
  created_at: string;
  error: (string | null) | Array<string | null>;
  id: number;
  kind: string;
  payload: {};
  printed_at: (string | null) | Array<string | null>;
  ref_id: number;
  ref_type: string;
  requested_at: string;
  status: string;
  updated_at: string;
};
type PlatformEventListOut = {
  ok?: boolean | undefined;
  rows: Array<PlatformEventRow>;
};
type PlatformEventRow = {
  dedup_key?: ((string | null) | Array<string | null>) | undefined;
  event_type: string;
  id: number;
  occurred_at: string;
  payload: {};
  platform: string;
  shop_id: string;
  status: string;
};
type PlatformOrderConfirmCreateIn = {
  decisions?: Array<PlatformOrderConfirmCreateDecisionIn> | undefined;
  ext_order_no: string;
  platform: string;
  reason?: ((string | null) | Array<string | null>) | undefined;
  store_id: number;
};
type PlatformOrderConfirmCreateDecisionIn = {
  filled_code?: ((string | null) | Array<string | null>) | undefined;
  item_id: number;
  line_key?: ((string | null) | Array<string | null>) | undefined;
  line_no?: ((number | null) | Array<number | null>) | undefined;
  locator_kind?: ((string | null) | Array<string | null>) | undefined;
  locator_value?: ((string | null) | Array<string | null>) | undefined;
  note?: ((string | null) | Array<string | null>) | undefined;
  platform_sku_id?: ((string | null) | Array<string | null>) | undefined;
  qty: number;
};
type PlatformOrderConfirmCreateOut = {
  blocked_reasons?:
    | ((Array<string> | null) | Array<Array<string> | null>)
    | undefined;
  decisions?: Array<PlatformOrderConfirmCreateDecisionOut> | undefined;
  ext_order_no: string;
  facts_n: number;
  fulfillment_status?: ((string | null) | Array<string | null>) | undefined;
  id: (number | null) | Array<number | null>;
  manual_batch_id?: ((string | null) | Array<string | null>) | undefined;
  manual_override: boolean;
  manual_reason?: ((string | null) | Array<string | null>) | undefined;
  platform: string;
  ref: string;
  risk_flags?: Array<string> | undefined;
  status: string;
  store_id: number;
};
type PlatformOrderConfirmCreateDecisionOut = Partial<{
  fact_qty: (number | null) | Array<number | null>;
  filled_code: (string | null) | Array<string | null>;
  item_id: (number | null) | Array<number | null>;
  line_key: (string | null) | Array<string | null>;
  line_no: (number | null) | Array<number | null>;
  locator_kind: (string | null) | Array<string | null>;
  locator_value: (string | null) | Array<string | null>;
  note: (string | null) | Array<string | null>;
  qty: (number | null) | Array<number | null>;
}>;
type PlatformOrderIngestIn = {
  buyer_name?: ((string | null) | Array<string | null>) | undefined;
  buyer_phone?: ((string | null) | Array<string | null>) | undefined;
  city?: ((string | null) | Array<string | null>) | undefined;
  detail?: ((string | null) | Array<string | null>) | undefined;
  district?: ((string | null) | Array<string | null>) | undefined;
  ext_order_no: string;
  lines?: Array<PlatformOrderLineIn> | undefined;
  occurred_at?: ((string | null) | Array<string | null>) | undefined;
  platform: string;
  province?: ((string | null) | Array<string | null>) | undefined;
  raw_payload?: (({} | null) | Array<{} | null>) | undefined;
  receiver_name?: ((string | null) | Array<string | null>) | undefined;
  receiver_phone?: ((string | null) | Array<string | null>) | undefined;
  shop_id?: ((string | null) | Array<string | null>) | undefined;
  store_id?: ((number | null) | Array<number | null>) | undefined;
  store_name?: ((string | null) | Array<string | null>) | undefined;
  zipcode?: ((string | null) | Array<string | null>) | undefined;
};
type PlatformOrderLineIn = Partial<{
  extras: ({} | null) | Array<{} | null>;
  filled_code: (string | null) | Array<string | null>;
  qty: number;
  spec: (string | null) | Array<string | null>;
  title: (string | null) | Array<string | null>;
}>;
type PlatformOrderIngestOut = {
  allow_manual_continue?: boolean | undefined;
  blocked_reasons?:
    | ((Array<string> | null) | Array<Array<string> | null>)
    | undefined;
  facts_written: number;
  fulfillment_status?: ((string | null) | Array<string | null>) | undefined;
  id: (number | null) | Array<number | null>;
  next_actions?: Array<{}> | undefined;
  reason_code?: ((string | null) | Array<string | null>) | undefined;
  ref: string;
  resolved?: Array<PlatformOrderLineResult> | undefined;
  risk_flags?: Array<string> | undefined;
  risk_level?: ((string | null) | Array<string | null>) | undefined;
  risk_reason?: ((string | null) | Array<string | null>) | undefined;
  status: string;
  store_id: (number | null) | Array<number | null>;
  unresolved?: Array<PlatformOrderLineResult> | undefined;
};
type PlatformOrderLineResult = {
  expanded_items?: ((Array<{}> | null) | Array<Array<{}> | null>) | undefined;
  filled_code?: ((string | null) | Array<string | null>) | undefined;
  fsku_id?: ((number | null) | Array<number | null>) | undefined;
  hint?: ((string | null) | Array<string | null>) | undefined;
  next_actions?: ((Array<{}> | null) | Array<Array<{}> | null>) | undefined;
  qty: number;
  reason?: ((string | null) | Array<string | null>) | undefined;
  risk_flags?:
    | ((Array<string> | null) | Array<Array<string> | null>)
    | undefined;
  risk_level?: ((string | null) | Array<string | null>) | undefined;
  risk_reason?: ((string | null) | Array<string | null>) | undefined;
};
type PricingIntegrityFixArchiveReleaseOut = {
  dry_run: boolean;
  items?: Array<PricingIntegrityFixArchiveReleaseItemOut> | undefined;
  scheme_id: number;
};
type PricingIntegrityFixArchiveReleaseItemOut = {
  after_active?: ((boolean | null) | Array<boolean | null>) | undefined;
  after_province_member_n?:
    | ((number | null) | Array<number | null>)
    | undefined;
  error?: ((string | null) | Array<string | null>) | undefined;
  ok: boolean;
  would_release_n?: number | undefined;
  would_release_provinces?: Array<string> | undefined;
  zone_id: number;
  zone_name: string;
};
type PricingIntegrityFixDetachZoneBracketsOut = {
  dry_run: boolean;
  items?: Array<PricingIntegrityFixDetachZoneBracketsItemOut> | undefined;
  scheme_id: number;
};
type PricingIntegrityFixDetachZoneBracketsItemOut = {
  after_brackets_n?: ((number | null) | Array<number | null>) | undefined;
  error?: ((string | null) | Array<string | null>) | undefined;
  ok: boolean;
  province_member_n?: number | undefined;
  would_delete_brackets_n?: number | undefined;
  would_delete_ranges_preview?: Array<string> | undefined;
  zone_id: number;
  zone_name: string;
};
type PricingIntegrityFixUnbindArchivedTemplatesOut = {
  dry_run: boolean;
  items?: Array<PricingIntegrityFixUnbindArchivedTemplatesItemOut> | undefined;
  scheme_id: number;
};
type PricingIntegrityFixUnbindArchivedTemplatesItemOut = {
  after_unbound_zone_n?: ((number | null) | Array<number | null>) | undefined;
  error?: ((string | null) | Array<string | null>) | undefined;
  ok: boolean;
  template_id: number;
  template_name: string;
  template_status?: ((string | null) | Array<string | null>) | undefined;
  would_unbind_zone_ids?: Array<number> | undefined;
  would_unbind_zone_n?: number | undefined;
  would_unbind_zone_names?: Array<string> | undefined;
};
type PricingIntegrityReportOut = {
  archived_templates_still_referenced?:
    | Array<PricingIntegrityArchivedTemplateStillReferencedIssue>
    | undefined;
  archived_zones_still_occupying?:
    | Array<PricingIntegrityArchivedZoneIssue>
    | undefined;
  released_zones_still_priced?:
    | Array<PricingIntegrityReleasedZoneStillPricedIssue>
    | undefined;
  scheme_id: number;
  summary: PricingIntegrityReportSummary;
};
type PricingIntegrityArchivedTemplateStillReferencedIssue = {
  referencing_zone_ids?: Array<number> | undefined;
  referencing_zone_n?: number | undefined;
  referencing_zone_names?: Array<string> | undefined;
  scheme_id: number;
  suggested_action?: string | undefined;
  template_id: number;
  template_name: string;
  template_status: string;
};
type PricingIntegrityArchivedZoneIssue = {
  province_member_n?: number | undefined;
  province_members?: Array<string> | undefined;
  scheme_id: number;
  suggested_action?: string | undefined;
  zone_active: boolean;
  zone_id: number;
  zone_name: string;
};
type PricingIntegrityReleasedZoneStillPricedIssue = {
  brackets_n?: number | undefined;
  province_member_n?: number | undefined;
  scheme_id: number;
  segment_template_id?: ((number | null) | Array<number | null>) | undefined;
  suggested_action?: string | undefined;
  zone_active: boolean;
  zone_id: number;
  zone_name: string;
};
type PricingIntegrityReportSummary = Partial<{
  blocking: number;
  warning: number;
}>;
type ProvinceRouteListOut = {
  data: Array<ProvinceRouteItem>;
  ok?: boolean | undefined;
};
type ProvinceRouteItem = {
  active?: boolean | undefined;
  id: number;
  priority?: number | undefined;
  province: string;
  store_id: number;
  warehouse_active?: boolean | undefined;
  warehouse_code?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id: number;
  warehouse_name?: ((string | null) | Array<string | null>) | undefined;
};
type PurchaseOrderCreateV2 = {
  lines: Array<PurchaseOrderLineCreate>;
  purchase_time: string;
  purchaser: string;
  remark?: ((string | null) | Array<string | null>) | undefined;
  supplier_id: number;
  warehouse_id: number;
};
type PurchaseOrderLineCreate = {
  base_uom?: ((string | null) | Array<string | null>) | undefined;
  discount_amount?:
    | ((number | string | null) | Array<number | string | null>)
    | undefined;
  discount_note?: ((string | null) | Array<string | null>) | undefined;
  item_id: number;
  item_name?: ((string | null) | Array<string | null>) | undefined;
  item_sku?: ((string | null) | Array<string | null>) | undefined;
  line_no: number;
  purchase_uom?: ((string | null) | Array<string | null>) | undefined;
  qty_ordered: number;
  remark?: ((string | null) | Array<string | null>) | undefined;
  spec_text?: ((string | null) | Array<string | null>) | undefined;
  supply_price?:
    | ((number | string | null) | Array<number | string | null>)
    | undefined;
  units_per_case?: ((number | null) | Array<number | null>) | undefined;
};
type PurchaseOrderListItemOut = {
  canceled_at?: ((string | null) | Array<string | null>) | undefined;
  canceled_by?: ((number | null) | Array<number | null>) | undefined;
  canceled_reason?: ((string | null) | Array<string | null>) | undefined;
  close_note?: ((string | null) | Array<string | null>) | undefined;
  close_reason?: ((string | null) | Array<string | null>) | undefined;
  closed_at?: ((string | null) | Array<string | null>) | undefined;
  closed_by?: ((number | null) | Array<number | null>) | undefined;
  created_at: string;
  id: number;
  last_received_at?: ((string | null) | Array<string | null>) | undefined;
  lines?: Array<PurchaseOrderLineListOut> | undefined;
  purchase_time: string;
  purchaser: string;
  remark: (string | null) | Array<string | null>;
  status: string;
  supplier_id: number;
  supplier_name: string;
  total_amount: (string | null) | Array<string | null>;
  updated_at: string;
  warehouse_id: number;
  warehouse_name?: ((string | null) | Array<string | null>) | undefined;
};
type PurchaseOrderLineListOut = {
  base_uom?: ((string | null) | Array<string | null>) | undefined;
  created_at: string;
  discount_amount?: string | undefined;
  discount_note?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  item_id: number;
  line_no: number;
  po_id: number;
  purchase_uom?: ((string | null) | Array<string | null>) | undefined;
  qty_ordered: number;
  qty_ordered_base: number;
  qty_received_base: number;
  qty_remaining_base: number;
  remark?: ((string | null) | Array<string | null>) | undefined;
  supply_price?: ((string | null) | Array<string | null>) | undefined;
  units_per_case: number;
  updated_at: string;
};
type PurchaseOrderReceiveWorkbenchOut = {
  caps: WorkbenchCapsOut;
  explain?:
    | ((WorkbenchExplainOut | null) | Array<WorkbenchExplainOut | null>)
    | undefined;
  po_summary: PoSummaryOut;
  receipt?:
    | ((ReceiptSummaryOut | null) | Array<ReceiptSummaryOut | null>)
    | undefined;
  rows: Array<WorkbenchRowOut>;
};
type WorkbenchCapsOut = {
  can_confirm: boolean;
  can_start_draft: boolean;
  receipt_id?: ((number | null) | Array<number | null>) | undefined;
};
type WorkbenchExplainOut = {
  blocking_errors?: Array<{}> | undefined;
  confirmable: boolean;
  normalized_lines_preview?: Array<{}> | undefined;
};
type PoSummaryOut = {
  occurred_at?: ((string | null) | Array<string | null>) | undefined;
  po_id: number;
  status?: ((string | null) | Array<string | null>) | undefined;
  supplier_id?: ((number | null) | Array<number | null>) | undefined;
  supplier_name?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id: number;
};
type ReceiptSummaryOut = {
  occurred_at: string;
  receipt_id: number;
  ref: string;
  status: string;
};
type WorkbenchRowOut = {
  all_batches?: Array<WorkbenchBatchRowOut> | undefined;
  batches?: Array<WorkbenchBatchRowOut> | undefined;
  confirmed_batches?: Array<WorkbenchBatchRowOut> | undefined;
  confirmed_received_qty: number;
  draft_received_qty: number;
  item_id: number;
  item_name?: ((string | null) | Array<string | null>) | undefined;
  item_sku?: ((string | null) | Array<string | null>) | undefined;
  line_no: number;
  ordered_qty: number;
  po_line_id: number;
  remaining_qty: number;
};
type WorkbenchBatchRowOut = {
  batch_code: string;
  expiry_date?: ((string | null) | Array<string | null>) | undefined;
  production_date?: ((string | null) | Array<string | null>) | undefined;
  qty_received: number;
};
type PurchaseOrderWithLinesOut = {
  canceled_at?: ((string | null) | Array<string | null>) | undefined;
  canceled_by?: ((number | null) | Array<number | null>) | undefined;
  canceled_reason?: ((string | null) | Array<string | null>) | undefined;
  close_note?: ((string | null) | Array<string | null>) | undefined;
  close_reason?: ((string | null) | Array<string | null>) | undefined;
  closed_at?: ((string | null) | Array<string | null>) | undefined;
  closed_by?: ((number | null) | Array<number | null>) | undefined;
  created_at: string;
  id: number;
  last_received_at?: ((string | null) | Array<string | null>) | undefined;
  lines?: Array<PurchaseOrderLineOut> | undefined;
  purchase_time: string;
  purchaser: string;
  remark: (string | null) | Array<string | null>;
  status: string;
  supplier_id: number;
  supplier_name: string;
  total_amount: (string | null) | Array<string | null>;
  updated_at: string;
  warehouse_id: number;
};
type PurchaseOrderLineOut = {
  base_uom: (string | null) | Array<string | null>;
  brand?: ((string | null) | Array<string | null>) | undefined;
  category?: ((string | null) | Array<string | null>) | undefined;
  created_at: string;
  discount_amount?: string | undefined;
  discount_note?: ((string | null) | Array<string | null>) | undefined;
  enabled?: ((boolean | null) | Array<boolean | null>) | undefined;
  has_shelf_life?: ((boolean | null) | Array<boolean | null>) | undefined;
  id: number;
  item_id: number;
  item_name: (string | null) | Array<string | null>;
  item_sku: (string | null) | Array<string | null>;
  line_no: number;
  po_id: number;
  primary_barcode?: ((string | null) | Array<string | null>) | undefined;
  purchase_uom: (string | null) | Array<string | null>;
  qty_ordered: number;
  qty_ordered_base: number;
  qty_received: number;
  qty_received_base: number;
  qty_remaining: number;
  qty_remaining_base: number;
  remark: (string | null) | Array<string | null>;
  shelf_life_unit?: ((string | null) | Array<string | null>) | undefined;
  shelf_life_value?: ((number | null) | Array<number | null>) | undefined;
  sku?: ((string | null) | Array<string | null>) | undefined;
  spec_text: (string | null) | Array<string | null>;
  supplier_id?: ((number | null) | Array<number | null>) | undefined;
  supplier_name?: ((string | null) | Array<string | null>) | undefined;
  supply_price: (string | null) | Array<string | null>;
  units_per_case: number;
  uom?: ((string | null) | Array<string | null>) | undefined;
  updated_at: string;
  weight_kg?: ((string | null) | Array<string | null>) | undefined;
};
type QuoteCalcIn = {
  dest: QuoteDestIn;
  flags?: Array<string> | undefined;
  height_cm?: ((number | null) | Array<number | null>) | undefined;
  length_cm?: ((number | null) | Array<number | null>) | undefined;
  real_weight_kg: number;
  scheme_id: number;
  warehouse_id: number;
  width_cm?: ((number | null) | Array<number | null>) | undefined;
};
type QuoteDestIn = {
  city?: ((string | null) | Array<string | null>) | undefined;
  city_code?: ((string | null) | Array<string | null>) | undefined;
  district?: ((string | null) | Array<string | null>) | undefined;
  province?: ((string | null) | Array<string | null>) | undefined;
  province_code: string;
};
type QuoteRecommendIn = {
  dest: QuoteDestIn;
  flags?: Array<string> | undefined;
  height_cm?: ((number | null) | Array<number | null>) | undefined;
  length_cm?: ((number | null) | Array<number | null>) | undefined;
  max_results?: number | undefined;
  provider_ids?: Array<number> | undefined;
  real_weight_kg: number;
  warehouse_id: number;
  width_cm?: ((number | null) | Array<number | null>) | undefined;
};
type QuoteRecommendOut = {
  ok: boolean;
  quotes: Array<QuoteRecommendItemOut>;
  recommended_scheme_id?: ((number | null) | Array<number | null>) | undefined;
};
type QuoteRecommendItemOut = {
  bracket?: (({} | null) | Array<{} | null>) | undefined;
  breakdown: {};
  carrier_code?: ((string | null) | Array<string | null>) | undefined;
  carrier_name: string;
  currency?: ((string | null) | Array<string | null>) | undefined;
  provider_id: number;
  quote_status: string;
  reasons?: Array<string> | undefined;
  scheme_id: number;
  scheme_name: string;
  total_amount: number;
  weight: {};
  zone?: (({} | null) | Array<{} | null>) | undefined;
};
type ReturnOrderRefDetailOut = {
  ext_order_no?: ((string | null) | Array<string | null>) | undefined;
  order_ref: string;
  platform?: ((string | null) | Array<string | null>) | undefined;
  remaining_qty?: ((number | null) | Array<number | null>) | undefined;
  shipping?:
    | (
        | (ReturnOrderRefShippingOut | null)
        | Array<ReturnOrderRefShippingOut | null>
      )
    | undefined;
  shop_id?: ((string | null) | Array<string | null>) | undefined;
  summary: ReturnOrderRefSummaryOut;
};
type ReturnOrderRefShippingOut = Partial<{
  carrier_code: (string | null) | Array<string | null>;
  carrier_name: (string | null) | Array<string | null>;
  cost_estimated: (number | null) | Array<number | null>;
  gross_weight_kg: (number | null) | Array<number | null>;
  meta: ({} | null) | Array<{} | null>;
  receiver:
    | (ReturnOrderRefReceiverOut | null)
    | Array<ReturnOrderRefReceiverOut | null>;
  shipped_at: (string | null) | Array<string | null>;
  status: (string | null) | Array<string | null>;
  tracking_no: (string | null) | Array<string | null>;
}>;
type ReturnOrderRefReceiverOut = Partial<{
  city: (string | null) | Array<string | null>;
  detail: (string | null) | Array<string | null>;
  district: (string | null) | Array<string | null>;
  name: (string | null) | Array<string | null>;
  phone: (string | null) | Array<string | null>;
  province: (string | null) | Array<string | null>;
}>;
type ReturnOrderRefSummaryOut = {
  lines: Array<ReturnOrderRefSummaryLine>;
  order_ref: string;
  ship_reasons?: Array<string> | undefined;
};
type ReturnOrderRefSummaryLine = {
  batch_code: string;
  item_id: number;
  item_name?: ((string | null) | Array<string | null>) | undefined;
  shipped_qty: number;
  warehouse_id: number;
};
type ReturnTaskOut = {
  created_at: string;
  id: number;
  lines?: Array<ReturnTaskLineOut> | undefined;
  order_id: string;
  remark: (string | null) | Array<string | null>;
  status: string;
  updated_at: string;
  warehouse_id: number;
};
type ReturnTaskLineOut = {
  batch_code: string;
  committed_qty: (number | null) | Array<number | null>;
  expected_qty: (number | null) | Array<number | null>;
  id: number;
  item_id: number;
  item_name: (string | null) | Array<string | null>;
  order_line_id?: ((number | null) | Array<number | null>) | undefined;
  picked_qty: number;
  remark: (string | null) | Array<string | null>;
  status: string;
  task_id: number;
};
type RoleOut = {
  description?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  name: string;
  permissions?: Array<PermissionOut> | undefined;
};
type PermissionOut = {
  description?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  name: string;
};
type SchemeCreateIn = {
  active?: boolean | undefined;
  billable_weight_rule?: (({} | null) | Array<{} | null>) | undefined;
  currency?: string | undefined;
  default_pricing_mode?: string | undefined;
  effective_from?: ((string | null) | Array<string | null>) | undefined;
  effective_to?: ((string | null) | Array<string | null>) | undefined;
  name: string;
  segments_json?:
    | ((Array<WeightSegmentIn> | null) | Array<Array<WeightSegmentIn> | null>)
    | undefined;
};
type WeightSegmentIn = {
  max?: string | undefined;
  min: string;
};
type SchemeDetailOut = {
  data: SchemeOut;
  ok?: boolean | undefined;
};
type SchemeOut = {
  active: boolean;
  archived_at?: ((string | null) | Array<string | null>) | undefined;
  billable_weight_rule?: (({} | null) | Array<{} | null>) | undefined;
  currency: string;
  default_pricing_mode: string;
  default_segment_template_id?:
    | ((number | null) | Array<number | null>)
    | undefined;
  dest_adjustments?: Array<DestAdjustmentOut> | undefined;
  effective_from?: ((string | null) | Array<string | null>) | undefined;
  effective_to?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  name: string;
  segments?: Array<SchemeSegmentOut> | undefined;
  segments_json?:
    | ((Array<WeightSegmentIn> | null) | Array<Array<WeightSegmentIn> | null>)
    | undefined;
  segments_updated_at?: ((string | null) | Array<string | null>) | undefined;
  shipping_provider_id: number;
  shipping_provider_name: string;
  surcharges?: Array<SurchargeOut> | undefined;
  zones?: Array<ZoneOut> | undefined;
};
type DestAdjustmentOut = {
  active: boolean;
  amount: number;
  city?: ((string | null) | Array<string | null>) | undefined;
  city_code?: ((string | null) | Array<string | null>) | undefined;
  city_name?: ((string | null) | Array<string | null>) | undefined;
  created_at: string;
  id: number;
  priority: number;
  province: string;
  province_code: string;
  province_name?: ((string | null) | Array<string | null>) | undefined;
  scheme_id: number;
  scope: string;
  updated_at: string;
};
type SchemeSegmentOut = {
  active?: boolean | undefined;
  id: number;
  max_kg?: unknown | undefined;
  min_kg: unknown;
  ord: number;
  scheme_id: number;
};
type SurchargeOut = {
  active: boolean;
  amount_json: {};
  condition_json: {};
  id: number;
  name: string;
  scheme_id: number;
};
type ZoneOut = {
  active: boolean;
  brackets?: Array<ZoneBracketOut> | undefined;
  id: number;
  members?: Array<ZoneMemberOut> | undefined;
  name: string;
  scheme_id: number;
  segment_template_id?: ((number | null) | Array<number | null>) | undefined;
};
type ZoneMemberOut = {
  id: number;
  level: string;
  value: string;
  zone_id: number;
};
type SchemeListOut = {
  data: Array<SchemeOut>;
  ok?: boolean | undefined;
};
type SchemeUpdateIn = Partial<{
  active: (boolean | null) | Array<boolean | null>;
  archived_at: (string | null) | Array<string | null>;
  billable_weight_rule: ({} | null) | Array<{} | null>;
  currency: (string | null) | Array<string | null>;
  default_pricing_mode: (string | null) | Array<string | null>;
  effective_from: (string | null) | Array<string | null>;
  effective_to: (string | null) | Array<string | null>;
  name: (string | null) | Array<string | null>;
  segments_json:
    | (Array<WeightSegmentIn> | null)
    | Array<Array<WeightSegmentIn> | null>;
}>;
type SchemeWarehouseBindOut = {
  data: SchemeWarehouseOut;
  ok: boolean;
};
type SchemeWarehouseOut = {
  active: boolean;
  scheme_id: number;
  warehouse: WarehouseLiteOut;
  warehouse_id: number;
};
type WarehouseLiteOut = {
  active: boolean;
  code?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  name: string;
};
type SchemeWarehousePatchOut = {
  data: SchemeWarehouseOut;
  ok: boolean;
};
type SchemeWarehousesGetOut = {
  data: Array<SchemeWarehouseOut>;
  ok: boolean;
};
type SegmentTemplateDetailOut = {
  data: SegmentTemplateOut;
  ok?: boolean | undefined;
};
type SegmentTemplateOut = {
  created_at?: ((string | null) | Array<string | null>) | undefined;
  effective_from?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  is_active: boolean;
  items?: Array<SegmentTemplateItemOut> | undefined;
  name: string;
  published_at?: ((string | null) | Array<string | null>) | undefined;
  scheme_id: number;
  status: string;
  updated_at?: ((string | null) | Array<string | null>) | undefined;
};
type SegmentTemplateItemOut = {
  active?: boolean | undefined;
  id: number;
  max_kg?: unknown | undefined;
  min_kg: unknown;
  ord: number;
  template_id: number;
};
type SegmentTemplateItemsPutIn = {
  items: Array<SegmentTemplateItemIn>;
};
type SegmentTemplateItemIn = {
  active?: boolean | undefined;
  max_kg?: unknown | undefined;
  min_kg: unknown;
  ord: number;
};
type SegmentTemplateListOut = {
  data: Array<SegmentTemplateOut>;
  ok?: boolean | undefined;
};
type ShipCalcResponse = {
  dest?: ((string | null) | Array<string | null>) | undefined;
  ok?: boolean | undefined;
  quotes: Array<ShipQuoteOut>;
  recommended?:
    | ((ShipRecommendedOut | null) | Array<ShipRecommendedOut | null>)
    | undefined;
  weight_kg: number;
};
type ShipQuoteOut = {
  breakdown?: (({} | null) | Array<{} | null>) | undefined;
  carrier_code?: ((string | null) | Array<string | null>) | undefined;
  carrier_name: string;
  currency?: ((string | null) | Array<string | null>) | undefined;
  est_cost?: ((number | null) | Array<number | null>) | undefined;
  eta?: ((string | null) | Array<string | null>) | undefined;
  provider_id: number;
  quote_status: string;
  reasons?: Array<string> | undefined;
  scheme_id: number;
  scheme_name: string;
};
type ShipRecommendedOut = {
  carrier_code?: ((string | null) | Array<string | null>) | undefined;
  currency?: ((number | null) | Array<number | null>) | undefined;
  est_cost?: ((number | null) | Array<number | null>) | undefined;
  provider_id: number;
  scheme_id: number;
};
type ShipPrepareResponse = {
  address_detail?: ((string | null) | Array<string | null>) | undefined;
  blocked_reasons?: Array<string> | undefined;
  candidate_warehouses?: Array<CandidateWarehouseOut> | undefined;
  city?: ((string | null) | Array<string | null>) | undefined;
  district?: ((string | null) | Array<string | null>) | undefined;
  ext_order_no: string;
  fulfillment_scan?: Array<FulfillmentScanWarehouseOut> | undefined;
  fulfillment_status?: ((string | null) | Array<string | null>) | undefined;
  items?: Array<ShipPrepareItem> | undefined;
  ok?: boolean | undefined;
  order_id: number;
  platform: string;
  province?: ((string | null) | Array<string | null>) | undefined;
  receiver_name?: ((string | null) | Array<string | null>) | undefined;
  receiver_phone?: ((string | null) | Array<string | null>) | undefined;
  ref: string;
  shop_id: string;
  total_qty?: number | undefined;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id?: ((number | null) | Array<number | null>) | undefined;
  warehouse_reason?: ((string | null) | Array<string | null>) | undefined;
  weight_kg?: ((number | null) | Array<number | null>) | undefined;
};
type CandidateWarehouseOut = {
  priority?: number | undefined;
  warehouse_active?: boolean | undefined;
  warehouse_code?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id: number;
  warehouse_name?: ((string | null) | Array<string | null>) | undefined;
};
type ShipPrepareItem = {
  item_id: number;
  qty: number;
};
type ShipRequest = {
  lines?: Array<ShipLineIn> | undefined;
  occurred_at?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id: number;
};
type ShipLineIn = {
  item_id: number;
  qty: number;
};
type ShippingByCarrierResponse = {
  ok?: boolean | undefined;
  rows: Array<ShippingByCarrierRow>;
};
type ShippingByCarrierRow = {
  avg_cost: number;
  carrier_code?: ((string | null) | Array<string | null>) | undefined;
  carrier_name?: ((string | null) | Array<string | null>) | undefined;
  ship_cnt: number;
  total_cost: number;
};
type ShippingByProvinceResponse = {
  ok?: boolean | undefined;
  rows: Array<ShippingByProvinceRow>;
};
type ShippingByProvinceRow = {
  avg_cost: number;
  province?: ((string | null) | Array<string | null>) | undefined;
  ship_cnt: number;
  total_cost: number;
};
type ShippingByShopResponse = {
  ok?: boolean | undefined;
  rows: Array<ShippingByShopRow>;
};
type ShippingByShopRow = {
  avg_cost: number;
  platform: string;
  ship_cnt: number;
  shop_id: string;
  total_cost: number;
};
type ShippingByWarehouseResponse = {
  ok?: boolean | undefined;
  rows: Array<ShippingByWarehouseRow>;
};
type ShippingByWarehouseRow = {
  avg_cost: number;
  ship_cnt: number;
  total_cost: number;
  warehouse_id?: ((number | null) | Array<number | null>) | undefined;
};
type ShippingDailyResponse = {
  ok?: boolean | undefined;
  rows: Array<ShippingDailyRow>;
};
type ShippingDailyRow = {
  avg_cost: number;
  ship_cnt: number;
  stat_date: string;
  total_cost: number;
};
type ShippingListResponse = {
  ok?: boolean | undefined;
  rows: Array<ShippingListRow>;
  total: number;
};
type ShippingListRow = {
  carrier_code?: ((string | null) | Array<string | null>) | undefined;
  carrier_name?: ((string | null) | Array<string | null>) | undefined;
  cost_estimated?: ((number | null) | Array<number | null>) | undefined;
  created_at: string;
  gross_weight_kg?: ((number | null) | Array<number | null>) | undefined;
  id: number;
  meta?: (({} | null) | Array<{} | null>) | undefined;
  order_ref: string;
  packaging_weight_kg?: ((number | null) | Array<number | null>) | undefined;
  platform: string;
  shop_id: string;
  status?: ((string | null) | Array<string | null>) | undefined;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id?: ((number | null) | Array<number | null>) | undefined;
};
type ShippingProviderCreateOut = {
  data: ShippingProviderOut;
  ok?: boolean | undefined;
};
type ShippingProviderOut = {
  active?: boolean | undefined;
  address?: ((string | null) | Array<string | null>) | undefined;
  code?: ((string | null) | Array<string | null>) | undefined;
  contacts?: Array<ShippingProviderContactOut> | undefined;
  id: number;
  name: string;
  pricing_model?: (({} | null) | Array<{} | null>) | undefined;
  priority?: number | undefined;
  region_rules?: (({} | null) | Array<{} | null>) | undefined;
  warehouse_id: number;
};
type ShippingProviderContactOut = {
  active: boolean;
  email?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  is_primary: boolean;
  name: string;
  phone?: ((string | null) | Array<string | null>) | undefined;
  role: string;
  shipping_provider_id: number;
  wechat?: ((string | null) | Array<string | null>) | undefined;
};
type ShippingProviderDetailOut = {
  data: ShippingProviderOut;
  ok?: boolean | undefined;
};
type ShippingProviderListOut = {
  data: Array<ShippingProviderOut>;
  ok?: boolean | undefined;
};
type ShippingProviderUpdateOut = {
  data: ShippingProviderOut;
  ok?: boolean | undefined;
};
type ShippingQuoteFailuresMetricsResponse = {
  calc_failed_total: number;
  calc_failures_by_code?: {} | undefined;
  day: string;
  details?: Array<ShippingQuoteFailureDetail> | undefined;
  platform?: ((string | null) | Array<string | null>) | undefined;
  recommend_failed_total: number;
  recommend_failures_by_code?: {} | undefined;
};
type ShippingQuoteFailureDetail = {
  created_at: string;
  error_code: string;
  event: string;
  message?: ((string | null) | Array<string | null>) | undefined;
  ref: string;
};
type StockBatchQueryOut = {
  items?: Array<StockBatchRow> | undefined;
  page: number;
  page_size: number;
  total: number;
};
type StockBatchRow = {
  batch_code: string;
  batch_id: number;
  days_to_expiry?: ((number | null) | Array<number | null>) | undefined;
  expiry_date?: ((string | null) | Array<string | null>) | undefined;
  item_id: number;
  production_date?: ((string | null) | Array<string | null>) | undefined;
  qty: number;
  warehouse_id: number;
};
type StoreListOut = {
  data: Array<StoreListItem>;
  ok?: boolean | undefined;
};
type StoreListItem = {
  active: boolean;
  contact_name?: ((string | null) | Array<string | null>) | undefined;
  contact_phone?: ((string | null) | Array<string | null>) | undefined;
  email?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  name: string;
  platform: string;
  route_mode: string;
  shop_id: string;
  shop_type?: string | undefined;
};
type SupplierOut = {
  active: boolean;
  code: string;
  contacts: Array<SupplierContactOut>;
  id: number;
  name: string;
  website?: ((string | null) | Array<string | null>) | undefined;
};
type SupplierContactOut = {
  active: boolean;
  email?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  is_primary: boolean;
  name: string;
  phone?: ((string | null) | Array<string | null>) | undefined;
  role: string;
  supplier_id: number;
  wechat?: ((string | null) | Array<string | null>) | undefined;
};
type TraceResponseModel = {
  events: Array<TraceEventModel>;
  trace_id: string;
  warehouse_id?: ((number | null) | Array<number | null>) | undefined;
};
type TraceEventModel = {
  batch_code?: ((string | null) | Array<string | null>) | undefined;
  item_id?: ((number | null) | Array<number | null>) | undefined;
  kind: string;
  message?: ((string | null) | Array<string | null>) | undefined;
  movement_type?: ((string | null) | Array<string | null>) | undefined;
  raw: {};
  reason?: ((string | null) | Array<string | null>) | undefined;
  ref?: ((string | null) | Array<string | null>) | undefined;
  source: string;
  summary: string;
  trace_id?: ((string | null) | Array<string | null>) | undefined;
  ts?: ((string | null) | Array<string | null>) | undefined;
  warehouse_id?: ((number | null) | Array<number | null>) | undefined;
};
type WarehouseActiveCarriersOut = {
  active_carriers: Array<ActiveCarrierOut>;
  active_carriers_count: number;
  warehouse_id: number;
};
type ActiveCarrierOut = {
  code?: ((string | null) | Array<string | null>) | undefined;
  name: string;
  priority: number;
  provider_id: number;
};
type WarehouseActiveCarriersSummaryOut = {
  data: Array<WarehouseActiveCarriersOut>;
  ok: boolean;
};
type WarehouseCreateOut = {
  data: WarehouseOut;
  ok?: boolean | undefined;
};
type WarehouseOut = {
  active?: boolean | undefined;
  address?: ((string | null) | Array<string | null>) | undefined;
  area_sqm?: ((number | null) | Array<number | null>) | undefined;
  code?: ((string | null) | Array<string | null>) | undefined;
  contact_name?: ((string | null) | Array<string | null>) | undefined;
  contact_phone?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  name: string;
};
type WarehouseDetailOut = {
  data: WarehouseOut;
  ok?: boolean | undefined;
};
type WarehouseListOut = {
  data: Array<WarehouseOut>;
  ok?: boolean | undefined;
};
type WarehouseServiceCityOccupancyOut = Partial<{
  rows: Array<WarehouseServiceCityOccupancyRow>;
}>;
type WarehouseServiceCityOccupancyRow = {
  city_code: string;
  warehouse_id: number;
};
type WarehouseServiceProvinceOccupancyOut = Partial<{
  rows: Array<WarehouseServiceProvinceOccupancyRow>;
}>;
type WarehouseServiceProvinceOccupancyRow = {
  province_code: string;
  warehouse_id: number;
};
type WarehouseShippingProviderBindOut = {
  data: WarehouseShippingProviderOut;
  ok?: boolean | undefined;
};
type WarehouseShippingProviderOut = {
  active?: boolean | undefined;
  pickup_cutoff_time?: ((string | null) | Array<string | null>) | undefined;
  priority?: number | undefined;
  provider: ShippingProviderLiteOut;
  remark?: ((string | null) | Array<string | null>) | undefined;
  shipping_provider_id: number;
  warehouse_id: number;
};
type ShippingProviderLiteOut = {
  active?: boolean | undefined;
  code?: ((string | null) | Array<string | null>) | undefined;
  id: number;
  name: string;
};
type WarehouseShippingProviderBulkUpsertIn = Partial<{
  disable_missing: boolean;
  items: Array<WarehouseShippingProviderUpsertItemIn>;
}>;
type WarehouseShippingProviderUpsertItemIn = {
  active?: boolean | undefined;
  pickup_cutoff_time?: ((string | null) | Array<string | null>) | undefined;
  priority?: number | undefined;
  remark?: ((string | null) | Array<string | null>) | undefined;
  shipping_provider_id: number;
};
type WarehouseShippingProviderBulkUpsertOut = {
  data: Array<WarehouseShippingProviderOut>;
  ok?: boolean | undefined;
};
type WarehouseShippingProviderListOut = {
  data: Array<WarehouseShippingProviderOut>;
  ok?: boolean | undefined;
};
type WarehouseShippingProviderUpdateOut = {
  data: WarehouseShippingProviderOut;
  ok?: boolean | undefined;
};
type WarehouseUpdateOut = {
  data: WarehouseOut;
  ok?: boolean | undefined;
};
type ZoneBracketsMatrixGroupOut = {
  segment_template_id: number;
  segments?: Array<SegmentRangeOut> | undefined;
  template_is_active: boolean;
  template_name: string;
  template_status: string;
  zones?: Array<ZoneOut> | undefined;
};
type SegmentRangeOut = {
  active?: boolean | undefined;
  max_kg?: ((string | null) | Array<string | null>) | undefined;
  min_kg: string;
  ord: number;
};
type ZoneBracketsMatrixOut = {
  groups?: Array<ZoneBracketsMatrixGroupOut> | undefined;
  ok?: boolean | undefined;
  scheme_id: number;
  unbound_zones?: Array<ZoneOut> | undefined;
};

const CountRequest = z
  .object({
    batch_code: z.union([z.string(), z.null()]).optional(),
    expiry_date: z.union([z.string(), z.null()]).optional(),
    item_id: z.number().int(),
    location_id: z.number().int(),
    occurred_at: z.string().datetime({ offset: true }).optional(),
    production_date: z.union([z.string(), z.null()]).optional(),
    qty: z.number().int().gte(0),
    ref: z.string(),
  })
  .passthrough();
const CountResponse = z
  .object({
    after: z.number().int(),
    batch_code: z.union([z.string(), z.null()]),
    item_id: z.number().int(),
    location_id: z.number().int(),
    occurred_at: z.string().datetime({ offset: true }),
    ok: z.boolean().optional().default(true),
    ref: z.string(),
  })
  .passthrough();
const ValidationError: z.ZodType<ValidationError> = z
  .object({
    ctx: z.object({}).partial().passthrough().optional(),
    input: z.unknown().optional(),
    loc: z.array(z.union([z.string(), z.number()])),
    msg: z.string(),
    type: z.string(),
  })
  .passthrough();
const HTTPValidationError: z.ZodType<HTTPValidationError> = z
  .object({ detail: z.array(ValidationError) })
  .partial()
  .passthrough();
const warehouse_id = z.union([z.number(), z.null()]).optional();
const TraceEventModel: z.ZodType<TraceEventModel> = z
  .object({
    batch_code: z.union([z.string(), z.null()]).optional(),
    item_id: z.union([z.number(), z.null()]).optional(),
    kind: z.string(),
    message: z.union([z.string(), z.null()]).optional(),
    movement_type: z.union([z.string(), z.null()]).optional(),
    raw: z.object({}).partial().passthrough(),
    reason: z.union([z.string(), z.null()]).optional(),
    ref: z.union([z.string(), z.null()]).optional(),
    source: z.string(),
    summary: z.string(),
    trace_id: z.union([z.string(), z.null()]).optional(),
    ts: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const TraceResponseModel: z.ZodType<TraceResponseModel> = z
  .object({
    events: z.array(TraceEventModel),
    trace_id: z.string(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const DestAdjustmentUpdateIn = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    amount: z.union([z.number(), z.null()]),
    city_code: z.union([z.string(), z.null()]),
    city_name: z.union([z.string(), z.null()]),
    priority: z.union([z.number(), z.null()]),
    province_code: z.union([z.string(), z.null()]),
    province_name: z.union([z.string(), z.null()]),
    scope: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const DestAdjustmentOut: z.ZodType<DestAdjustmentOut> = z
  .object({
    active: z.boolean(),
    amount: z.number(),
    city: z.union([z.string(), z.null()]).optional(),
    city_code: z.union([z.string(), z.null()]).optional(),
    city_name: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    id: z.number().int(),
    priority: z.number().int(),
    province: z.string(),
    province_code: z.string(),
    province_name: z.union([z.string(), z.null()]).optional(),
    scheme_id: z.number().int(),
    scope: z.string(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const FakeGenerateParams: z.ZodType<FakeGenerateParams> = z
  .object({
    count: z.number().int().gte(1).lte(200).default(10),
    lines_max: z.number().int().gte(1).lte(10).default(3),
    lines_min: z.number().int().gte(1).lte(10).default(1),
    qty_max: z.number().int().gte(1).lte(100).default(3),
    qty_min: z.number().int().gte(1).lte(100).default(1),
    rng_seed: z.number().int().gte(0).lte(10000000).default(42),
  })
  .partial()
  .passthrough();
const DevFakeOrdersGenerateIn: z.ZodType<DevFakeOrdersGenerateIn> = z
  .object({
    generate: FakeGenerateParams.optional(),
    seed: z.object({}).partial().passthrough(),
  })
  .passthrough();
const DevFakeOrdersGenerateOut = z
  .object({
    batch_id: z.string(),
    gen_stats: z.object({}).partial().passthrough(),
    orders: z.array(z.object({}).partial().passthrough()),
  })
  .passthrough();
const DevFakeOrdersRunIn: z.ZodType<DevFakeOrdersRunIn> = z
  .object({
    generate: FakeGenerateParams.optional(),
    seed: z.object({}).partial().passthrough(),
    watch_filled_codes: z.array(z.string()).optional(),
    with_replay: z.boolean().optional().default(true),
  })
  .passthrough();
const DevFakeOrdersRunOut = z
  .object({
    gen_stats: z.object({}).partial().passthrough(),
    report: z.object({}).partial().passthrough(),
  })
  .passthrough();
const platform = z.union([z.string(), z.null()]).optional();
const time_from = z.union([z.unknown(), z.null()]).optional();
const DevOrderSummary = z
  .object({
    created_at: z.string().datetime({ offset: true }),
    ext_order_no: z.string(),
    id: z.number().int(),
    order_amount: z.union([z.number(), z.null()]).optional(),
    pay_amount: z.union([z.number(), z.null()]).optional(),
    platform: z.string(),
    shop_id: z.string(),
    status: z.union([z.string(), z.null()]).optional(),
    updated_at: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const DevOrderReconcileLine: z.ZodType<DevOrderReconcileLine> = z
  .object({
    item_id: z.number().int(),
    qty_ordered: z.number().int(),
    qty_returned: z.number().int(),
    qty_shipped: z.number().int(),
    remaining_refundable: z.number().int(),
    sku_id: z.union([z.string(), z.null()]).optional(),
    title: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const DevOrderReconcileResultModel: z.ZodType<DevOrderReconcileResultModel> = z
  .object({
    ext_order_no: z.string(),
    issues: z.array(z.string()).optional(),
    lines: z.array(DevOrderReconcileLine).optional(),
    order_id: z.number().int(),
    platform: z.string(),
    shop_id: z.string(),
  })
  .passthrough();
const DevDemoOrderOut = z
  .object({
    ext_order_no: z.string(),
    order_id: z.number().int(),
    platform: z.string(),
    shop_id: z.string(),
    trace_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const DevReconcileRangeResult = z
  .object({
    count: z.number().int(),
    order_ids: z.array(z.number().int()).optional(),
  })
  .passthrough();
const DevOrderInfo: z.ZodType<DevOrderInfo> = z
  .object({
    created_at: z.string().datetime({ offset: true }),
    ext_order_no: z.string(),
    id: z.number().int(),
    order_amount: z.union([z.number(), z.null()]).optional(),
    pay_amount: z.union([z.number(), z.null()]).optional(),
    platform: z.string(),
    shop_id: z.string(),
    status: z.union([z.string(), z.null()]).optional(),
    trace_id: z.union([z.string(), z.null()]).optional(),
    updated_at: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const DevOrderView: z.ZodType<DevOrderView> = z
  .object({
    order: DevOrderInfo,
    trace_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const DevEnsureWarehouseOut = z
  .object({
    ext_order_no: z.string(),
    message: z.union([z.string(), z.null()]).optional(),
    ok: z.boolean(),
    order_id: z.number().int(),
    platform: z.string(),
    shop_id: z.string(),
    source: z.string(),
    store_id: z.union([z.number(), z.null()]).optional(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const DevOrderItemFact: z.ZodType<DevOrderItemFact> = z
  .object({
    item_id: z.number().int(),
    qty_ordered: z.number().int(),
    qty_remaining_refundable: z.number().int(),
    qty_returned: z.number().int(),
    qty_shipped: z.number().int(),
    sku_id: z.union([z.string(), z.null()]).optional(),
    title: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const DevOrderFacts: z.ZodType<DevOrderFacts> = z
  .object({ items: z.array(DevOrderItemFact).optional(), order: DevOrderInfo })
  .passthrough();
const PlatformEventRow: z.ZodType<PlatformEventRow> = z
  .object({
    dedup_key: z.union([z.string(), z.null()]).optional(),
    event_type: z.string(),
    id: z.number().int(),
    occurred_at: z.string().datetime({ offset: true }),
    payload: z.object({}).partial().passthrough(),
    platform: z.string(),
    shop_id: z.string(),
    status: z.string(),
  })
  .passthrough();
const PlatformEventListOut: z.ZodType<PlatformEventListOut> = z
  .object({
    ok: z.boolean().optional().default(true),
    rows: z.array(PlatformEventRow),
  })
  .passthrough();
const FakeOrderStatusIn = z
  .object({
    delivered_at: z.union([z.string(), z.null()]).optional(),
    ext_order_no: z.string().min(1),
    extras: z.object({}).partial().passthrough().optional(),
    platform: z.string().min(1).max(32),
    platform_status: z.string(),
    shop_id: z.string().min(1),
  })
  .passthrough();
const FakeOrderStatusOut = z
  .object({
    dedup_key: z.union([z.string(), z.null()]).optional(),
    ext_order_no: z.string(),
    id: z.number().int(),
    occurred_at: z.string().datetime({ offset: true }),
    ok: z.boolean().optional().default(true),
    platform: z.string(),
    platform_status: z.string(),
    shop_id: z.string(),
  })
  .passthrough();
const FinanceDailyRow = z
  .object({
    day: z.string(),
    fulfillment_ratio: z.union([z.string(), z.null()]).optional(),
    gross_margin: z.union([z.string(), z.null()]).optional(),
    gross_profit: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    purchase_cost: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    revenue: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    shipping_cost: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
  })
  .passthrough();
const FinanceShopRow = z
  .object({
    fulfillment_ratio: z.union([z.string(), z.null()]).optional(),
    gross_margin: z.union([z.string(), z.null()]).optional(),
    gross_profit: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    platform: z.string(),
    purchase_cost: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    revenue: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    shipping_cost: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    shop_id: z.string(),
  })
  .passthrough();
const FinanceSkuRow = z
  .object({
    gross_margin: z.union([z.string(), z.null()]).optional(),
    gross_profit: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    item_id: z.number().int(),
    purchase_cost: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    qty_sold: z.number().int(),
    revenue: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    sku_id: z.union([z.string(), z.null()]).optional(),
    title: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const FskuListItem: z.ZodType<FskuListItem> = z
  .object({
    code: z.string(),
    components_summary: z.string(),
    components_summary_name: z.string(),
    id: z.number().int(),
    name: z.string(),
    published_at: z.union([z.string(), z.null()]),
    retired_at: z.union([z.string(), z.null()]),
    shape: z.enum(["single", "bundle"]),
    status: z.string(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const FskuListOut: z.ZodType<FskuListOut> = z
  .object({
    items: z.array(FskuListItem),
    limit: z.number().int(),
    offset: z.number().int(),
    total: z.number().int(),
  })
  .passthrough();
const FskuCreateIn = z
  .object({
    code: z.union([z.string(), z.null()]).optional(),
    name: z.string().min(1).max(200),
    shape: z.enum(["single", "bundle"]).optional().default("bundle"),
  })
  .passthrough();
const FskuComponentOut: z.ZodType<FskuComponentOut> = z
  .object({
    item_id: z.number().int(),
    qty: z.number().int(),
    role: z.enum(["primary", "gift"]),
  })
  .passthrough();
const FskuDetailOut: z.ZodType<FskuDetailOut> = z
  .object({
    code: z.string(),
    components: z.array(FskuComponentOut),
    created_at: z.string().datetime({ offset: true }),
    id: z.number().int(),
    name: z.string(),
    published_at: z.union([z.string(), z.null()]),
    retired_at: z.union([z.string(), z.null()]),
    shape: z.enum(["single", "bundle"]),
    status: z.string(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const FskuNameUpdateIn = z
  .object({ name: z.string().min(1).max(200) })
  .passthrough();
const FskuComponentIn: z.ZodType<FskuComponentIn> = z
  .object({
    item_id: z.number().int().gte(1),
    qty: z.number().int().gte(1),
    role: z.enum(["primary", "gift"]),
  })
  .passthrough();
const FskuComponentsReplaceIn: z.ZodType<FskuComponentsReplaceIn> = z
  .object({ components: z.array(FskuComponentIn) })
  .passthrough();
const GeoItemOut = z
  .object({ code: z.string(), name: z.string() })
  .passthrough();
const InboundReceiptLineOut: z.ZodType<InboundReceiptLineOut> = z
  .object({
    barcode: z.union([z.string(), z.null()]).optional(),
    batch_code: z.string(),
    created_at: z.string().datetime({ offset: true }),
    expiry_date: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    item_id: z.number().int(),
    item_name: z.union([z.string(), z.null()]).optional(),
    item_sku: z.union([z.string(), z.null()]).optional(),
    line_amount: z.union([z.string(), z.null()]).optional(),
    line_no: z.number().int(),
    po_line_id: z.union([z.number(), z.null()]).optional(),
    production_date: z.union([z.string(), z.null()]).optional(),
    qty_received: z.number().int(),
    qty_units: z.number().int(),
    receipt_id: z.number().int(),
    remark: z.union([z.string(), z.null()]).optional(),
    unit_cost: z.union([z.string(), z.null()]).optional(),
    units_per_case: z.number().int(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const InboundReceiptOut: z.ZodType<InboundReceiptOut> = z
  .object({
    created_at: z.string().datetime({ offset: true }),
    id: z.number().int(),
    lines: z.array(InboundReceiptLineOut).optional().default([]),
    occurred_at: z.string().datetime({ offset: true }),
    ref: z.string(),
    remark: z.union([z.string(), z.null()]).optional(),
    source_id: z.union([z.number(), z.null()]).optional(),
    source_type: z.string(),
    status: z.string(),
    supplier_id: z.union([z.number(), z.null()]).optional(),
    supplier_name: z.union([z.string(), z.null()]).optional(),
    trace_id: z.union([z.string(), z.null()]).optional(),
    updated_at: z.string().datetime({ offset: true }),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const InboundReceiptCreateIn = z
  .object({
    occurred_at: z.union([z.string(), z.null()]).optional(),
    remark: z.union([z.string(), z.null()]).optional(),
    source_id: z.number().int(),
    source_type: z.string(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const InboundReceiptConfirmLedgerRef: z.ZodType<InboundReceiptConfirmLedgerRef> =
  z
    .object({
      applied: z.union([z.boolean(), z.null()]).optional(),
      idempotent: z.union([z.boolean(), z.null()]).optional(),
      item_id: z.number().int(),
      qty_delta: z.number().int(),
      ref: z.string(),
      ref_line: z.number().int(),
      source_line_key: z.string(),
    })
    .passthrough();
const InboundReceiptConfirmOut: z.ZodType<InboundReceiptConfirmOut> = z
  .object({
    ledger_refs: z.array(InboundReceiptConfirmLedgerRef).optional(),
    ledger_written: z.number().int(),
    receipt: InboundReceiptOut,
  })
  .passthrough();
const ProblemItem: z.ZodType<ProblemItem> = z
  .object({
    field: z.string(),
    index: z.union([z.number(), z.null()]).optional(),
    message: z.string(),
    scope: z.enum(["header", "line"]),
  })
  .passthrough();
const LedgerPreviewOut: z.ZodType<LedgerPreviewOut> = z
  .object({
    action: z.string(),
    item_id: z.number().int(),
    qty_delta: z.number().int(),
    source_line_key: z.string(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const NormalizedLinePreviewOut: z.ZodType<NormalizedLinePreviewOut> = z
  .object({
    batch_code: z.string(),
    item_id: z.number().int(),
    line_key: z.string(),
    po_line_id: z.union([z.number(), z.null()]).optional(),
    production_date: z.union([z.string(), z.null()]).optional(),
    qty_total: z.number().int(),
    source_line_indexes: z.array(z.number().int()).optional(),
  })
  .passthrough();
const InboundReceiptSummaryOut: z.ZodType<InboundReceiptSummaryOut> = z
  .object({
    id: z.number().int(),
    occurred_at: z.union([z.string(), z.null()]).optional(),
    ref: z.union([z.string(), z.null()]).optional(),
    source_id: z.union([z.number(), z.null()]).optional(),
    source_type: z.union([z.string(), z.null()]).optional(),
    status: z.string(),
    trace_id: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const InboundReceiptExplainOut: z.ZodType<InboundReceiptExplainOut> = z
  .object({
    blocking_errors: z.array(ProblemItem).optional(),
    confirmable: z.boolean(),
    ledger_preview: z.array(LedgerPreviewOut).optional(),
    normalized_lines_preview: z.array(NormalizedLinePreviewOut).optional(),
    receipt_summary: InboundReceiptSummaryOut,
  })
  .passthrough();
const InternalOutboundLineOut: z.ZodType<InternalOutboundLineOut> = z
  .object({
    batch_code: z.union([z.string(), z.null()]).optional(),
    confirmed_qty: z.union([z.number(), z.null()]).optional(),
    doc_id: z.number().int(),
    extra_meta: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    id: z.number().int(),
    item_id: z.number().int(),
    line_no: z.number().int(),
    note: z.union([z.string(), z.null()]).optional(),
    requested_qty: z.number().int(),
    uom: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const InternalOutboundDocOut: z.ZodType<InternalOutboundDocOut> = z
  .object({
    canceled_at: z.union([z.string(), z.null()]).optional(),
    canceled_by: z.union([z.number(), z.null()]).optional(),
    confirmed_at: z.union([z.string(), z.null()]).optional(),
    confirmed_by: z.union([z.number(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    created_by: z.union([z.number(), z.null()]).optional(),
    doc_no: z.string(),
    doc_type: z.string(),
    extra_meta: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    id: z.number().int(),
    lines: z.array(InternalOutboundLineOut).optional().default([]),
    note: z.union([z.string(), z.null()]).optional(),
    recipient_id: z.union([z.number(), z.null()]).optional(),
    recipient_name: z.union([z.string(), z.null()]).optional(),
    recipient_note: z.union([z.string(), z.null()]).optional(),
    recipient_type: z.union([z.string(), z.null()]).optional(),
    status: z.string(),
    trace_id: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const InternalOutboundCreateDocIn = z
  .object({
    doc_type: z.string(),
    note: z.union([z.string(), z.null()]).optional(),
    recipient_name: z.string(),
    recipient_note: z.union([z.string(), z.null()]).optional(),
    recipient_type: z.union([z.string(), z.null()]).optional(),
    trace_id: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const InternalOutboundConfirmIn = z
  .object({ trace_id: z.union([z.string(), z.null()]) })
  .partial()
  .passthrough();
const InternalOutboundUpsertLineIn = z
  .object({
    batch_code: z.union([z.string(), z.null()]).optional(),
    item_id: z.number().int(),
    note: z.union([z.string(), z.null()]).optional(),
    qty: z.number().int(),
    uom: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const ItemBarcodeCreate = z
  .object({
    active: z.boolean().optional().default(true),
    barcode: z.string(),
    item_id: z.number().int(),
    kind: z.string().optional().default("CUSTOM"),
  })
  .passthrough();
const ItemBarcodeOut = z
  .object({
    active: z.boolean(),
    barcode: z.string(),
    id: z.number().int(),
    is_primary: z.boolean(),
    item_id: z.number().int(),
    kind: z.string(),
  })
  .passthrough();
const ItemBarcodeUpdate = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    barcode: z.union([z.string(), z.null()]),
    is_primary: z.union([z.boolean(), z.null()]),
    kind: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const enabled = z.union([z.boolean(), z.null()]).optional();
const ItemOut = z
  .object({
    barcode: z.union([z.string(), z.null()]).optional(),
    brand: z.union([z.string(), z.null()]).optional(),
    case_ratio: z.union([z.number(), z.null()]).optional(),
    case_uom: z.union([z.string(), z.null()]).optional(),
    category: z.union([z.string(), z.null()]).optional(),
    created_at: z.union([z.string(), z.null()]).optional(),
    default_batch_code: z.union([z.string(), z.null()]).optional(),
    enabled: z.boolean().optional().default(true),
    has_shelf_life: z.union([z.boolean(), z.null()]).optional(),
    id: z.number().int(),
    is_test: z.boolean().optional().default(false),
    name: z.string().min(1).max(128),
    primary_barcode: z.union([z.string(), z.null()]).optional(),
    requires_batch: z.boolean().optional().default(true),
    requires_dates: z.boolean().optional().default(true),
    shelf_life_unit: z.union([z.enum(["DAY", "MONTH"]), z.null()]).optional(),
    shelf_life_value: z.union([z.number(), z.null()]).optional(),
    sku: z.string().min(1).max(128),
    spec: z.union([z.string(), z.null()]).optional(),
    supplier_id: z.union([z.number(), z.null()]).optional(),
    supplier_name: z.union([z.string(), z.null()]).optional(),
    uom: z.union([z.string(), z.null()]).optional(),
    updated_at: z.union([z.string(), z.null()]).optional(),
    weight_kg: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ItemCreate = z
  .object({
    barcode: z.union([z.string(), z.null()]).optional(),
    brand: z.union([z.string(), z.null()]).optional(),
    case_ratio: z.union([z.number(), z.null()]).optional(),
    case_uom: z.union([z.string(), z.null()]).optional(),
    category: z.union([z.string(), z.null()]).optional(),
    enabled: z.boolean().optional().default(true),
    has_shelf_life: z.union([z.boolean(), z.null()]).optional(),
    name: z.string().min(1).max(128),
    shelf_life_unit: z.union([z.enum(["DAY", "MONTH"]), z.null()]).optional(),
    shelf_life_value: z.union([z.number(), z.null()]).optional(),
    spec: z.union([z.string(), z.null()]).optional(),
    supplier_id: z.union([z.number(), z.null()]).optional(),
    uom: z.union([z.string(), z.null()]).optional(),
    weight_kg: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const NextSkuOut = z.object({ sku: z.string() }).passthrough();
const ItemUpdate = z
  .object({
    barcode: z.union([z.string(), z.null()]),
    brand: z.union([z.string(), z.null()]),
    case_ratio: z.union([z.number(), z.null()]),
    case_uom: z.union([z.string(), z.null()]),
    category: z.union([z.string(), z.null()]),
    enabled: z.union([z.boolean(), z.null()]),
    has_shelf_life: z.union([z.boolean(), z.null()]),
    name: z.union([z.string(), z.null()]),
    shelf_life_unit: z.union([z.enum(["DAY", "MONTH"]), z.null()]),
    shelf_life_value: z.union([z.number(), z.null()]),
    sku: z.union([z.string(), z.null()]),
    spec: z.union([z.string(), z.null()]),
    supplier_id: z.union([z.number(), z.null()]),
    uom: z.union([z.string(), z.null()]),
    weight_kg: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const FskuLiteOut: z.ZodType<FskuLiteOut> = z
  .object({
    code: z.string(),
    id: z.number().int(),
    name: z.string(),
    status: z.string(),
  })
  .passthrough();
const StoreLiteOut: z.ZodType<StoreLiteOut> = z
  .object({ id: z.number().int(), name: z.string() })
  .passthrough();
const MerchantCodeBindingRowOut: z.ZodType<MerchantCodeBindingRowOut> = z
  .object({
    created_at: z.string().datetime({ offset: true }),
    fsku: FskuLiteOut,
    fsku_id: z.number().int(),
    id: z.number().int(),
    merchant_code: z.string(),
    platform: z.string(),
    reason: z.union([z.string(), z.null()]),
    shop_id: z.string(),
    store: StoreLiteOut,
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const MerchantCodeBindingListDataOut: z.ZodType<MerchantCodeBindingListDataOut> =
  z
    .object({
      items: z.array(MerchantCodeBindingRowOut),
      limit: z.number().int(),
      offset: z.number().int(),
      total: z.number().int(),
    })
    .passthrough();
const MerchantCodeBindingListOut: z.ZodType<MerchantCodeBindingListOut> = z
  .object({
    data: MerchantCodeBindingListDataOut,
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const MerchantCodeBindingBindIn = z
  .object({
    fsku_id: z.number().int().gte(1),
    merchant_code: z.string().min(1).max(128),
    platform: z.string().min(1).max(32),
    reason: z.union([z.string(), z.null()]).optional(),
    shop_id: z.string().min(1).max(64),
  })
  .passthrough();
const MerchantCodeBindingOut: z.ZodType<MerchantCodeBindingOut> = z
  .object({
    data: MerchantCodeBindingRowOut,
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const MerchantCodeBindingCloseIn = z
  .object({
    merchant_code: z.string().min(1).max(128),
    platform: z.string().min(1).max(32),
    shop_id: z.string().min(1).max(64),
  })
  .passthrough();
const MetaPlatformItem: z.ZodType<MetaPlatformItem> = z
  .object({
    enabled: z.boolean().optional().default(true),
    label: z.string().min(1).max(64),
    platform: z.string().min(1).max(32),
  })
  .passthrough();
const MetaPlatformsOut: z.ZodType<MetaPlatformsOut> = z
  .object({
    data: z.array(MetaPlatformItem),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const AlertItem: z.ZodType<AlertItem> = z
  .object({
    code: z.string(),
    count: z.number().int(),
    domain: z.string(),
    message: z.string(),
    meta: z.object({}).partial().passthrough().optional().default({}),
    severity: z.string(),
    threshold: z.union([z.number(), z.null()]).optional(),
    title: z.string(),
  })
  .passthrough();
const AlertsResponse: z.ZodType<AlertsResponse> = z
  .object({
    alerts: z.array(AlertItem).optional().default([]),
    day: z.string(),
    platform: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const FefoItemRisk: z.ZodType<FefoItemRisk> = z
  .object({
    fefo_hit_rate_7d: z.number(),
    item_id: z.number().int(),
    name: z.string(),
    near_expiry_batches: z.number().int(),
    risk_score: z.number(),
    sku: z.string(),
  })
  .passthrough();
const FefoRiskMetricsResponse: z.ZodType<FefoRiskMetricsResponse> = z
  .object({ as_of: z.string(), items: z.array(FefoItemRisk) })
  .passthrough();
const OutboundDistributionPoint: z.ZodType<OutboundDistributionPoint> = z
  .object({
    hour: z.string(),
    orders: z.number().int(),
    pick_qty: z.number().int(),
  })
  .passthrough();
const OutboundMetricsV2: z.ZodType<OutboundMetricsV2> = z
  .object({
    day: z.string(),
    distribution: z.array(OutboundDistributionPoint).optional().default([]),
    fallback_rate: z.number(),
    fallback_times: z.number().int(),
    fefo_hit_rate: z.number(),
    platform: z.string(),
    success_orders: z.number().int(),
    success_rate: z.number(),
    total_orders: z.number().int(),
  })
  .passthrough();
const OutboundShopMetric: z.ZodType<OutboundShopMetric> = z
  .object({
    fallback_rate: z.number(),
    fallback_times: z.number().int(),
    shop_id: z.string(),
    success_orders: z.number().int(),
    success_rate: z.number(),
    total_orders: z.number().int(),
  })
  .passthrough();
const OutboundShopMetricsResponse: z.ZodType<OutboundShopMetricsResponse> = z
  .object({
    day: z.string(),
    platform: z.string(),
    shops: z.array(OutboundShopMetric),
  })
  .passthrough();
const OutboundWarehouseMetric: z.ZodType<OutboundWarehouseMetric> = z
  .object({
    pick_qty: z.number().int(),
    success_orders: z.number().int(),
    success_rate: z.number(),
    total_orders: z.number().int(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const OutboundWarehouseMetricsResponse: z.ZodType<OutboundWarehouseMetricsResponse> =
  z
    .object({
      day: z.string(),
      platform: z.string(),
      warehouses: z.array(OutboundWarehouseMetric),
    })
    .passthrough();
const OutboundFailureDetail: z.ZodType<OutboundFailureDetail> = z
  .object({
    fail_point: z.string(),
    message: z.union([z.string(), z.null()]).optional(),
    ref: z.string(),
    trace_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OutboundFailuresMetricsResponse: z.ZodType<OutboundFailuresMetricsResponse> =
  z
    .object({
      day: z.string(),
      details: z.array(OutboundFailureDetail).optional().default([]),
      inventory_failures_by_code: z
        .record(z.string(), z.number().int())
        .optional()
        .default({}),
      inventory_insufficient: z.number().int(),
      pick_failed: z.number().int(),
      pick_failures_by_code: z.record(z.string(), z.number().int()).optional().default({}),
      platform: z.string(),
      routing_failed: z.number().int(),
      routing_failures_by_code: z
        .record(z.string(), z.number().int())
        .optional()
        .default({}),
      ship_failed: z.number().int(),
      ship_failures_by_code: z.record(z.string(), z.number().int()).optional().default({}),
    })
    .passthrough();
const OutboundDaySummary: z.ZodType<OutboundDaySummary> = z
  .object({
    day: z.string(),
    fallback_rate: z.number(),
    fefo_hit_rate: z.number(),
    success_rate: z.number(),
    total_orders: z.number().int(),
  })
  .passthrough();
const OutboundRangeMetricsResponse: z.ZodType<OutboundRangeMetricsResponse> = z
  .object({ days: z.array(OutboundDaySummary), platform: z.string() })
  .passthrough();
const ShippingQuoteFailureDetail: z.ZodType<ShippingQuoteFailureDetail> = z
  .object({
    created_at: z.string(),
    error_code: z.string(),
    event: z.string(),
    message: z.union([z.string(), z.null()]).optional(),
    ref: z.string(),
  })
  .passthrough();
const ShippingQuoteFailuresMetricsResponse: z.ZodType<ShippingQuoteFailuresMetricsResponse> =
  z
    .object({
      calc_failed_total: z.number().int(),
      calc_failures_by_code: z.record(z.string(), z.number().int()).optional().default({}),
      day: z.string(),
      details: z.array(ShippingQuoteFailureDetail).optional().default([]),
      platform: z.union([z.string(), z.null()]).optional(),
      recommend_failed_total: z.number().int(),
      recommend_failures_by_code: z
        .record(z.string(), z.number().int())
        .optional()
        .default({}),
    })
    .passthrough();
const OAuthStartOut = z
  .object({ data: z.object({}).partial().passthrough(), ok: z.boolean() })
  .passthrough();
const OpsActiveSchemeRow: z.ZodType<OpsActiveSchemeRow> = z
  .object({
    scheme_id: z.number().int(),
    scheme_name: z.string(),
    shipping_provider_id: z.number().int(),
    shipping_provider_name: z.string(),
  })
  .passthrough();
const OpsActiveSchemesOut: z.ZodType<OpsActiveSchemesOut> = z
  .object({ data: z.array(OpsActiveSchemeRow), ok: z.boolean().default(true) })
  .partial()
  .passthrough();
const ShellSchemeRow: z.ZodType<ShellSchemeRow> = z
  .object({
    active: z.boolean(),
    name: z.string(),
    scheme_id: z.number().int(),
    seg_n: z.number().int().optional().default(0),
    surcharge_n: z.number().int().optional().default(0),
    tpl_n: z.number().int().optional().default(0),
    wh_n: z.number().int().optional().default(0),
    zone_n: z.number().int().optional().default(0),
  })
  .passthrough();
const CleanupShellSchemesOut: z.ZodType<CleanupShellSchemesOut> = z
  .object({
    candidates: z.array(ShellSchemeRow).optional(),
    candidates_n: z.number().int(),
    deleted_n: z.number().int().optional().default(0),
    dry_run: z.boolean(),
    include_surcharge_only: z.boolean(),
    limit: z.number().int(),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const PricingIntegrityFixArchiveReleaseIn = z
  .object({
    dry_run: z.boolean().optional().default(false),
    scheme_id: z.number().int().gte(1),
    zone_ids: z.array(z.number().int()).min(1),
  })
  .passthrough();
const PricingIntegrityFixArchiveReleaseItemOut: z.ZodType<PricingIntegrityFixArchiveReleaseItemOut> =
  z
    .object({
      after_active: z.union([z.boolean(), z.null()]).optional(),
      after_province_member_n: z.union([z.number(), z.null()]).optional(),
      error: z.union([z.string(), z.null()]).optional(),
      ok: z.boolean(),
      would_release_n: z.number().int().optional().default(0),
      would_release_provinces: z.array(z.string()).optional(),
      zone_id: z.number().int(),
      zone_name: z.string(),
    })
    .passthrough();
const PricingIntegrityFixArchiveReleaseOut: z.ZodType<PricingIntegrityFixArchiveReleaseOut> =
  z
    .object({
      dry_run: z.boolean(),
      items: z.array(PricingIntegrityFixArchiveReleaseItemOut).optional(),
      scheme_id: z.number().int(),
    })
    .passthrough();
const PricingIntegrityFixDetachZoneBracketsIn = z
  .object({
    dry_run: z.boolean().optional().default(false),
    scheme_id: z.number().int().gte(1),
    zone_ids: z.array(z.number().int()).min(1),
  })
  .passthrough();
const PricingIntegrityFixDetachZoneBracketsItemOut: z.ZodType<PricingIntegrityFixDetachZoneBracketsItemOut> =
  z
    .object({
      after_brackets_n: z.union([z.number(), z.null()]).optional(),
      error: z.union([z.string(), z.null()]).optional(),
      ok: z.boolean(),
      province_member_n: z.number().int().optional().default(0),
      would_delete_brackets_n: z.number().int().optional().default(0),
      would_delete_ranges_preview: z.array(z.string()).optional(),
      zone_id: z.number().int(),
      zone_name: z.string(),
    })
    .passthrough();
const PricingIntegrityFixDetachZoneBracketsOut: z.ZodType<PricingIntegrityFixDetachZoneBracketsOut> =
  z
    .object({
      dry_run: z.boolean(),
      items: z.array(PricingIntegrityFixDetachZoneBracketsItemOut).optional(),
      scheme_id: z.number().int(),
    })
    .passthrough();
const PricingIntegrityFixUnbindArchivedTemplatesIn = z
  .object({
    dry_run: z.boolean().optional().default(false),
    scheme_id: z.number().int().gte(1),
    template_ids: z.array(z.number().int()).min(1),
  })
  .passthrough();
const PricingIntegrityFixUnbindArchivedTemplatesItemOut: z.ZodType<PricingIntegrityFixUnbindArchivedTemplatesItemOut> =
  z
    .object({
      after_unbound_zone_n: z.union([z.number(), z.null()]).optional(),
      error: z.union([z.string(), z.null()]).optional(),
      ok: z.boolean(),
      template_id: z.number().int(),
      template_name: z.string(),
      template_status: z.union([z.string(), z.null()]).optional(),
      would_unbind_zone_ids: z.array(z.number().int()).optional(),
      would_unbind_zone_n: z.number().int().optional().default(0),
      would_unbind_zone_names: z.array(z.string()).optional(),
    })
    .passthrough();
const PricingIntegrityFixUnbindArchivedTemplatesOut: z.ZodType<PricingIntegrityFixUnbindArchivedTemplatesOut> =
  z
    .object({
      dry_run: z.boolean(),
      items: z
        .array(PricingIntegrityFixUnbindArchivedTemplatesItemOut)
        .optional(),
      scheme_id: z.number().int(),
    })
    .passthrough();
const PricingIntegrityArchivedTemplateStillReferencedIssue: z.ZodType<PricingIntegrityArchivedTemplateStillReferencedIssue> =
  z
    .object({
      referencing_zone_ids: z.array(z.number().int()).optional(),
      referencing_zone_n: z.number().int().optional().default(0),
      referencing_zone_names: z.array(z.string()).optional(),
      scheme_id: z.number().int(),
      suggested_action: z
        .string()
        .optional()
        .default("UNBIND_ARCHIVED_TEMPLATE"),
      template_id: z.number().int(),
      template_name: z.string(),
      template_status: z.string(),
    })
    .passthrough();
const PricingIntegrityArchivedZoneIssue: z.ZodType<PricingIntegrityArchivedZoneIssue> =
  z
    .object({
      province_member_n: z.number().int().optional().default(0),
      province_members: z.array(z.string()).optional(),
      scheme_id: z.number().int(),
      suggested_action: z
        .string()
        .optional()
        .default("ARCHIVE_RELEASE_PROVINCES"),
      zone_active: z.boolean(),
      zone_id: z.number().int(),
      zone_name: z.string(),
    })
    .passthrough();
const PricingIntegrityReleasedZoneStillPricedIssue: z.ZodType<PricingIntegrityReleasedZoneStillPricedIssue> =
  z
    .object({
      brackets_n: z.number().int().optional().default(0),
      province_member_n: z.number().int().optional().default(0),
      scheme_id: z.number().int(),
      segment_template_id: z.union([z.number(), z.null()]).optional(),
      suggested_action: z.string().optional().default("DETACH_ZONE_BRACKETS"),
      zone_active: z.boolean(),
      zone_id: z.number().int(),
      zone_name: z.string(),
    })
    .passthrough();
const PricingIntegrityReportSummary: z.ZodType<PricingIntegrityReportSummary> =
  z
    .object({
      blocking: z.number().int().default(0),
      warning: z.number().int().default(0),
    })
    .partial()
    .passthrough();
const PricingIntegrityReportOut: z.ZodType<PricingIntegrityReportOut> = z
  .object({
    archived_templates_still_referenced: z
      .array(PricingIntegrityArchivedTemplateStillReferencedIssue)
      .optional(),
    archived_zones_still_occupying: z
      .array(PricingIntegrityArchivedZoneIssue)
      .optional(),
    released_zones_still_priced: z
      .array(PricingIntegrityReleasedZoneStillPricedIssue)
      .optional(),
    scheme_id: z.number().int(),
    summary: PricingIntegrityReportSummary,
  })
  .passthrough();
const OrderAddrIn: z.ZodType<OrderAddrIn> = z
  .object({
    city: z.union([z.string(), z.null()]),
    detail: z.union([z.string(), z.null()]),
    district: z.union([z.string(), z.null()]),
    province: z.union([z.string(), z.null()]),
    receiver_name: z.union([z.string(), z.null()]),
    receiver_phone: z.union([z.string(), z.null()]),
    zipcode: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const OrderLineIn: z.ZodType<OrderLineIn> = z
  .object({
    amount: z.union([z.number(), z.null()]).default(0),
    discount: z.union([z.number(), z.null()]).default(0),
    item_id: z.union([z.number(), z.null()]),
    price: z.union([z.number(), z.null()]).default(0),
    qty: z.number().int().gt(0).default(1),
    sku_id: z.union([z.string(), z.null()]),
    title: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const OrderCreateIn: z.ZodType<OrderCreateIn> = z
  .object({
    address: z.union([OrderAddrIn, z.null()]).optional(),
    buyer_name: z.union([z.string(), z.null()]).optional(),
    buyer_phone: z.union([z.string(), z.null()]).optional(),
    ext_order_no: z.string().min(1),
    lines: z.array(OrderLineIn).optional(),
    occurred_at: z.union([z.string(), z.null()]).optional(),
    order_amount: z.union([z.number(), z.null()]).optional().default(0),
    pay_amount: z.union([z.number(), z.null()]).optional().default(0),
    platform: z.string().min(1).max(32),
    shop_id: z.string().min(1),
    store_name: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OrderFulfillmentOut: z.ZodType<OrderFulfillmentOut> = z
  .object({
    auto_assign_status: z.union([z.string(), z.null()]),
    fulfillment_status: z.union([z.string(), z.null()]),
    ingest_state: z.union([z.string(), z.null()]),
    route_status: z.union([z.string(), z.null()]),
    service_warehouse_id: z.union([z.number(), z.null()]),
    warehouse_id: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const OrderCreateOut: z.ZodType<OrderCreateOut> = z
  .object({
    fulfillment: z.union([OrderFulfillmentOut, z.null()]).optional(),
    id: z.union([z.number(), z.null()]).optional(),
    ref: z.string(),
    status: z.string(),
  })
  .passthrough();
const OrdersDailyStatsModel = z
  .object({
    date: z.string(),
    orders_created: z.number().int(),
    orders_returned: z.number().int(),
    orders_shipped: z.number().int(),
    platform: z.union([z.string(), z.null()]).optional(),
    shop_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OrdersDailyTrendItem: z.ZodType<OrdersDailyTrendItem> = z
  .object({
    date: z.string(),
    orders_created: z.number().int(),
    orders_returned: z.number().int(),
    orders_shipped: z.number().int(),
    return_rate: z.number(),
  })
  .passthrough();
const OrdersTrendResponseModel: z.ZodType<OrdersTrendResponseModel> = z
  .object({ days: z.array(OrdersDailyTrendItem) })
  .partial()
  .passthrough();
const OrdersSlaStatsModel = z
  .object({
    avg_ship_hours: z.union([z.number(), z.null()]).optional(),
    on_time_orders: z.number().int(),
    on_time_rate: z.number(),
    p95_ship_hours: z.union([z.number(), z.null()]).optional(),
    total_orders: z.number().int(),
  })
  .passthrough();
const OrderSummaryOut: z.ZodType<OrderSummaryOut> = z
  .object({
    can_manual_assign_execution_warehouse: z
      .boolean()
      .optional()
      .default(false),
    created_at: z.string().datetime({ offset: true }),
    ext_order_no: z.string(),
    fulfillment_status: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    manual_assign_hint: z.union([z.string(), z.null()]).optional(),
    order_amount: z.union([z.number(), z.null()]).optional(),
    pay_amount: z.union([z.number(), z.null()]).optional(),
    platform: z.string(),
    service_warehouse_id: z.union([z.number(), z.null()]).optional(),
    shop_id: z.string(),
    status: z.union([z.string(), z.null()]).optional(),
    store_id: z.union([z.number(), z.null()]).optional(),
    updated_at: z.union([z.string(), z.null()]).optional(),
    warehouse_assign_mode: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const WarehouseOptionOut: z.ZodType<WarehouseOptionOut> = z
  .object({
    active: z.union([z.boolean(), z.null()]).optional(),
    code: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    name: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OrdersSummaryResponse: z.ZodType<OrdersSummaryResponse> = z
  .object({
    data: z.array(OrderSummaryOut),
    ok: z.boolean().optional().default(true),
    warehouses: z.array(WarehouseOptionOut),
  })
  .passthrough();
const FulfillmentDebugAddress: z.ZodType<FulfillmentDebugAddress> = z
  .object({
    city: z.union([z.string(), z.null()]),
    detail: z.union([z.string(), z.null()]),
    district: z.union([z.string(), z.null()]),
    province: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const FulfillmentServiceDebug: z.ZodType<FulfillmentServiceDebug> = z
  .object({
    city_code: z.union([z.string(), z.null()]),
    hit: z.boolean().default(false),
    province_code: z.union([z.string(), z.null()]),
    reason: z.union([z.string(), z.null()]),
    service_warehouse_id: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const FulfillmentDebugOut: z.ZodType<FulfillmentDebugOut> = z
  .object({
    address: FulfillmentDebugAddress.optional(),
    ext_order_no: z.union([z.string(), z.null()]).optional(),
    order_id: z.number().int(),
    platform: z.string(),
    service: FulfillmentServiceDebug.optional(),
    shop_id: z.string(),
    summary: z.object({}).partial().passthrough().optional(),
    version: z.string().optional().default("v4-min"),
  })
  .passthrough();
const AvailabilityLineOut: z.ZodType<AvailabilityLineOut> = z
  .object({
    item_id: z.number().int(),
    req_qty: z.number().int(),
    sku_id: z.union([z.string(), z.null()]).optional(),
    title: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const AvailabilityCellOut: z.ZodType<AvailabilityCellOut> = z
  .object({
    available: z.number().int(),
    item_id: z.number().int(),
    shortage: z.number().int(),
    status: z.string(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const WarehouseBriefOut: z.ZodType<WarehouseBriefOut> = z
  .object({
    code: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    name: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OrderWarehouseAvailabilityResponse: z.ZodType<OrderWarehouseAvailabilityResponse> =
  z
    .object({
      lines: z.array(AvailabilityLineOut),
      matrix: z.array(AvailabilityCellOut),
      ok: z.boolean().optional().default(true),
      order_id: z.number().int(),
      scope: z.string(),
      warehouses: z.array(WarehouseBriefOut),
    })
    .passthrough();
const ManualAssignRequest = z
  .object({
    note: z.union([z.string(), z.null()]).optional(),
    reason: z.string().min(1).max(500),
    warehouse_id: z.number().int().gte(1),
  })
  .passthrough();
const ManualAssignResponse = z
  .object({
    from_warehouse_id: z.union([z.number(), z.null()]).optional(),
    fulfillment_status: z.string(),
    ref: z.string(),
    status: z.string(),
    to_warehouse_id: z.number().int(),
  })
  .passthrough();
const PickLineIn: z.ZodType<PickLineIn> = z
  .object({ item_id: z.number().int().gt(0), qty: z.number().int().gt(0) })
  .passthrough();
const PickRequest: z.ZodType<PickRequest> = z
  .object({
    batch_code: z.union([z.string(), z.null()]).optional(),
    lines: z.array(PickLineIn).optional(),
    occurred_at: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int().gt(0),
  })
  .passthrough();
const PickResponse = z
  .object({
    batch_code: z.union([z.string(), z.null()]),
    item_id: z.number().int(),
    picked: z.number().int(),
    ref: z.string(),
    status: z.string(),
    stock_after: z.union([z.number(), z.null()]).optional(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const ShipLineIn: z.ZodType<ShipLineIn> = z
  .object({ item_id: z.number().int().gt(0), qty: z.number().int().gt(0) })
  .passthrough();
const ShipRequest: z.ZodType<ShipRequest> = z
  .object({
    lines: z.array(ShipLineIn).optional(),
    occurred_at: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int().gt(0),
  })
  .passthrough();
const ShipResponse = z
  .object({
    event: z.string().optional().default("SHIP_COMMIT"),
    ref: z.string(),
    status: z.string(),
  })
  .passthrough();
const ShipWithWaybillRequest = z
  .object({
    address_detail: z.union([z.string(), z.null()]).optional(),
    carrier_code: z.string().min(1),
    carrier_name: z.union([z.string(), z.null()]).optional(),
    city: z.union([z.string(), z.null()]).optional(),
    district: z.union([z.string(), z.null()]).optional(),
    meta: z.union([z.object({}).partial().passthrough(), z.null()]).optional(),
    province: z.union([z.string(), z.null()]).optional(),
    receiver_name: z.union([z.string(), z.null()]).optional(),
    receiver_phone: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int().gt(0),
    weight_kg: z.number().gt(0),
  })
  .passthrough();
const ShipWithWaybillResponse = z
  .object({
    carrier_code: z.string(),
    carrier_name: z.union([z.string(), z.null()]).optional(),
    label_base64: z.union([z.string(), z.null()]).optional(),
    label_format: z.union([z.string(), z.null()]).optional(),
    ok: z.boolean(),
    ref: z.string(),
    status: z.string().optional().default("IN_TRANSIT"),
    tracking_no: z.string(),
  })
  .passthrough();
const PlatformOrderAddressOut: z.ZodType<PlatformOrderAddressOut> = z
  .object({
    city: z.union([z.string(), z.null()]),
    detail: z.union([z.string(), z.null()]),
    district: z.union([z.string(), z.null()]),
    province: z.union([z.string(), z.null()]),
    receiver_name: z.union([z.string(), z.null()]),
    receiver_phone: z.union([z.string(), z.null()]),
    zipcode: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const PlatformOrderLineOut: z.ZodType<PlatformOrderLineOut> = z
  .object({
    amount: z.union([z.number(), z.null()]),
    discount: z.union([z.number(), z.null()]),
    extras: z.union([z.object({}).partial().passthrough(), z.null()]),
    item_id: z.union([z.number(), z.null()]),
    price: z.union([z.number(), z.null()]),
    qty: z.number().int().default(0),
    sku: z.union([z.string(), z.null()]),
    spec: z.union([z.string(), z.null()]),
    title: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const PlatformOrderOut: z.ZodType<PlatformOrderOut> = z
  .object({
    address: z.union([PlatformOrderAddressOut, z.null()]).optional(),
    buyer_name: z.union([z.string(), z.null()]).optional(),
    buyer_phone: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    ext_order_no: z.string(),
    id: z.number().int(),
    items: z.array(PlatformOrderLineOut).optional().default([]),
    order_amount: z.union([z.number(), z.null()]).optional(),
    pay_amount: z.union([z.number(), z.null()]).optional(),
    platform: z.string(),
    raw: z.union([z.object({}).partial().passthrough(), z.null()]).optional(),
    shop_id: z.string(),
    status: z.union([z.string(), z.null()]).optional(),
    updated_at: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OrderViewResponse: z.ZodType<OrderViewResponse> = z
  .object({ ok: z.boolean().optional().default(true), order: PlatformOrderOut })
  .passthrough();
const OutboundLineIn: z.ZodType<OutboundLineIn> = z
  .object({
    batch_code: z.union([z.string(), z.null()]).optional(),
    item_id: z.number().int(),
    qty: z.number().int().gt(0),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const OutboundShipIn: z.ZodType<OutboundShipIn> = z
  .object({
    external_order_ref: z.union([z.string(), z.null()]).optional(),
    lines: z.array(OutboundLineIn),
    occurred_at: z.union([z.string(), z.null()]).optional(),
    platform: z.string().min(1).max(32),
    ref: z.string().min(1),
    shop_id: z.string().min(1),
  })
  .passthrough();
const OutboundShipOut = z
  .object({
    idempotent: z.boolean().optional().default(false),
    status: z.string(),
    total_qty: z.number().int(),
    trace_id: z.string(),
  })
  .passthrough();
const PermissionOut: z.ZodType<PermissionOut> = z
  .object({
    description: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    name: z.string().min(1).max(64),
  })
  .passthrough();
const PermissionCreate = z
  .object({
    description: z.union([z.string(), z.null()]).optional(),
    name: z.string().min(1).max(64),
  })
  .passthrough();
const PickIn = z
  .object({
    batch_code: z.union([z.string(), z.null()]).optional(),
    device_id: z.union([z.string(), z.null()]).optional(),
    item_id: z.number().int().gte(1),
    location_id: z.union([z.number(), z.null()]).optional(),
    occurred_at: z.union([z.string(), z.null()]).optional(),
    operator: z.union([z.string(), z.null()]).optional(),
    qty: z.number().int().gte(1),
    ref: z.string().min(1),
    task_line_id: z.union([z.number(), z.null()]).optional(),
    warehouse_id: z.number().int().gte(1),
  })
  .passthrough();
const PickOut = z
  .object({
    batch_code: z.union([z.string(), z.null()]),
    item_id: z.number().int(),
    picked: z.number().int(),
    ref: z.string(),
    status: z.string(),
    stock_after: z.union([z.number(), z.null()]).optional(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const GateOut: z.ZodType<GateOut> = z
  .object({
    allowed: z.boolean(),
    details: z.array(z.object({}).partial().passthrough()).optional(),
    error_code: z.union([z.string(), z.null()]).optional(),
    message: z.union([z.string(), z.null()]).optional(),
    next_actions: z.array(z.object({}).partial().passthrough()).optional(),
  })
  .passthrough();
const PickTaskLineOut: z.ZodType<PickTaskLineOut> = z
  .object({
    batch_code: z.union([z.string(), z.null()]),
    created_at: z.string().datetime({ offset: true }),
    delta: z.number().int(),
    diff_status: z.string(),
    id: z.number().int(),
    item_id: z.number().int(),
    note: z.union([z.string(), z.null()]),
    order_id: z.union([z.number(), z.null()]),
    order_line_id: z.union([z.number(), z.null()]),
    picked_qty: z.number().int(),
    remain_qty: z.number().int(),
    req_qty: z.number().int(),
    status: z.string(),
    task_id: z.number().int(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PrintJobOut: z.ZodType<PrintJobOut> = z
  .object({
    created_at: z.string().datetime({ offset: true }),
    error: z.union([z.string(), z.null()]),
    id: z.number().int(),
    kind: z.string(),
    payload: z.object({}).partial().passthrough(),
    printed_at: z.union([z.string(), z.null()]),
    ref_id: z.number().int(),
    ref_type: z.string(),
    requested_at: z.string().datetime({ offset: true }),
    status: z.string(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PickTaskOut: z.ZodType<PickTaskOut> = z
  .object({
    assigned_to: z.union([z.string(), z.null()]),
    commit_gate: GateOut,
    created_at: z.string().datetime({ offset: true }),
    has_over: z.boolean(),
    has_under: z.boolean(),
    id: z.number().int(),
    lines: z.array(PickTaskLineOut).optional(),
    note: z.union([z.string(), z.null()]),
    picked_total: z.number().int(),
    print_job: z.union([PrintJobOut, z.null()]).optional(),
    priority: z.number().int(),
    ref: z.union([z.string(), z.null()]),
    remain_total: z.number().int(),
    req_total: z.number().int(),
    scan_gate: GateOut,
    source: z.union([z.string(), z.null()]),
    status: z.string(),
    updated_at: z.string().datetime({ offset: true }),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const PickTaskCreateFromOrder = z
  .object({
    priority: z.number().int().gte(0).default(100),
    source: z.string().default("ORDER"),
    warehouse_id: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const PickTaskCommitIn = z
  .object({
    allow_diff: z.boolean().optional().default(true),
    handoff_code: z.union([z.string(), z.null()]).optional(),
    platform: z.string(),
    shop_id: z.string(),
    trace_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const PickTaskCommitDiffLineOut: z.ZodType<PickTaskCommitDiffLineOut> = z
  .object({
    delta: z.number().int(),
    item_id: z.number().int(),
    picked_qty: z.number().int(),
    req_qty: z.number().int(),
    status: z.string(),
  })
  .passthrough();
const PickTaskCommitDiffOut: z.ZodType<PickTaskCommitDiffOut> = z
  .object({
    has_over: z.boolean(),
    has_temp_lines: z.boolean(),
    has_under: z.boolean(),
    lines: z.array(PickTaskCommitDiffLineOut),
    task_id: z.number().int(),
    temp_lines_n: z.number().int(),
  })
  .passthrough();
const PickTaskCommitResult: z.ZodType<PickTaskCommitResult> = z
  .object({
    committed_at: z.union([z.string(), z.null()]).optional(),
    diff: PickTaskCommitDiffOut,
    idempotent: z.boolean().optional().default(false),
    next_actions: z.array(z.object({}).partial().passthrough()).optional(),
    platform: z.string(),
    ref: z.string(),
    shop_id: z.string(),
    status: z.string(),
    task_id: z.number().int(),
    trace_id: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const PickTaskCommitCheckOut = z
  .object({
    allowed: z.boolean(),
    context: z.object({}).partial().passthrough().optional(),
    details: z.array(z.object({}).partial().passthrough()).optional(),
    error_code: z.union([z.string(), z.null()]).optional(),
    message: z.union([z.string(), z.null()]).optional(),
    next_actions: z.array(z.object({}).partial().passthrough()).optional(),
  })
  .passthrough();
const PickTaskDiffLineOut: z.ZodType<PickTaskDiffLineOut> = z
  .object({
    delta: z.number().int(),
    item_id: z.number().int(),
    picked_qty: z.number().int(),
    req_qty: z.number().int(),
    status: z.string(),
  })
  .passthrough();
const PickTaskDiffSummaryOut: z.ZodType<PickTaskDiffSummaryOut> = z
  .object({
    has_over: z.boolean(),
    has_under: z.boolean(),
    lines: z.array(PickTaskDiffLineOut),
    task_id: z.number().int(),
  })
  .passthrough();
const PickTaskPrintPickListIn = z
  .object({
    order_id: z.number().int().gte(1),
    trace_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const PickTaskScanIn = z
  .object({
    batch_code: z.union([z.string(), z.null()]).optional(),
    item_id: z.number().int(),
    qty: z.number().int().gt(0),
  })
  .passthrough();
const PlatformOrderConfirmCreateDecisionIn: z.ZodType<PlatformOrderConfirmCreateDecisionIn> =
  z
    .object({
      filled_code: z.union([z.string(), z.null()]).optional(),
      item_id: z.number().int(),
      line_key: z.union([z.string(), z.null()]).optional(),
      line_no: z.union([z.number(), z.null()]).optional(),
      locator_kind: z.union([z.string(), z.null()]).optional(),
      locator_value: z.union([z.string(), z.null()]).optional(),
      note: z.union([z.string(), z.null()]).optional(),
      platform_sku_id: z.union([z.string(), z.null()]).optional(),
      qty: z.number().int(),
    })
    .passthrough();
const PlatformOrderConfirmCreateIn: z.ZodType<PlatformOrderConfirmCreateIn> = z
  .object({
    decisions: z.array(PlatformOrderConfirmCreateDecisionIn).optional(),
    ext_order_no: z.string(),
    platform: z.string(),
    reason: z.union([z.string(), z.null()]).optional(),
    store_id: z.number().int(),
  })
  .passthrough();
const PlatformOrderConfirmCreateDecisionOut: z.ZodType<PlatformOrderConfirmCreateDecisionOut> =
  z
    .object({
      fact_qty: z.union([z.number(), z.null()]),
      filled_code: z.union([z.string(), z.null()]),
      item_id: z.union([z.number(), z.null()]),
      line_key: z.union([z.string(), z.null()]),
      line_no: z.union([z.number(), z.null()]),
      locator_kind: z.union([z.string(), z.null()]),
      locator_value: z.union([z.string(), z.null()]),
      note: z.union([z.string(), z.null()]),
      qty: z.union([z.number(), z.null()]),
    })
    .partial()
    .passthrough();
const PlatformOrderConfirmCreateOut: z.ZodType<PlatformOrderConfirmCreateOut> =
  z
    .object({
      blocked_reasons: z.union([z.array(z.string()), z.null()]).optional(),
      decisions: z.array(PlatformOrderConfirmCreateDecisionOut).optional(),
      ext_order_no: z.string(),
      facts_n: z.number().int(),
      fulfillment_status: z.union([z.string(), z.null()]).optional(),
      id: z.union([z.number(), z.null()]),
      manual_batch_id: z.union([z.string(), z.null()]).optional(),
      manual_override: z.boolean(),
      manual_reason: z.union([z.string(), z.null()]).optional(),
      platform: z.string(),
      ref: z.string(),
      risk_flags: z.array(z.string()).optional(),
      status: z.string(),
      store_id: z.number().int(),
    })
    .passthrough();
const PlatformOrderLineIn: z.ZodType<PlatformOrderLineIn> = z
  .object({
    extras: z.union([z.object({}).partial().passthrough(), z.null()]),
    filled_code: z.union([z.string(), z.null()]),
    qty: z.number().int().gt(0).default(1),
    spec: z.union([z.string(), z.null()]),
    title: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const PlatformOrderIngestIn: z.ZodType<PlatformOrderIngestIn> = z
  .object({
    buyer_name: z.union([z.string(), z.null()]).optional(),
    buyer_phone: z.union([z.string(), z.null()]).optional(),
    city: z.union([z.string(), z.null()]).optional(),
    detail: z.union([z.string(), z.null()]).optional(),
    district: z.union([z.string(), z.null()]).optional(),
    ext_order_no: z.string().min(1),
    lines: z.array(PlatformOrderLineIn).optional(),
    occurred_at: z.union([z.string(), z.null()]).optional(),
    platform: z.string().min(1).max(32),
    province: z.union([z.string(), z.null()]).optional(),
    raw_payload: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    receiver_name: z.union([z.string(), z.null()]).optional(),
    receiver_phone: z.union([z.string(), z.null()]).optional(),
    shop_id: z.union([z.string(), z.null()]).optional(),
    store_id: z.union([z.number(), z.null()]).optional(),
    store_name: z.union([z.string(), z.null()]).optional(),
    zipcode: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const PlatformOrderLineResult: z.ZodType<PlatformOrderLineResult> = z
  .object({
    expanded_items: z
      .union([z.array(z.object({}).partial().passthrough()), z.null()])
      .optional(),
    filled_code: z.union([z.string(), z.null()]).optional(),
    fsku_id: z.union([z.number(), z.null()]).optional(),
    hint: z.union([z.string(), z.null()]).optional(),
    next_actions: z
      .union([z.array(z.object({}).partial().passthrough()), z.null()])
      .optional(),
    qty: z.number().int(),
    reason: z.union([z.string(), z.null()]).optional(),
    risk_flags: z.union([z.array(z.string()), z.null()]).optional(),
    risk_level: z.union([z.string(), z.null()]).optional(),
    risk_reason: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const PlatformOrderIngestOut: z.ZodType<PlatformOrderIngestOut> = z
  .object({
    allow_manual_continue: z.boolean().optional().default(false),
    blocked_reasons: z.union([z.array(z.string()), z.null()]).optional(),
    facts_written: z.number().int(),
    fulfillment_status: z.union([z.string(), z.null()]).optional(),
    id: z.union([z.number(), z.null()]),
    next_actions: z.array(z.object({}).partial().passthrough()).optional(),
    reason_code: z.union([z.string(), z.null()]).optional(),
    ref: z.string(),
    resolved: z.array(PlatformOrderLineResult).optional(),
    risk_flags: z.array(z.string()).optional(),
    risk_level: z.union([z.string(), z.null()]).optional(),
    risk_reason: z.union([z.string(), z.null()]).optional(),
    status: z.string(),
    store_id: z.union([z.number(), z.null()]),
    unresolved: z.array(PlatformOrderLineResult).optional(),
  })
  .passthrough();
const ManualBindMerchantCodeIn = z
  .object({
    filled_code: z.string().min(1).max(128),
    fsku_id: z.number().int().gte(1),
    platform: z.string().min(1).max(32),
    reason: z.union([z.string(), z.null()]).optional(),
    store_id: z.number().int().gte(1),
  })
  .passthrough();
const ManualDecisionLineOut: z.ZodType<ManualDecisionLineOut> = z
  .object({
    fact_qty: z.union([z.number(), z.null()]),
    filled_code: z.union([z.string(), z.null()]),
    item_id: z.union([z.number(), z.null()]),
    line_key: z.union([z.string(), z.null()]),
    line_no: z.union([z.number(), z.null()]),
    locator_kind: z.union([z.string(), z.null()]),
    locator_value: z.union([z.string(), z.null()]),
    note: z.union([z.string(), z.null()]),
    qty: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const ManualDecisionOrderOut: z.ZodType<ManualDecisionOrderOut> = z
  .object({
    batch_id: z.string(),
    created_at: z.string().datetime({ offset: true }),
    ext_order_no: z.string(),
    manual_decisions: z.array(ManualDecisionLineOut).optional(),
    manual_reason: z.union([z.string(), z.null()]).optional(),
    order_id: z.number().int(),
    platform: z.string(),
    ref: z.string(),
    risk_flags: z.array(z.string()).optional(),
    shop_id: z.string(),
    store_id: z.number().int(),
  })
  .passthrough();
const ManualDecisionOrdersOut: z.ZodType<ManualDecisionOrdersOut> = z
  .object({
    items: z.array(ManualDecisionOrderOut).optional(),
    limit: z.number().int(),
    offset: z.number().int(),
    total: z.number().int(),
  })
  .passthrough();
const PlatformOrderReplayIn = z
  .object({
    ext_order_no: z.string().min(1),
    platform: z.string().min(1).max(32),
    store_id: z.number().int().gte(1),
  })
  .passthrough();
const PlatformOrderReplayOut = z
  .object({
    blocked_reasons: z.union([z.array(z.string()), z.null()]).optional(),
    ext_order_no: z.string(),
    facts_n: z.number().int().optional().default(0),
    fulfillment_status: z.union([z.string(), z.null()]).optional(),
    id: z.union([z.number(), z.null()]).optional(),
    platform: z.string(),
    ref: z.string(),
    resolved: z.array(z.object({}).partial().passthrough()).optional(),
    status: z.string(),
    store_id: z.number().int(),
    unresolved: z.array(z.object({}).partial().passthrough()).optional(),
  })
  .passthrough();
const PlatformShopCredentialsIn = z
  .object({
    access_token: z.string().min(1),
    platform: z.string().min(1).max(16),
    shop_id: z.string().min(1).max(64),
    status: z.union([z.string(), z.null()]).optional().default("ACTIVE"),
    store_name: z.union([z.string(), z.null()]).optional(),
    token_expires_at: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const SimpleOut = z
  .object({
    data: z.union([z.object({}).partial().passthrough(), z.null()]).optional(),
    ok: z.boolean(),
  })
  .passthrough();
const SchemeSegmentOut: z.ZodType<SchemeSegmentOut> = z
  .object({
    active: z.boolean().optional().default(true),
    id: z.number().int(),
    max_kg: z.unknown().optional(),
    min_kg: z.unknown(),
    ord: z.number().int(),
    scheme_id: z.number().int(),
  })
  .passthrough();
const WeightSegmentIn: z.ZodType<WeightSegmentIn> = z
  .object({
    max: z.string().max(32).optional().default(""),
    min: z.string().min(1).max(32),
  })
  .passthrough();
const SurchargeOut: z.ZodType<SurchargeOut> = z
  .object({
    active: z.boolean(),
    amount_json: z.object({}).partial().passthrough(),
    condition_json: z.object({}).partial().passthrough(),
    id: z.number().int(),
    name: z.string(),
    scheme_id: z.number().int(),
  })
  .passthrough();
const ZoneBracketOut: z.ZodType<ZoneBracketOut> = z
  .object({
    active: z.boolean(),
    base_amount: z.union([z.string(), z.null()]).optional(),
    base_kg: z.union([z.string(), z.null()]).optional(),
    flat_amount: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    max_kg: z.union([z.string(), z.null()]).optional(),
    min_kg: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    price_json: z.object({}).partial().passthrough().optional(),
    pricing_mode: z.string(),
    rate_per_kg: z.union([z.string(), z.null()]).optional(),
    zone_id: z.number().int(),
  })
  .passthrough();
const ZoneMemberOut: z.ZodType<ZoneMemberOut> = z
  .object({
    id: z.number().int(),
    level: z.string(),
    value: z.string(),
    zone_id: z.number().int(),
  })
  .passthrough();
const ZoneOut: z.ZodType<ZoneOut> = z
  .object({
    active: z.boolean(),
    brackets: z.array(ZoneBracketOut).optional(),
    id: z.number().int(),
    members: z.array(ZoneMemberOut).optional(),
    name: z.string(),
    scheme_id: z.number().int(),
    segment_template_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const SchemeOut: z.ZodType<SchemeOut> = z
  .object({
    active: z.boolean(),
    archived_at: z.union([z.string(), z.null()]).optional(),
    billable_weight_rule: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    currency: z.string(),
    default_pricing_mode: z.string(),
    default_segment_template_id: z.union([z.number(), z.null()]).optional(),
    dest_adjustments: z.array(DestAdjustmentOut).optional(),
    effective_from: z.union([z.string(), z.null()]).optional(),
    effective_to: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    name: z.string(),
    segments: z.array(SchemeSegmentOut).optional(),
    segments_json: z.union([z.array(WeightSegmentIn), z.null()]).optional(),
    segments_updated_at: z.union([z.string(), z.null()]).optional(),
    shipping_provider_id: z.number().int(),
    shipping_provider_name: z.string(),
    surcharges: z.array(SurchargeOut).optional(),
    zones: z.array(ZoneOut).optional(),
  })
  .passthrough();
const SchemeDetailOut: z.ZodType<SchemeDetailOut> = z
  .object({ data: SchemeOut, ok: z.boolean().optional().default(true) })
  .passthrough();
const SchemeUpdateIn: z.ZodType<SchemeUpdateIn> = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    archived_at: z.union([z.string(), z.null()]),
    billable_weight_rule: z.union([
      z.object({}).partial().passthrough(),
      z.null(),
    ]),
    currency: z.union([z.string(), z.null()]),
    default_pricing_mode: z.union([z.string(), z.null()]),
    effective_from: z.union([z.string(), z.null()]),
    effective_to: z.union([z.string(), z.null()]),
    name: z.union([z.string(), z.null()]),
    segments_json: z.union([z.array(WeightSegmentIn), z.null()]),
  })
  .partial()
  .passthrough();
const DestAdjustmentUpsertIn = z
  .object({
    active: z.boolean().optional().default(true),
    amount: z.number(),
    city_code: z.union([z.string(), z.null()]).optional(),
    city_name: z.union([z.string(), z.null()]).optional(),
    priority: z.number().int().optional().default(100),
    province_code: z.string(),
    province_name: z.union([z.string(), z.null()]).optional(),
    scope: z.string(),
  })
  .passthrough();
const SegmentTemplateItemOut: z.ZodType<SegmentTemplateItemOut> = z
  .object({
    active: z.boolean().optional().default(true),
    id: z.number().int(),
    max_kg: z.unknown().optional(),
    min_kg: z.unknown(),
    ord: z.number().int(),
    template_id: z.number().int(),
  })
  .passthrough();
const SegmentTemplateOut: z.ZodType<SegmentTemplateOut> = z
  .object({
    created_at: z.union([z.string(), z.null()]).optional(),
    effective_from: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    is_active: z.boolean(),
    items: z.array(SegmentTemplateItemOut).optional(),
    name: z.string(),
    published_at: z.union([z.string(), z.null()]).optional(),
    scheme_id: z.number().int(),
    status: z.string(),
    updated_at: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const SegmentTemplateListOut: z.ZodType<SegmentTemplateListOut> = z
  .object({
    data: z.array(SegmentTemplateOut),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const SegmentTemplateCreateIn = z
  .object({
    effective_from: z.union([z.string(), z.null()]),
    name: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const SegmentTemplateDetailOut: z.ZodType<SegmentTemplateDetailOut> = z
  .object({
    data: SegmentTemplateOut,
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const SchemeSegmentActivePatchIn = z
  .object({ active: z.boolean() })
  .passthrough();
const SurchargeCreateIn = z
  .object({
    active: z.boolean().optional().default(true),
    amount_json: z.object({}).partial().passthrough(),
    condition_json: z.object({}).partial().passthrough(),
    name: z.string().min(1).max(128),
  })
  .passthrough();
const SurchargeUpsertIn = z
  .object({
    active: z.boolean().optional().default(true),
    amount: z.number().gte(0),
    city: z.union([z.string(), z.null()]).optional(),
    name: z.union([z.string(), z.null()]).optional(),
    province: z.string().min(1).max(64),
    scope: z.enum(["province", "city"]),
  })
  .passthrough();
const WarehouseLiteOut: z.ZodType<WarehouseLiteOut> = z
  .object({
    active: z.boolean(),
    code: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    name: z.string(),
  })
  .passthrough();
const SchemeWarehouseOut: z.ZodType<SchemeWarehouseOut> = z
  .object({
    active: z.boolean(),
    scheme_id: z.number().int(),
    warehouse: WarehouseLiteOut,
    warehouse_id: z.number().int(),
  })
  .passthrough();
const SchemeWarehousesGetOut: z.ZodType<SchemeWarehousesGetOut> = z
  .object({ data: z.array(SchemeWarehouseOut), ok: z.boolean() })
  .passthrough();
const SchemeWarehouseBindIn = z
  .object({
    active: z.boolean().optional().default(false),
    warehouse_id: z.number().int().gte(1),
  })
  .passthrough();
const SchemeWarehouseBindOut: z.ZodType<SchemeWarehouseBindOut> = z
  .object({ data: SchemeWarehouseOut, ok: z.boolean() })
  .passthrough();
const SchemeWarehouseDeleteOut = z
  .object({ data: z.object({}).partial().passthrough(), ok: z.boolean() })
  .passthrough();
const SchemeWarehousePatchIn = z
  .object({ active: z.union([z.boolean(), z.null()]) })
  .partial()
  .passthrough();
const SchemeWarehousePatchOut: z.ZodType<SchemeWarehousePatchOut> = z
  .object({ data: SchemeWarehouseOut, ok: z.boolean() })
  .passthrough();
const SegmentRangeOut: z.ZodType<SegmentRangeOut> = z
  .object({
    active: z.boolean().optional().default(true),
    max_kg: z.union([z.string(), z.null()]).optional(),
    min_kg: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    ord: z.number().int(),
  })
  .passthrough();
const ZoneBracketsMatrixGroupOut: z.ZodType<ZoneBracketsMatrixGroupOut> = z
  .object({
    segment_template_id: z.number().int(),
    segments: z.array(SegmentRangeOut).optional(),
    template_is_active: z.boolean(),
    template_name: z.string(),
    template_status: z.string(),
    zones: z.array(ZoneOut).optional(),
  })
  .passthrough();
const ZoneBracketsMatrixOut: z.ZodType<ZoneBracketsMatrixOut> = z
  .object({
    groups: z.array(ZoneBracketsMatrixGroupOut).optional(),
    ok: z.boolean().optional().default(true),
    scheme_id: z.number().int(),
    unbound_zones: z.array(ZoneOut).optional(),
  })
  .passthrough();
const ZoneCreateIn = z
  .object({
    active: z.boolean().optional().default(true),
    name: z.string().min(1).max(128),
    segment_template_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ZoneCreateAtomicIn = z
  .object({
    active: z.boolean().optional().default(true),
    name: z.string().min(1).max(128),
    provinces: z.array(z.string()).optional(),
    segment_template_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const SchemeDefaultSegmentTemplateIn = z
  .object({ template_id: z.union([z.number(), z.null()]) })
  .partial()
  .passthrough();
const MarkFailedIn = z
  .object({ error: z.string().min(1).max(2000) })
  .passthrough();
const MarkPrintedIn = z
  .object({ printed_at: z.union([z.string(), z.null()]) })
  .partial()
  .passthrough();
const PurchaseOrderLineListOut: z.ZodType<PurchaseOrderLineListOut> = z
  .object({
    base_uom: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    discount_amount: z
      .string()
      .regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/)
      .optional()
      .default("0"),
    discount_note: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    item_id: z.number().int(),
    line_no: z.number().int(),
    po_id: z.number().int(),
    purchase_uom: z.union([z.string(), z.null()]).optional(),
    qty_ordered: z.number().int(),
    qty_ordered_base: z.number().int().gte(0),
    qty_received_base: z.number().int().gte(0),
    qty_remaining_base: z.number().int().gte(0),
    remark: z.union([z.string(), z.null()]).optional(),
    supply_price: z.union([z.string(), z.null()]).optional(),
    units_per_case: z.number().int().gte(1),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PurchaseOrderListItemOut: z.ZodType<PurchaseOrderListItemOut> = z
  .object({
    canceled_at: z.union([z.string(), z.null()]).optional(),
    canceled_by: z.union([z.number(), z.null()]).optional(),
    canceled_reason: z.union([z.string(), z.null()]).optional(),
    close_note: z.union([z.string(), z.null()]).optional(),
    close_reason: z.union([z.string(), z.null()]).optional(),
    closed_at: z.union([z.string(), z.null()]).optional(),
    closed_by: z.union([z.number(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    id: z.number().int(),
    last_received_at: z.union([z.string(), z.null()]).optional(),
    lines: z.array(PurchaseOrderLineListOut).optional().default([]),
    purchase_time: z.string().datetime({ offset: true }),
    purchaser: z.string(),
    remark: z.union([z.string(), z.null()]),
    status: z.string(),
    supplier_id: z.number().int(),
    supplier_name: z.string(),
    total_amount: z.union([z.string(), z.null()]),
    updated_at: z.string().datetime({ offset: true }),
    warehouse_id: z.number().int(),
    warehouse_name: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const PurchaseOrderLineCreate: z.ZodType<PurchaseOrderLineCreate> = z
  .object({
    base_uom: z.union([z.string(), z.null()]).optional(),
    discount_amount: z.union([z.number(), z.string(), z.null()]).optional(),
    discount_note: z.union([z.string(), z.null()]).optional(),
    item_id: z.number().int(),
    item_name: z.union([z.string(), z.null()]).optional(),
    item_sku: z.union([z.string(), z.null()]).optional(),
    line_no: z.number().int().gt(0),
    purchase_uom: z.union([z.string(), z.null()]).optional(),
    qty_ordered: z.number().int().gt(0),
    remark: z.union([z.string(), z.null()]).optional(),
    spec_text: z.union([z.string(), z.null()]).optional(),
    supply_price: z.union([z.number(), z.string(), z.null()]).optional(),
    units_per_case: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const PurchaseOrderCreateV2: z.ZodType<PurchaseOrderCreateV2> = z
  .object({
    lines: z.array(PurchaseOrderLineCreate).min(1),
    purchase_time: z.string().datetime({ offset: true }),
    purchaser: z.string(),
    remark: z.union([z.string(), z.null()]).optional(),
    supplier_id: z.number().int(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const PurchaseOrderLineOut: z.ZodType<PurchaseOrderLineOut> = z
  .object({
    base_uom: z.union([z.string(), z.null()]),
    brand: z.union([z.string(), z.null()]).optional(),
    category: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    discount_amount: z
      .string()
      .regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/)
      .optional()
      .default("0"),
    discount_note: z.union([z.string(), z.null()]).optional(),
    enabled: z.union([z.boolean(), z.null()]).optional(),
    has_shelf_life: z.union([z.boolean(), z.null()]).optional(),
    id: z.number().int(),
    item_id: z.number().int(),
    item_name: z.union([z.string(), z.null()]),
    item_sku: z.union([z.string(), z.null()]),
    line_no: z.number().int(),
    po_id: z.number().int(),
    primary_barcode: z.union([z.string(), z.null()]).optional(),
    purchase_uom: z.union([z.string(), z.null()]),
    qty_ordered: z.number().int().gt(0),
    qty_ordered_base: z.number().int().gte(0),
    qty_received: z.number().int().gte(0),
    qty_received_base: z.number().int().gte(0),
    qty_remaining: z.number().int().gte(0),
    qty_remaining_base: z.number().int().gte(0),
    remark: z.union([z.string(), z.null()]),
    shelf_life_unit: z.union([z.string(), z.null()]).optional(),
    shelf_life_value: z.union([z.number(), z.null()]).optional(),
    sku: z.union([z.string(), z.null()]).optional(),
    spec_text: z.union([z.string(), z.null()]),
    supplier_id: z.union([z.number(), z.null()]).optional(),
    supplier_name: z.union([z.string(), z.null()]).optional(),
    supply_price: z.union([z.string(), z.null()]),
    units_per_case: z.number().int().gte(1),
    uom: z.union([z.string(), z.null()]).optional(),
    updated_at: z.string().datetime({ offset: true }),
    weight_kg: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const PurchaseOrderWithLinesOut: z.ZodType<PurchaseOrderWithLinesOut> = z
  .object({
    canceled_at: z.union([z.string(), z.null()]).optional(),
    canceled_by: z.union([z.number(), z.null()]).optional(),
    canceled_reason: z.union([z.string(), z.null()]).optional(),
    close_note: z.union([z.string(), z.null()]).optional(),
    close_reason: z.union([z.string(), z.null()]).optional(),
    closed_at: z.union([z.string(), z.null()]).optional(),
    closed_by: z.union([z.number(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    id: z.number().int(),
    last_received_at: z.union([z.string(), z.null()]).optional(),
    lines: z.array(PurchaseOrderLineOut).optional().default([]),
    purchase_time: z.string().datetime({ offset: true }),
    purchaser: z.string(),
    remark: z.union([z.string(), z.null()]),
    status: z.string(),
    supplier_id: z.number().int(),
    supplier_name: z.string(),
    total_amount: z.union([z.string(), z.null()]),
    updated_at: z.string().datetime({ offset: true }),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const PurchaseOrderCloseIn = z
  .object({ note: z.union([z.string(), z.null()]) })
  .partial()
  .passthrough();
const PurchaseOrderReceiptEventOut = z
  .object({
    after_qty: z.number().int(),
    batch_code: z.string(),
    expiry_date: z.union([z.string(), z.null()]).optional(),
    item_id: z.number().int().gt(0),
    line_no: z.union([z.number(), z.null()]).optional(),
    occurred_at: z.string().datetime({ offset: true }),
    production_date: z.union([z.string(), z.null()]).optional(),
    qty: z.number().int(),
    ref: z.string(),
    ref_line: z.number().int().gt(0),
    warehouse_id: z.number().int().gt(0),
  })
  .passthrough();
const PurchaseOrderReceiveLineIn = z
  .object({
    barcode: z.union([z.string(), z.null()]).optional(),
    expiry_date: z.union([z.string(), z.null()]).optional(),
    line_id: z.union([z.number(), z.null()]).optional(),
    line_no: z.union([z.number(), z.null()]).optional(),
    production_date: z.union([z.string(), z.null()]).optional(),
    qty: z.number().int().gt(0),
  })
  .passthrough();
const WorkbenchCapsOut: z.ZodType<WorkbenchCapsOut> = z
  .object({
    can_confirm: z.boolean(),
    can_start_draft: z.boolean(),
    receipt_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const WorkbenchExplainOut: z.ZodType<WorkbenchExplainOut> = z
  .object({
    blocking_errors: z.array(z.object({}).partial().passthrough()).optional(),
    confirmable: z.boolean(),
    normalized_lines_preview: z
      .array(z.object({}).partial().passthrough())
      .optional(),
  })
  .passthrough();
const PoSummaryOut: z.ZodType<PoSummaryOut> = z
  .object({
    occurred_at: z.union([z.string(), z.null()]).optional(),
    po_id: z.number().int(),
    status: z.union([z.string(), z.null()]).optional(),
    supplier_id: z.union([z.number(), z.null()]).optional(),
    supplier_name: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const ReceiptSummaryOut: z.ZodType<ReceiptSummaryOut> = z
  .object({
    occurred_at: z.string().datetime({ offset: true }),
    receipt_id: z.number().int(),
    ref: z.string(),
    status: z.string(),
  })
  .passthrough();
const WorkbenchBatchRowOut: z.ZodType<WorkbenchBatchRowOut> = z
  .object({
    batch_code: z.string(),
    expiry_date: z.union([z.string(), z.null()]).optional(),
    production_date: z.union([z.string(), z.null()]).optional(),
    qty_received: z.number().int(),
  })
  .passthrough();
const WorkbenchRowOut: z.ZodType<WorkbenchRowOut> = z
  .object({
    all_batches: z.array(WorkbenchBatchRowOut).optional(),
    batches: z.array(WorkbenchBatchRowOut).optional(),
    confirmed_batches: z.array(WorkbenchBatchRowOut).optional(),
    confirmed_received_qty: z.number().int(),
    draft_received_qty: z.number().int(),
    item_id: z.number().int(),
    item_name: z.union([z.string(), z.null()]).optional(),
    item_sku: z.union([z.string(), z.null()]).optional(),
    line_no: z.number().int(),
    ordered_qty: z.number().int(),
    po_line_id: z.number().int(),
    remaining_qty: z.number().int(),
  })
  .passthrough();
const PurchaseOrderReceiveWorkbenchOut: z.ZodType<PurchaseOrderReceiveWorkbenchOut> =
  z
    .object({
      caps: WorkbenchCapsOut,
      explain: z.union([WorkbenchExplainOut, z.null()]).optional(),
      po_summary: PoSummaryOut,
      receipt: z.union([ReceiptSummaryOut, z.null()]).optional(),
      rows: z.array(WorkbenchRowOut),
    })
    .passthrough();
const DailyPurchaseReportItem = z
  .object({
    day: z.string(),
    order_count: z.number().int(),
    total_amount: z.union([z.string(), z.null()]).optional(),
    total_qty_cases: z.number().int(),
    total_units: z.number().int(),
  })
  .passthrough();
const ItemPurchaseReportItem = z
  .object({
    avg_unit_price: z.union([z.string(), z.null()]).optional(),
    barcode: z.union([z.string(), z.null()]).optional(),
    brand: z.union([z.string(), z.null()]).optional(),
    category: z.union([z.string(), z.null()]).optional(),
    item_id: z.number().int(),
    item_name: z.union([z.string(), z.null()]).optional(),
    item_sku: z.union([z.string(), z.null()]).optional(),
    order_count: z.number().int(),
    spec_text: z.union([z.string(), z.null()]).optional(),
    supplier_id: z.union([z.number(), z.null()]).optional(),
    supplier_name: z.union([z.string(), z.null()]).optional(),
    total_amount: z.union([z.string(), z.null()]).optional(),
    total_qty_cases: z.number().int(),
    total_units: z.number().int(),
  })
  .passthrough();
const SupplierPurchaseReportItem = z
  .object({
    avg_unit_price: z.union([z.string(), z.null()]).optional(),
    order_count: z.number().int(),
    supplier_id: z.union([z.number(), z.null()]),
    supplier_name: z.string(),
    total_amount: z.union([z.string(), z.null()]).optional(),
    total_qty_cases: z.number().int(),
    total_units: z.number().int(),
  })
  .passthrough();
const ReturnTaskLineOut: z.ZodType<ReturnTaskLineOut> = z
  .object({
    batch_code: z.string(),
    committed_qty: z.union([z.number(), z.null()]),
    expected_qty: z.union([z.number(), z.null()]),
    id: z.number().int(),
    item_id: z.number().int(),
    item_name: z.union([z.string(), z.null()]),
    order_line_id: z.union([z.number(), z.null()]).optional(),
    picked_qty: z.number().int(),
    remark: z.union([z.string(), z.null()]),
    status: z.string(),
    task_id: z.number().int(),
  })
  .passthrough();
const ReturnTaskOut: z.ZodType<ReturnTaskOut> = z
  .object({
    created_at: z.string().datetime({ offset: true }),
    id: z.number().int(),
    lines: z.array(ReturnTaskLineOut).optional().default([]),
    order_id: z.string(),
    remark: z.union([z.string(), z.null()]),
    status: z.string(),
    updated_at: z.string().datetime({ offset: true }),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const ReturnTaskCreateFromOrder = z
  .object({
    include_zero_shipped: z.boolean().default(false),
    warehouse_id: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const ReturnOrderRefItem = z
  .object({
    last_ship_at: z.string().datetime({ offset: true }),
    order_ref: z.string(),
    remaining_qty: z.number().int(),
    total_lines: z.number().int(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ReturnOrderRefReceiverOut: z.ZodType<ReturnOrderRefReceiverOut> = z
  .object({
    city: z.union([z.string(), z.null()]),
    detail: z.union([z.string(), z.null()]),
    district: z.union([z.string(), z.null()]),
    name: z.union([z.string(), z.null()]),
    phone: z.union([z.string(), z.null()]),
    province: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const ReturnOrderRefShippingOut: z.ZodType<ReturnOrderRefShippingOut> = z
  .object({
    carrier_code: z.union([z.string(), z.null()]),
    carrier_name: z.union([z.string(), z.null()]),
    cost_estimated: z.union([z.number(), z.null()]),
    gross_weight_kg: z.union([z.number(), z.null()]),
    meta: z.union([z.object({}).partial().passthrough(), z.null()]),
    receiver: z.union([ReturnOrderRefReceiverOut, z.null()]),
    shipped_at: z.union([z.string(), z.null()]),
    status: z.union([z.string(), z.null()]),
    tracking_no: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const ReturnOrderRefSummaryLine: z.ZodType<ReturnOrderRefSummaryLine> = z
  .object({
    batch_code: z.string(),
    item_id: z.number().int(),
    item_name: z.union([z.string(), z.null()]).optional(),
    shipped_qty: z.number().int(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const ReturnOrderRefSummaryOut: z.ZodType<ReturnOrderRefSummaryOut> = z
  .object({
    lines: z.array(ReturnOrderRefSummaryLine),
    order_ref: z.string(),
    ship_reasons: z.array(z.string()).optional(),
  })
  .passthrough();
const ReturnOrderRefDetailOut: z.ZodType<ReturnOrderRefDetailOut> = z
  .object({
    ext_order_no: z.union([z.string(), z.null()]).optional(),
    order_ref: z.string(),
    platform: z.union([z.string(), z.null()]).optional(),
    remaining_qty: z.union([z.number(), z.null()]).optional(),
    shipping: z.union([ReturnOrderRefShippingOut, z.null()]).optional(),
    shop_id: z.union([z.string(), z.null()]).optional(),
    summary: ReturnOrderRefSummaryOut,
  })
  .passthrough();
const ReturnTaskCommitIn = z
  .object({ trace_id: z.union([z.string(), z.null()]) })
  .partial()
  .passthrough();
const ReturnTaskReceiveIn = z
  .object({ item_id: z.number().int(), qty: z.number().int() })
  .passthrough();
const RoleOut: z.ZodType<RoleOut> = z
  .object({
    description: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    name: z.string().min(1).max(64),
    permissions: z.array(PermissionOut).optional(),
  })
  .passthrough();
const RoleCreate = z
  .object({
    description: z.union([z.string(), z.null()]).optional(),
    name: z.string().min(1).max(64),
  })
  .passthrough();
const RolePermissionsBody = z
  .object({ permission_ids: z.array(z.string()) })
  .passthrough();
const ScanRequest = z
  .object({
    barcode: z.union([z.string(), z.null()]).optional(),
    batch_code: z.union([z.string(), z.null()]).optional(),
    ctx: z.union([z.object({}).partial().passthrough(), z.null()]).optional(),
    expiry_date: z.union([z.string(), z.null()]).optional(),
    item_id: z.union([z.number(), z.null()]).optional(),
    mode: z.string(),
    probe: z.boolean().optional().default(false),
    production_date: z.union([z.string(), z.null()]).optional(),
    qty: z.union([z.number(), z.null()]).optional().default(1),
    task_line_id: z.union([z.number(), z.null()]).optional(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ScanResponse = z
  .object({
    actual: z.union([z.number(), z.null()]).optional(),
    after: z.union([z.number(), z.null()]).optional(),
    after_qty: z.union([z.number(), z.null()]).optional(),
    batch_code: z.union([z.string(), z.null()]).optional(),
    before: z.union([z.number(), z.null()]).optional(),
    before_qty: z.union([z.number(), z.null()]).optional(),
    committed: z.boolean().optional().default(true),
    delta: z.union([z.number(), z.null()]).optional(),
    errors: z.array(z.object({}).partial().passthrough()).optional(),
    event_id: z.union([z.number(), z.null()]).optional(),
    evidence: z.array(z.object({}).partial().passthrough()).optional(),
    expiry_date: z.union([z.string(), z.null()]).optional(),
    item_id: z.union([z.number(), z.null()]).optional(),
    location_id: z.union([z.number(), z.null()]).optional(),
    ok: z.boolean().optional().default(true),
    production_date: z.union([z.string(), z.null()]).optional(),
    qty: z.union([z.number(), z.null()]).optional(),
    scan_ref: z.string(),
    source: z.string(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ScanCountCommitRequest = z
  .object({
    batch_code: z.union([z.string(), z.null()]).optional(),
    expiry_date: z.union([z.string(), z.null()]).optional(),
    item_id: z.number().int(),
    location_id: z.number().int(),
    occurred_at: z.string().datetime({ offset: true }).optional(),
    production_date: z.union([z.string(), z.null()]).optional(),
    qty: z.number().int().gte(0),
    ref: z.string(),
  })
  .passthrough();
const SegmentTemplateItemActivePatchIn = z
  .object({ active: z.boolean() })
  .passthrough();
const SegmentTemplateItemIn: z.ZodType<SegmentTemplateItemIn> = z
  .object({
    active: z.boolean().optional().default(true),
    max_kg: z.unknown().optional(),
    min_kg: z.unknown(),
    ord: z.number().int().gte(0),
  })
  .passthrough();
const SegmentTemplateItemsPutIn: z.ZodType<SegmentTemplateItemsPutIn> = z
  .object({ items: z.array(SegmentTemplateItemIn) })
  .passthrough();
const SegmentTemplateRenameIn = z
  .object({ name: z.string().min(1).max(80) })
  .passthrough();
const ShipCalcRequest = z
  .object({
    city: z.union([z.string(), z.null()]).optional(),
    debug_ref: z.union([z.string(), z.null()]).optional(),
    district: z.union([z.string(), z.null()]).optional(),
    province: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int().gte(1),
    weight_kg: z.number().gt(0),
  })
  .passthrough();
const ShipQuoteOut: z.ZodType<ShipQuoteOut> = z
  .object({
    breakdown: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    carrier_code: z.union([z.string(), z.null()]).optional(),
    carrier_name: z.string(),
    currency: z.union([z.string(), z.null()]).optional(),
    est_cost: z.union([z.number(), z.null()]).optional(),
    eta: z.union([z.string(), z.null()]).optional(),
    provider_id: z.number().int(),
    quote_status: z.string(),
    reasons: z.array(z.string()).optional(),
    scheme_id: z.number().int(),
    scheme_name: z.string(),
  })
  .passthrough();
const ShipRecommendedOut: z.ZodType<ShipRecommendedOut> = z
  .object({
    carrier_code: z.union([z.string(), z.null()]).optional(),
    currency: z.union([z.number(), z.null()]).optional(),
    est_cost: z.union([z.number(), z.null()]).optional(),
    provider_id: z.number().int(),
    scheme_id: z.number().int(),
  })
  .passthrough();
const ShipCalcResponse: z.ZodType<ShipCalcResponse> = z
  .object({
    dest: z.union([z.string(), z.null()]).optional(),
    ok: z.boolean().optional().default(true),
    quotes: z.array(ShipQuoteOut),
    recommended: z.union([ShipRecommendedOut, z.null()]).optional(),
    weight_kg: z.number(),
  })
  .passthrough();
const ShipConfirmRequest = z
  .object({
    carrier: z.union([z.string(), z.null()]).optional(),
    carrier_name: z.union([z.string(), z.null()]).optional(),
    cost_estimated: z.union([z.number(), z.null()]).optional(),
    cost_real: z.union([z.number(), z.null()]).optional(),
    delivery_time: z.union([z.string(), z.null()]).optional(),
    error_code: z.union([z.string(), z.null()]).optional(),
    error_message: z.union([z.string(), z.null()]).optional(),
    gross_weight_kg: z.union([z.number(), z.null()]).optional(),
    meta: z.union([z.object({}).partial().passthrough(), z.null()]).optional(),
    packaging_weight_kg: z.union([z.number(), z.null()]).optional(),
    platform: z.string(),
    ref: z.string().min(1),
    scheme_id: z.union([z.number(), z.null()]).optional(),
    shop_id: z.string(),
    status: z.union([z.string(), z.null()]).optional(),
    trace_id: z.union([z.string(), z.null()]).optional(),
    tracking_no: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ShipConfirmResponse = z
  .object({
    ok: z.boolean().optional().default(true),
    ref: z.string(),
    trace_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const ShipPrepareRequest = z
  .object({
    ext_order_no: z.string(),
    platform: z.string(),
    shop_id: z.string(),
  })
  .passthrough();
const CandidateWarehouseOut: z.ZodType<CandidateWarehouseOut> = z
  .object({
    priority: z.number().int().optional().default(100),
    warehouse_active: z.boolean().optional().default(true),
    warehouse_code: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int(),
    warehouse_name: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const FulfillmentMissingLineOut: z.ZodType<FulfillmentMissingLineOut> = z
  .object({
    available: z.number().int(),
    item_id: z.number().int(),
    need: z.number().int(),
  })
  .passthrough();
const FulfillmentScanWarehouseOut: z.ZodType<FulfillmentScanWarehouseOut> = z
  .object({
    missing: z.array(FulfillmentMissingLineOut).optional(),
    status: z.string(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const ShipPrepareItem: z.ZodType<ShipPrepareItem> = z
  .object({ item_id: z.number().int(), qty: z.number().int() })
  .passthrough();
const ShipPrepareResponse: z.ZodType<ShipPrepareResponse> = z
  .object({
    address_detail: z.union([z.string(), z.null()]).optional(),
    blocked_reasons: z.array(z.string()).optional(),
    candidate_warehouses: z.array(CandidateWarehouseOut).optional(),
    city: z.union([z.string(), z.null()]).optional(),
    district: z.union([z.string(), z.null()]).optional(),
    ext_order_no: z.string(),
    fulfillment_scan: z.array(FulfillmentScanWarehouseOut).optional(),
    fulfillment_status: z.union([z.string(), z.null()]).optional(),
    items: z.array(ShipPrepareItem).optional(),
    ok: z.boolean().optional().default(true),
    order_id: z.number().int(),
    platform: z.string(),
    province: z.union([z.string(), z.null()]).optional(),
    receiver_name: z.union([z.string(), z.null()]).optional(),
    receiver_phone: z.union([z.string(), z.null()]).optional(),
    ref: z.string(),
    shop_id: z.string(),
    total_qty: z.number().int().optional().default(0),
    trace_id: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
    warehouse_reason: z.union([z.string(), z.null()]).optional(),
    weight_kg: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ShippingProviderContactUpdateIn = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    email: z.union([z.string(), z.null()]),
    is_primary: z.union([z.boolean(), z.null()]),
    name: z.union([z.string(), z.null()]),
    phone: z.union([z.string(), z.null()]),
    role: z.union([z.string(), z.null()]),
    wechat: z.union([z.union([z.string(), z.string()]), z.null()]),
  })
  .partial()
  .passthrough();
const ShippingProviderContactOut: z.ZodType<ShippingProviderContactOut> = z
  .object({
    active: z.boolean(),
    email: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    is_primary: z.boolean(),
    name: z.string(),
    phone: z.union([z.string(), z.null()]).optional(),
    role: z.string(),
    shipping_provider_id: z.number().int(),
    wechat: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const ShippingProviderOut: z.ZodType<ShippingProviderOut> = z
  .object({
    active: z.boolean().optional().default(true),
    address: z.union([z.string(), z.null()]).optional(),
    code: z.union([z.string(), z.null()]).optional(),
    contacts: z.array(ShippingProviderContactOut).optional(),
    id: z.number().int(),
    name: z.string(),
    pricing_model: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    priority: z.number().int().optional().default(100),
    region_rules: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const ShippingProviderListOut: z.ZodType<ShippingProviderListOut> = z
  .object({
    data: z.array(ShippingProviderOut),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const ShippingProviderCreateIn = z
  .object({
    active: z.boolean().optional().default(true),
    address: z.union([z.string(), z.null()]).optional(),
    code: z.union([z.string(), z.null()]).optional(),
    name: z.string().min(1).max(255),
    pricing_model: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    priority: z.union([z.number(), z.null()]).optional().default(100),
    region_rules: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    warehouse_id: z.number().int().gte(1),
  })
  .passthrough();
const ShippingProviderCreateOut: z.ZodType<ShippingProviderCreateOut> = z
  .object({
    data: ShippingProviderOut,
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const ShippingProviderDetailOut: z.ZodType<ShippingProviderDetailOut> = z
  .object({
    data: ShippingProviderOut,
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const ShippingProviderUpdateIn = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    address: z.union([z.string(), z.null()]),
    code: z.union([z.string(), z.null()]),
    name: z.union([z.string(), z.null()]),
    pricing_model: z.union([z.object({}).partial().passthrough(), z.null()]),
    priority: z.union([z.number(), z.null()]),
    region_rules: z.union([z.object({}).partial().passthrough(), z.null()]),
    warehouse_id: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const ShippingProviderUpdateOut: z.ZodType<ShippingProviderUpdateOut> = z
  .object({
    data: ShippingProviderOut,
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const ShippingProviderContactCreateIn = z
  .object({
    active: z.boolean().optional().default(true),
    email: z.union([z.string(), z.null()]).optional(),
    is_primary: z.boolean().optional().default(false),
    name: z.string().min(1).max(100),
    phone: z.union([z.string(), z.null()]).optional(),
    role: z.string().max(32).optional().default("other"),
    wechat: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const SchemeListOut: z.ZodType<SchemeListOut> = z
  .object({
    data: z.array(SchemeOut),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const SchemeCreateIn: z.ZodType<SchemeCreateIn> = z
  .object({
    active: z.boolean().optional().default(true),
    billable_weight_rule: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    currency: z.string().min(1).max(8).optional().default("CNY"),
    default_pricing_mode: z
      .string()
      .min(1)
      .max(32)
      .optional()
      .default("linear_total"),
    effective_from: z.union([z.string(), z.null()]).optional(),
    effective_to: z.union([z.string(), z.null()]).optional(),
    name: z.string().min(1).max(128),
    segments_json: z.union([z.array(WeightSegmentIn), z.null()]).optional(),
  })
  .passthrough();
const QuoteDestIn: z.ZodType<QuoteDestIn> = z
  .object({
    city: z.union([z.string(), z.null()]).optional(),
    city_code: z.union([z.string(), z.null()]).optional(),
    district: z.union([z.string(), z.null()]).optional(),
    province: z.union([z.string(), z.null()]).optional(),
    province_code: z.string().min(1),
  })
  .passthrough();
const QuoteCalcIn: z.ZodType<QuoteCalcIn> = z
  .object({
    dest: QuoteDestIn,
    flags: z.array(z.string()).optional(),
    height_cm: z.union([z.number(), z.null()]).optional(),
    length_cm: z.union([z.number(), z.null()]).optional(),
    real_weight_kg: z.number().gte(0),
    scheme_id: z.number().int().gte(1),
    warehouse_id: z.number().int().gte(1),
    width_cm: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const QuoteCalcOut = z
  .object({
    bracket: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    breakdown: z.object({}).partial().passthrough(),
    currency: z.union([z.string(), z.null()]).optional(),
    ok: z.boolean(),
    quote_status: z.string(),
    reasons: z.array(z.string()).optional(),
    total_amount: z.union([z.number(), z.null()]).optional(),
    weight: z.object({}).partial().passthrough(),
    zone: z.union([z.object({}).partial().passthrough(), z.null()]).optional(),
  })
  .passthrough();
const QuoteRecommendIn: z.ZodType<QuoteRecommendIn> = z
  .object({
    dest: QuoteDestIn,
    flags: z.array(z.string()).optional(),
    height_cm: z.union([z.number(), z.null()]).optional(),
    length_cm: z.union([z.number(), z.null()]).optional(),
    max_results: z.number().int().gte(1).lte(50).optional().default(10),
    provider_ids: z.array(z.number().int()).optional(),
    real_weight_kg: z.number().gte(0),
    warehouse_id: z.number().int().gte(1),
    width_cm: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const QuoteRecommendItemOut: z.ZodType<QuoteRecommendItemOut> = z
  .object({
    bracket: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    breakdown: z.object({}).partial().passthrough(),
    carrier_code: z.union([z.string(), z.null()]).optional(),
    carrier_name: z.string(),
    currency: z.union([z.string(), z.null()]).optional(),
    provider_id: z.number().int(),
    quote_status: z.string(),
    reasons: z.array(z.string()).optional(),
    scheme_id: z.number().int(),
    scheme_name: z.string(),
    total_amount: z.number(),
    weight: z.object({}).partial().passthrough(),
    zone: z.union([z.object({}).partial().passthrough(), z.null()]).optional(),
  })
  .passthrough();
const QuoteRecommendOut: z.ZodType<QuoteRecommendOut> = z
  .object({
    ok: z.boolean(),
    quotes: z.array(QuoteRecommendItemOut),
    recommended_scheme_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ShippingRecordOut = z
  .object({
    carrier_code: z.union([z.string(), z.null()]).optional(),
    carrier_name: z.union([z.string(), z.null()]).optional(),
    cost_estimated: z.union([z.number(), z.null()]).optional(),
    cost_real: z.union([z.number(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    delivery_time: z.union([z.string(), z.null()]).optional(),
    error_code: z.union([z.string(), z.null()]).optional(),
    error_message: z.union([z.string(), z.null()]).optional(),
    gross_weight_kg: z.union([z.number(), z.null()]).optional(),
    id: z.number().int(),
    meta: z.union([z.object({}).partial().passthrough(), z.null()]).optional(),
    order_ref: z.string(),
    packaging_weight_kg: z.union([z.number(), z.null()]).optional(),
    platform: z.string(),
    shop_id: z.string(),
    status: z.union([z.string(), z.null()]).optional(),
    trace_id: z.union([z.string(), z.null()]).optional(),
    tracking_no: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
    weight_kg: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ShippingStatusUpdateIn = z
  .object({
    delivery_time: z.union([z.string(), z.null()]).optional(),
    error_code: z.union([z.string(), z.null()]).optional(),
    error_message: z.union([z.string(), z.null()]).optional(),
    meta: z.union([z.object({}).partial().passthrough(), z.null()]).optional(),
    status: z.enum(["IN_TRANSIT", "DELIVERED", "LOST", "RETURNED"]),
  })
  .passthrough();
const ShippingStatusUpdateOut = z
  .object({
    delivery_time: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    ok: z.boolean().optional().default(true),
    status: z.string(),
  })
  .passthrough();
const ShippingByCarrierRow: z.ZodType<ShippingByCarrierRow> = z
  .object({
    avg_cost: z.number(),
    carrier_code: z.union([z.string(), z.null()]).optional(),
    carrier_name: z.union([z.string(), z.null()]).optional(),
    ship_cnt: z.number().int(),
    total_cost: z.number(),
  })
  .passthrough();
const ShippingByCarrierResponse: z.ZodType<ShippingByCarrierResponse> = z
  .object({
    ok: z.boolean().optional().default(true),
    rows: z.array(ShippingByCarrierRow),
  })
  .passthrough();
const ShippingByProvinceRow: z.ZodType<ShippingByProvinceRow> = z
  .object({
    avg_cost: z.number(),
    province: z.union([z.string(), z.null()]).optional(),
    ship_cnt: z.number().int(),
    total_cost: z.number(),
  })
  .passthrough();
const ShippingByProvinceResponse: z.ZodType<ShippingByProvinceResponse> = z
  .object({
    ok: z.boolean().optional().default(true),
    rows: z.array(ShippingByProvinceRow),
  })
  .passthrough();
const ShippingByShopRow: z.ZodType<ShippingByShopRow> = z
  .object({
    avg_cost: z.number(),
    platform: z.string(),
    ship_cnt: z.number().int(),
    shop_id: z.string(),
    total_cost: z.number(),
  })
  .passthrough();
const ShippingByShopResponse: z.ZodType<ShippingByShopResponse> = z
  .object({
    ok: z.boolean().optional().default(true),
    rows: z.array(ShippingByShopRow),
  })
  .passthrough();
const ShippingByWarehouseRow: z.ZodType<ShippingByWarehouseRow> = z
  .object({
    avg_cost: z.number(),
    ship_cnt: z.number().int(),
    total_cost: z.number(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ShippingByWarehouseResponse: z.ZodType<ShippingByWarehouseResponse> = z
  .object({
    ok: z.boolean().optional().default(true),
    rows: z.array(ShippingByWarehouseRow),
  })
  .passthrough();
const ShippingDailyRow: z.ZodType<ShippingDailyRow> = z
  .object({
    avg_cost: z.number(),
    ship_cnt: z.number().int(),
    stat_date: z.string(),
    total_cost: z.number(),
  })
  .passthrough();
const ShippingDailyResponse: z.ZodType<ShippingDailyResponse> = z
  .object({
    ok: z.boolean().optional().default(true),
    rows: z.array(ShippingDailyRow),
  })
  .passthrough();
const ShippingListRow: z.ZodType<ShippingListRow> = z
  .object({
    carrier_code: z.union([z.string(), z.null()]).optional(),
    carrier_name: z.union([z.string(), z.null()]).optional(),
    cost_estimated: z.union([z.number(), z.null()]).optional(),
    created_at: z.string(),
    gross_weight_kg: z.union([z.number(), z.null()]).optional(),
    id: z.number().int(),
    meta: z.union([z.object({}).partial().passthrough(), z.null()]).optional(),
    order_ref: z.string(),
    packaging_weight_kg: z.union([z.number(), z.null()]).optional(),
    platform: z.string(),
    shop_id: z.string(),
    status: z.union([z.string(), z.null()]).optional(),
    trace_id: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ShippingListResponse: z.ZodType<ShippingListResponse> = z
  .object({
    ok: z.boolean().optional().default(true),
    rows: z.array(ShippingListRow),
    total: z.number().int(),
  })
  .passthrough();
const ShippingReportFilterOptions = z
  .object({
    cities: z.array(z.string()),
    platforms: z.array(z.string()),
    provinces: z.array(z.string()),
    shop_ids: z.array(z.string()),
  })
  .passthrough();
const InventoryRow: z.ZodType<InventoryRow> = z
  .object({
    batch_code: z.union([z.string(), z.null()]).optional(),
    brand: z.union([z.string(), z.null()]).optional(),
    category: z.union([z.string(), z.null()]).optional(),
    days_to_expiry: z.union([z.number(), z.null()]).optional(),
    expiry_date: z.union([z.string(), z.null()]).optional(),
    item_code: z.union([z.string(), z.null()]).optional(),
    item_id: z.number().int().gte(1),
    item_name: z.string().min(0).max(128),
    main_barcode: z.union([z.string(), z.null()]).optional(),
    near_expiry: z.boolean().optional().default(false),
    qty: z.number().int(),
    spec: z.union([z.string(), z.null()]).optional(),
    uom: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int().gte(1),
  })
  .passthrough();
const InventorySnapshotResponse: z.ZodType<InventorySnapshotResponse> = z
  .object({
    limit: z.number().int().gte(1).lte(100),
    offset: z.number().int().gte(0),
    rows: z.array(InventoryRow).optional(),
    total: z.number().int().gte(0),
  })
  .passthrough();
const ItemDetailSlice: z.ZodType<ItemDetailSlice> = z
  .object({
    available_qty: z.number().int().gte(0),
    batch_code: z.string().min(1).max(64),
    expiry_date: z.union([z.string(), z.null()]).optional(),
    is_top: z.boolean().optional().default(false),
    near_expiry: z.boolean().optional().default(false),
    on_hand_qty: z.number().int().gte(0),
    pool: z.string().min(1).max(32),
    production_date: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int().gte(1),
    warehouse_name: z.string().min(1).max(100),
  })
  .passthrough();
const ItemDetailTotals: z.ZodType<ItemDetailTotals> = z
  .object({
    available_qty: z.number().int().gte(0),
    on_hand_qty: z.number().int().gte(0),
  })
  .passthrough();
const ItemDetailResponse: z.ZodType<ItemDetailResponse> = z
  .object({
    item_id: z.number().int().gte(1),
    item_name: z.string().min(0).max(128),
    slices: z.array(ItemDetailSlice),
    totals: ItemDetailTotals,
  })
  .passthrough();
const StockBatchQueryIn = z
  .object({
    expiry_date_from: z.union([z.string(), z.null()]),
    expiry_date_to: z.union([z.string(), z.null()]),
    item_id: z.union([z.number(), z.null()]),
    page: z.number().int().gte(1).default(1),
    page_size: z.number().int().gte(1).lte(500).default(50),
    warehouse_id: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const StockBatchRow: z.ZodType<StockBatchRow> = z
  .object({
    batch_code: z.string(),
    batch_id: z.number().int(),
    days_to_expiry: z.union([z.number(), z.null()]).optional(),
    expiry_date: z.union([z.string(), z.null()]).optional(),
    item_id: z.number().int(),
    production_date: z.union([z.string(), z.null()]).optional(),
    qty: z.number().int(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const StockBatchQueryOut: z.ZodType<StockBatchQueryOut> = z
  .object({
    items: z.array(StockBatchRow).optional(),
    page: z.number().int(),
    page_size: z.number().int(),
    total: z.number().int(),
  })
  .passthrough();
const ReasonCanon = z.enum(["RECEIPT", "SHIPMENT", "ADJUSTMENT"]);
const SubReason = z.enum([
  "PO_RECEIPT",
  "ORDER_SHIP",
  "COUNT_ADJUST",
  "RETURN_RECEIPT",
  "INTERNAL_SHIP",
  "RETURN_TO_VENDOR",
]);
const LedgerEnums: z.ZodType<LedgerEnums> = z
  .object({
    reason_canons: z.array(ReasonCanon),
    sub_reasons: z.array(SubReason),
  })
  .partial()
  .passthrough();
const ExplainAnchor: z.ZodType<ExplainAnchor> = z
  .object({
    ref: z.string(),
    trace_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const ExplainLedgerRow: z.ZodType<ExplainLedgerRow> = z
  .object({
    after_qty: z.number().int(),
    batch_code: z.string(),
    created_at: z.string().datetime({ offset: true }),
    delta: z.number().int(),
    expiry_date: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    item_id: z.number().int(),
    occurred_at: z.string().datetime({ offset: true }),
    production_date: z.union([z.string(), z.null()]).optional(),
    reason: z.string(),
    reason_canon: z.union([z.string(), z.null()]).optional(),
    ref: z.string(),
    ref_line: z.number().int(),
    sub_reason: z.union([z.string(), z.null()]).optional(),
    trace_id: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const ExplainPurchaseOrderLine: z.ZodType<ExplainPurchaseOrderLine> = z
  .object({
    base_uom: z.union([z.string(), z.null()]).optional(),
    category: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    item_id: z.number().int(),
    item_name: z.union([z.string(), z.null()]).optional(),
    item_sku: z.union([z.string(), z.null()]).optional(),
    line_no: z.number().int(),
    po_id: z.number().int(),
    purchase_uom: z.union([z.string(), z.null()]).optional(),
    qty_ordered: z.number().int(),
    qty_received: z.number().int(),
    remark: z.union([z.string(), z.null()]).optional(),
    spec_text: z.union([z.string(), z.null()]).optional(),
    status: z.string(),
    units_per_case: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ExplainPurchaseOrder: z.ZodType<ExplainPurchaseOrder> = z
  .object({
    closed_at: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    id: z.number().int(),
    last_received_at: z.union([z.string(), z.null()]).optional(),
    lines: z.array(ExplainPurchaseOrderLine).optional().default([]),
    purchase_time: z.string().datetime({ offset: true }),
    purchaser: z.string(),
    remark: z.union([z.string(), z.null()]).optional(),
    status: z.string(),
    supplier_id: z.union([z.number(), z.null()]).optional(),
    supplier_name: z.union([z.string(), z.null()]).optional(),
    updated_at: z.string().datetime({ offset: true }),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const ExplainReceipt: z.ZodType<ExplainReceipt> = z
  .object({
    created_at: z.string().datetime({ offset: true }),
    id: z.number().int(),
    occurred_at: z.string().datetime({ offset: true }),
    ref: z.string(),
    remark: z.union([z.string(), z.null()]).optional(),
    source_id: z.union([z.number(), z.null()]).optional(),
    source_type: z.string(),
    status: z.string(),
    supplier_id: z.union([z.number(), z.null()]).optional(),
    supplier_name: z.union([z.string(), z.null()]).optional(),
    trace_id: z.union([z.string(), z.null()]).optional(),
    updated_at: z.string().datetime({ offset: true }),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const ExplainReceiptLine: z.ZodType<ExplainReceiptLine> = z
  .object({
    base_uom: z.union([z.string(), z.null()]).optional(),
    batch_code: z.string(),
    category: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    expiry_date: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    item_id: z.number().int(),
    item_name: z.union([z.string(), z.null()]).optional(),
    item_sku: z.union([z.string(), z.null()]).optional(),
    line_amount: z.union([z.string(), z.null()]).optional(),
    line_no: z.number().int(),
    po_line_id: z.union([z.number(), z.null()]).optional(),
    production_date: z.union([z.string(), z.null()]).optional(),
    purchase_uom: z.union([z.string(), z.null()]).optional(),
    qty_received: z.number().int(),
    qty_units: z.number().int(),
    receipt_id: z.number().int(),
    remark: z.union([z.string(), z.null()]).optional(),
    spec_text: z.union([z.string(), z.null()]).optional(),
    unit_cost: z.union([z.string(), z.null()]).optional(),
    units_per_case: z.number().int(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const LedgerExplainOut: z.ZodType<LedgerExplainOut> = z
  .object({
    anchor: ExplainAnchor,
    ledger: z.array(ExplainLedgerRow),
    purchase_order: z.union([ExplainPurchaseOrder, z.null()]).optional(),
    receipt: ExplainReceipt,
    receipt_lines: z.array(ExplainReceiptLine),
  })
  .passthrough();
const LedgerQuery: z.ZodType<LedgerQuery> = z
  .object({
    batch_code: z.union([z.string(), z.null()]),
    item_id: z.union([z.number(), z.null()]),
    item_keyword: z.union([z.string(), z.null()]),
    limit: z.number().int().gte(1).lte(1000).default(100),
    offset: z.number().int().gte(0).default(0),
    reason: z.union([z.string(), z.null()]),
    reason_canon: z.union([ReasonCanon, z.null()]),
    ref: z.union([z.string(), z.null()]),
    sub_reason: z.union([SubReason, z.null()]),
    time_from: z.union([z.string(), z.null()]),
    time_to: z.union([z.string(), z.null()]),
    trace_id: z.union([z.string(), z.null()]),
    warehouse_id: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const LedgerRow: z.ZodType<LedgerRow> = z
  .object({
    after_qty: z.number().int(),
    batch_code: z.string(),
    created_at: z.string().datetime({ offset: true }),
    delta: z.number().int(),
    id: z.number().int(),
    item_id: z.number().int(),
    item_name: z.union([z.string(), z.null()]).optional(),
    movement_type: z.union([z.string(), z.null()]).optional(),
    occurred_at: z.string().datetime({ offset: true }),
    reason: z.string(),
    reason_canon: z.union([z.string(), z.null()]).optional(),
    ref: z.union([z.string(), z.null()]).optional(),
    ref_line: z.number().int(),
    sub_reason: z.union([z.string(), z.null()]).optional(),
    trace_id: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const LedgerList: z.ZodType<LedgerList> = z
  .object({ items: z.array(LedgerRow).optional(), total: z.number().int() })
  .passthrough();
const LedgerReconcileRow: z.ZodType<LedgerReconcileRow> = z
  .object({
    batch_code: z.string(),
    diff: z.number().int(),
    item_id: z.number().int(),
    ledger_sum_delta: z.number().int(),
    stock_qty: z.number().int(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const LedgerReconcileResult: z.ZodType<LedgerReconcileResult> = z
  .object({ rows: z.array(LedgerReconcileRow) })
  .partial()
  .passthrough();
const ReconcileSummaryPayload = z
  .object({
    time_from: z.union([z.string(), z.null()]),
    time_to: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const ThreeBooksPayload = z
  .object({ cut: z.string().datetime({ offset: true }) })
  .passthrough();
const LedgerReasonStat: z.ZodType<LedgerReasonStat> = z
  .object({
    count: z.number().int(),
    reason: z.string(),
    total_delta: z.number().int(),
  })
  .passthrough();
const LedgerSummary: z.ZodType<LedgerSummary> = z
  .object({
    by_reason: z.array(LedgerReasonStat).optional(),
    filters: LedgerQuery,
    net_delta: z.number().int(),
  })
  .passthrough();
const StoreListItem: z.ZodType<StoreListItem> = z
  .object({
    active: z.boolean(),
    contact_name: z.union([z.string(), z.null()]).optional(),
    contact_phone: z.union([z.string(), z.null()]).optional(),
    email: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    name: z.string(),
    platform: z.string(),
    route_mode: z.string(),
    shop_id: z.string(),
    shop_type: z.string().optional().default("PROD"),
  })
  .passthrough();
const StoreListOut: z.ZodType<StoreListOut> = z
  .object({
    data: z.array(StoreListItem),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const StoreCreateIn = z
  .object({
    name: z.union([z.string(), z.null()]).optional(),
    platform: z.string().min(2).max(32),
    shop_id: z.string().min(1).max(128),
    shop_type: z.enum(["TEST", "PROD"]).optional().default("PROD"),
  })
  .passthrough();
const StoreCreateOut = z
  .object({
    data: z.object({}).partial().passthrough(),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const StoreDetailOut = z
  .object({
    data: z.object({}).partial().passthrough(),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const StoreUpdateIn = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    contact_name: z.union([z.string(), z.null()]),
    contact_phone: z.union([z.string(), z.null()]),
    email: z.union([z.string(), z.null()]),
    name: z.union([z.string(), z.null()]),
    route_mode: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const StoreUpdateOut = z
  .object({
    data: z.object({}).partial().passthrough(),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const DefaultWarehouseOut = z
  .object({
    data: z.record(z.string(), z.union([z.number(), z.null()])),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const OrderSimCartGetOut = z
  .object({ data: z.object({}).partial().passthrough(), ok: z.boolean() })
  .passthrough();
const CartLineItemIn: z.ZodType<CartLineItemIn> = z
  .object({
    checked: z.boolean().optional().default(false),
    city: z.union([z.string(), z.null()]).optional(),
    detail: z.union([z.string(), z.null()]).optional(),
    district: z.union([z.string(), z.null()]).optional(),
    if_version: z.union([z.number(), z.null()]).optional(),
    province: z.union([z.string(), z.null()]).optional(),
    qty: z.number().int().optional().default(0),
    receiver_name: z.union([z.string(), z.null()]).optional(),
    receiver_phone: z.union([z.string(), z.null()]).optional(),
    row_no: z.number().int().gte(1).lte(6),
    zipcode: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OrderSimCartPutIn: z.ZodType<OrderSimCartPutIn> = z
  .object({ items: z.array(CartLineItemIn) })
  .partial()
  .passthrough();
const OrderSimCartPutOut = z
  .object({ data: z.object({}).partial().passthrough(), ok: z.boolean() })
  .passthrough();
const OrderSimFilledCodeOptionOut: z.ZodType<OrderSimFilledCodeOptionOut> = z
  .object({
    components_summary: z.string(),
    filled_code: z.string().min(1).max(128),
    suggested_title: z.string(),
  })
  .passthrough();
const OrderSimFilledCodeOptionsData: z.ZodType<OrderSimFilledCodeOptionsData> =
  z
    .object({ items: z.array(OrderSimFilledCodeOptionOut) })
    .partial()
    .passthrough();
const OrderSimFilledCodeOptionsOut: z.ZodType<OrderSimFilledCodeOptionsOut> = z
  .object({ data: OrderSimFilledCodeOptionsData, ok: z.boolean() })
  .passthrough();
const OrderSimGenerateOrderIn = z
  .object({ idempotency_key: z.union([z.string(), z.null()]) })
  .partial()
  .passthrough();
const OrderSimGenerateOrderOut = z
  .object({ data: z.object({}).partial().passthrough(), ok: z.boolean() })
  .passthrough();
const OrderSimMerchantLinesGetOut = z
  .object({ data: z.object({}).partial().passthrough(), ok: z.boolean() })
  .passthrough();
const MerchantLineItemIn: z.ZodType<MerchantLineItemIn> = z
  .object({
    filled_code: z.union([z.string(), z.null()]).optional(),
    if_version: z.union([z.number(), z.null()]).optional(),
    row_no: z.number().int().gte(1).lte(6),
    spec: z.union([z.string(), z.null()]).optional(),
    title: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OrderSimMerchantLinesPutIn: z.ZodType<OrderSimMerchantLinesPutIn> = z
  .object({ items: z.array(MerchantLineItemIn) })
  .partial()
  .passthrough();
const OrderSimMerchantLinesPutOut = z
  .object({ data: z.object({}).partial().passthrough(), ok: z.boolean() })
  .passthrough();
const OrderSimPreviewOrderIn = z
  .object({ idempotency_key: z.union([z.string(), z.null()]) })
  .partial()
  .passthrough();
const OrderSimPreviewOrderOut = z
  .object({ data: z.object({}).partial().passthrough(), ok: z.boolean() })
  .passthrough();
const StorePlatformAuthOut = z
  .object({
    data: z.object({}).partial().passthrough(),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const ProvinceRouteItem: z.ZodType<ProvinceRouteItem> = z
  .object({
    active: z.boolean().optional().default(true),
    id: z.number().int(),
    priority: z.number().int().optional().default(100),
    province: z.string(),
    store_id: z.number().int(),
    warehouse_active: z.boolean().optional().default(true),
    warehouse_code: z.union([z.string(), z.null()]).optional(),
    warehouse_id: z.number().int(),
    warehouse_name: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const ProvinceRouteListOut: z.ZodType<ProvinceRouteListOut> = z
  .object({
    data: z.array(ProvinceRouteItem),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const ProvinceRouteCreateIn = z
  .object({
    active: z.boolean().optional().default(true),
    priority: z.number().int().gte(0).lte(100000).optional().default(100),
    province: z.string().min(1).max(32),
    warehouse_id: z.number().int().gte(1),
  })
  .passthrough();
const ProvinceRouteWriteOut = z
  .object({
    data: z.object({}).partial().passthrough(),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const ProvinceRouteUpdateIn = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    priority: z.union([z.number(), z.null()]),
    province: z.union([z.string(), z.null()]),
    warehouse_id: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const RoutingHealthOut = z
  .object({
    data: z.object({}).partial().passthrough(),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const BindWarehouseIn = z
  .object({
    is_default: z.boolean().optional().default(false),
    is_top: z.union([z.boolean(), z.null()]).optional(),
    priority: z.number().int().gte(0).lte(100000).optional().default(100),
    warehouse_id: z.number().int().gte(1),
  })
  .passthrough();
const BindWarehouseOut = z
  .object({
    data: z.object({}).partial().passthrough(),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const BindingDeleteOut = z
  .object({
    data: z.object({}).partial().passthrough(),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const BindingUpdateIn = z
  .object({
    is_default: z.union([z.boolean(), z.null()]),
    is_top: z.union([z.boolean(), z.null()]),
    priority: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const BindingUpdateOut = z
  .object({
    data: z.object({}).partial().passthrough(),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const SupplierContactUpdateIn = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    email: z.union([z.string(), z.null()]),
    is_primary: z.union([z.boolean(), z.null()]),
    name: z.union([z.string(), z.null()]),
    phone: z.union([z.string(), z.null()]),
    role: z.union([z.string(), z.null()]),
    wechat: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const SupplierContactOut: z.ZodType<SupplierContactOut> = z
  .object({
    active: z.boolean(),
    email: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    is_primary: z.boolean(),
    name: z.string(),
    phone: z.union([z.string(), z.null()]).optional(),
    role: z.string(),
    supplier_id: z.number().int(),
    wechat: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const SupplierOut: z.ZodType<SupplierOut> = z
  .object({
    active: z.boolean(),
    code: z.string(),
    contacts: z.array(SupplierContactOut),
    id: z.number().int(),
    name: z.string(),
    website: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const SupplierCreateIn = z
  .object({
    active: z.boolean().optional().default(true),
    code: z.string().min(1),
    name: z.string().min(1),
    website: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const active = z.union([z.boolean(), z.null()]).optional().default(true);
const SupplierBasicOut = z
  .object({
    active: z.boolean(),
    code: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    name: z.string(),
  })
  .passthrough();
const SupplierUpdateIn = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    code: z.union([z.string(), z.null()]),
    name: z.union([z.string(), z.null()]),
    website: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const SupplierContactCreateIn = z
  .object({
    active: z.boolean().optional().default(true),
    email: z.union([z.string(), z.null()]).optional(),
    is_primary: z.boolean().optional().default(false),
    name: z.string().min(1).max(100),
    phone: z.union([z.string(), z.null()]).optional(),
    role: z.string().max(32).optional().default("other"),
    wechat: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const SurchargeUpdateIn = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    amount_json: z.union([z.object({}).partial().passthrough(), z.null()]),
    condition_json: z.union([z.object({}).partial().passthrough(), z.null()]),
    name: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const UserOut = z
  .object({
    email: z.union([z.string(), z.null()]).optional(),
    full_name: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    is_active: z.boolean().optional().default(true),
    phone: z.union([z.string(), z.null()]).optional(),
    role_id: z.union([z.number(), z.null()]).optional(),
    username: z.string(),
  })
  .passthrough();
const PasswordChangeIn = z
  .object({ new_password: z.string(), old_password: z.string() })
  .passthrough();
const UserLogin = z
  .object({ password: z.string().min(1), username: z.string().min(3).max(64) })
  .passthrough();
const Token = z
  .object({
    access_token: z.string(),
    expires_in: z.union([z.number(), z.null()]).optional(),
    token_type: z.string().optional().default("bearer"),
  })
  .passthrough();
const UserCreateMulti = z
  .object({
    email: z.union([z.string(), z.null()]).optional(),
    extra_role_ids: z.array(z.number().int()).optional().default([]),
    full_name: z.union([z.string(), z.null()]).optional(),
    password: z.string(),
    phone: z.union([z.string(), z.null()]).optional(),
    primary_role_id: z.number().int(),
    username: z.string(),
  })
  .passthrough();
const UserUpdateMulti = z
  .object({
    email: z.union([z.string(), z.null()]),
    extra_role_ids: z.union([z.array(z.number().int()), z.null()]),
    full_name: z.union([z.string(), z.null()]),
    is_active: z.union([z.boolean(), z.null()]),
    phone: z.union([z.string(), z.null()]),
    primary_role_id: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const PasswordResetIn = z.object({}).partial().passthrough();
const WarehouseOut: z.ZodType<WarehouseOut> = z
  .object({
    active: z.boolean().optional().default(true),
    address: z.union([z.string(), z.null()]).optional(),
    area_sqm: z.union([z.number(), z.null()]).optional(),
    code: z.union([z.string(), z.null()]).optional(),
    contact_name: z.union([z.string(), z.null()]).optional(),
    contact_phone: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    name: z.string(),
  })
  .passthrough();
const WarehouseListOut: z.ZodType<WarehouseListOut> = z
  .object({
    data: z.array(WarehouseOut),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const WarehouseCreateIn = z
  .object({
    active: z.boolean().optional().default(true),
    address: z.union([z.string(), z.null()]).optional(),
    area_sqm: z.union([z.number(), z.null()]).optional(),
    code: z.union([z.string(), z.null()]).optional(),
    contact_name: z.union([z.string(), z.null()]).optional(),
    contact_phone: z.union([z.string(), z.null()]).optional(),
    name: z.string().min(1).max(100),
  })
  .passthrough();
const WarehouseCreateOut: z.ZodType<WarehouseCreateOut> = z
  .object({ data: WarehouseOut, ok: z.boolean().optional().default(true) })
  .passthrough();
const ActiveCarrierOut: z.ZodType<ActiveCarrierOut> = z
  .object({
    code: z.union([z.string(), z.null()]).optional(),
    name: z.string(),
    priority: z.number().int(),
    provider_id: z.number().int(),
  })
  .passthrough();
const WarehouseActiveCarriersOut: z.ZodType<WarehouseActiveCarriersOut> = z
  .object({
    active_carriers: z.array(ActiveCarrierOut),
    active_carriers_count: z.number().int(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const WarehouseActiveCarriersSummaryOut: z.ZodType<WarehouseActiveCarriersSummaryOut> =
  z
    .object({ data: z.array(WarehouseActiveCarriersOut), ok: z.boolean() })
    .passthrough();
const WarehouseServiceCityOccupancyRow: z.ZodType<WarehouseServiceCityOccupancyRow> =
  z
    .object({ city_code: z.string(), warehouse_id: z.number().int() })
    .passthrough();
const WarehouseServiceCityOccupancyOut: z.ZodType<WarehouseServiceCityOccupancyOut> =
  z
    .object({ rows: z.array(WarehouseServiceCityOccupancyRow) })
    .partial()
    .passthrough();
const WarehouseServiceCitySplitProvincesOut = z
  .object({ provinces: z.array(z.string()) })
  .partial()
  .passthrough();
const WarehouseServiceCitySplitProvincesPutIn = z
  .object({ provinces: z.array(z.string()) })
  .partial()
  .passthrough();
const WarehouseServiceProvinceOccupancyRow: z.ZodType<WarehouseServiceProvinceOccupancyRow> =
  z
    .object({ province_code: z.string(), warehouse_id: z.number().int() })
    .passthrough();
const WarehouseServiceProvinceOccupancyOut: z.ZodType<WarehouseServiceProvinceOccupancyOut> =
  z
    .object({ rows: z.array(WarehouseServiceProvinceOccupancyRow) })
    .partial()
    .passthrough();
const WarehouseDetailOut: z.ZodType<WarehouseDetailOut> = z
  .object({ data: WarehouseOut, ok: z.boolean().optional().default(true) })
  .passthrough();
const WarehouseUpdateIn = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    address: z.union([z.string(), z.null()]),
    area_sqm: z.union([z.number(), z.null()]),
    code: z.union([z.string(), z.null()]),
    contact_name: z.union([z.string(), z.null()]),
    contact_phone: z.union([z.string(), z.null()]),
    name: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const WarehouseUpdateOut: z.ZodType<WarehouseUpdateOut> = z
  .object({ data: WarehouseOut, ok: z.boolean().optional().default(true) })
  .passthrough();
const WarehouseServiceCitiesOut = z
  .object({
    cities: z.array(z.string()).optional(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const WarehouseServiceCitiesPutIn = z
  .object({ cities: z.array(z.string()) })
  .partial()
  .passthrough();
const WarehouseServiceProvincesOut = z
  .object({
    provinces: z.array(z.string()).optional(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const WarehouseServiceProvincesPutIn = z
  .object({ provinces: z.array(z.string()) })
  .partial()
  .passthrough();
const ShippingProviderLiteOut: z.ZodType<ShippingProviderLiteOut> = z
  .object({
    active: z.boolean().optional().default(true),
    code: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    name: z.string(),
  })
  .passthrough();
const WarehouseShippingProviderOut: z.ZodType<WarehouseShippingProviderOut> = z
  .object({
    active: z.boolean().optional().default(true),
    pickup_cutoff_time: z.union([z.string(), z.null()]).optional(),
    priority: z.number().int().optional().default(0),
    provider: ShippingProviderLiteOut,
    remark: z.union([z.string(), z.null()]).optional(),
    shipping_provider_id: z.number().int(),
    warehouse_id: z.number().int(),
  })
  .passthrough();
const WarehouseShippingProviderListOut: z.ZodType<WarehouseShippingProviderListOut> =
  z
    .object({
      data: z.array(WarehouseShippingProviderOut),
      ok: z.boolean().optional().default(true),
    })
    .passthrough();
const WarehouseShippingProviderUpsertItemIn: z.ZodType<WarehouseShippingProviderUpsertItemIn> =
  z
    .object({
      active: z.boolean().optional().default(true),
      pickup_cutoff_time: z.union([z.string(), z.null()]).optional(),
      priority: z.number().int().gte(0).optional().default(0),
      remark: z.union([z.string(), z.null()]).optional(),
      shipping_provider_id: z.number().int().gte(1),
    })
    .passthrough();
const WarehouseShippingProviderBulkUpsertIn: z.ZodType<WarehouseShippingProviderBulkUpsertIn> =
  z
    .object({
      disable_missing: z.boolean().default(true),
      items: z.array(WarehouseShippingProviderUpsertItemIn),
    })
    .partial()
    .passthrough();
const WarehouseShippingProviderBulkUpsertOut: z.ZodType<WarehouseShippingProviderBulkUpsertOut> =
  z
    .object({
      data: z.array(WarehouseShippingProviderOut),
      ok: z.boolean().optional().default(true),
    })
    .passthrough();
const WarehouseShippingProviderBindIn = z
  .object({
    active: z.boolean().optional().default(true),
    pickup_cutoff_time: z.union([z.string(), z.null()]).optional(),
    priority: z.number().int().gte(0).optional().default(0),
    remark: z.union([z.string(), z.null()]).optional(),
    shipping_provider_id: z.number().int().gte(1),
  })
  .passthrough();
const WarehouseShippingProviderBindOut: z.ZodType<WarehouseShippingProviderBindOut> =
  z
    .object({
      data: WarehouseShippingProviderOut,
      ok: z.boolean().optional().default(true),
    })
    .passthrough();
const WarehouseShippingProviderDeleteOut = z
  .object({
    data: z.object({}).partial().passthrough(),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();
const WarehouseShippingProviderUpdateIn = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    pickup_cutoff_time: z.union([z.string(), z.null()]),
    priority: z.union([z.number(), z.null()]),
    remark: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const WarehouseShippingProviderUpdateOut: z.ZodType<WarehouseShippingProviderUpdateOut> =
  z
    .object({
      data: WarehouseShippingProviderOut,
      ok: z.boolean().optional().default(true),
    })
    .passthrough();
const ZoneBracketUpdateIn = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    base_amount: z.union([z.number(), z.string(), z.null()]),
    base_kg: z.union([z.number(), z.string(), z.null()]),
    flat_amount: z.union([z.number(), z.string(), z.null()]),
    max_kg: z.union([z.number(), z.string(), z.null()]),
    min_kg: z.union([z.number(), z.string(), z.null()]),
    pricing_mode: z.union([z.string(), z.null()]),
    rate_per_kg: z.union([z.number(), z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const CopyZoneBracketsIn = z
  .object({
    active_policy: z.string().optional().default("preserve"),
    conflict_policy: z.string().optional().default("skip"),
    include_inactive: z.boolean().optional().default(false),
    pricing_modes: z.array(z.string()).optional(),
    source_zone_id: z.number().int().gte(1),
  })
  .passthrough();
const CopyZoneBracketsSummary: z.ZodType<CopyZoneBracketsSummary> = z
  .object({
    created_count: z.number().int(),
    failed_count: z.number().int(),
    skipped_count: z.number().int(),
    source_count: z.number().int(),
    updated_count: z.number().int(),
  })
  .passthrough();
const CopyZoneBracketsOut: z.ZodType<CopyZoneBracketsOut> = z
  .object({
    active_policy: z.string(),
    conflict_policy: z.string(),
    created: z.array(ZoneBracketOut).optional(),
    failed: z.array(z.object({}).partial().passthrough()).optional(),
    ok: z.boolean().optional().default(true),
    skipped: z.array(ZoneBracketOut).optional(),
    source_zone_id: z.number().int(),
    summary: CopyZoneBracketsSummary,
    target_zone_id: z.number().int(),
    updated: z.array(ZoneBracketOut).optional(),
  })
  .passthrough();
const ZoneUpdateIn = z
  .object({
    active: z.union([z.boolean(), z.null()]),
    name: z.union([z.string(), z.null()]),
    segment_template_id: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const ZoneBracketCreateIn = z
  .object({
    active: z.boolean().optional().default(true),
    base_amount: z.union([z.number(), z.string(), z.null()]).optional(),
    base_kg: z.union([z.number(), z.string(), z.null()]).optional(),
    flat_amount: z.union([z.number(), z.string(), z.null()]).optional(),
    max_kg: z.union([z.number(), z.string(), z.null()]).optional(),
    min_kg: z.union([z.number(), z.string()]),
    pricing_mode: z.string().min(1).max(32),
    rate_per_kg: z.union([z.number(), z.string(), z.null()]).optional(),
  })
  .passthrough();
const ZoneMemberCreateIn = z
  .object({
    level: z.string().min(1).max(16),
    value: z.string().min(1).max(64),
  })
  .passthrough();
const ZoneProvinceMembersReplaceIn = z
  .object({ provinces: z.array(z.string()) })
  .partial()
  .passthrough();
const OrderFactItemOut: z.ZodType<OrderFactItemOut> = z
  .object({
    item_id: z.number().int(),
    qty_ordered: z.number().int().optional().default(0),
    sku_id: z.union([z.string(), z.null()]).optional(),
    title: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OrderFactsResponse: z.ZodType<OrderFactsResponse> = z
  .object({
    items: z.array(OrderFactItemOut),
    ok: z.boolean().optional().default(true),
  })
  .passthrough();

export const schemas = {
  CountRequest,
  CountResponse,
  ValidationError,
  HTTPValidationError,
  warehouse_id,
  TraceEventModel,
  TraceResponseModel,
  DestAdjustmentUpdateIn,
  DestAdjustmentOut,
  FakeGenerateParams,
  DevFakeOrdersGenerateIn,
  DevFakeOrdersGenerateOut,
  DevFakeOrdersRunIn,
  DevFakeOrdersRunOut,
  platform,
  time_from,
  DevOrderSummary,
  DevOrderReconcileLine,
  DevOrderReconcileResultModel,
  DevDemoOrderOut,
  DevReconcileRangeResult,
  DevOrderInfo,
  DevOrderView,
  DevEnsureWarehouseOut,
  DevOrderItemFact,
  DevOrderFacts,
  PlatformEventRow,
  PlatformEventListOut,
  FakeOrderStatusIn,
  FakeOrderStatusOut,
  FinanceDailyRow,
  FinanceShopRow,
  FinanceSkuRow,
  FskuListItem,
  FskuListOut,
  FskuCreateIn,
  FskuComponentOut,
  FskuDetailOut,
  FskuNameUpdateIn,
  FskuComponentIn,
  FskuComponentsReplaceIn,
  GeoItemOut,
  InboundReceiptLineOut,
  InboundReceiptOut,
  InboundReceiptCreateIn,
  InboundReceiptConfirmLedgerRef,
  InboundReceiptConfirmOut,
  ProblemItem,
  LedgerPreviewOut,
  NormalizedLinePreviewOut,
  InboundReceiptSummaryOut,
  InboundReceiptExplainOut,
  InternalOutboundLineOut,
  InternalOutboundDocOut,
  InternalOutboundCreateDocIn,
  InternalOutboundConfirmIn,
  InternalOutboundUpsertLineIn,
  ItemBarcodeCreate,
  ItemBarcodeOut,
  ItemBarcodeUpdate,
  enabled,
  ItemOut,
  ItemCreate,
  NextSkuOut,
  ItemUpdate,
  FskuLiteOut,
  StoreLiteOut,
  MerchantCodeBindingRowOut,
  MerchantCodeBindingListDataOut,
  MerchantCodeBindingListOut,
  MerchantCodeBindingBindIn,
  MerchantCodeBindingOut,
  MerchantCodeBindingCloseIn,
  MetaPlatformItem,
  MetaPlatformsOut,
  AlertItem,
  AlertsResponse,
  FefoItemRisk,
  FefoRiskMetricsResponse,
  OutboundDistributionPoint,
  OutboundMetricsV2,
  OutboundShopMetric,
  OutboundShopMetricsResponse,
  OutboundWarehouseMetric,
  OutboundWarehouseMetricsResponse,
  OutboundFailureDetail,
  OutboundFailuresMetricsResponse,
  OutboundDaySummary,
  OutboundRangeMetricsResponse,
  ShippingQuoteFailureDetail,
  ShippingQuoteFailuresMetricsResponse,
  OAuthStartOut,
  OpsActiveSchemeRow,
  OpsActiveSchemesOut,
  ShellSchemeRow,
  CleanupShellSchemesOut,
  PricingIntegrityFixArchiveReleaseIn,
  PricingIntegrityFixArchiveReleaseItemOut,
  PricingIntegrityFixArchiveReleaseOut,
  PricingIntegrityFixDetachZoneBracketsIn,
  PricingIntegrityFixDetachZoneBracketsItemOut,
  PricingIntegrityFixDetachZoneBracketsOut,
  PricingIntegrityFixUnbindArchivedTemplatesIn,
  PricingIntegrityFixUnbindArchivedTemplatesItemOut,
  PricingIntegrityFixUnbindArchivedTemplatesOut,
  PricingIntegrityArchivedTemplateStillReferencedIssue,
  PricingIntegrityArchivedZoneIssue,
  PricingIntegrityReleasedZoneStillPricedIssue,
  PricingIntegrityReportSummary,
  PricingIntegrityReportOut,
  OrderAddrIn,
  OrderLineIn,
  OrderCreateIn,
  OrderFulfillmentOut,
  OrderCreateOut,
  OrdersDailyStatsModel,
  OrdersDailyTrendItem,
  OrdersTrendResponseModel,
  OrdersSlaStatsModel,
  OrderSummaryOut,
  WarehouseOptionOut,
  OrdersSummaryResponse,
  FulfillmentDebugAddress,
  FulfillmentServiceDebug,
  FulfillmentDebugOut,
  AvailabilityLineOut,
  AvailabilityCellOut,
  WarehouseBriefOut,
  OrderWarehouseAvailabilityResponse,
  ManualAssignRequest,
  ManualAssignResponse,
  PickLineIn,
  PickRequest,
  PickResponse,
  ShipLineIn,
  ShipRequest,
  ShipResponse,
  ShipWithWaybillRequest,
  ShipWithWaybillResponse,
  PlatformOrderAddressOut,
  PlatformOrderLineOut,
  PlatformOrderOut,
  OrderViewResponse,
  OutboundLineIn,
  OutboundShipIn,
  OutboundShipOut,
  PermissionOut,
  PermissionCreate,
  PickIn,
  PickOut,
  GateOut,
  PickTaskLineOut,
  PrintJobOut,
  PickTaskOut,
  PickTaskCreateFromOrder,
  PickTaskCommitIn,
  PickTaskCommitDiffLineOut,
  PickTaskCommitDiffOut,
  PickTaskCommitResult,
  PickTaskCommitCheckOut,
  PickTaskDiffLineOut,
  PickTaskDiffSummaryOut,
  PickTaskPrintPickListIn,
  PickTaskScanIn,
  PlatformOrderConfirmCreateDecisionIn,
  PlatformOrderConfirmCreateIn,
  PlatformOrderConfirmCreateDecisionOut,
  PlatformOrderConfirmCreateOut,
  PlatformOrderLineIn,
  PlatformOrderIngestIn,
  PlatformOrderLineResult,
  PlatformOrderIngestOut,
  ManualBindMerchantCodeIn,
  ManualDecisionLineOut,
  ManualDecisionOrderOut,
  ManualDecisionOrdersOut,
  PlatformOrderReplayIn,
  PlatformOrderReplayOut,
  PlatformShopCredentialsIn,
  SimpleOut,
  SchemeSegmentOut,
  WeightSegmentIn,
  SurchargeOut,
  ZoneBracketOut,
  ZoneMemberOut,
  ZoneOut,
  SchemeOut,
  SchemeDetailOut,
  SchemeUpdateIn,
  DestAdjustmentUpsertIn,
  SegmentTemplateItemOut,
  SegmentTemplateOut,
  SegmentTemplateListOut,
  SegmentTemplateCreateIn,
  SegmentTemplateDetailOut,
  SchemeSegmentActivePatchIn,
  SurchargeCreateIn,
  SurchargeUpsertIn,
  WarehouseLiteOut,
  SchemeWarehouseOut,
  SchemeWarehousesGetOut,
  SchemeWarehouseBindIn,
  SchemeWarehouseBindOut,
  SchemeWarehouseDeleteOut,
  SchemeWarehousePatchIn,
  SchemeWarehousePatchOut,
  SegmentRangeOut,
  ZoneBracketsMatrixGroupOut,
  ZoneBracketsMatrixOut,
  ZoneCreateIn,
  ZoneCreateAtomicIn,
  SchemeDefaultSegmentTemplateIn,
  MarkFailedIn,
  MarkPrintedIn,
  PurchaseOrderLineListOut,
  PurchaseOrderListItemOut,
  PurchaseOrderLineCreate,
  PurchaseOrderCreateV2,
  PurchaseOrderLineOut,
  PurchaseOrderWithLinesOut,
  PurchaseOrderCloseIn,
  PurchaseOrderReceiptEventOut,
  PurchaseOrderReceiveLineIn,
  WorkbenchCapsOut,
  WorkbenchExplainOut,
  PoSummaryOut,
  ReceiptSummaryOut,
  WorkbenchBatchRowOut,
  WorkbenchRowOut,
  PurchaseOrderReceiveWorkbenchOut,
  DailyPurchaseReportItem,
  ItemPurchaseReportItem,
  SupplierPurchaseReportItem,
  ReturnTaskLineOut,
  ReturnTaskOut,
  ReturnTaskCreateFromOrder,
  ReturnOrderRefItem,
  ReturnOrderRefReceiverOut,
  ReturnOrderRefShippingOut,
  ReturnOrderRefSummaryLine,
  ReturnOrderRefSummaryOut,
  ReturnOrderRefDetailOut,
  ReturnTaskCommitIn,
  ReturnTaskReceiveIn,
  RoleOut,
  RoleCreate,
  RolePermissionsBody,
  ScanRequest,
  ScanResponse,
  ScanCountCommitRequest,
  SegmentTemplateItemActivePatchIn,
  SegmentTemplateItemIn,
  SegmentTemplateItemsPutIn,
  SegmentTemplateRenameIn,
  ShipCalcRequest,
  ShipQuoteOut,
  ShipRecommendedOut,
  ShipCalcResponse,
  ShipConfirmRequest,
  ShipConfirmResponse,
  ShipPrepareRequest,
  CandidateWarehouseOut,
  FulfillmentMissingLineOut,
  FulfillmentScanWarehouseOut,
  ShipPrepareItem,
  ShipPrepareResponse,
  ShippingProviderContactUpdateIn,
  ShippingProviderContactOut,
  ShippingProviderOut,
  ShippingProviderListOut,
  ShippingProviderCreateIn,
  ShippingProviderCreateOut,
  ShippingProviderDetailOut,
  ShippingProviderUpdateIn,
  ShippingProviderUpdateOut,
  ShippingProviderContactCreateIn,
  SchemeListOut,
  SchemeCreateIn,
  QuoteDestIn,
  QuoteCalcIn,
  QuoteCalcOut,
  QuoteRecommendIn,
  QuoteRecommendItemOut,
  QuoteRecommendOut,
  ShippingRecordOut,
  ShippingStatusUpdateIn,
  ShippingStatusUpdateOut,
  ShippingByCarrierRow,
  ShippingByCarrierResponse,
  ShippingByProvinceRow,
  ShippingByProvinceResponse,
  ShippingByShopRow,
  ShippingByShopResponse,
  ShippingByWarehouseRow,
  ShippingByWarehouseResponse,
  ShippingDailyRow,
  ShippingDailyResponse,
  ShippingListRow,
  ShippingListResponse,
  ShippingReportFilterOptions,
  InventoryRow,
  InventorySnapshotResponse,
  ItemDetailSlice,
  ItemDetailTotals,
  ItemDetailResponse,
  StockBatchQueryIn,
  StockBatchRow,
  StockBatchQueryOut,
  ReasonCanon,
  SubReason,
  LedgerEnums,
  ExplainAnchor,
  ExplainLedgerRow,
  ExplainPurchaseOrderLine,
  ExplainPurchaseOrder,
  ExplainReceipt,
  ExplainReceiptLine,
  LedgerExplainOut,
  LedgerQuery,
  LedgerRow,
  LedgerList,
  LedgerReconcileRow,
  LedgerReconcileResult,
  ReconcileSummaryPayload,
  ThreeBooksPayload,
  LedgerReasonStat,
  LedgerSummary,
  StoreListItem,
  StoreListOut,
  StoreCreateIn,
  StoreCreateOut,
  StoreDetailOut,
  StoreUpdateIn,
  StoreUpdateOut,
  DefaultWarehouseOut,
  OrderSimCartGetOut,
  CartLineItemIn,
  OrderSimCartPutIn,
  OrderSimCartPutOut,
  OrderSimFilledCodeOptionOut,
  OrderSimFilledCodeOptionsData,
  OrderSimFilledCodeOptionsOut,
  OrderSimGenerateOrderIn,
  OrderSimGenerateOrderOut,
  OrderSimMerchantLinesGetOut,
  MerchantLineItemIn,
  OrderSimMerchantLinesPutIn,
  OrderSimMerchantLinesPutOut,
  OrderSimPreviewOrderIn,
  OrderSimPreviewOrderOut,
  StorePlatformAuthOut,
  ProvinceRouteItem,
  ProvinceRouteListOut,
  ProvinceRouteCreateIn,
  ProvinceRouteWriteOut,
  ProvinceRouteUpdateIn,
  RoutingHealthOut,
  BindWarehouseIn,
  BindWarehouseOut,
  BindingDeleteOut,
  BindingUpdateIn,
  BindingUpdateOut,
  SupplierContactUpdateIn,
  SupplierContactOut,
  SupplierOut,
  SupplierCreateIn,
  active,
  SupplierBasicOut,
  SupplierUpdateIn,
  SupplierContactCreateIn,
  SurchargeUpdateIn,
  UserOut,
  PasswordChangeIn,
  UserLogin,
  Token,
  UserCreateMulti,
  UserUpdateMulti,
  PasswordResetIn,
  WarehouseOut,
  WarehouseListOut,
  WarehouseCreateIn,
  WarehouseCreateOut,
  ActiveCarrierOut,
  WarehouseActiveCarriersOut,
  WarehouseActiveCarriersSummaryOut,
  WarehouseServiceCityOccupancyRow,
  WarehouseServiceCityOccupancyOut,
  WarehouseServiceCitySplitProvincesOut,
  WarehouseServiceCitySplitProvincesPutIn,
  WarehouseServiceProvinceOccupancyRow,
  WarehouseServiceProvinceOccupancyOut,
  WarehouseDetailOut,
  WarehouseUpdateIn,
  WarehouseUpdateOut,
  WarehouseServiceCitiesOut,
  WarehouseServiceCitiesPutIn,
  WarehouseServiceProvincesOut,
  WarehouseServiceProvincesPutIn,
  ShippingProviderLiteOut,
  WarehouseShippingProviderOut,
  WarehouseShippingProviderListOut,
  WarehouseShippingProviderUpsertItemIn,
  WarehouseShippingProviderBulkUpsertIn,
  WarehouseShippingProviderBulkUpsertOut,
  WarehouseShippingProviderBindIn,
  WarehouseShippingProviderBindOut,
  WarehouseShippingProviderDeleteOut,
  WarehouseShippingProviderUpdateIn,
  WarehouseShippingProviderUpdateOut,
  ZoneBracketUpdateIn,
  CopyZoneBracketsIn,
  CopyZoneBracketsSummary,
  CopyZoneBracketsOut,
  ZoneUpdateIn,
  ZoneBracketCreateIn,
  ZoneMemberCreateIn,
  ZoneProvinceMembersReplaceIn,
  OrderFactItemOut,
  OrderFactsResponse,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/",
    alias: "root__get",
    requestFormat: "json",
    response: z.object({}).partial().passthrough(),
  },
  {
    method: "post",
    path: "/count",
    alias: "count_inventory_count_post",
    description: `将 (item_id, location_id, batch_id[由 batch_code 解析]) 的库存 **校正为** 给定 qty（绝对量）。

流程：
  1) 通过内核规则幂等解析/创建批次，得到 batch_id（与内核粒度一致）；
  2) 以 (item_id, location_id, batch_id) 精确读取 current qty；
  3) 计算 delta &#x3D; qty - current，调用 StockService.adjust(reason&#x3D;COUNT) 落一条台账
     （即使 delta&#x3D;&#x3D;0 也落账，便于审计）。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CountRequest,
      },
    ],
    response: CountResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/debug/trace/:trace_id",
    alias: "get_trace_debug_trace__trace_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "trace_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
    ],
    response: TraceResponseModel,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/dest-adjustments/:dest_adjustment_id",
    alias:
      "delete_dest_adjustment_route_dest_adjustments__dest_adjustment_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "dest_adjustment_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/dest-adjustments/:dest_adjustment_id",
    alias: "patch_dest_adjustment_dest_adjustments__dest_adjustment_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestAdjustmentUpdateIn,
      },
      {
        name: "dest_adjustment_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: DestAdjustmentOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/dev/fake-orders/generate",
    alias: "generate_fake_orders_dev_fake_orders_generate_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DevFakeOrdersGenerateIn,
      },
    ],
    response: DevFakeOrdersGenerateOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/dev/fake-orders/run",
    alias: "run_fake_orders_dev_fake_orders_run_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DevFakeOrdersRunIn,
      },
    ],
    response: DevFakeOrdersRunOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/dev/orders",
    alias: "list_orders_summary_dev_orders_get",
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "status",
        type: "Query",
        schema: platform,
      },
      {
        name: "time_from",
        type: "Query",
        schema: time_from,
      },
      {
        name: "time_to",
        type: "Query",
        schema: time_from,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional().default(100),
      },
    ],
    response: z.array(DevOrderSummary),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/dev/orders/:platform/:shop_id/:ext_order_no",
    alias:
      "get_dev_order_view_dev_orders__platform___shop_id___ext_order_no__get",
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "shop_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "ext_order_no",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: DevOrderView,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/dev/orders/:platform/:shop_id/:ext_order_no/ensure-warehouse",
    alias:
      "ensure_order_warehouse_disabled_dev_orders__platform___shop_id___ext_order_no__ensure_warehouse_post",
    description: `Phase 5.1：devconsole 不允许写 orders.warehouse_id（禁止隐性回填/后门写入）。

✅ 正确做法：
- 走订单履约 API：/orders/{platform}/{shop_id}/{ext}/fulfillment/manual-assign
- 或使用离线脚本（仅本地/运维）：scripts/dev_set_order_warehouse.py`,
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "shop_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "ext_order_no",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: DevEnsureWarehouseOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/dev/orders/:platform/:shop_id/:ext_order_no/facts",
    alias:
      "get_dev_order_facts_dev_orders__platform___shop_id___ext_order_no__facts_get",
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "shop_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "ext_order_no",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: DevOrderFacts,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/dev/orders/by-id/:order_id/reconcile",
    alias: "reconcile_order_by_id_dev_orders_by_id__order_id__reconcile_get",
    requestFormat: "json",
    parameters: [
      {
        name: "order_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: DevOrderReconcileResultModel,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/dev/orders/demo",
    alias: "create_demo_order_dev_orders_demo_post",
    description: `生成 demo 订单（Phase 5.1 版本）：

- 订单 ingest：给出 province&#x3D;UT，让其进入 SERVICE_ASSIGNED（只写 service_warehouse_id）
- ❌ 不再写 orders.warehouse_id（devconsole 禁止后门写入）
- 库存 seed：仍然可以往某个仓库里落库存（这不是“订单执行仓”）`,
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Query",
        schema: z.string().optional().default("PDD"),
      },
      {
        name: "shop_id",
        type: "Query",
        schema: z.string().optional().default("1"),
      },
    ],
    response: DevDemoOrderOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/dev/orders/reconcile-range",
    alias: "reconcile_orders_range_dev_orders_reconcile_range_post",
    requestFormat: "json",
    parameters: [
      {
        name: "time_from",
        type: "Query",
        schema: z.string().datetime({ offset: true }),
      },
      {
        name: "time_to",
        type: "Query",
        schema: z.string().datetime({ offset: true }),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(1000).optional().default(200),
      },
    ],
    response: DevReconcileRangeResult,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/dev/seed-ledger-test",
    alias: "seed_ledger_test_dev_seed_ledger_test_post",
    description: `dev 用测试初始化接口：

复用库里已有的 1 个 warehouse + 1 个 item，生成以下三笔台账：

1) 入库：  +10（RECEIPT，batch&#x3D;B-TEST-LEDGER）
2) 出库：   -4（SHIPMENT）
3) 盘点：   调整到 5（ADJUSTMENT/COUNT）

幂等设计：
- 所有调用都用固定 ref / ref_line / batch_code
- StockService.adjust + ledger 唯一约束保障幂等
- 重复调用不会重复扣减，只会返回 idempotent&#x3D;True。

注意：
- 这里显式调用 session.commit()，确保写入持久化到 DB。`,
    requestFormat: "json",
    response: z.object({}).partial().passthrough(),
  },
  {
    method: "get",
    path: "/diagnostics/lifecycle/batch",
    alias: "batch_lifeline_diagnostics_lifecycle_batch_get",
    description: `批次生命线（仍然按 wh + item + batch_code 维度走，和订单生命周期不同维度）。`,
    requestFormat: "json",
    parameters: [
      {
        name: "warehouse_id",
        type: "Query",
        schema: z.number().int(),
      },
      {
        name: "item_id",
        type: "Query",
        schema: z.number().int(),
      },
      {
        name: "batch_code",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/diagnostics/lifecycle/order-v2",
    alias: "order_lifecycle_v2_diagnostics_lifecycle_order_v2_get",
    description: `v2：基于 trace_id 的订单生命周期视图（官方推荐 / 唯一路线）。

- 由 TraceService 聚合 event_store / audit_events / stock_ledger / orders / outbound_v2 等事件；
- 再由 OrderLifecycleV2Service 按阶段推断：
    created / outbound / shipped / returned / delivered（以当前实现为准）
- 同时给出整体 health + issues 诊断。`,
    requestFormat: "json",
    parameters: [
      {
        name: "trace_id",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/fake-platform/events",
    alias: "list_platform_events_fake_platform_events_get",
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "event_type",
        type: "Query",
        schema: platform,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
    ],
    response: PlatformEventListOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/fake-platform/order-status",
    alias: "fake_order_status_fake_platform_order_status_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: FakeOrderStatusIn,
      },
    ],
    response: FakeOrderStatusOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/finance/order-unit",
    alias: "finance_order_unit_finance_order_unit_get",
    description: `客单价 &amp; 贡献度分析：

- 每一条记录 &#x3D; 一笔订单（order_value &#x3D; pay_amount 或 order_amount）
- summary：订单数 / 总收入 / 平均客单价 / 中位客单价
- contribution_curve：前 20%/40%/60%/80%/100% 订单贡献的收入占比
- top_orders：按金额从大到小列出前 N 笔订单`,
    requestFormat: "json",
    parameters: [
      {
        name: "from_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "to_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
    ],
    response: z.object({}).partial().passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/finance/overview/daily",
    alias: "finance_overview_daily_finance_overview_daily_get",
    description: `财务总览（按日）——运营视角粗估版本（PROD-only）：

✅ 统计口径（封板）：
- 收入：orders.pay_amount（缺失则退回 order_amount），按 orders.created_at::date 汇总
- 商品成本：以 purchase_order_lines 的平均单价（总金额 / 总最小单位数）粗算
         行金额口径：qty_ordered_base * supply_price - discount_amount（line_amount 不落库）
- 发货成本：shipping_records.cost_estimated，按 shipping_records.created_at::date 汇总`,
    requestFormat: "json",
    parameters: [
      {
        name: "from_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "to_date",
        type: "Query",
        schema: platform,
      },
    ],
    response: z.array(FinanceDailyRow),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/finance/shop",
    alias: "finance_by_shop_finance_shop_get",
    description: `店铺盈利能力（粗粒度）（PROD-only）：

- 商品成本：基于 purchase_order_lines 推导的 avg_unit_cost × order_items.qty
  行金额口径：qty_ordered_base*supply_price - discount_amount（line_amount 不落库）`,
    requestFormat: "json",
    parameters: [
      {
        name: "from_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "to_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
    ],
    response: z.array(FinanceShopRow),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/finance/sku",
    alias: "finance_by_sku_finance_sku_get",
    description: `SKU 毛利榜（粗粒度版本）：

- 商品成本：avg_unit_cost(item_id) × SUM(order_items.qty)
  avg_unit_cost &#x3D; total_amount / total_units
  total_amount &#x3D; SUM(qty_ordered_base*supply_price - discount_amount)
  total_units  &#x3D; SUM(qty_ordered_base)`,
    requestFormat: "json",
    parameters: [
      {
        name: "from_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "to_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
    ],
    response: z.array(FinanceSkuRow),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/fskus",
    alias: "list__fskus_get",
    requestFormat: "json",
    parameters: [
      {
        name: "query",
        type: "Query",
        schema: platform,
      },
      {
        name: "status",
        type: "Query",
        schema: platform,
      },
      {
        name: "store_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: FskuListOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/fskus",
    alias: "create_fskus_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: FskuCreateIn,
      },
    ],
    response: FskuDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/fskus/:fsku_id",
    alias: "detail_fskus__fsku_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "fsku_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: FskuDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/fskus/:fsku_id",
    alias: "patch_fsku_fskus__fsku_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string().min(1).max(200) }).passthrough(),
      },
      {
        name: "fsku_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: FskuDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/fskus/:fsku_id/components",
    alias: "components_fskus__fsku_id__components_get",
    requestFormat: "json",
    parameters: [
      {
        name: "fsku_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: FskuDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/fskus/:fsku_id/components",
    alias: "replace_components_fskus__fsku_id__components_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: FskuComponentsReplaceIn,
      },
      {
        name: "fsku_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: FskuDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/fskus/:fsku_id/publish",
    alias: "publish_fskus__fsku_id__publish_post",
    requestFormat: "json",
    parameters: [
      {
        name: "fsku_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: FskuDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/fskus/:fsku_id/retire",
    alias: "retire_fskus__fsku_id__retire_post",
    requestFormat: "json",
    parameters: [
      {
        name: "fsku_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: FskuDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/fskus/:fsku_id/unretire",
    alias: "unretire_fskus__fsku_id__unretire_post",
    description: `⚠️ 兼容保留：取消归档（不支持）
- 系统封板：FSKU 生命周期单向（draft → published → retired）
- 发布事实不可逆，因此该接口将始终返回 409（state_conflict）`,
    requestFormat: "json",
    parameters: [
      {
        name: "fsku_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: FskuDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/geo/provinces",
    alias: "geo_list_provinces_geo_provinces_get",
    requestFormat: "json",
    parameters: [
      {
        name: "q",
        type: "Query",
        schema: platform,
      },
    ],
    response: z.array(GeoItemOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/geo/provinces/:province_code/cities",
    alias: "geo_list_cities_geo_provinces__province_code__cities_get",
    requestFormat: "json",
    parameters: [
      {
        name: "province_code",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "q",
        type: "Query",
        schema: platform,
      },
    ],
    response: z.array(GeoItemOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/healthz",
    alias: "healthz_healthz_get",
    requestFormat: "json",
    response: z.object({}).partial().passthrough(),
  },
  {
    method: "get",
    path: "/inbound-receipts/",
    alias: "list_inbound_receipts_inbound_receipts__get",
    requestFormat: "json",
    parameters: [
      {
        name: "ref",
        type: "Query",
        schema: platform,
      },
      {
        name: "trace_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "source_type",
        type: "Query",
        schema: platform,
      },
      {
        name: "source_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "time_from",
        type: "Query",
        schema: platform,
      },
      {
        name: "time_to",
        type: "Query",
        schema: platform,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: z.array(InboundReceiptOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/inbound-receipts/",
    alias: "create_inbound_receipt_inbound_receipts__post",
    description: `Phase5：Receipt 创建入口（DRAFT）
- 当前仅支持 PO：创建/复用最新 DRAFT receipt
- ✅ 只写 Receipt(DRAFT) 事实
- ❌ 不写库存（库存只能由 /confirm 触发）

重要：返回前必须确保 lines 已加载，避免 async 环境下触发 relationship lazyload -&gt; MissingGreenlet`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InboundReceiptCreateIn,
      },
    ],
    response: InboundReceiptOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/inbound-receipts/:receipt_id",
    alias: "get_inbound_receipt_inbound_receipts__receipt_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "receipt_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InboundReceiptOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/inbound-receipts/:receipt_id/confirm",
    alias: "confirm_inbound_receipt_inbound_receipts__receipt_id__confirm_post",
    description: `Phase5：Receipt confirm（唯一库存写入口）
- 必须 commit：CONFIRMED 是事实固化；库存流水是结果固化`,
    requestFormat: "json",
    parameters: [
      {
        name: "receipt_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InboundReceiptConfirmOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/inbound-receipts/:receipt_id/explain",
    alias: "explain_inbound_receipt_inbound_receipts__receipt_id__explain_get",
    description: `Preflight explain（确认前预检）：
- 只读 Receipt 事实层（InboundReceipt / InboundReceiptLine）
- 不写库`,
    requestFormat: "json",
    parameters: [
      {
        name: "receipt_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InboundReceiptExplainOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/internal-outbound/docs",
    alias: "list_internal_outbound_docs_internal_outbound_docs_get",
    description: `列出内部出库单（简单列表）：

- 可按 status / warehouse_id 过滤；
- 默认按 id 倒序。`,
    requestFormat: "json",
    parameters: [
      {
        name: "skip",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
      {
        name: "status",
        type: "Query",
        schema: platform,
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
    ],
    response: z.array(InternalOutboundDocOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/internal-outbound/docs",
    alias: "create_internal_outbound_doc_internal_outbound_docs_post",
    description: `创建内部出库单（只建头，不带行）：

- 必须指定 warehouse_id / doc_type / recipient_name；
- 初始状态为 DRAFT。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InternalOutboundCreateDocIn,
      },
    ],
    response: InternalOutboundDocOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/internal-outbound/docs/:doc_id",
    alias: "get_internal_outbound_doc_internal_outbound_docs__doc_id__get",
    description: `获取内部出库单详情（头 + 行）。`,
    requestFormat: "json",
    parameters: [
      {
        name: "doc_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InternalOutboundDocOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/internal-outbound/docs/:doc_id/cancel",
    alias:
      "cancel_internal_outbound_doc_internal_outbound_docs__doc_id__cancel_post",
    description: `取消内部出库单：

- 仅 DRAFT 状态可取消；
- 不回滚库存（因为还没扣库存），只改状态 + 写审计事件。`,
    requestFormat: "json",
    parameters: [
      {
        name: "doc_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InternalOutboundDocOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/internal-outbound/docs/:doc_id/confirm",
    alias:
      "confirm_internal_outbound_doc_internal_outbound_docs__doc_id__confirm_post",
    description: `确认内部出库：

- 仅 DRAFT 状态可确认；
- 必须已经填写 recipient_name；
- 按行扣库存（指定批次或 FEFO），写入 ledger + audit。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InternalOutboundConfirmIn,
      },
      {
        name: "doc_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InternalOutboundDocOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/internal-outbound/docs/:doc_id/lines",
    alias:
      "upsert_internal_outbound_line_internal_outbound_docs__doc_id__lines_post",
    description: `在内部出库单上新增/累加一行：

- 若存在相同 (item_id, batch_code) 行则累加 requested_qty；
- 否则新建一行（line_no &#x3D; 当前最大 + 1）。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InternalOutboundUpsertLineIn,
      },
      {
        name: "doc_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InternalOutboundDocOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/inventory/autoheal/execute",
    alias: "autoheal_execute_inventory_autoheal_execute_post",
    requestFormat: "json",
    parameters: [
      {
        name: "cut",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "dry_run",
        type: "Query",
        schema: z.boolean().optional().default(true),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/inventory/flow-graph",
    alias: "inventory_flow_graph_inventory_flow_graph_post",
    requestFormat: "json",
    parameters: [
      {
        name: "time_from",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "time_to",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/inventory/intelligence/ageing",
    alias: "detect_ageing_inventory_intelligence_ageing_get",
    description: `批次老化检测：
- 找出在 within_days 天内即将到期的批次`,
    requestFormat: "json",
    parameters: [
      {
        name: "within_days",
        type: "Query",
        schema: z.number().int().optional().default(30),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/inventory/intelligence/anomaly",
    alias: "detect_anomaly_inventory_intelligence_anomaly_get",
    description: `库存异常检测：
- ledger vs stocks/snapshot 不一致记录`,
    requestFormat: "json",
    parameters: [
      {
        name: "cut",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/inventory/intelligence/autoheal",
    alias: "autoheal_inventory_intelligence_autoheal_get",
    description: `自动校正建议（不执行）：
- 基于 ledger_cut 与 stocks 差异给出调整建议列表`,
    requestFormat: "json",
    parameters: [
      {
        name: "cut",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/inventory/intelligence/insights",
    alias: "get_insights_inventory_intelligence_insights_get",
    description: `全局库存洞察：
- inventory_health_score
- inventory_accuracy_score
- snapshot_accuracy_score
- batch_activity_30days
- batch_risk_score
- warehouse_efficiency`,
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "get",
    path: "/inventory/intelligence/predict",
    alias: "predict_inventory_intelligence_predict_get",
    description: `简单库存预测：
- 基于最近 30 天出库趋势，估算未来 days 天库存量`,
    requestFormat: "json",
    parameters: [
      {
        name: "warehouse_id",
        type: "Query",
        schema: z.number().int(),
      },
      {
        name: "item_id",
        type: "Query",
        schema: z.number().int(),
      },
      {
        name: "days",
        type: "Query",
        schema: z.number().int().optional().default(7),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/inventory/ledger-replay",
    alias: "ledger_replay_inventory_ledger_replay_post",
    requestFormat: "json",
    parameters: [
      {
        name: "time_from",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "time_to",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/item-barcodes",
    alias: "create_barcode_item_barcodes_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ItemBarcodeCreate,
      },
    ],
    response: ItemBarcodeOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/item-barcodes/:id",
    alias: "delete_barcode_item_barcodes__id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/item-barcodes/:id",
    alias: "update_barcode_item_barcodes__id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ItemBarcodeUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ItemBarcodeOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/item-barcodes/:id/primary",
    alias: "set_primary_compat_item_barcodes__id__primary_post",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/item-barcodes/:id/set-primary",
    alias: "set_primary_item_barcodes__id__set_primary_post",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ItemBarcodeOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/item-barcodes/by-items",
    alias: "list_barcodes_for_items_item_barcodes_by_items_get",
    requestFormat: "json",
    parameters: [
      {
        name: "item_id",
        type: "Query",
        schema: z.array(z.number().int()),
      },
      {
        name: "active_only",
        type: "Query",
        schema: z.boolean().optional().default(true),
      },
    ],
    response: z.array(ItemBarcodeOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/item-barcodes/item/:item_id",
    alias: "list_barcodes_for_item_item_barcodes_item__item_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "item_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.array(ItemBarcodeOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/items",
    alias: "get_all_items_items_get",
    requestFormat: "json",
    parameters: [
      {
        name: "supplier_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "enabled",
        type: "Query",
        schema: enabled,
      },
      {
        name: "q",
        type: "Query",
        schema: platform,
      },
      {
        name: "limit",
        type: "Query",
        schema: warehouse_id,
      },
    ],
    response: z.array(ItemOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/items",
    alias: "create_item_items_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ItemCreate,
      },
    ],
    response: ItemOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/items/:id",
    alias: "get_item_by_id_items__id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ItemOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/items/:id",
    alias: "update_item_items__id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ItemUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ItemOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/items/:id/test:disable",
    alias: "disable_test_item_items__id__test_disable_post",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ItemOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/items/:id/test:enable",
    alias: "enable_test_item_items__id__test_enable_post",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ItemOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/items/sku/:sku",
    alias: "get_item_by_sku_items_sku__sku__get",
    requestFormat: "json",
    parameters: [
      {
        name: "sku",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: ItemOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/items/sku/next",
    alias: "next_sku_items_sku_next_post",
    description: `返回下一个 SKU：
- AKT-000001...
- 并发安全
- 不创建 item`,
    requestFormat: "json",
    response: z.object({ sku: z.string() }).passthrough(),
  },
  {
    method: "get",
    path: "/merchant-code-bindings",
    alias: "list_merchant_code_bindings_merchant_code_bindings_get",
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "merchant_code",
        type: "Query",
        schema: platform,
      },
      {
        name: "current_only",
        type: "Query",
        schema: z.boolean().optional().default(true),
      },
      {
        name: "fsku_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "fsku_code",
        type: "Query",
        schema: platform,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: MerchantCodeBindingListOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/merchant-code-bindings/bind",
    alias: "bind_merchant_code_merchant_code_bindings_bind_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: MerchantCodeBindingBindIn,
      },
    ],
    response: MerchantCodeBindingOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/merchant-code-bindings/close",
    alias: "close_merchant_code_binding_merchant_code_bindings_close_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: MerchantCodeBindingCloseIn,
      },
    ],
    response: MerchantCodeBindingOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/meta/platforms",
    alias: "list_platforms_meta_platforms_get",
    description: `平台枚举（事实源：stores distinct）。
- 前端只消费，不维护隐式常量
- 输出统一大写
- 当前不做 enabled/disabled 配置开关，默认 enabled&#x3D;true`,
    requestFormat: "json",
    response: MetaPlatformsOut,
  },
  {
    method: "get",
    path: "/metrics/alerts/today",
    alias: "get_alerts_today_metrics_alerts_today_get",
    description: `可报警面板（Phase 4.3）：
- OUTBOUND：基于 SHIP_CONFIRM_REJECT 的 error_code（需要 platform）
- SHIPPING_QUOTE：基于 QUOTE_*_REJECT 的 error_code`,
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "day",
        type: "Query",
        schema: platform,
      },
      {
        name: "test_mode",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
    ],
    response: AlertsResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/metrics/fefo-risk",
    alias: "get_fefo_risk_metrics_metrics_fefo_risk_get",
    description: `FEFO 风险面板：近期临期批次 + FEFO 命中率 + 风险评分。`,
    requestFormat: "json",
    parameters: [
      {
        name: "days",
        type: "Query",
        schema: z.number().int().gte(1).lte(60).optional().default(7),
      },
    ],
    response: FefoRiskMetricsResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/metrics/outbound/by-day/:day",
    alias: "get_outbound_metrics_by_day_metrics_outbound_by_day__day__get",
    description: `单平台指定日期出库指标大盘（v2 结构）`,
    requestFormat: "json",
    parameters: [
      {
        name: "day",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "platform",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: OutboundMetricsV2,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/metrics/outbound/by-shop",
    alias: "get_outbound_metrics_by_shop_metrics_outbound_by_shop_get",
    description: `按店铺拆分出库表现。`,
    requestFormat: "json",
    parameters: [
      {
        name: "day",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "platform",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: OutboundShopMetricsResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/metrics/outbound/by-warehouse",
    alias:
      "get_outbound_metrics_by_warehouse_metrics_outbound_by_warehouse_get",
    description: `按仓库拆分出库表现。`,
    requestFormat: "json",
    parameters: [
      {
        name: "day",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "platform",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: OutboundWarehouseMetricsResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/metrics/outbound/failures",
    alias: "get_outbound_failures_metrics_outbound_failures_get",
    description: `出库失败统计：routing/pick/ship/inventory 等失败点汇总 + 明细。`,
    requestFormat: "json",
    parameters: [
      {
        name: "day",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "platform",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: OutboundFailuresMetricsResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/metrics/outbound/range",
    alias: "get_outbound_metrics_range_metrics_outbound_range_get",
    description: `最近 N 天出库趋势（按天汇总成功率 / FEFO 命中率 / fallback 比例）。`,
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "days",
        type: "Query",
        schema: z.number().int().gte(1).lte(60).optional().default(7),
      },
      {
        name: "end_day",
        type: "Query",
        schema: platform,
      },
    ],
    response: OutboundRangeMetricsResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/metrics/outbound/today",
    alias: "get_outbound_metrics_today_metrics_outbound_today_get",
    description: `单平台今日出库指标大盘（v2 结构）`,
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: OutboundMetricsV2,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/metrics/shipping-quote/failures",
    alias: "get_shipping_quote_failures_metrics_shipping_quote_failures_get",
    description: `Shipping Quote 失败统计：calc/recommend 的 reject 按 error_code 聚合 + 明细。`,
    requestFormat: "json",
    parameters: [
      {
        name: "day",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(2000).optional().default(200),
      },
    ],
    response: ShippingQuoteFailuresMetricsResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/oauth/:platform/callback",
    alias: "oauth_callback_oauth__platform__callback_get",
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "code",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "state",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/oauth/:platform/start",
    alias: "oauth_start_oauth__platform__start_get",
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "shop_id",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "redirect_uri",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: OAuthStartOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/ops/pricing-integrity/active-schemes",
    alias: "list_active_schemes_ops_pricing_integrity_active_schemes_get",
    requestFormat: "json",
    parameters: [
      {
        name: "include_archived",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
    ],
    response: OpsActiveSchemesOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/ops/pricing-integrity/cleanup/shell-schemes",
    alias:
      "cleanup_shell_schemes_ops_pricing_integrity_cleanup_shell_schemes_post",
    requestFormat: "json",
    parameters: [
      {
        name: "dry_run",
        type: "Query",
        schema: z.boolean().optional().default(true),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(5000).optional().default(500),
      },
      {
        name: "include_surcharge_only",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
    ],
    response: CleanupShellSchemesOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/ops/pricing-integrity/fix/archive-release-provinces",
    alias:
      "ops_fix_archive_release_provinces_ops_pricing_integrity_fix_archive_release_provinces_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PricingIntegrityFixArchiveReleaseIn,
      },
    ],
    response: PricingIntegrityFixArchiveReleaseOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/ops/pricing-integrity/fix/detach-zone-brackets",
    alias:
      "ops_fix_detach_zone_brackets_ops_pricing_integrity_fix_detach_zone_brackets_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PricingIntegrityFixDetachZoneBracketsIn,
      },
    ],
    response: PricingIntegrityFixDetachZoneBracketsOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/ops/pricing-integrity/fix/unbind-archived-templates",
    alias:
      "ops_fix_unbind_archived_templates_ops_pricing_integrity_fix_unbind_archived_templates_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PricingIntegrityFixUnbindArchivedTemplatesIn,
      },
    ],
    response: PricingIntegrityFixUnbindArchivedTemplatesOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/ops/pricing-integrity/schemes/:scheme_id",
    alias:
      "ops_pricing_integrity_report_ops_pricing_integrity_schemes__scheme_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: PricingIntegrityReportOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/ops/pricing-integrity/schemes/:scheme_id/fix/archive-release-all-provinces",
    alias:
      "ops_fix_archive_release_all_provinces_ops_pricing_integrity_schemes__scheme_id__fix_archive_release_all_provinces_post",
    requestFormat: "json",
    parameters: [
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "dry_run",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
    ],
    response: PricingIntegrityFixArchiveReleaseOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/ops/pricing-integrity/schemes/:scheme_id/fix/detach-brackets-all",
    alias:
      "ops_fix_detach_brackets_all_ops_pricing_integrity_schemes__scheme_id__fix_detach_brackets_all_post",
    requestFormat: "json",
    parameters: [
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "dry_run",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
    ],
    response: PricingIntegrityFixDetachZoneBracketsOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/ops/pricing-integrity/schemes/:scheme_id/fix/unbind-archived-templates-all",
    alias:
      "ops_fix_unbind_archived_templates_all_ops_pricing_integrity_schemes__scheme_id__fix_unbind_archived_templates_all_post",
    requestFormat: "json",
    parameters: [
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "dry_run",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
    ],
    response: PricingIntegrityFixUnbindArchivedTemplatesOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/orders",
    alias: "create_order_orders_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OrderCreateIn,
      },
    ],
    response: OrderCreateOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/orders/:order_id/fulfillment-debug",
    alias: "get_fulfillment_debug_orders__order_id__fulfillment_debug_get",
    requestFormat: "json",
    parameters: [
      {
        name: "order_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: FulfillmentDebugOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/orders/:order_id/warehouse-availability",
    alias:
      "order_warehouse_availability_orders__order_id__warehouse_availability_get",
    requestFormat: "json",
    parameters: [
      {
        name: "order_id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "warehouse_ids",
        type: "Query",
        schema: platform,
      },
    ],
    response: OrderWarehouseAvailabilityResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/orders/:platform/:shop_id/:ext_order_no/fulfillment/manual-assign",
    alias:
      "fulfillment_manual_assign_orders__platform___shop_id___ext_order_no__fulfillment_manual_assign_post",
    description: `Phase 5.1：人工指定执行仓（执行期唯一合法写入路径）

✅ 新世界观（一步到位迁移后）：
- 实际出库仓写入 order_fulfillment.actual_warehouse_id（执行仓事实）
- planned/service 归属仓仍由 routing 写入 order_fulfillment.planned_warehouse_id
- 写 fulfillment_status&#x3D;MANUALLY_ASSIGNED
- 写审计事件：MANUAL_WAREHOUSE_ASSIGNED

❌ 禁止回潮：
- 不允许写 orders.warehouse_id（该列迁移后将被删除/不再承载事实）`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ManualAssignRequest,
      },
      {
        name: "platform",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "shop_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "ext_order_no",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: ManualAssignResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/orders/:platform/:shop_id/:ext_order_no/fulfillment/override",
    alias:
      "fulfillment_override_alias_orders__platform___shop_id___ext_order_no__fulfillment_override_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ManualAssignRequest,
      },
      {
        name: "platform",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "shop_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "ext_order_no",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: ManualAssignResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/orders/:platform/:shop_id/:ext_order_no/pick",
    alias: "order_pick_orders__platform___shop_id___ext_order_no__pick_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PickRequest,
      },
      {
        name: "platform",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "shop_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "ext_order_no",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.array(PickResponse),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/orders/:platform/:shop_id/:ext_order_no/ship",
    alias: "order_ship_orders__platform___shop_id___ext_order_no__ship_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ShipRequest,
      },
      {
        name: "platform",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "shop_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "ext_order_no",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: ShipResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/orders/:platform/:shop_id/:ext_order_no/ship-with-waybill",
    alias:
      "order_ship_with_waybill_orders__platform___shop_id___ext_order_no__ship_with_waybill_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ShipWithWaybillRequest,
      },
      {
        name: "platform",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "shop_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "ext_order_no",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: ShipWithWaybillResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/orders/:platform/:shop_id/:ext_order_no/view",
    alias: "order_view_orders__platform___shop_id___ext_order_no__view_get",
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "shop_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "ext_order_no",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: OrderViewResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/orders/raw",
    alias: "create_order_raw_orders_raw_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({}).partial().passthrough(),
      },
      {
        name: "platform",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "shop_id",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: OrderCreateOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/orders/stats/daily",
    alias: "get_orders_daily_stats_orders_stats_daily_get",
    description: `单日订单统计：

- orders_created  : 当天创建订单数
- orders_shipped  : 当天发货订单数（ledger ref&#x3D;ORD:*，delta&lt;0 的 distinct ref）
- orders_returned : 当天有退货入库的订单数（source_type&#x3D;ORDER 的收货任务）`,
    requestFormat: "json",
    parameters: [
      {
        name: "date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
    ],
    response: OrdersDailyStatsModel,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/orders/stats/last7",
    alias: "get_orders_last7_stats_orders_stats_last7_get",
    description: `近 7 天订单趋势：

- 每天：orders_created / orders_shipped / orders_returned / return_rate
- 日期按升序排列（最早在前）`,
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
    ],
    response: OrdersTrendResponseModel,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/orders/stats/sla",
    alias: "get_orders_sla_stats_orders_stats_sla_get",
    description: `订单发货 SLA 统计：

- 以 orders.created_at 为下单时间；
- 以 outbound_commits_v2.created_at 为发货时间（state&#x3D;COMPLETED）；
- 两表通过 trace_id 关联。

只统计在给定时间窗口内发货的订单（按 outbound_commits_v2.created_at 过滤）。

✅ PROD-only（简化口径）：
- 排除测试店铺（platform_test_shops.code&#x3D;&#x27;DEFAULT&#x27;，以 store_id 为事实锚点）`,
    requestFormat: "json",
    parameters: [
      {
        name: "time_from",
        type: "Query",
        schema: platform,
      },
      {
        name: "time_to",
        type: "Query",
        schema: platform,
      },
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "sla_hours",
        type: "Query",
        schema: z.number().gte(0).optional().default(24),
      },
    ],
    response: OrdersSlaStatsModel,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/orders/summary",
    alias: "orders_summary_orders_summary_get",
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "status",
        type: "Query",
        schema: platform,
      },
      {
        name: "fulfillment_status",
        type: "Query",
        schema: platform,
      },
      {
        name: "time_from",
        type: "Query",
        schema: platform,
      },
      {
        name: "time_to",
        type: "Query",
        schema: platform,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional().default(100),
      },
    ],
    response: OrdersSummaryResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/outbound/ops",
    alias: "outbound_ops_legacy_stub_outbound_ops_get",
    description: `旧版出库操作（legacy）占位路由。

说明：
- 早期版本依赖旧的出库规划器与若干历史接口；
- 当前 v3 出库链路已经统一到 OutboundService + pick/ship；
- 为避免 ImportError &amp; 破坏现有启动流程，这里保留一个空壳路由，
  一旦被访问，明确返回 410（Gone），提示调用方迁移到新接口。`,
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "post",
    path: "/outbound/ops",
    alias: "outbound_ops_legacy_stub_outbound_ops_post",
    description: `旧版出库操作（legacy）占位路由。

说明：
- 早期版本依赖旧的出库规划器与若干历史接口；
- 当前 v3 出库链路已经统一到 OutboundService + pick/ship；
- 为避免 ImportError &amp; 破坏现有启动流程，这里保留一个空壳路由，
  一旦被访问，明确返回 410（Gone），提示调用方迁移到新接口。`,
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "get",
    path: "/outbound/ops/:path",
    alias: "outbound_ops_legacy_stub_outbound_ops__path__get",
    description: `旧版出库操作（legacy）占位路由。

说明：
- 早期版本依赖旧的出库规划器与若干历史接口；
- 当前 v3 出库链路已经统一到 OutboundService + pick/ship；
- 为避免 ImportError &amp; 破坏现有启动流程，这里保留一个空壳路由，
  一旦被访问，明确返回 410（Gone），提示调用方迁移到新接口。`,
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "post",
    path: "/outbound/ops/:path",
    alias: "outbound_ops_legacy_stub_outbound_ops__path__post",
    description: `旧版出库操作（legacy）占位路由。

说明：
- 早期版本依赖旧的出库规划器与若干历史接口；
- 当前 v3 出库链路已经统一到 OutboundService + pick/ship；
- 为避免 ImportError &amp; 破坏现有启动流程，这里保留一个空壳路由，
  一旦被访问，明确返回 410（Gone），提示调用方迁移到新接口。`,
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "post",
    path: "/outbound/ship/commit",
    alias: "outbound_ship_commit_outbound_ship_commit_post",
    description: `出库入口（统一版，真正扣库存）：

- 每次调用都会生成一个 trace_id，用于串联订单 / 预占 / 出库 / ledger；
- 实际库存扣减与台账写入统一走 OutboundService → StockService.adjust；
- 幂等：以 (platform, shop_id, ref) 组成的 order_id 作为业务键，
  OutboundService 会通过 stock_ledger 中已有 delta 判断“已扣数量”，
  只扣“剩余需要扣”的部分；若 total_qty&#x3D;0，则视为完全幂等。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OutboundShipIn,
      },
    ],
    response: OutboundShipOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/pdd/auth/url",
    alias: "get_pdd_auth_url_pdd_auth_url_get",
    description: `前端调用这个接口，拿到 PDD 授权 URL，然后 window.location.href 跳过去。`,
    requestFormat: "json",
    parameters: [
      {
        name: "store_id",
        type: "Query",
        schema: z.number().int(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/pdd/oauth/callback",
    alias: "pdd_oauth_callback_pdd_oauth_callback_get",
    description: `被拼多多回调的入口：?code&#x3D;xxx&amp;state&#x3D;yyy

正常场景下，处理完后你可以给一个简单 HTML 提示“授权成功，可以关闭窗口”。`,
    requestFormat: "json",
    parameters: [
      {
        name: "code",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "state",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/permissions",
    alias: "get_all_permissions_permissions_get",
    description: `获取全部权限列表。

需要权限: system.permission.manage`,
    requestFormat: "json",
    response: z.array(PermissionOut),
  },
  {
    method: "post",
    path: "/permissions",
    alias: "create_permission_permissions_post",
    description: `创建权限。

需要权限: system.permission.manage`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PermissionCreate,
      },
    ],
    response: PermissionOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/permissions/:permission_id",
    alias: "get_permission_by_id_permissions__permission_id__get",
    description: `按 ID 获取权限详情。

需要权限: system.permission.manage`,
    requestFormat: "json",
    parameters: [
      {
        name: "permission_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: PermissionOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pick",
    alias: "pick_commit_pick_post",
    description: `拣货动作：调用 PickService.record_pick 立即扣减库存（原子 + 幂等）。

当前版本暂不直接更新 pick_task_lines / remain，仅返回本次拣货结果；
后续可在此基础上增加任务维度的 picked/remain 统计。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PickIn,
      },
    ],
    response: PickOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/pick-tasks",
    alias: "list_pick_tasks_pick_tasks_get",
    requestFormat: "json",
    parameters: [
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "status",
        type: "Query",
        schema: platform,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional().default(50),
      },
    ],
    response: z.array(PickTaskOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/pick-tasks/:task_id",
    alias: "get_pick_task_pick_tasks__task_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "task_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PickTaskOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pick-tasks/:task_id/commit",
    alias: "commit_pick_task_pick_tasks__task_id__commit_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PickTaskCommitIn,
      },
      {
        name: "task_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PickTaskCommitResult,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/pick-tasks/:task_id/commit-check",
    alias: "get_pick_task_commit_check_pick_tasks__task_id__commit_check_get",
    requestFormat: "json",
    parameters: [
      {
        name: "task_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PickTaskCommitCheckOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/pick-tasks/:task_id/diff",
    alias: "get_pick_task_diff_pick_tasks__task_id__diff_get",
    requestFormat: "json",
    parameters: [
      {
        name: "task_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PickTaskDiffSummaryOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pick-tasks/:task_id/print-pick-list",
    alias: "print_pick_list_pick_tasks__task_id__print_pick_list_post",
    description: `手工触发打印（显式动作）：
- 幂等 enqueue pick_list print_job
- 不做任何自动解析（order_id 必须由调用方显式提供）`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PickTaskPrintPickListIn,
      },
      {
        name: "task_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PickTaskOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pick-tasks/:task_id/scan",
    alias: "record_scan_for_pick_task_pick_tasks__task_id__scan_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PickTaskScanIn,
      },
      {
        name: "task_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PickTaskOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pick-tasks/ensure-from-order/:order_id",
    alias:
      "ensure_pick_task_from_order_disabled_pick_tasks_ensure_from_order__order_id__post",
    description: `自动化入口：已废弃 / 禁用
- 不再自动解析仓库
- 不再自动创建任务
- 不再自动打印`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PickTaskCreateFromOrder,
      },
      {
        name: "order_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PickTaskOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pick-tasks/manual-from-order/:order_id",
    alias:
      "manual_create_pick_task_from_order_pick_tasks_manual_from_order__order_id__post",
    description: `手工入口（推荐）：
- 必须显式 warehouse_id
- 只创建 pick_task + lines
- ❌ 不自动 enqueue 打印`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PickTaskCreateFromOrder,
      },
      {
        name: "order_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PickTaskOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/ping",
    alias: "ping_ping_get",
    requestFormat: "json",
    response: z.object({}).partial().passthrough(),
  },
  {
    method: "post",
    path: "/platform-orders/confirm-and-create",
    alias:
      "confirm_and_create_platform_order_platform_orders_confirm_and_create_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PlatformOrderConfirmCreateIn,
      },
    ],
    response: PlatformOrderConfirmCreateOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/platform-orders/ingest",
    alias: "ingest_platform_order_platform_orders_ingest_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PlatformOrderIngestIn,
      },
    ],
    response: PlatformOrderIngestOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/platform-orders/manual-decisions/bind-merchant-code",
    alias:
      "manual_bind_merchant_code_platform_orders_manual_decisions_bind_merchant_code_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ManualBindMerchantCodeIn,
      },
    ],
    response: z.object({}).partial().passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/platform-orders/manual-decisions/latest",
    alias:
      "list_latest_manual_decisions_platform_orders_manual_decisions_latest_get",
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "store_id",
        type: "Query",
        schema: z.number().int().gte(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(20),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: ManualDecisionOrdersOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/platform-orders/replay",
    alias: "replay_platform_order_platform_orders_replay_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PlatformOrderReplayIn,
      },
    ],
    response: PlatformOrderReplayOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/platform-shops/:platform/:shop_id",
    alias: "get_platform_shop_status_platform_shops__platform___shop_id__get",
    description: `查询平台店铺当前状态（来自 store_tokens 表）。

- 如果存在 OAuth / 手工 token → 返回 token 信息；
- 如果不存在 → 返回 NOT_FOUND。`,
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "shop_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: SimpleOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/platform-shops/credentials",
    alias: "upsert_credentials_platform_shops_credentials_post",
    description: `手工录入平台店铺 access_token（不走 OAuth，快速调试用）。

行为调整版（相比旧实现）：
- 不再写 legacy 的 platform_shops 表；
- 统一写入 store_tokens 表，和 OAuth token 走同一套模型；
- refresh_token 固定为 &quot;MANUAL&quot;，方便区分来源。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PlatformShopCredentialsIn,
      },
    ],
    response: SimpleOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/pricing-schemes/:scheme_id",
    alias:
      "shipping_provider_pricing_schemes_detail_pricing_schemes__scheme_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SchemeDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/pricing-schemes/:scheme_id",
    alias: "update_scheme_pricing_schemes__scheme_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SchemeUpdateIn,
      },
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SchemeDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pricing-schemes/:scheme_id:set-default-segment-template",
    alias:
      "set_default_segment_template_pricing_schemes__scheme_id__set_default_segment_template_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SchemeDefaultSegmentTemplateIn,
      },
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SchemeDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/pricing-schemes/:scheme_id/__debug_echo",
    alias:
      "shipping_provider_pricing_schemes_debug_echo_pricing_schemes__scheme_id____debug_echo_get",
    requestFormat: "json",
    parameters: [
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SchemeDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pricing-schemes/:scheme_id/activate-exclusive",
    alias:
      "activate_scheme_exclusive_pricing_schemes__scheme_id__activate_exclusive_post",
    description: `✅ 原子“独占启用”接口：
- 启用本 scheme
- 同 provider 其它 scheme 自动停用`,
    requestFormat: "json",
    parameters: [
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SchemeDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/pricing-schemes/:scheme_id/dest-adjustments",
    alias:
      "list_dest_adjustments_pricing_schemes__scheme_id__dest_adjustments_get",
    requestFormat: "json",
    parameters: [
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: z.array(DestAdjustmentOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pricing-schemes/:scheme_id/dest-adjustments:upsert",
    alias:
      "upsert_dest_adjustments_pricing_schemes__scheme_id__dest_adjustments_upsert_post",
    description: `✅ 新主入口（事实写入点，严格 code 世界）：
- 输入：scope + province_code(+city_code) + amount + active + priority
- 行为：同 key 则更新，否则创建（幂等）
- 互斥：同省 province vs city active 互斥（service 层硬约束）`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestAdjustmentUpsertIn,
      },
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: DestAdjustmentOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/pricing-schemes/:scheme_id/segment-templates",
    alias: "list_templates_pricing_schemes__scheme_id__segment_templates_get",
    requestFormat: "json",
    parameters: [
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SegmentTemplateListOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pricing-schemes/:scheme_id/segment-templates",
    alias: "create_template_pricing_schemes__scheme_id__segment_templates_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SegmentTemplateCreateIn,
      },
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SegmentTemplateDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/pricing-schemes/:scheme_id/segments/:segment_id",
    alias:
      "patch_scheme_segment_active_pricing_schemes__scheme_id__segments__segment_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ active: z.boolean() }).passthrough(),
      },
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "segment_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SchemeDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pricing-schemes/:scheme_id/surcharges",
    alias: "create_surcharge_pricing_schemes__scheme_id__surcharges_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SurchargeCreateIn,
      },
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SurchargeOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pricing-schemes/:scheme_id/surcharges:upsert",
    alias:
      "upsert_surcharge_pricing_schemes__scheme_id__surcharges_upsert_post",
    description: `✅ 新主入口（事实写入点）：
- 输入：scope + province(+city) + amount
- 行为：同 key 则更新，否则创建（幂等）
- 护栏：同省 province vs city 互斥（active 时）`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SurchargeUpsertIn,
      },
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SurchargeOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/pricing-schemes/:scheme_id/warehouses",
    alias: "get_scheme_warehouses_pricing_schemes__scheme_id__warehouses_get",
    requestFormat: "json",
    parameters: [
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SchemeWarehousesGetOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/pricing-schemes/:scheme_id/warehouses/:warehouse_id",
    alias:
      "delete_scheme_warehouse_pricing_schemes__scheme_id__warehouses__warehouse_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SchemeWarehouseDeleteOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/pricing-schemes/:scheme_id/warehouses/:warehouse_id",
    alias:
      "patch_scheme_warehouse_pricing_schemes__scheme_id__warehouses__warehouse_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SchemeWarehousePatchIn,
      },
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SchemeWarehousePatchOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pricing-schemes/:scheme_id/warehouses/bind",
    alias:
      "bind_scheme_warehouse_pricing_schemes__scheme_id__warehouses_bind_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SchemeWarehouseBindIn,
      },
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SchemeWarehouseBindOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/pricing-schemes/:scheme_id/zone-brackets-matrix",
    alias:
      "shipping_provider_pricing_schemes_zone_brackets_matrix_pricing_schemes__scheme_id__zone_brackets_matrix_get",
    requestFormat: "json",
    parameters: [
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ZoneBracketsMatrixOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pricing-schemes/:scheme_id/zones",
    alias: "create_zone_pricing_schemes__scheme_id__zones_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ZoneCreateIn,
      },
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ZoneOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/pricing-schemes/:scheme_id/zones-atomic",
    alias: "create_zone_atomic_pricing_schemes__scheme_id__zones_atomic_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ZoneCreateAtomicIn,
      },
      {
        name: "scheme_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ZoneOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/print-jobs/:job_id",
    alias: "get_print_job_print_jobs__job_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "job_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.object({}).partial().passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/print-jobs/:job_id/failed",
    alias: "mark_failed_print_jobs__job_id__failed_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ error: z.string().min(1).max(2000) }).passthrough(),
      },
      {
        name: "job_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.object({}).partial().passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/print-jobs/:job_id/printed",
    alias: "mark_printed_print_jobs__job_id__printed_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: MarkPrintedIn,
      },
      {
        name: "job_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.object({}).partial().passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/purchase-orders/",
    alias: "list_purchase_orders_purchase_orders__get",
    requestFormat: "json",
    parameters: [
      {
        name: "skip",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
      {
        name: "supplier",
        type: "Query",
        schema: platform,
      },
      {
        name: "status",
        type: "Query",
        schema: platform,
      },
    ],
    response: z.array(PurchaseOrderListItemOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/purchase-orders/",
    alias: "create_purchase_order_purchase_orders__post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PurchaseOrderCreateV2,
      },
    ],
    response: PurchaseOrderWithLinesOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/purchase-orders/:po_id",
    alias: "get_purchase_order_purchase_orders__po_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "po_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PurchaseOrderWithLinesOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/purchase-orders/:po_id/close",
    alias: "close_purchase_order_purchase_orders__po_id__close_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PurchaseOrderCloseIn,
      },
      {
        name: "po_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PurchaseOrderWithLinesOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/purchase-orders/:po_id/receipts",
    alias: "get_purchase_order_receipts_purchase_orders__po_id__receipts_get",
    requestFormat: "json",
    parameters: [
      {
        name: "po_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.array(PurchaseOrderReceiptEventOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/purchase-orders/:po_id/receipts/draft",
    alias: "start_po_receive_draft_purchase_orders__po_id__receipts_draft_post",
    description: `显式开始收货：创建/复用 PO 的 DRAFT receipt
- 彻底消除“录入接口隐式生成 receipt”的行为`,
    requestFormat: "json",
    parameters: [
      {
        name: "po_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: InboundReceiptOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/purchase-orders/:po_id/receive-line",
    alias:
      "receive_purchase_order_line_purchase_orders__po_id__receive_line_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PurchaseOrderReceiveLineIn,
      },
      {
        name: "po_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PurchaseOrderReceiveWorkbenchOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/purchase-orders/:po_id/receive-workbench",
    alias:
      "get_po_receive_workbench_purchase_orders__po_id__receive_workbench_get",
    description: `Workbench 统一输出：
- po_summary（合同锚点）
- receipt（当前 DRAFT 或 null）
- rows（计划 + 已确认实收 + 草稿实收 + 剩余应收 + 批次维度）
- explain（confirm 预检结果）
- caps（可 confirm 与否）`,
    requestFormat: "json",
    parameters: [
      {
        name: "po_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: PurchaseOrderReceiveWorkbenchOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/purchase-orders/dev-demo",
    alias: "create_demo_purchase_order_purchase_orders_dev_demo_post",
    requestFormat: "json",
    response: PurchaseOrderWithLinesOut,
  },
  {
    method: "get",
    path: "/purchase-reports/daily",
    alias: "purchase_report_daily_purchase_reports_daily_get",
    requestFormat: "json",
    parameters: [
      {
        name: "date_from",
        type: "Query",
        schema: platform,
      },
      {
        name: "date_to",
        type: "Query",
        schema: platform,
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "supplier_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "status",
        type: "Query",
        schema: platform,
      },
      {
        name: "mode",
        type: "Query",
        schema: z.enum(["fact", "plan"]).optional().default("fact"),
      },
      {
        name: "time_mode",
        type: "Query",
        schema: z.string().optional().default("occurred"),
      },
    ],
    response: z.array(DailyPurchaseReportItem),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/purchase-reports/items",
    alias: "purchase_report_by_items_purchase_reports_items_get",
    requestFormat: "json",
    parameters: [
      {
        name: "date_from",
        type: "Query",
        schema: platform,
      },
      {
        name: "date_to",
        type: "Query",
        schema: platform,
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "supplier_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "status",
        type: "Query",
        schema: platform,
      },
      {
        name: "item_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "item_keyword",
        type: "Query",
        schema: platform,
      },
      {
        name: "mode",
        type: "Query",
        schema: z.enum(["fact", "plan"]).optional().default("fact"),
      },
      {
        name: "time_mode",
        type: "Query",
        schema: z.string().optional().default("occurred"),
      },
    ],
    response: z.array(ItemPurchaseReportItem),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/purchase-reports/suppliers",
    alias: "purchase_report_by_suppliers_purchase_reports_suppliers_get",
    requestFormat: "json",
    parameters: [
      {
        name: "date_from",
        type: "Query",
        schema: platform,
      },
      {
        name: "date_to",
        type: "Query",
        schema: platform,
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "supplier_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "status",
        type: "Query",
        schema: platform,
      },
      {
        name: "mode",
        type: "Query",
        schema: z.enum(["fact", "plan"]).optional().default("fact"),
      },
      {
        name: "time_mode",
        type: "Query",
        schema: z.string().optional().default("occurred"),
      },
    ],
    response: z.array(SupplierPurchaseReportItem),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/return-tasks/",
    alias: "list_return_tasks_return_tasks__get",
    requestFormat: "json",
    parameters: [
      {
        name: "skip",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
      {
        name: "status",
        type: "Query",
        schema: platform,
      },
      {
        name: "order_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
    ],
    response: z.array(ReturnTaskOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/return-tasks/:task_id",
    alias: "get_return_task_return_tasks__task_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "task_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ReturnTaskOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/return-tasks/:task_id/commit",
    alias: "commit_return_task_return_tasks__task_id__commit_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ReturnTaskCommitIn,
      },
      {
        name: "task_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ReturnTaskOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/return-tasks/:task_id/pick",
    alias: "pick_return_task_compat_return_tasks__task_id__pick_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ReturnTaskReceiveIn,
      },
      {
        name: "task_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ReturnTaskOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/return-tasks/:task_id/receive",
    alias: "receive_return_task_return_tasks__task_id__receive_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ReturnTaskReceiveIn,
      },
      {
        name: "task_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ReturnTaskOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/return-tasks/from-order/:order_id",
    alias:
      "create_return_task_from_order_return_tasks_from_order__order_id__post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ReturnTaskCreateFromOrder,
      },
      {
        name: "order_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: ReturnTaskOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/return-tasks/order-refs",
    alias: "list_return_order_refs_return_tasks_order_refs_get",
    requestFormat: "json",
    parameters: [
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(20),
      },
      {
        name: "days",
        type: "Query",
        schema: z.number().int().gte(1).lte(3650).optional().default(30),
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
    ],
    response: z.array(ReturnOrderRefItem),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/return-tasks/order-refs/:order_ref/detail",
    alias:
      "get_return_order_ref_detail_return_tasks_order_refs__order_ref__detail_get",
    requestFormat: "json",
    parameters: [
      {
        name: "order_ref",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
    ],
    response: ReturnOrderRefDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/return-tasks/order-refs/:order_ref/summary",
    alias:
      "get_return_order_ref_summary_return_tasks_order_refs__order_ref__summary_get",
    requestFormat: "json",
    parameters: [
      {
        name: "order_ref",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
    ],
    response: ReturnOrderRefSummaryOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/roles",
    alias: "get_all_roles_roles_get",
    description: `获取全部角色列表。

需要权限: system.role.manage`,
    requestFormat: "json",
    response: z.array(RoleOut),
  },
  {
    method: "post",
    path: "/roles",
    alias: "create_role_roles_post",
    description: `创建角色。

需要权限: system.role.manage`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RoleCreate,
      },
    ],
    response: RoleOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/roles/:role_id",
    alias: "get_role_by_id_roles__role_id__get",
    description: `按 ID 获取角色详情。

需要权限: system.role.manage`,
    requestFormat: "json",
    parameters: [
      {
        name: "role_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: RoleOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/roles/:role_id/permissions",
    alias: "set_role_permissions_roles__role_id__permissions_patch",
    description: `为某个角色批量绑定权限（幂等覆盖）。

请求示例：
    PATCH /roles/1/permissions
    {
      &quot;permission_ids&quot;: [&quot;1&quot;, &quot;2&quot;, &quot;3&quot;]
    }

需要权限: system.role.manage`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RolePermissionsBody,
      },
      {
        name: "role_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: RoleOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/roles/:role_id/permissions",
    alias: "set_role_permissions_roles__role_id__permissions_put",
    description: `为某个角色批量绑定权限（幂等覆盖）。

请求示例：
    PATCH /roles/1/permissions
    {
      &quot;permission_ids&quot;: [&quot;1&quot;, &quot;2&quot;, &quot;3&quot;]
    }

需要权限: system.role.manage`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RolePermissionsBody,
      },
      {
        name: "role_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: RoleOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/scan",
    alias: "scan_entrypoint_scan_post",
    description: `v2 统一 /scan 入口：

- 前端提交 ScanRequest（mode + item_id + qty + warehouse_id + 批次/日期 + ctx）
- 由 scan_orchestrator.ingest 解析并路由到对应 handler（receive/pick/count）
- 不再直接调用 InboundService.receive，也不再依赖 location_id/ref/occurred_at`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ScanRequest,
      },
    ],
    response: ScanResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/scan/count/commit",
    alias: "scan_count_commit_scan_count_commit_post",
    description: `LEGACY：基于 location 的盘点接口。
当前仍按旧实现工作，未来可迁移到 /scan + ScanRequest(mode&#x3D;&#x27;count&#x27;)，并改用 warehouse_id 粒度。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ScanCountCommitRequest,
      },
    ],
    response: ScanResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/segment-template-items/:item_id",
    alias: "patch_item_active_segment_template_items__item_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ active: z.boolean() }).passthrough(),
      },
      {
        name: "item_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SegmentTemplateDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/segment-templates/:template_id",
    alias: "get_template_detail_segment_templates__template_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "template_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SegmentTemplateDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/segment-templates/:template_id:activate",
    alias: "activate_template_segment_templates__template_id__activate_post",
    requestFormat: "json",
    parameters: [
      {
        name: "template_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SegmentTemplateDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/segment-templates/:template_id:archive",
    alias: "archive_template_segment_templates__template_id__archive_post",
    description: `✅ 归档：只允许“已保存（published）且非当前生效”的模板归档
- 归档后 status&#x3D;archived
- 归档后不可启用（activate 已经只允许 published）`,
    requestFormat: "json",
    parameters: [
      {
        name: "template_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SegmentTemplateDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/segment-templates/:template_id:deactivate",
    alias:
      "deactivate_template_segment_templates__template_id__deactivate_post",
    requestFormat: "json",
    parameters: [
      {
        name: "template_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: SegmentTemplateDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/segment-templates/:template_id:publish",
    alias: "publish_template_segment_templates__template_id__publish_post",
    requestFormat: "json",
    parameters: [
      {
        name: "template_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SegmentTemplateDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/segment-templates/:template_id:rename",
    alias: "rename_template_segment_templates__template_id__rename_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string().min(1).max(80) }).passthrough(),
      },
      {
        name: "template_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: SegmentTemplateDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/segment-templates/:template_id:unarchive",
    alias: "unarchive_template_segment_templates__template_id__unarchive_post",
    description: `✅ 取消归档：只允许“已归档（archived）”模板取消归档
- 取消归档后 status&#x3D;published
- 取消归档后允许再次启用（activate 仍只允许 published）
- 不引入通用 PATCH status 口子`,
    requestFormat: "json",
    parameters: [
      {
        name: "template_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SegmentTemplateDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/segment-templates/:template_id/items",
    alias: "put_template_items_segment_templates__template_id__items_put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SegmentTemplateItemsPutIn,
      },
      {
        name: "template_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SegmentTemplateDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/ship/calc",
    alias: "calc_shipping_quotes_ship_calc_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ShipCalcRequest,
      },
    ],
    response: ShipCalcResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/ship/confirm",
    alias: "confirm_ship_ship_confirm_post",
    description: `记录一次发货完成事件（Phase 3 + 幂等守门 + 可统计错误码）

合同（刚性）：
- ref 在 (platform, shop_id) 维度必须幂等（防重复确认）
- warehouse_id 必填
- carrier 必填且必须是该仓可服务
- scheme_id 必填且必须绑定该仓、有效期命中、且属于 carrier
- tracking_no 若提供：(carrier_code, tracking_no) 唯一

错误返回：
- 422：缺字段/入参不合法（detail: {code,message}）
- 409：合同冲突（detail: {code,message}）

失败审计（Phase 4 样板）：
- 对所有 422/409，写 audit_events：flow&#x3D;OUTBOUND, event&#x3D;SHIP_CONFIRM_REJECT
  meta 包含 error_code / message / platform / shop_id / ref / trace_id / warehouse_id / carrier / scheme_id`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ShipConfirmRequest,
      },
    ],
    response: ShipConfirmResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/ship/prepare-from-order",
    alias: "prepare_from_order_ship_prepare_from_order_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ShipPrepareRequest,
      },
    ],
    response: ShipPrepareResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/shipping-provider-contacts/:contact_id",
    alias:
      "shipping_provider_delete_contact_shipping_provider_contacts__contact_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "contact_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/shipping-provider-contacts/:contact_id",
    alias:
      "shipping_provider_update_contact_shipping_provider_contacts__contact_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ShippingProviderContactUpdateIn,
      },
      {
        name: "contact_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ShippingProviderContactOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/shipping-providers",
    alias: "list_shipping_providers_shipping_providers_get",
    description: `物流/快递网点列表（读聚合 contacts）。

权限：config.store.read`,
    requestFormat: "json",
    parameters: [
      {
        name: "active",
        type: "Query",
        schema: enabled,
      },
      {
        name: "q",
        type: "Query",
        schema: platform,
      },
    ],
    response: ShippingProviderListOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/shipping-providers",
    alias: "create_shipping_provider_shipping_providers_post",
    description: `新建仓库可用快递网点（主体事实）。

权限：config.store.write

刚性合同：
- warehouse_id 必填且必须存在
- code 必填（不允许 None / 空白）
- code 全局唯一（strip + upper 后比较）`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ShippingProviderCreateIn,
      },
    ],
    response: ShippingProviderCreateOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/shipping-providers/:provider_id",
    alias: "get_shipping_provider_shipping_providers__provider_id__get",
    description: `物流/快递网点详情（读聚合 contacts）。

权限：config.store.read`,
    requestFormat: "json",
    parameters: [
      {
        name: "provider_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ShippingProviderDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/shipping-providers/:provider_id",
    alias: "update_shipping_provider_shipping_providers__provider_id__patch",
    description: `更新仓库可用快递网点（主体事实）。

权限：config.store.write

刚性合同：
- 如果更新 code：不允许置空；必须非空
- code 全局唯一（strip + upper 后比较）
- 如果更新 warehouse_id：必须存在`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ShippingProviderUpdateIn,
      },
      {
        name: "provider_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ShippingProviderUpdateOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/shipping-providers/:provider_id/contacts",
    alias:
      "shipping_provider_create_contact_shipping_providers__provider_id__contacts_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ShippingProviderContactCreateIn,
      },
      {
        name: "provider_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ShippingProviderContactOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/shipping-providers/:provider_id/pricing-schemes",
    alias:
      "shipping_provider_pricing_schemes_list_shipping_providers__provider_id__pricing_schemes_get",
    requestFormat: "json",
    parameters: [
      {
        name: "provider_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "active",
        type: "Query",
        schema: enabled,
      },
      {
        name: "include_archived",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
      {
        name: "include_inactive",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
    ],
    response: SchemeListOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/shipping-providers/:provider_id/pricing-schemes",
    alias:
      "create_scheme_shipping_providers__provider_id__pricing_schemes_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SchemeCreateIn,
      },
      {
        name: "provider_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SchemeDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/shipping-providers/:provider_id/pricing-schemes/active",
    alias:
      "shipping_provider_pricing_schemes_list_active_shipping_providers__provider_id__pricing_schemes_active_get",
    requestFormat: "json",
    parameters: [
      {
        name: "provider_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SchemeListOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/shipping-quote/calc",
    alias: "calc_shipping_quote_shipping_quote_calc_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: QuoteCalcIn,
      },
    ],
    response: QuoteCalcOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/shipping-quote/recommend",
    alias: "recommend_shipping_quote_shipping_quote_recommend_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: QuoteRecommendIn,
      },
    ],
    response: QuoteRecommendOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/shipping-records/:record_id",
    alias: "get_shipping_record_by_id_shipping_records__record_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "record_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ShippingRecordOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/shipping-records/:record_id/status",
    alias:
      "update_shipping_record_status_shipping_records__record_id__status_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ShippingStatusUpdateIn,
      },
      {
        name: "record_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: ShippingStatusUpdateOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/shipping-records/by-ref/:order_ref",
    alias:
      "get_shipping_records_by_ref_shipping_records_by_ref__order_ref__get",
    requestFormat: "json",
    parameters: [
      {
        name: "order_ref",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.array(ShippingRecordOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/shipping-reports/by-carrier",
    alias: "shipping_reports_by_carrier_shipping_reports_by_carrier_get",
    requestFormat: "json",
    parameters: [
      {
        name: "from_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "to_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "carrier_code",
        type: "Query",
        schema: platform,
      },
      {
        name: "province",
        type: "Query",
        schema: platform,
      },
      {
        name: "city",
        type: "Query",
        schema: platform,
      },
      {
        name: "district",
        type: "Query",
        schema: platform,
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
    ],
    response: ShippingByCarrierResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/shipping-reports/by-province",
    alias: "shipping_reports_by_province_shipping_reports_by_province_get",
    requestFormat: "json",
    parameters: [
      {
        name: "from_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "to_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "carrier_code",
        type: "Query",
        schema: platform,
      },
      {
        name: "province",
        type: "Query",
        schema: platform,
      },
      {
        name: "city",
        type: "Query",
        schema: platform,
      },
      {
        name: "district",
        type: "Query",
        schema: platform,
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
    ],
    response: ShippingByProvinceResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/shipping-reports/by-shop",
    alias: "shipping_reports_by_shop_shipping_reports_by_shop_get",
    requestFormat: "json",
    parameters: [
      {
        name: "from_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "to_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "carrier_code",
        type: "Query",
        schema: platform,
      },
      {
        name: "province",
        type: "Query",
        schema: platform,
      },
      {
        name: "city",
        type: "Query",
        schema: platform,
      },
      {
        name: "district",
        type: "Query",
        schema: platform,
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
    ],
    response: ShippingByShopResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/shipping-reports/by-warehouse",
    alias: "shipping_reports_by_warehouse_shipping_reports_by_warehouse_get",
    requestFormat: "json",
    parameters: [
      {
        name: "from_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "to_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "carrier_code",
        type: "Query",
        schema: platform,
      },
      {
        name: "province",
        type: "Query",
        schema: platform,
      },
      {
        name: "city",
        type: "Query",
        schema: platform,
      },
      {
        name: "district",
        type: "Query",
        schema: platform,
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
    ],
    response: ShippingByWarehouseResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/shipping-reports/daily",
    alias: "shipping_reports_daily_shipping_reports_daily_get",
    requestFormat: "json",
    parameters: [
      {
        name: "from_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "to_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "carrier_code",
        type: "Query",
        schema: platform,
      },
      {
        name: "province",
        type: "Query",
        schema: platform,
      },
      {
        name: "city",
        type: "Query",
        schema: platform,
      },
      {
        name: "district",
        type: "Query",
        schema: platform,
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
    ],
    response: ShippingDailyResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/shipping-reports/list",
    alias: "shipping_reports_list_shipping_reports_list_get",
    description: `发货明细列表（带过滤条件 + 分页）。`,
    requestFormat: "json",
    parameters: [
      {
        name: "from_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "to_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "shop_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "carrier_code",
        type: "Query",
        schema: platform,
      },
      {
        name: "province",
        type: "Query",
        schema: platform,
      },
      {
        name: "city",
        type: "Query",
        schema: platform,
      },
      {
        name: "district",
        type: "Query",
        schema: platform,
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(500).optional().default(50),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: ShippingListResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/shipping-reports/options",
    alias: "shipping_reports_options_shipping_reports_options_get",
    description: `发货报表下拉选项：
- 平台列表（platform）
- 店铺 ID 列表（shop_id）
- 省份列表（meta.dest_province）
- 城市列表（meta.dest_city）
只统计当前日期范围内 shipping_records 出现过的值。`,
    requestFormat: "json",
    parameters: [
      {
        name: "from_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "to_date",
        type: "Query",
        schema: platform,
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
    ],
    response: ShippingReportFilterOptions,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/snapshot/inventory",
    alias: "inventory_snapshot_snapshot_inventory_get",
    description: `SnapshotPage 主列表接口（库存总览，实时视图）。`,
    requestFormat: "json",
    parameters: [
      {
        name: "q",
        type: "Query",
        schema: platform,
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(20),
      },
    ],
    response: InventorySnapshotResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/snapshot/item-detail/:item_id",
    alias: "item_detail_snapshot_item_detail__item_id__get",
    description: `Drawer V2 使用的“单品仓+批次明细”接口。`,
    requestFormat: "json",
    parameters: [
      {
        name: "item_id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "pools",
        type: "Query",
        schema: z.string().optional().default("MAIN"),
      },
    ],
    response: ItemDetailResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stock/batch/query",
    alias: "query_batches_stock_batch_query_post",
    description: `批次视图（v2）——**以 stocks 为唯一真相**：

- 先从 stocks 聚合 (item_id, warehouse_id, batch_code) 的当前库存 qty；
- 再 LEFT JOIN batches 取生产/有效期等 FEFO 信息；
- 完全忽略 batches.qty 字段，不再依赖旧时代的冗余数量。

过滤维度：
- item_id（必选或可选，视前端而定）
- warehouse_id（可选）
- expiry_date_from / expiry_date_to（基于 batches.expiry_date）`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StockBatchQueryIn,
      },
    ],
    response: StockBatchQueryOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stock/ledger/enums",
    alias: "ledger_enums_stock_ledger_enums_post",
    description: `前端下拉唯一来源（由后端 Enum 生成）：
- reason_canons: 稳定口径枚举
- sub_reasons: 具体动作枚举`,
    requestFormat: "json",
    response: LedgerEnums,
  },
  {
    method: "get",
    path: "/stock/ledger/explain",
    alias: "explain_ledger_ref_stock_ledger_explain_get",
    description: `台账解释（终态口径）：

- ledger → receipt → PO（可选）
- 不再解释 receive_task（执行层已移除）
- Receipt 是事实源：用 inbound_receipts(ref, trace_id) 定位
- Ledger 是动作流水：用 stock_ledger(ref, trace_id) 拉取`,
    requestFormat: "json",
    parameters: [
      {
        name: "ref",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "trace_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(2000).optional().default(300),
      },
    ],
    response: LedgerExplainOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stock/ledger/export",
    alias: "export_ledger_stock_ledger_export_post",
    description: `导出台账 CSV：

- 过滤条件与 /stock/ledger/query 一致（基于 LedgerQuery &amp; occurred_at）；
- 本次增强：支持 sub_reason 过滤，导出列中包含 sub_reason。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LedgerQuery,
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stock/ledger/query",
    alias: "query_ledger_stock_ledger_query_post",
    description: `普通查询（&lt;&#x3D;90 天限制由 normalize_time_range 控制）：
- 默认按 occurred_at 降序 + id 降序排序；
- 支持 item_id/item_keyword/warehouse_id/batch_code/reason/reason_canon/sub_reason/ref/trace_id 过滤；
- 返回 item_name（当前页批量补齐）。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LedgerQuery,
      },
    ],
    response: LedgerList,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stock/ledger/query-history",
    alias: "query_ledger_history_stock_ledger_query_history_post",
    description: `历史台账查询（用于 &gt;90 天窗口）：

- 必须提供 time_from；
- 必须提供锚点（trace_id/ref/item_id/reason_canon/sub_reason 任意一项）；
- 返回结构与 /stock/ledger/query 一致（LedgerList）。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LedgerQuery,
      },
    ],
    response: LedgerList,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stock/ledger/reconcile",
    alias: "reconcile_ledger_stock_ledger_reconcile_post",
    description: `台账对账接口：

在指定时间窗口内（基于 occurred_at），对比：

  SUM(delta)  vs  stocks.qty

找出 (warehouse_id, item_id, batch_code_key) 维度上“不平”的记录：
- ledger_sum_delta !&#x3D; stock_qty

过滤条件：
- 复用 LedgerQuery 中的 warehouse_id / item_id / batch_code（查询级归一后映射到 batch_code_key）；
- 其它过滤（reason/ref/trace_id）对对账没有意义，此处忽略。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LedgerQuery,
      },
    ],
    response: LedgerReconcileResult,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stock/ledger/reconcile-v2/summary",
    alias: "reconcile_summary_stock_ledger_reconcile_v2_summary_post",
    description: `多维对账汇总（供 LedgerCockpit 使用）：

- body 中使用 {time_from, time_to}（ISO datetime 字符串）；
- 内部按 &lt;&#x3D;90 天 做时间窗限制；
- 返回三块数据：
    movement_type 汇总
    ref 汇总
    trace 汇总`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ReconcileSummaryPayload,
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stock/ledger/reconcile-v2/three-books",
    alias: "reconcile_three_books_stock_ledger_reconcile_v2_three_books_post",
    description: `三账对账入口：

- body 中传 {cut}（ISO datetime），用于：
    * ledger_cut（occurred_at &lt;&#x3D; cut）
    * snapshot_v3 对应 snapshot_date &#x3D; cut::date`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ cut: z.string().datetime({ offset: true }) })
          .passthrough(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stock/ledger/summary",
    alias: "summarize_ledger_stock_ledger_summary_post",
    description: `台账统计接口（供前端直接渲染统计表/图）：

- 使用与明细查询相同的过滤条件（LedgerQuery）；
- 按 reason 聚合 count / sum(delta)；
- ✅ 统计口径 PROD-only：排除 DEFAULT Test Set 商品。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LedgerQuery,
      },
    ],
    response: LedgerSummary,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stock/ledger/timeline",
    alias: "ledger_timeline_stock_ledger_timeline_post",
    requestFormat: "json",
    parameters: [
      {
        name: "time_from",
        type: "Query",
        schema: z.string().datetime({ offset: true }),
      },
      {
        name: "time_to",
        type: "Query",
        schema: z.string().datetime({ offset: true }),
      },
      {
        name: "warehouse_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "item_id",
        type: "Query",
        schema: warehouse_id,
      },
      {
        name: "batch_code",
        type: "Query",
        schema: platform,
      },
      {
        name: "trace_id",
        type: "Query",
        schema: platform,
      },
      {
        name: "ref",
        type: "Query",
        schema: platform,
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stock/snapshot/v3/compare",
    alias: "snapshot_compare_stock_snapshot_v3_compare_post",
    requestFormat: "json",
    parameters: [
      {
        name: "at",
        type: "Query",
        schema: z.string().datetime({ offset: true }),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stock/snapshot/v3/cut",
    alias: "snapshot_cut_stock_snapshot_v3_cut_post",
    requestFormat: "json",
    parameters: [
      {
        name: "at",
        type: "Query",
        schema: z.string().datetime({ offset: true }),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stock/snapshot/v3/rebuild",
    alias: "snapshot_rebuild_stock_snapshot_v3_rebuild_post",
    requestFormat: "json",
    parameters: [
      {
        name: "at",
        type: "Query",
        schema: z.string().datetime({ offset: true }),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/stores",
    alias: "list_stores_stores_get",
    description: `店铺列表（基础信息，不含仓绑定）。

权限：config.store.read

✅ 合同：
- 支持 platform/q/limit/offset
- 返回结构保持：{ ok: true, data: [...] }`,
    requestFormat: "json",
    parameters: [
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "q",
        type: "Query",
        schema: platform,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(1000).optional().default(200),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: StoreListOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stores",
    alias: "create_or_get_store_stores_post",
    description: `店铺建档 / 补录（幂等）。

权限：config.store.write

✅ 合同收敛：
- shop_type 的唯一真相为 platform_test_shops（code&#x3D;&#x27;DEFAULT&#x27;）
- 创建时可选择 TEST/PROD：
  * TEST：写入/更新 platform_test_shops（绑定 store_id）
  * PROD：确保该 store_id 不在 platform_test_shops（删除绑定）`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StoreCreateIn,
      },
    ],
    response: StoreCreateOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/stores/:store_id",
    alias: "get_store_detail_stores__store_id__get",
    description: `店铺详情（含绑定仓列表）。
权限：config.store.read`,
    requestFormat: "json",
    parameters: [
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: StoreDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/stores/:store_id",
    alias: "update_store_stores__store_id__patch",
    description: `更新店铺基础信息（name / active / route_mode / email / 联系人 / 电话）。

权限：config.store.write`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StoreUpdateIn,
      },
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: StoreUpdateOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/stores/:store_id/default-warehouse",
    alias: "get_default_warehouse_stores__store_id__default_warehouse_get",
    description: `解析默认仓（若无绑定返回 null）。
权限：config.store.read`,
    requestFormat: "json",
    parameters: [
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: DefaultWarehouseOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/stores/:store_id/fskus",
    alias: "list_store_fskus_stores__store_id__fskus_get",
    requestFormat: "json",
    parameters: [
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "query",
        type: "Query",
        schema: platform,
      },
      {
        name: "status",
        type: "Query",
        schema: platform,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: FskuListOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/stores/:store_id/order-sim/cart",
    alias: "get_order_sim_cart_stores__store_id__order_sim_cart_get",
    requestFormat: "json",
    parameters: [
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: OrderSimCartGetOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/stores/:store_id/order-sim/cart",
    alias: "put_order_sim_cart_stores__store_id__order_sim_cart_put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OrderSimCartPutIn,
      },
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: OrderSimCartPutOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/stores/:store_id/order-sim/filled-code-options",
    alias:
      "get_order_sim_filled_code_options_stores__store_id__order_sim_filled_code_options_get",
    requestFormat: "json",
    parameters: [
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: OrderSimFilledCodeOptionsOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stores/:store_id/order-sim/generate-order",
    alias:
      "generate_order_sim_order_stores__store_id__order_sim_generate_order_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OrderSimGenerateOrderIn,
      },
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: OrderSimGenerateOrderOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/stores/:store_id/order-sim/merchant-lines",
    alias:
      "get_order_sim_merchant_lines_stores__store_id__order_sim_merchant_lines_get",
    requestFormat: "json",
    parameters: [
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: OrderSimMerchantLinesGetOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/stores/:store_id/order-sim/merchant-lines",
    alias:
      "put_order_sim_merchant_lines_stores__store_id__order_sim_merchant_lines_put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OrderSimMerchantLinesPutIn,
      },
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: OrderSimMerchantLinesPutOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stores/:store_id/order-sim/preview-order",
    alias:
      "preview_order_sim_order_stores__store_id__order_sim_preview_order_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OrderSimPreviewOrderIn,
      },
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: OrderSimPreviewOrderOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/stores/:store_id/platform-auth",
    alias: "get_store_platform_auth_stores__store_id__platform_auth_get",
    description: `店铺平台授权状态视图：

data:
  - store_id
  - platform
  - shop_id
  - auth_source: &quot;NONE&quot; / &quot;MANUAL&quot; / &quot;OAUTH&quot;
  - expires_at
  - mall_id`,
    requestFormat: "json",
    parameters: [
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: StorePlatformAuthOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/stores/:store_id/routes/provinces",
    alias: "list_province_routes_stores__store_id__routes_provinces_get",
    requestFormat: "json",
    parameters: [
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ProvinceRouteListOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stores/:store_id/routes/provinces",
    alias: "create_province_route_stores__store_id__routes_provinces_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProvinceRouteCreateIn,
      },
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ProvinceRouteWriteOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/stores/:store_id/routes/provinces/:route_id",
    alias:
      "delete_province_route_stores__store_id__routes_provinces__route_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "route_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ProvinceRouteWriteOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/stores/:store_id/routes/provinces/:route_id",
    alias:
      "update_province_route_stores__store_id__routes_provinces__route_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProvinceRouteUpdateIn,
      },
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "route_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ProvinceRouteWriteOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/stores/:store_id/routing/health",
    alias: "routing_health_stores__store_id__routing_health_get",
    requestFormat: "json",
    parameters: [
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: RoutingHealthOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/stores/:store_id/warehouses/:warehouse_id",
    alias: "delete_binding_stores__store_id__warehouses__warehouse_id__delete",
    description: `解除店 ↔ 仓 绑定关系。
权限：config.store.write`,
    requestFormat: "json",
    parameters: [
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: BindingDeleteOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/stores/:store_id/warehouses/:warehouse_id",
    alias: "update_binding_stores__store_id__warehouses__warehouse_id__patch",
    description: `更新绑定关系（is_default / priority / is_top）。
权限：config.store.write

✅ 强约束：当 is_default&#x3D;true 时，必须保证“唯一默认仓”。
实现方式：调用 StoreService.set_default_warehouse（清空同店其它 default，再置当前为 default）。`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BindingUpdateIn,
      },
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: BindingUpdateOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/stores/:store_id/warehouses/bind",
    alias: "bind_store_warehouse_stores__store_id__warehouses_bind_post",
    description: `店 ↔ 仓 绑定（幂等）。
权限：config.store.write

约束：
- 若 is_default&#x3D;true，会保证该店铺“唯一默认仓”
- 若 is_top 为 null，由后端按 is_default 推导（由 StoreService.bind_warehouse 负责）`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BindWarehouseIn,
      },
      {
        name: "store_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: BindWarehouseOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/supplier-contacts/:contact_id",
    alias: "supplier_delete_contact_supplier_contacts__contact_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "contact_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/supplier-contacts/:contact_id",
    alias: "supplier_update_contact_supplier_contacts__contact_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SupplierContactUpdateIn,
      },
      {
        name: "contact_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SupplierContactOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/suppliers",
    alias: "list_suppliers_suppliers_get",
    requestFormat: "json",
    parameters: [
      {
        name: "active",
        type: "Query",
        schema: enabled,
      },
      {
        name: "q",
        type: "Query",
        schema: platform,
      },
    ],
    response: z.array(SupplierOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/suppliers",
    alias: "create_supplier_suppliers_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SupplierCreateIn,
      },
    ],
    response: SupplierOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/suppliers/:supplier_id",
    alias: "update_supplier_suppliers__supplier_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SupplierUpdateIn,
      },
      {
        name: "supplier_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SupplierOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/suppliers/:supplier_id/contacts",
    alias: "supplier_create_contact_suppliers__supplier_id__contacts_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SupplierContactCreateIn,
      },
      {
        name: "supplier_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SupplierContactOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/suppliers/basic",
    alias: "list_suppliers_basic_suppliers_basic_get",
    requestFormat: "json",
    parameters: [
      {
        name: "active",
        type: "Query",
        schema: active,
      },
      {
        name: "q",
        type: "Query",
        schema: platform,
      },
    ],
    response: z.array(SupplierBasicOut),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/surcharges/:surcharge_id",
    alias: "delete_surcharge_surcharges__surcharge_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "surcharge_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/surcharges/:surcharge_id",
    alias: "update_surcharge_surcharges__surcharge_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SurchargeUpdateIn,
      },
      {
        name: "surcharge_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: SurchargeOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/users/",
    alias: "list_users_users__get",
    requestFormat: "json",
    response: z.array(UserOut),
  },
  {
    method: "patch",
    path: "/users/:user_id",
    alias: "update_user_users__user_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserUpdateMulti,
      },
      {
        name: "user_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: UserOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/users/:user_id/reset-password",
    alias: "reset_password_users__user_id__reset_password_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({}).partial().passthrough(),
      },
      {
        name: "user_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/users/change-password",
    alias: "change_password_users_change_password_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PasswordChangeIn,
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/users/login",
    alias: "login_users_login_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserLogin,
      },
    ],
    response: Token,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/users/me",
    alias: "get_me_users_me_get",
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "post",
    path: "/users/register",
    alias: "register_user_users_register_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserCreateMulti,
      },
    ],
    response: UserOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/warehouses",
    alias: "list_warehouses_warehouses_get",
    requestFormat: "json",
    parameters: [
      {
        name: "active",
        type: "Query",
        schema: enabled,
      },
    ],
    response: WarehouseListOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/warehouses",
    alias: "create_warehouse_warehouses_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WarehouseCreateIn,
      },
    ],
    response: WarehouseCreateOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/warehouses/:warehouse_id",
    alias: "get_warehouse_warehouses__warehouse_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: WarehouseDetailOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/warehouses/:warehouse_id",
    alias: "update_warehouse_warehouses__warehouse_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WarehouseUpdateIn,
      },
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: WarehouseUpdateOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/warehouses/:warehouse_id/service-cities",
    alias: "get_service_cities_warehouses__warehouse_id__service_cities_get",
    requestFormat: "json",
    parameters: [
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: WarehouseServiceCitiesOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/warehouses/:warehouse_id/service-cities",
    alias: "put_service_cities_warehouses__warehouse_id__service_cities_put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WarehouseServiceCitiesPutIn,
      },
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: WarehouseServiceCitiesOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/warehouses/:warehouse_id/service-provinces",
    alias:
      "get_service_provinces_warehouses__warehouse_id__service_provinces_get",
    requestFormat: "json",
    parameters: [
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: WarehouseServiceProvincesOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/warehouses/:warehouse_id/service-provinces",
    alias:
      "put_service_provinces_warehouses__warehouse_id__service_provinces_put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WarehouseServiceProvincesPutIn,
      },
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: WarehouseServiceProvincesOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/warehouses/:warehouse_id/shipping-providers",
    alias:
      "list_warehouse_shipping_providers_warehouses__warehouse_id__shipping_providers_get",
    requestFormat: "json",
    parameters: [
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: WarehouseShippingProviderListOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/warehouses/:warehouse_id/shipping-providers",
    alias:
      "bulk_upsert_warehouse_shipping_providers_warehouses__warehouse_id__shipping_providers_put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WarehouseShippingProviderBulkUpsertIn,
      },
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: WarehouseShippingProviderBulkUpsertOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/warehouses/:warehouse_id/shipping-providers/:shipping_provider_id",
    alias:
      "unbind_shipping_provider_from_warehouse_warehouses__warehouse_id__shipping_providers__shipping_provider_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "shipping_provider_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: WarehouseShippingProviderDeleteOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/warehouses/:warehouse_id/shipping-providers/:shipping_provider_id",
    alias:
      "update_warehouse_shipping_provider_warehouses__warehouse_id__shipping_providers__shipping_provider_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WarehouseShippingProviderUpdateIn,
      },
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
      {
        name: "shipping_provider_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: WarehouseShippingProviderUpdateOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/warehouses/:warehouse_id/shipping-providers/bind",
    alias:
      "bind_shipping_provider_to_warehouse_warehouses__warehouse_id__shipping_providers_bind_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WarehouseShippingProviderBindIn,
      },
      {
        name: "warehouse_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: WarehouseShippingProviderBindOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/warehouses/active-carriers/summary",
    alias:
      "list_warehouses_active_carriers_summary_warehouses_active_carriers_summary_get",
    description: `Phase 2.1：后端汇总接口（消除 N+1）

刚性契约口径：
- 只返回正在服务的快递公司：wsp.active &#x3D; true AND sp.active &#x3D; true
- 不做推荐策略，不做 fallback
- 排序仅用于展示稳定：
  warehouse_id ASC, wsp.priority ASC, sp.priority ASC, sp.id ASC`,
    requestFormat: "json",
    response: WarehouseActiveCarriersSummaryOut,
  },
  {
    method: "get",
    path: "/warehouses/service-cities/occupancy",
    alias:
      "get_service_cities_occupancy_warehouses_service_cities_occupancy_get",
    requestFormat: "json",
    response: WarehouseServiceCityOccupancyOut,
  },
  {
    method: "get",
    path: "/warehouses/service-provinces/city-split",
    alias:
      "get_city_split_provinces_warehouses_service_provinces_city_split_get",
    requestFormat: "json",
    response: WarehouseServiceCitySplitProvincesOut,
  },
  {
    method: "put",
    path: "/warehouses/service-provinces/city-split",
    alias:
      "put_city_split_provinces_warehouses_service_provinces_city_split_put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WarehouseServiceCitySplitProvincesPutIn,
      },
    ],
    response: WarehouseServiceCitySplitProvincesOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/warehouses/service-provinces/occupancy",
    alias:
      "get_service_provinces_occupancy_warehouses_service_provinces_occupancy_get",
    requestFormat: "json",
    response: WarehouseServiceProvinceOccupancyOut,
  },
  {
    method: "delete",
    path: "/zone-brackets/:bracket_id",
    alias: "delete_zone_bracket_zone_brackets__bracket_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "bracket_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/zone-brackets/:bracket_id",
    alias: "update_zone_bracket_zone_brackets__bracket_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ZoneBracketUpdateIn,
      },
      {
        name: "bracket_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ZoneBracketOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/zone-members/:member_id",
    alias: "delete_zone_member_zone_members__member_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "member_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/zones/:target_zone_id/brackets:copy",
    alias: "copy_zone_brackets_zones__target_zone_id__brackets_copy_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CopyZoneBracketsIn,
      },
      {
        name: "target_zone_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: CopyZoneBracketsOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/zones/:zone_id",
    alias: "delete_zone_zones__zone_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "zone_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/zones/:zone_id",
    alias: "update_zone_zones__zone_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ZoneUpdateIn,
      },
      {
        name: "zone_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ZoneOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/zones/:zone_id/archive-release-provinces",
    alias:
      "archive_release_zone_provinces_zones__zone_id__archive_release_provinces_post",
    requestFormat: "json",
    parameters: [
      {
        name: "zone_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ZoneOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/zones/:zone_id/brackets",
    alias: "create_zone_bracket_zones__zone_id__brackets_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ZoneBracketCreateIn,
      },
      {
        name: "zone_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ZoneBracketOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/zones/:zone_id/members",
    alias: "create_zone_member_zones__zone_id__members_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ZoneMemberCreateIn,
      },
      {
        name: "zone_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ZoneMemberOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/zones/:zone_id/province-members",
    alias: "replace_zone_province_members_zones__zone_id__province_members_put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ZoneProvinceMembersReplaceIn,
      },
      {
        name: "zone_id",
        type: "Path",
        schema: z.number().int().gte(1),
      },
    ],
    response: ZoneOut,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
