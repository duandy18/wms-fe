export type FinanceDateRangeQuery = {
  from_date?: string;
  to_date?: string;
};

export type FinanceStoreQuery = FinanceDateRangeQuery & {
  platform?: string;
  store_code?: string;
};

export type FinanceOrderSalesQuery = FinanceStoreQuery & {
  order_no?: string;
  limit?: number;
  offset?: number;
};

export type FinanceSkuPurchaseLedgerQuery = FinanceDateRangeQuery & {
  supplier_id?: number;
  warehouse_id?: number;
  item_keyword?: string;
};

export type FinanceShippingLedgerQuery = FinanceDateRangeQuery & {
  platform?: string;
  store_code?: string;
  warehouse_id?: number;
  shipping_provider_id?: number;
  order_keyword?: string;
  tracking_no?: string;
};

export type FinanceOverviewSummary = {
  revenue: number;
  purchase_cost: number;
  shipping_cost: number;
  gross_profit: number;
  gross_margin: number | null;
  fulfillment_ratio: number | null;
};

export type FinanceOverviewDailyRow = {
  day: string;
  revenue: number;
  purchase_cost: number;
  shipping_cost: number;
  gross_profit: number;
  gross_margin: number | null;
  fulfillment_ratio: number | null;
};

export type FinanceOverviewResponse = {
  summary: FinanceOverviewSummary;
  daily: FinanceOverviewDailyRow[];
};

export type OrderSalesSummary = {
  order_count: number;
  line_count: number;
  qty_sold: number;
  revenue: number;
  avg_order_value: number | null;
  median_order_value: number | null;
};

export type OrderSalesDailyRow = {
  day: string;
  order_count: number;
  line_count: number;
  qty_sold: number;
  revenue: number;
};

export type OrderSalesStoreRow = {
  platform: string;
  store_code: string;
  store_name: string | null;
  order_count: number;
  line_count: number;
  qty_sold: number;
  revenue: number;
};

export type OrderSalesItemRow = {
  item_id: number;
  sku_id: string | null;
  title: string | null;
  qty_sold: number;
  revenue: number;
};

export type OrderSalesLineRow = {
  id: number;
  order_id: number;
  order_item_id: number;

  platform: string;
  store_id: number;
  store_code: string;
  store_name: string | null;

  ext_order_no: string;
  order_ref: string;
  order_status: string | null;
  order_created_at: string;
  order_date: string;

  receiver_province: string | null;
  receiver_city: string | null;
  receiver_district: string | null;

  item_id: number;
  sku_id: string | null;
  title: string | null;

  qty_sold: number;
  unit_price: number | null;
  discount_amount: number | null;
  line_amount: number;

  order_amount: number | null;
  pay_amount: number | null;
};

export type OrderSalesResponse = {
  summary: OrderSalesSummary;
  daily: OrderSalesDailyRow[];
  by_store: OrderSalesStoreRow[];
  by_item: OrderSalesItemRow[];
  items: OrderSalesLineRow[];
  total: number;
  limit: number;
  offset: number;
};

export type PurchaseCostSummary = {
  purchase_order_count: number;
  supplier_count: number;
  item_count: number;
  purchase_amount: number;
  avg_unit_cost: number | null;
};

export type PurchaseCostDailyRow = {
  day: string;
  purchase_order_count: number;
  purchase_amount: number;
};

export type PurchaseCostSupplierRow = {
  supplier_id: number | null;
  supplier_name: string;
  purchase_order_count: number;
  purchase_amount: number;
  avg_unit_cost: number | null;
};

export type PurchaseCostItemRow = {
  item_id: number;
  item_sku: string | null;
  item_name: string | null;
  total_units: number;
  purchase_amount: number;
  avg_unit_cost: number | null;
};

export type PurchaseCostResponse = {
  summary: PurchaseCostSummary;
  daily: PurchaseCostDailyRow[];
  by_supplier: PurchaseCostSupplierRow[];
  by_item: PurchaseCostItemRow[];
};

export type SkuPurchaseLedgerRow = {
  po_line_id: number;
  po_id: number;
  po_no: string;
  line_no: number;

  item_id: number;
  item_sku: string | null;
  item_name: string | null;
  spec_text: string | null;

  supplier_id: number;
  supplier_name: string;

  warehouse_id: number;
  warehouse_name: string | null;

  purchase_time: string;
  purchase_date: string;

  qty_ordered_input: number;
  purchase_uom_name_snapshot: string;
  purchase_ratio_to_base_snapshot: number;
  qty_ordered_base: number;

  purchase_unit_price: number | null;
  planned_line_amount: number;
  accounting_unit_price: number | null;
};

export type SkuPurchaseLedgerResponse = {
  rows: SkuPurchaseLedgerRow[];
};

export type SkuPurchaseLedgerItemOption = {
  item_id: number;
  item_sku: string | null;
  item_name: string | null;
  spec_text: string | null;
};

export type SkuPurchaseLedgerSupplierOption = {
  supplier_id: number;
  supplier_name: string;
};

export type SkuPurchaseLedgerWarehouseOption = {
  warehouse_id: number;
  warehouse_name: string;
};

export type SkuPurchaseLedgerOptionsResponse = {
  items: SkuPurchaseLedgerItemOption[];
  suppliers: SkuPurchaseLedgerSupplierOption[];
  warehouses: SkuPurchaseLedgerWarehouseOption[];
};

export type ShippingCostLedgerRow = {
  shipping_record_id: number;

  platform: string;
  store_code: string;
  store_name: string | null;

  order_ref: string;
  package_no: number;
  tracking_no: string | null;

  warehouse_id: number;
  warehouse_name: string;

  shipping_provider_id: number;
  shipping_provider_code: string | null;
  shipping_provider_name: string | null;

  shipped_time: string;
  shipped_date: string;

  dest_province: string | null;
  dest_city: string | null;

  gross_weight_kg: number | null;
  freight_estimated: number | null;
  surcharge_estimated: number | null;
  cost_estimated: number | null;
};

export type ShippingCostLedgerResponse = {
  rows: ShippingCostLedgerRow[];
};

export type ShippingCostLedgerStoreOption = {
  platform: string;
  store_code: string;
  store_name: string | null;
};

export type ShippingCostLedgerWarehouseOption = {
  warehouse_id: number;
  warehouse_name: string;
};

export type ShippingCostLedgerProviderOption = {
  shipping_provider_id: number;
  shipping_provider_code: string | null;
  shipping_provider_name: string | null;
};

export type ShippingCostLedgerOptionsResponse = {
  stores: ShippingCostLedgerStoreOption[];
  warehouses: ShippingCostLedgerWarehouseOption[];
  providers: ShippingCostLedgerProviderOption[];
};
