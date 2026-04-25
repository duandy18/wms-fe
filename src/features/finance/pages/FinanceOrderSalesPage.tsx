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

export default function FinanceOrderSalesPage() {
  const [range, setRange] = useState<DateRange>(() => getDefaultDateRange(30));
  const [platform, setPlatform] = useState("");
  const [shopId, setShopId] = useState("");
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
        shop_id: shopId || undefined,
      });
      setData(res);
    } catch (err: unknown) {
      console.error("load finance order sales failed", err);
      setError(errorMessage(err, "加载订单销售失败"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [range, platform, shopId]);

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
        description="只展示订单销售事实：订单数、销售收入、客单价、店铺销售、商品销售与大额订单。"
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
        showPlatformShop
        platform={platform}
        shopId={shopId}
        onPlatformChange={setPlatform}
        onShopIdChange={setShopId}
      />

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
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">销售收入</th>
                </tr>
              </thead>
              <tbody>
                {(data?.daily ?? []).map((row) => (
                  <tr key={row.day} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-[11px]">{row.day}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.order_count}</td>
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
          {(data?.by_shop ?? []).length === 0 ? (
            <p className="text-xs text-slate-500">暂无店铺销售数据。</p>
          ) : (
            <div className="overflow-auto rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">平台 / 店铺</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">订单数</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">收入</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.by_shop ?? []).map((row) => (
                    <tr key={`${row.platform}-${row.shop_id}`} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span>{row.platform}</span>
                          <span className="font-mono text-[10px] text-slate-500">shop: {row.shop_id}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">{row.order_count}</td>
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
        <h2 className="mb-3 text-sm font-semibold text-slate-800">大额订单 Top</h2>
        {(data?.top_orders ?? []).length === 0 ? (
          <p className="text-xs text-slate-500">暂无订单数据。</p>
        ) : (
          <div className="overflow-auto rounded-xl border border-slate-100">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">订单</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">平台 / 店铺</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">金额</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {(data?.top_orders ?? []).map((row) => (
                  <tr key={row.order_id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-mono">#{row.order_id}</span>
                        <span className="font-mono text-[10px] text-slate-500">{row.ext_order_no}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">{row.platform} / {row.shop_id}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.order_value)}</td>
                    <td className="px-3 py-2 text-[11px] text-slate-600">{formatDateTime(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
