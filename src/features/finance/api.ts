// src/features/finance/api.ts
//
// 财务分析相关 API：
// - /finance/overview/daily   → 日度收入 / 成本 / 毛利趋势
// - /finance/shop             → 店铺盈利能力
// - /finance/sku              → SKU 毛利榜
// - /finance/order-unit       → 客单价 / 贡献度分析
//

import { apiGet } from "../../lib/api";

/* ======================== 公共工具 ======================== */

const toNum = (v: unknown): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toNumOrNull = (v: unknown): number | null => {
  if (v == null) return null;
  const n = toNum(v);
  return Number.isFinite(n) ? n : null;
};

/* ======================== 日度总览 ======================== */

export interface FinanceDailyRow {
  day: string; // YYYY-MM-DD
  revenue: number;
  purchase_cost: number;
  shipping_cost: number;
  gross_profit: number;
  gross_margin: number | null;
  fulfillment_ratio: number | null;
}

interface FinanceDailyRowRaw {
  day: string;
  revenue: number | string | null;
  purchase_cost: number | string | null;
  shipping_cost: number | string | null;
  gross_profit: number | string | null;
  gross_margin: number | string | null;
  fulfillment_ratio: number | string | null;
}

export interface FinanceDailyQuery {
  from_date?: string;
  to_date?: string;
}

/** 日度收入 / 成本 / 毛利趋势 */
export async function fetchFinanceDaily(
  params: FinanceDailyQuery,
): Promise<FinanceDailyRow[]> {
  const qs = new URLSearchParams();
  if (params.from_date) qs.set("from_date", params.from_date);
  if (params.to_date) qs.set("to_date", params.to_date);
  const query = qs.toString();
  const path = query
    ? `/finance/overview/daily?${query}`
    : "/finance/overview/daily";

  const raw = await apiGet<FinanceDailyRowRaw[]>(path);

  return raw.map((r) => ({
    day: r.day,
    revenue: toNum(r.revenue),
    purchase_cost: toNum(r.purchase_cost),
    shipping_cost: toNum(r.shipping_cost),
    gross_profit: toNum(r.gross_profit),
    gross_margin: toNumOrNull(r.gross_margin),
    fulfillment_ratio: toNumOrNull(r.fulfillment_ratio),
  }));
}

/* ======================== 店铺盈利 ======================== */

export interface FinanceShopRow {
  platform: string;
  shop_id: string;
  revenue: number;
  purchase_cost: number;
  shipping_cost: number;
  gross_profit: number;
  gross_margin: number | null;
  fulfillment_ratio: number | null;
}

interface FinanceShopRowRaw {
  platform: string;
  shop_id: string;
  revenue: number | string | null;
  purchase_cost: number | string | null;
  shipping_cost: number | string | null;
  gross_profit: number | string | null;
  gross_margin: number | string | null;
  fulfillment_ratio: number | string | null;
}

export interface FinanceShopQuery {
  from_date?: string;
  to_date?: string;
  platform?: string;
  shop_id?: string;
}

/** 店铺盈利能力 */
export async function fetchFinanceShop(
  params: FinanceShopQuery,
): Promise<FinanceShopRow[]> {
  const qs = new URLSearchParams();
  if (params.from_date) qs.set("from_date", params.from_date);
  if (params.to_date) qs.set("to_date", params.to_date);
  if (params.platform) qs.set("platform", params.platform);
  if (params.shop_id) qs.set("shop_id", params.shop_id);
  const query = qs.toString();
  const path = query ? `/finance/shop?${query}` : "/finance/shop";

  const raw = await apiGet<FinanceShopRowRaw[]>(path);

  return raw.map((r) => ({
    platform: r.platform,
    shop_id: r.shop_id,
    revenue: toNum(r.revenue),
    purchase_cost: toNum(r.purchase_cost),
    shipping_cost: toNum(r.shipping_cost),
    gross_profit: toNum(r.gross_profit),
    gross_margin: toNumOrNull(r.gross_margin),
    fulfillment_ratio: toNumOrNull(r.fulfillment_ratio),
  }));
}

/* ======================== SKU 毛利榜 ======================== */

export interface FinanceSkuRow {
  item_id: number;
  sku_id: string | null;
  title: string | null;
  qty_sold: number;
  revenue: number;
  purchase_cost: number;
  gross_profit: number;
  gross_margin: number | null;
}

interface FinanceSkuRowRaw {
  item_id: number;
  sku_id: string | null;
  title: string | null;
  qty_sold: number | string | null;
  revenue: number | string | null;
  purchase_cost: number | string | null;
  gross_profit?: number | string | null;
  gross_margin?: number | string | null;
}

export interface FinanceSkuQuery {
  from_date?: string;
  to_date?: string;
  platform?: string;
}

/** SKU 毛利榜（不含运费） */
export async function fetchFinanceSku(
  params: FinanceSkuQuery,
): Promise<FinanceSkuRow[]> {
  const qs = new URLSearchParams();
  if (params.from_date) qs.set("from_date", params.from_date);
  if (params.to_date) qs.set("to_date", params.to_date);
  if (params.platform) qs.set("platform", params.platform);
  const query = qs.toString();
  const path = query ? `/finance/sku?${query}` : "/finance/sku";

  const raw = await apiGet<FinanceSkuRowRaw[]>(path);

  return raw.map((r) => {
    const revenue = toNum(r.revenue);
    const purchase = toNum(r.purchase_cost);
    const gross = revenue - purchase;
    const margin =
      revenue > 0 ? gross / revenue : null;
    return {
      item_id: r.item_id,
      sku_id: r.sku_id,
      title: r.title,
      qty_sold: toNum(r.qty_sold),
      revenue,
      purchase_cost: purchase,
      gross_profit: gross,
      gross_margin: margin,
    };
  });
}

/* ======================== 客单价 / 贡献度 ======================== */

export interface OrderUnitSummary {
  order_count: number;
  revenue: number;
  avg_order_value: number | null;
  median_order_value: number | null;
}

export interface OrderUnitContributionPoint {
  percent_orders: number;   // 0~1
  percent_revenue: number;  // 0~1
}

export interface OrderUnitRow {
  order_id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  order_value: number;
  created_at: string;
}

export interface OrderUnitResponse {
  summary: OrderUnitSummary;
  contribution_curve: OrderUnitContributionPoint[];
  top_orders: OrderUnitRow[];
}

export interface FinanceOrderUnitQuery {
  from_date?: string;
  to_date?: string;
  platform?: string;
  shop_id?: string;
}

/** 客单价 & 贡献度分析（按订单维度） */
export async function fetchFinanceOrderUnit(
  params: FinanceOrderUnitQuery,
): Promise<OrderUnitResponse> {
  const qs = new URLSearchParams();
  if (params.from_date) qs.set("from_date", params.from_date);
  if (params.to_date) qs.set("to_date", params.to_date);
  if (params.platform) qs.set("platform", params.platform);
  if (params.shop_id) qs.set("shop_id", params.shop_id);
  const query = qs.toString();
  const path = query
    ? `/finance/order-unit?${query}`
    : "/finance/order-unit";

  const raw = await apiGet<any>(path);

  const summaryRaw = raw.summary ?? {};
  const summary: OrderUnitSummary = {
    order_count: summaryRaw.order_count ?? 0,
    revenue: toNum(summaryRaw.revenue),
    avg_order_value:
      summaryRaw.avg_order_value != null
        ? toNum(summaryRaw.avg_order_value)
        : null,
    median_order_value:
      summaryRaw.median_order_value != null
        ? toNum(summaryRaw.median_order_value)
        : null,
  };

  const curve: OrderUnitContributionPoint[] = (raw.contribution_curve ?? []).map(
    (p: any) => ({
      percent_orders: Number(p.percent_orders ?? 0),
      percent_revenue: Number(p.percent_revenue ?? 0),
    }),
  );

  const top_orders: OrderUnitRow[] = (raw.top_orders ?? []).map((o: any) => ({
    order_id: o.order_id,
    platform: o.platform,
    shop_id: o.shop_id,
    ext_order_no: o.ext_order_no,
    order_value: toNum(o.order_value),
    created_at: o.created_at,
  }));

  return {
    summary,
    contribution_curve: curve,
    top_orders,
  };
}
