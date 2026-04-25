import { apiGet } from "../../../lib/api";
import type {
  FinanceDateRangeQuery,
  FinanceOverviewResponse,
  FinancePlatformShopQuery,
  FinanceSkuPurchaseLedgerQuery,
  OrderSalesResponse,
  PurchaseCostResponse,
  ShippingCostResponse,
  SkuPurchaseLedgerOptionsResponse,
  SkuPurchaseLedgerResponse,
} from "../contracts/finance";

type MoneyLike = number | string | null | undefined;

type FinanceQueryParams = FinancePlatformShopQuery &
  FinanceSkuPurchaseLedgerQuery;

type FinanceOverviewSummaryRaw = {
  revenue: MoneyLike;
  purchase_cost: MoneyLike;
  shipping_cost: MoneyLike;
  gross_profit: MoneyLike;
  gross_margin: MoneyLike;
  fulfillment_ratio: MoneyLike;
};

type FinanceOverviewDailyRowRaw = FinanceOverviewSummaryRaw & {
  day: string;
};

type FinanceOverviewResponseRaw = {
  summary: FinanceOverviewSummaryRaw;
  daily: FinanceOverviewDailyRowRaw[];
};

type OrderSalesResponseRaw = {
  summary: {
    order_count: number | string | null;
    revenue: MoneyLike;
    avg_order_value: MoneyLike;
    median_order_value: MoneyLike;
  };
  daily: Array<{
    day: string;
    order_count: number | string | null;
    revenue: MoneyLike;
  }>;
  by_shop: Array<{
    platform: string | null;
    shop_id: string | null;
    order_count: number | string | null;
    revenue: MoneyLike;
  }>;
  by_item: Array<{
    item_id: number | string;
    sku_id: string | null;
    title: string | null;
    qty_sold: number | string | null;
    revenue: MoneyLike;
  }>;
  top_orders: Array<{
    order_id: number | string;
    platform: string | null;
    shop_id: string | null;
    ext_order_no: string | null;
    order_value: MoneyLike;
    created_at: string;
  }>;
};

type PurchaseCostResponseRaw = {
  summary: {
    purchase_order_count: number | string | null;
    supplier_count: number | string | null;
    item_count: number | string | null;
    purchase_amount: MoneyLike;
    avg_unit_cost: MoneyLike;
  };
  daily: Array<{
    day: string;
    purchase_order_count: number | string | null;
    purchase_amount: MoneyLike;
  }>;
  by_supplier: Array<{
    supplier_id: number | string | null;
    supplier_name: string | null;
    purchase_order_count: number | string | null;
    purchase_amount: MoneyLike;
    avg_unit_cost: MoneyLike;
  }>;
  by_item: Array<{
    item_id: number | string;
    item_sku: string | null;
    item_name: string | null;
    total_units: number | string | null;
    purchase_amount: MoneyLike;
    avg_unit_cost: MoneyLike;
  }>;
};

type SkuPurchaseLedgerResponseRaw = {
  rows: Array<{
    po_line_id: number | string;
    po_id: number | string;
    po_no: string;
    line_no: number | string;
    item_id: number | string;
    item_sku: string | null;
    item_name: string | null;
    spec_text: string | null;
    supplier_id: number | string;
    supplier_name: string;
    warehouse_id: number | string;
    warehouse_name: string | null;
    purchase_time: string;
    purchase_date: string;
    qty_ordered_input: number | string | null;
    purchase_uom_name_snapshot: string;
    purchase_ratio_to_base_snapshot: number | string | null;
    qty_ordered_base: number | string | null;
    purchase_unit_price: MoneyLike;
    planned_line_amount: MoneyLike;
    accounting_unit_price: MoneyLike;
  }>;
};

type SkuPurchaseLedgerOptionsResponseRaw = {
  items: Array<{
    item_id: number | string;
    item_sku: string | null;
    item_name: string | null;
    spec_text: string | null;
  }>;
  suppliers: Array<{
    supplier_id: number | string;
    supplier_name: string;
  }>;
  warehouses: Array<{
    warehouse_id: number | string;
    warehouse_name: string;
  }>;
};

type ShippingCostResponseRaw = {
  summary: {
    shipment_count: number | string | null;
    estimated_shipping_cost: MoneyLike;
    billed_shipping_cost: MoneyLike;
    cost_diff: MoneyLike;
    adjusted_cost: MoneyLike;
  };
  daily: Array<{
    day: string;
    shipment_count: number | string | null;
    estimated_shipping_cost: MoneyLike;
    billed_shipping_cost: MoneyLike;
    cost_diff: MoneyLike;
    adjusted_cost: MoneyLike;
  }>;
  by_carrier: Array<{
    carrier_code: string | null;
    shipment_count: number | string | null;
    estimated_shipping_cost: MoneyLike;
    billed_shipping_cost: MoneyLike;
  }>;
  by_shop: Array<{
    platform: string | null;
    shop_id: string | null;
    shipment_count: number | string | null;
    estimated_shipping_cost: MoneyLike;
    billed_shipping_cost: MoneyLike;
  }>;
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value == null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toNumberOrNull = (value: unknown): number | null => {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toStringValue = (value: string | null | undefined): string =>
  String(value ?? "");

const buildQuery = (params: FinanceQueryParams): string => {
  const qs = new URLSearchParams();
  if (params.from_date) qs.set("from_date", params.from_date);
  if (params.to_date) qs.set("to_date", params.to_date);
  if (params.platform) qs.set("platform", params.platform);
  if (params.shop_id) qs.set("shop_id", params.shop_id);
  if (typeof params.supplier_id === "number") {
    qs.set("supplier_id", String(params.supplier_id));
  }
  if (typeof params.warehouse_id === "number") {
    qs.set("warehouse_id", String(params.warehouse_id));
  }
  if (params.item_keyword) qs.set("item_keyword", params.item_keyword);
  const query = qs.toString();
  return query ? `?${query}` : "";
};

export async function fetchFinanceOverview(
  params: FinancePlatformShopQuery,
): Promise<FinanceOverviewResponse> {
  const raw = await apiGet<FinanceOverviewResponseRaw>(
    `/finance/overview${buildQuery(params)}`,
  );

  return {
    summary: {
      revenue: toNumber(raw.summary.revenue),
      purchase_cost: toNumber(raw.summary.purchase_cost),
      shipping_cost: toNumber(raw.summary.shipping_cost),
      gross_profit: toNumber(raw.summary.gross_profit),
      gross_margin: toNumberOrNull(raw.summary.gross_margin),
      fulfillment_ratio: toNumberOrNull(raw.summary.fulfillment_ratio),
    },
    daily: raw.daily.map((row) => ({
      day: row.day,
      revenue: toNumber(row.revenue),
      purchase_cost: toNumber(row.purchase_cost),
      shipping_cost: toNumber(row.shipping_cost),
      gross_profit: toNumber(row.gross_profit),
      gross_margin: toNumberOrNull(row.gross_margin),
      fulfillment_ratio: toNumberOrNull(row.fulfillment_ratio),
    })),
  };
}

export async function fetchFinanceOrderSales(
  params: FinancePlatformShopQuery,
): Promise<OrderSalesResponse> {
  const raw = await apiGet<OrderSalesResponseRaw>(
    `/finance/order-sales${buildQuery(params)}`,
  );

  return {
    summary: {
      order_count: toNumber(raw.summary.order_count),
      revenue: toNumber(raw.summary.revenue),
      avg_order_value: toNumberOrNull(raw.summary.avg_order_value),
      median_order_value: toNumberOrNull(raw.summary.median_order_value),
    },
    daily: raw.daily.map((row) => ({
      day: row.day,
      order_count: toNumber(row.order_count),
      revenue: toNumber(row.revenue),
    })),
    by_shop: raw.by_shop.map((row) => ({
      platform: toStringValue(row.platform),
      shop_id: toStringValue(row.shop_id),
      order_count: toNumber(row.order_count),
      revenue: toNumber(row.revenue),
    })),
    by_item: raw.by_item.map((row) => ({
      item_id: toNumber(row.item_id),
      sku_id: row.sku_id,
      title: row.title,
      qty_sold: toNumber(row.qty_sold),
      revenue: toNumber(row.revenue),
    })),
    top_orders: raw.top_orders.map((row) => ({
      order_id: toNumber(row.order_id),
      platform: toStringValue(row.platform),
      shop_id: toStringValue(row.shop_id),
      ext_order_no: toStringValue(row.ext_order_no),
      order_value: toNumber(row.order_value),
      created_at: row.created_at,
    })),
  };
}

export async function fetchFinancePurchaseCosts(
  params: FinanceDateRangeQuery,
): Promise<PurchaseCostResponse> {
  const raw = await apiGet<PurchaseCostResponseRaw>(
    `/finance/purchase-costs${buildQuery(params)}`,
  );

  return {
    summary: {
      purchase_order_count: toNumber(raw.summary.purchase_order_count),
      supplier_count: toNumber(raw.summary.supplier_count),
      item_count: toNumber(raw.summary.item_count),
      purchase_amount: toNumber(raw.summary.purchase_amount),
      avg_unit_cost: toNumberOrNull(raw.summary.avg_unit_cost),
    },
    daily: raw.daily.map((row) => ({
      day: row.day,
      purchase_order_count: toNumber(row.purchase_order_count),
      purchase_amount: toNumber(row.purchase_amount),
    })),
    by_supplier: raw.by_supplier.map((row) => ({
      supplier_id: row.supplier_id == null ? null : toNumber(row.supplier_id),
      supplier_name: toStringValue(row.supplier_name),
      purchase_order_count: toNumber(row.purchase_order_count),
      purchase_amount: toNumber(row.purchase_amount),
      avg_unit_cost: toNumberOrNull(row.avg_unit_cost),
    })),
    by_item: raw.by_item.map((row) => ({
      item_id: toNumber(row.item_id),
      item_sku: row.item_sku,
      item_name: row.item_name,
      total_units: toNumber(row.total_units),
      purchase_amount: toNumber(row.purchase_amount),
      avg_unit_cost: toNumberOrNull(row.avg_unit_cost),
    })),
  };
}

export async function fetchFinanceSkuPurchaseLedger(
  params: FinanceSkuPurchaseLedgerQuery,
): Promise<SkuPurchaseLedgerResponse> {
  const raw = await apiGet<SkuPurchaseLedgerResponseRaw>(
    `/finance/purchase-costs/sku-purchase-ledger${buildQuery(params)}`,
  );

  return {
    rows: raw.rows.map((row) => ({
      po_line_id: toNumber(row.po_line_id),
      po_id: toNumber(row.po_id),
      po_no: row.po_no,
      line_no: toNumber(row.line_no),
      item_id: toNumber(row.item_id),
      item_sku: row.item_sku,
      item_name: row.item_name,
      spec_text: row.spec_text,
      supplier_id: toNumber(row.supplier_id),
      supplier_name: row.supplier_name,
      warehouse_id: toNumber(row.warehouse_id),
      warehouse_name: row.warehouse_name,
      purchase_time: row.purchase_time,
      purchase_date: row.purchase_date,
      qty_ordered_input: toNumber(row.qty_ordered_input),
      purchase_uom_name_snapshot: row.purchase_uom_name_snapshot,
      purchase_ratio_to_base_snapshot: toNumber(
        row.purchase_ratio_to_base_snapshot,
      ),
      qty_ordered_base: toNumber(row.qty_ordered_base),
      purchase_unit_price: toNumberOrNull(row.purchase_unit_price),
      planned_line_amount: toNumber(row.planned_line_amount),
      accounting_unit_price: toNumberOrNull(row.accounting_unit_price),
    })),
  };
}

export async function fetchFinanceSkuPurchaseLedgerOptions(): Promise<SkuPurchaseLedgerOptionsResponse> {
  const raw = await apiGet<SkuPurchaseLedgerOptionsResponseRaw>(
    "/finance/purchase-costs/sku-purchase-ledger/options",
  );

  return {
    items: raw.items.map((item) => ({
      item_id: toNumber(item.item_id),
      item_sku: item.item_sku,
      item_name: item.item_name,
      spec_text: item.spec_text,
    })),
    suppliers: raw.suppliers.map((supplier) => ({
      supplier_id: toNumber(supplier.supplier_id),
      supplier_name: supplier.supplier_name,
    })),
    warehouses: raw.warehouses.map((warehouse) => ({
      warehouse_id: toNumber(warehouse.warehouse_id),
      warehouse_name: warehouse.warehouse_name,
    })),
  };
}

export async function fetchFinanceShippingCosts(
  params: FinancePlatformShopQuery,
): Promise<ShippingCostResponse> {
  const raw = await apiGet<ShippingCostResponseRaw>(
    `/finance/shipping-costs${buildQuery(params)}`,
  );

  return {
    summary: {
      shipment_count: toNumber(raw.summary.shipment_count),
      estimated_shipping_cost: toNumber(raw.summary.estimated_shipping_cost),
      billed_shipping_cost: toNumber(raw.summary.billed_shipping_cost),
      cost_diff: toNumber(raw.summary.cost_diff),
      adjusted_cost: toNumber(raw.summary.adjusted_cost),
    },
    daily: raw.daily.map((row) => ({
      day: row.day,
      shipment_count: toNumber(row.shipment_count),
      estimated_shipping_cost: toNumber(row.estimated_shipping_cost),
      billed_shipping_cost: toNumber(row.billed_shipping_cost),
      cost_diff: toNumber(row.cost_diff),
      adjusted_cost: toNumber(row.adjusted_cost),
    })),
    by_carrier: raw.by_carrier.map((row) => ({
      carrier_code: toStringValue(row.carrier_code),
      shipment_count: toNumber(row.shipment_count),
      estimated_shipping_cost: toNumber(row.estimated_shipping_cost),
      billed_shipping_cost: toNumber(row.billed_shipping_cost),
    })),
    by_shop: raw.by_shop.map((row) => ({
      platform: toStringValue(row.platform),
      shop_id: toStringValue(row.shop_id),
      shipment_count: toNumber(row.shipment_count),
      estimated_shipping_cost: toNumber(row.estimated_shipping_cost),
      billed_shipping_cost: toNumber(row.billed_shipping_cost),
    })),
  };
}
