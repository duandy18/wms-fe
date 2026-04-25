import { useCallback, useEffect, useMemo, useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";
import { fetchFinanceOverview } from "../api/financeApi";
import { FinanceFilters } from "../components/FinanceFilters";
import { FinanceMetricCards } from "../components/FinanceMetricCards";
import type { FinanceOverviewResponse } from "../contracts/finance";
import {
  formatCurrency,
  formatPercent,
} from "../model/formatters";
import {
  getDefaultDateRange,
  getQuickDateRange,
  type DateRange,
} from "../model/dateRange";

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

export default function FinanceOverviewPage() {
  const [range, setRange] = useState<DateRange>(() => getDefaultDateRange(30));
  const [platform, setPlatform] = useState("");
  const [shopId, setShopId] = useState("");
  const [data, setData] = useState<FinanceOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFinanceOverview({
        ...range,
        platform: platform || undefined,
        shop_id: shopId || undefined,
      });
      setData(res);
    } catch (err: unknown) {
      console.error("load finance overview failed", err);
      setError(errorMessage(err, "加载综合分析失败"));
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
        label: "销售收入",
        value: formatCurrency(summary?.revenue),
        hint: "来自订单销售事实",
      },
      {
        label: "采购成本",
        value: formatCurrency(summary?.purchase_cost),
        hint: "当前为采购计划成本口径",
      },
      {
        label: "物流成本",
        value: formatCurrency(summary?.shipping_cost),
        hint: "当前以发货预估成本进入综合分析",
      },
      {
        label: "毛利 / 毛利率",
        value: formatCurrency(summary?.gross_profit),
        hint: (
          <>
            毛利率：
            <span className="font-mono">{formatPercent(summary?.gross_margin)}</span>
            {" · "}
            物流占比：
            <span className="font-mono">
              {formatPercent(summary?.fulfillment_ratio)}
            </span>
          </>
        ),
      },
    ],
    [summary],
  );

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="财务分析 · 综合分析"
        description="统一查看销售收入、采购成本、物流成本、毛利与毛利率。前端只消费 /finance/overview 后端 read model，不跨模块拼接。"
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
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">日度综合明细</h2>
          <span className="text-[11px] text-slate-500">
            收入、成本、毛利均由后端统一聚合返回。
          </span>
        </div>

        {(data?.daily ?? []).length === 0 ? (
          <p className="text-xs text-slate-500">当前筛选条件下暂无可统计数据。</p>
        ) : (
          <div className="overflow-auto rounded-xl border border-slate-100">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">日期</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">收入</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">采购成本</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">物流成本</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">毛利</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">毛利率</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">物流占比</th>
                </tr>
              </thead>
              <tbody>
                {(data?.daily ?? []).map((row) => (
                  <tr key={row.day} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{row.day}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.revenue)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.purchase_cost)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.shipping_cost)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.gross_profit)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatPercent(row.gross_margin)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatPercent(row.fulfillment_ratio)}</td>
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
