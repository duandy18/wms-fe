import { useCallback, useEffect, useMemo, useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";
import { fetchFinanceOrderSales } from "../api/financeApi";
import { FinanceFilters } from "../components/FinanceFilters";
import { FinanceMetricCards } from "../components/FinanceMetricCards";
import type { OrderSalesResponse } from "../contracts/finance";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "../model/formatters";
import {
  getDefaultDateRange,
  getQuickDateRange,
  type DateRange,
} from "../model/dateRange";

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

const formatMaybeCurrency = (value: number | null | undefined) =>
  value == null ? "-" : formatCurrency(value);

const addressText = (
  province: string | null,
  city: string | null,
  district: string | null,
) => [province, city, district].filter(Boolean).join(" / ") || "-";

export default function FinanceOrderSalesPage() {
  const [range, setRange] = useState<DateRange>(() => getDefaultDateRange(30));
  const [platform, setPlatform] = useState("");
  const [storeCode, setStoreCode] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [data, setData] = useState<OrderSalesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFinanceOrderSales({
        ...range,
        platform: platform || undefined,
        store_code: storeCode || undefined,
        order_no: orderNo.trim() || undefined,
        limit: 200,
        offset: 0,
      });
      setData(res);
    } catch (err: unknown) {
      console.error("load finance order sales failed", err);
      setError(errorMessage(err, "加载订单销售失败"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [range, platform, storeCode, orderNo]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = data?.summary;

  const cards = useMemo(
    () => [
      {
        label: "订单数",
        value: formatNumber(summary?.order_count),
      },
      {
        label: "销售行数",
        value: formatNumber(summary?.line_count),
      },
      {
        label: "销售数量",
        value: formatNumber(summary?.qty_sold),
      },
      {
        label: "销售收入",
        value: formatCurrency(summary?.revenue),
      },
      {
        label: "平均客单价",
        value: formatCurrency(summary?.avg_order_value),
      },
      {
        label: "中位客单价",
        value: formatCurrency(summary?.median_order_value),
      },
    ],
    [summary],
  );

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="财务分析 · 订单销售"
        description="按平台、店铺和订单号查询订单销售核算表。一行代表一个销售订单行；销售事实来自后端财务事实表 finance_order_sales_lines。"
      />

      <FinanceFilters
        range={range}
        onRangeChange={(field, value) =>
          setRange((prev) => ({ ...prev, [field]: value }))
        }
        onQuickRange={(days) => setRange(getQuickDateRange(days))}
        onRefresh={() => void load()}
        loading={loading}
        error={error}
        showPlatformStore
        platform={platform}
        storeCode={storeCode}
        onPlatformChange={setPlatform}
        onStoreCodeChange={setStoreCode}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <span>订单号</span>
            <input
              className="w-64 rounded-md border border-slate-300 px-2 py-1 text-xs"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              placeholder="订单号 / 订单引用模糊搜索"
            />
          </label>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className={
              "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white " +
              (loading ? "bg-sky-400 opacity-70" : "bg-sky-600 hover:bg-sky-700")
            }
          >
            {loading ? "加载中…" : "查询"}
          </button>
        </div>
      </section>

      <FinanceMetricCards cards={cards} />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">按日销售趋势</h2>
        {(data?.daily ?? []).length === 0 ? (
          <p className="text-xs text-slate-500">当前筛选条件下暂无销售数据。</p>
        ) : (
          <div className="overflow-auto rounded-xl border border-slate-100">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">日期</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">订单数</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">销售行数</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">销售数量</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">销售收入</th>
                </tr>
              </thead>
              <tbody>
                {(data?.daily ?? []).map((row) => (
                  <tr key={row.day} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-[11px]">{row.day}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.order_count}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.line_count}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.qty_sold}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">店铺销售</h2>
          {(data?.by_store ?? []).length === 0 ? (
            <p className="text-xs text-slate-500">暂无店铺销售数据。</p>
          ) : (
            <div className="overflow-auto rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">平台 / 店铺</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">订单数</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">销售行数</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">销售数量</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">收入</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.by_store ?? []).map((row) => (
                    <tr key={`${row.platform}-${row.store_code}`} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span>{row.store_name || row.platform}</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {row.platform} / {row.store_code}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">{row.order_count}</td>
                      <td className="px-3 py-2 text-right font-mono">{row.line_count}</td>
                      <td className="px-3 py-2 text-right font-mono">{row.qty_sold}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">商品销售 Top</h2>
          {(data?.by_item ?? []).length === 0 ? (
            <p className="text-xs text-slate-500">暂无商品销售数据。</p>
          ) : (
            <div className="overflow-auto rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">商品</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">销量</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">收入</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.by_item ?? []).map((row) => (
                    <tr key={row.item_id} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span>{row.title || `Item #${row.item_id}`}</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            ID: {row.item_id}{row.sku_id ? ` · SKU: ${row.sku_id}` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">{row.qty_sold}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">订单销售核算表</h2>
            <p className="mt-1 text-[11px] text-slate-500">
              一行代表一个销售订单行；订单级收入按后端去重汇总，明细金额按销售行展示。
            </p>
          </div>
          <span className="text-[11px] text-slate-500">
            当前返回：
            <span className="mx-1 font-mono font-semibold text-slate-900">
              {(data?.items ?? []).length}
            </span>
            / 总计
            <span className="ml-1 font-mono font-semibold text-slate-900">
              {formatNumber(data?.total)}
            </span>
          </span>
        </div>

        <div className="overflow-auto rounded-xl border border-slate-100">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">日期</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">平台</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">店铺编码</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">店铺名称</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">订单号</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">商品</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">数量</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">单价</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">优惠</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">销售行金额</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">订单实付</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">收货地区</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">创建时间</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="px-3 py-8 text-center text-xs text-slate-500"
                  >
                    当前筛选条件下暂无订单销售核算数据。
                  </td>
                </tr>
              ) : (
                (data?.items ?? []).map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-[11px]">{row.order_date}</td>
                    <td className="px-3 py-2 font-mono text-[11px]">{row.platform}</td>
                    <td className="px-3 py-2 font-mono text-[11px]">{row.store_code}</td>
                    <td className="px-3 py-2 text-slate-800">{row.store_name || "-"}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-mono text-[11px] text-slate-900">{row.ext_order_no}</span>
                        <span className="font-mono text-[10px] text-slate-500">{row.order_ref}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span>{row.title || `Item #${row.item_id}`}</span>
                        <span className="font-mono text-[10px] text-slate-500">
                          ID: {row.item_id}{row.sku_id ? ` · SKU: ${row.sku_id}` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{row.qty_sold}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatMaybeCurrency(row.unit_price)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatMaybeCurrency(row.discount_amount)}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(row.line_amount)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatMaybeCurrency(row.pay_amount ?? row.order_amount)}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {addressText(row.receiver_province, row.receiver_city, row.receiver_district)}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-600">
                      {formatDateTime(row.order_created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
