import { apiGet } from "../../../lib/api";
import type {
  FinanceDateRangeQuery,
  FinanceOrderSalesQuery,
  FinanceOverviewResponse,
  FinanceShippingLedgerQuery,
  FinanceSkuPurchaseLedgerQuery,
  FinanceStoreQuery,
  OrderSalesResponse,
  PurchaseCostResponse,
  ShippingCostLedgerOptionsResponse,
  ShippingCostLedgerResponse,
  SkuPurchaseLedgerOptionsResponse,
  SkuPurchaseLedgerResponse,
} from "../contracts/finance";

type MoneyLike = number | string | null | undefined;

type FinanceQueryParams = Partial<
  FinanceStoreQuery &
    FinanceOrderSalesQuery &
    FinanceSkuPurchaseLedgerQuery &
    FinanceShippingLedgerQuery
>;

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
    line_count: number | string | null;
    qty_sold: number | string | null;
    revenue: MoneyLike;
    avg_order_value: MoneyLike;
    median_order_value: MoneyLike;
  };
  daily: Array<{
    day: string;
    order_count: number | string | null;
    line_count: number | string | null;
    qty_sold: number | string | null;
    revenue: MoneyLike;
  }>;
  by_store: Array<{
    platform: string | null;
    store_code: string | null;
    store_name: string | null;
    order_count: number | string | null;
    line_count: number | string | null;
    qty_sold: number | string | null;
    revenue: MoneyLike;
  }>;
  by_item: Array<{
    item_id: number | string;
    sku_id: string | null;
    title: string | null;
    qty_sold: number | string | null;
    revenue: MoneyLike;
  }>;
  items: Array<{
    id: number | string;
    order_id: number | string;
    order_item_id: number | string;
    platform: string | null;
    store_id: number | string;
    store_code: string | null;
    store_name: string | null;
    ext_order_no: string | null;
    order_ref: string | null;
    order_status: string | null;
    order_created_at: string;
    order_date: string;
    receiver_province: string | null;
    receiver_city: string | null;
    receiver_district: string | null;
    item_id: number | string;
    sku_id: string | null;
    title: string | null;
    qty_sold: number | string | null;
    unit_price: MoneyLike;
    discount_amount: MoneyLike;
    line_amount: MoneyLike;
    order_amount: MoneyLike;
    pay_amount: MoneyLike;
  }>;
  total: number | string | null;
  limit: number | string | null;
  offset: number | string | null;
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

type ShippingCostLedgerResponseRaw = {
  rows: Array<{
    shipping_record_id: number | string;
    platform: string | null;
    store_code: string | null;
    store_name: string | null;
    order_ref: string;
    package_no: number | string;
    tracking_no: string | null;
    warehouse_id: number | string;
    warehouse_name: string;
    shipping_provider_id: number | string;
    shipping_provider_code: string | null;
    shipping_provider_name: string | null;
    shipped_time: string;
    shipped_date: string;
    dest_province: string | null;
    dest_city: string | null;
    gross_weight_kg: MoneyLike;
    freight_estimated: MoneyLike;
    surcharge_estimated: MoneyLike;
    cost_estimated: MoneyLike;
  }>;
};

type ShippingCostLedgerOptionsResponseRaw = {
  stores: Array<{
    platform: string | null;
    store_code: string | null;
    store_name: string | null;
  }>;
  warehouses: Array<{
    warehouse_id: number | string;
    warehouse_name: string;
  }>;
  providers: Array<{
    shipping_provider_id: number | string;
    shipping_provider_code: string | null;
    shipping_provider_name: string | null;
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

const toStringValue = (value: unknown): string => String(value ?? "");

const buildQuery = (params: FinanceQueryParams): string => {
  const qs = new URLSearchParams();

  if (params.from_date) qs.set("from_date", params.from_date);
  if (params.to_date) qs.set("to_date", params.to_date);
  if (params.platform) qs.set("platform", params.platform);
  if (params.store_code) qs.set("store_code", params.store_code);

  if (typeof params.supplier_id === "number") {
    qs.set("supplier_id", String(params.supplier_id));
  }
  if (typeof params.warehouse_id === "number") {
    qs.set("warehouse_id", String(params.warehouse_id));
  }
  if (typeof params.shipping_provider_id === "number") {
    qs.set("shipping_provider_id", String(params.shipping_provider_id));
  }
  if (typeof params.limit === "number") {
    qs.set("limit", String(params.limit));
  }
  if (typeof params.offset === "number") {
    qs.set("offset", String(params.offset));
  }

  if (params.item_keyword) qs.set("item_keyword", params.item_keyword);
  if (params.order_keyword) qs.set("order_keyword", params.order_keyword);
  if (params.order_no) qs.set("order_no", params.order_no);
  if (params.tracking_no) qs.set("tracking_no", params.tracking_no);

  const query = qs.toString();
  return query ? `?${query}` : "";
};

export async function fetchFinanceOverview(
  params: FinanceStoreQuery,
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
  params: FinanceOrderSalesQuery,
): Promise<OrderSalesResponse> {
  const raw = await apiGet<OrderSalesResponseRaw>(
    `/finance/order-sales${buildQuery(params)}`,
  );

  return {
    summary: {
      order_count: toNumber(raw.summary.order_count),
      line_count: toNumber(raw.summary.line_count),
      qty_sold: toNumber(raw.summary.qty_sold),
      revenue: toNumber(raw.summary.revenue),
      avg_order_value: toNumberOrNull(raw.summary.avg_order_value),
      median_order_value: toNumberOrNull(raw.summary.median_order_value),
    },
    daily: raw.daily.map((row) => ({
      day: row.day,
      order_count: toNumber(row.order_count),
      line_count: toNumber(row.line_count),
      qty_sold: toNumber(row.qty_sold),
      revenue: toNumber(row.revenue),
    })),
    by_store: raw.by_store.map((row) => ({
      platform: toStringValue(row.platform),
      store_code: toStringValue(row.store_code),
      store_name: row.store_name,
      order_count: toNumber(row.order_count),
      line_count: toNumber(row.line_count),
      qty_sold: toNumber(row.qty_sold),
      revenue: toNumber(row.revenue),
    })),
    by_item: raw.by_item.map((row) => ({
      item_id: toNumber(row.item_id),
      sku_id: row.sku_id,
      title: row.title,
      qty_sold: toNumber(row.qty_sold),
      revenue: toNumber(row.revenue),
    })),
    items: raw.items.map((row) => ({
      id: toNumber(row.id),
      order_id: toNumber(row.order_id),
      order_item_id: toNumber(row.order_item_id),
      platform: toStringValue(row.platform),
      store_id: toNumber(row.store_id),
      store_code: toStringValue(row.store_code),
      store_name: row.store_name,
      ext_order_no: toStringValue(row.ext_order_no),
      order_ref: toStringValue(row.order_ref),
      order_status: row.order_status,
      order_created_at: row.order_created_at,
      order_date: row.order_date,
      receiver_province: row.receiver_province,
      receiver_city: row.receiver_city,
      receiver_district: row.receiver_district,
      item_id: toNumber(row.item_id),
      sku_id: row.sku_id,
      title: row.title,
      qty_sold: toNumber(row.qty_sold),
      unit_price: toNumberOrNull(row.unit_price),
      discount_amount: toNumberOrNull(row.discount_amount),
      line_amount: toNumber(row.line_amount),
      order_amount: toNumberOrNull(row.order_amount),
      pay_amount: toNumberOrNull(row.pay_amount),
    })),
    total: toNumber(raw.total),
    limit: toNumber(raw.limit),
    offset: toNumber(raw.offset),
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

export async function fetchFinanceShippingLedger(
  params: FinanceShippingLedgerQuery,
): Promise<ShippingCostLedgerResponse> {
  const raw = await apiGet<ShippingCostLedgerResponseRaw>(
    `/finance/shipping-costs/shipping-ledger${buildQuery(params)}`,
  );

  return {
    rows: raw.rows.map((row) => ({
      shipping_record_id: toNumber(row.shipping_record_id),
      platform: toStringValue(row.platform),
      store_code: toStringValue(row.store_code),
      store_name: row.store_name,
      order_ref: row.order_ref,
      package_no: toNumber(row.package_no),
      tracking_no: row.tracking_no,
      warehouse_id: toNumber(row.warehouse_id),
      warehouse_name: row.warehouse_name,
      shipping_provider_id: toNumber(row.shipping_provider_id),
      shipping_provider_code: row.shipping_provider_code,
      shipping_provider_name: row.shipping_provider_name,
      shipped_time: row.shipped_time,
      shipped_date: row.shipped_date,
      dest_province: row.dest_province,
      dest_city: row.dest_city,
      gross_weight_kg: toNumberOrNull(row.gross_weight_kg),
      freight_estimated: toNumberOrNull(row.freight_estimated),
      surcharge_estimated: toNumberOrNull(row.surcharge_estimated),
      cost_estimated: toNumberOrNull(row.cost_estimated),
    })),
  };
}

export async function fetchFinanceShippingLedgerOptions(
  params: FinanceShippingLedgerQuery = {},
): Promise<ShippingCostLedgerOptionsResponse> {
  const raw = await apiGet<ShippingCostLedgerOptionsResponseRaw>(
    `/finance/shipping-costs/shipping-ledger/options${buildQuery(params)}`,
  );

  return {
    stores: raw.stores.map((store) => ({
      platform: toStringValue(store.platform),
      store_code: toStringValue(store.store_code),
      store_name: store.store_name,
    })),
    warehouses: raw.warehouses.map((warehouse) => ({
      warehouse_id: toNumber(warehouse.warehouse_id),
      warehouse_name: warehouse.warehouse_name,
    })),
    providers: raw.providers.map((provider) => ({
      shipping_provider_id: toNumber(provider.shipping_provider_id),
      shipping_provider_code: provider.shipping_provider_code,
      shipping_provider_name: provider.shipping_provider_name,
    })),
  };
}
