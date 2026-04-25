export type FinanceDateRangeQuery = {
  from_date?: string;
  to_date?: string;
};

export type FinancePlatformShopQuery = FinanceDateRangeQuery & {
  platform?: string;
  shop_id?: string;
};

export type FinanceSkuPurchaseLedgerQuery = FinanceDateRangeQuery & {
  supplier_id?: number;
  warehouse_id?: number;
  item_keyword?: string;
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
  revenue: number;
  avg_order_value: number | null;
  median_order_value: number | null;
};

export type OrderSalesDailyRow = {
  day: string;
  order_count: number;
  revenue: number;
};

export type OrderSalesShopRow = {
  platform: string;
  shop_id: string;
  order_count: number;
  revenue: number;
};

export type OrderSalesItemRow = {
  item_id: number;
  sku_id: string | null;
  title: string | null;
  qty_sold: number;
  revenue: number;
};

export type OrderSalesTopOrderRow = {
  order_id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  order_value: number;
  created_at: string;
};

export type OrderSalesResponse = {
  summary: OrderSalesSummary;
  daily: OrderSalesDailyRow[];
  by_shop: OrderSalesShopRow[];
  by_item: OrderSalesItemRow[];
  top_orders: OrderSalesTopOrderRow[];
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

export type ShippingCostSummary = {
  shipment_count: number;
  estimated_shipping_cost: number;
  billed_shipping_cost: number;
  cost_diff: number;
  adjusted_cost: number;
};

export type ShippingCostDailyRow = {
  day: string;
  shipment_count: number;
  estimated_shipping_cost: number;
  billed_shipping_cost: number;
  cost_diff: number;
  adjusted_cost: number;
};

export type ShippingCostCarrierRow = {
  carrier_code: string;
  shipment_count: number;
  estimated_shipping_cost: number;
  billed_shipping_cost: number;
};

export type ShippingCostShopRow = {
  platform: string;
  shop_id: string;
  shipment_count: number;
  estimated_shipping_cost: number;
  billed_shipping_cost: number;
};

export type ShippingCostResponse = {
  summary: ShippingCostSummary;
  daily: ShippingCostDailyRow[];
  by_carrier: ShippingCostCarrierRow[];
  by_shop: ShippingCostShopRow[];
};
