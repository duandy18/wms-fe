import { useCallback, useEffect, useMemo, useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";
import { fetchFinanceShippingCosts } from "../api/financeApi";
import { FinanceFilters } from "../components/FinanceFilters";
import { FinanceMetricCards } from "../components/FinanceMetricCards";
import type { ShippingCostResponse } from "../contracts/finance";
import {
  formatCurrency,
  formatNumber,
} from "../model/formatters";
import {
  getDefaultDateRange,
  getQuickDateRange,
  type DateRange,
} from "../model/dateRange";

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

export default function FinanceShippingCostPage() {
  const [range, setRange] = useState<DateRange>(() => getDefaultDateRange(30));
  const [platform, setPlatform] = useState("");
  const [shopId, setShopId] = useState("");
  const [data, setData] = useState<ShippingCostResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFinanceShippingCosts({
        ...range,
        platform: platform || undefined,
        shop_id: shopId || undefined,
      });
      setData(res);
    } catch (err: unknown) {
      console.error("load finance shipping costs failed", err);
      setError(errorMessage(err, "加载物流成本失败"));
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
        label: "发货单数",
        value: formatNumber(summary?.shipment_count),
      },
      {
        label: "预估物流成本",
        value: formatCurrency(summary?.estimated_shipping_cost),
      },
      {
        label: "账单物流成本",
        value: formatCurrency(summary?.billed_shipping_cost),
      },
      {
        label: "对账差异 / 调整",
        value: formatCurrency(summary?.cost_diff),
        hint: <>调整金额：<span className="font-mono">{formatCurrency(summary?.adjusted_cost)}</span></>,
      },
    ],
    [summary],
  );

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="财务分析 · 物流成本"
        description="从发货辅助系统读取预估运费、账单运费和对账差异，前端只展示 /finance/shipping-costs read model。"
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
        <h2 className="mb-3 text-sm font-semibold text-slate-800">日度物流成本</h2>
        {(data?.daily ?? []).length === 0 ? (
          <p className="text-xs text-slate-500">当前筛选条件下暂无物流成本数据。</p>
        ) : (
          <div className="overflow-auto rounded-xl border border-slate-100">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">日期</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">发货单数</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">预估成本</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">账单成本</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">差异</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">调整</th>
                </tr>
              </thead>
              <tbody>
                {(data?.daily ?? []).map((row) => (
                  <tr key={row.day} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-[11px]">{row.day}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.shipment_count}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.estimated_shipping_cost)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.billed_shipping_cost)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.cost_diff)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.adjusted_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">承运商成本</h2>
          {(data?.by_carrier ?? []).length === 0 ? (
            <p className="text-xs text-slate-500">暂无承运商物流成本。</p>
          ) : (
            <div className="overflow-auto rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">承运商</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">发货单数</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">预估成本</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">账单成本</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.by_carrier ?? []).map((row) => (
                    <tr key={row.carrier_code} className="border-t border-slate-100">
                      <td className="px-3 py-2">{row.carrier_code || "-"}</td>
                      <td className="px-3 py-2 text-right font-mono">{row.shipment_count}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.estimated_shipping_cost)}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.billed_shipping_cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">店铺物流成本</h2>
          {(data?.by_shop ?? []).length === 0 ? (
            <p className="text-xs text-slate-500">暂无店铺物流成本。</p>
          ) : (
            <div className="overflow-auto rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">平台 / 店铺</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">发货单数</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">预估成本</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">账单成本</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.by_shop ?? []).map((row) => (
                    <tr key={`${row.platform}-${row.shop_id}`} className="border-t border-slate-100">
                      <td className="px-3 py-2">{row.platform} / {row.shop_id}</td>
                      <td className="px-3 py-2 text-right font-mono">{row.shipment_count}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.estimated_shipping_cost)}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.billed_shipping_cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
