// src/features/finance/FinanceSkuPage.tsx
//
// 财务分析 · SKU 毛利榜

import React, { useEffect, useMemo, useState } from "react";
import PageTitle from "../../components/ui/PageTitle";
import {
  fetchFinanceSku,
  type FinanceSkuRow,
} from "./api";

type DateRange = {
  from_date: string;
  to_date: string;
};

type ApiErrorShape = {
  message?: string;
};

function getDefaultRange(): DateRange {
  const today = new Date();
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const to = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(
    today.getDate(),
  )}`;
  const d30 = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
  const from = `${d30.getFullYear()}-${pad2(d30.getMonth() + 1)}-${pad2(
    d30.getDate(),
  )}`;
  return { from_date: from, to_date: to };
}

const formatCurrency = (v: number | string | null | undefined) => {
  let n: number;
  if (typeof v === "number") n = v;
  else if (v == null) n = 0;
  else {
    const parsed = Number(v);
    n = Number.isFinite(parsed) ? parsed : 0;
  }
  if (!Number.isFinite(n)) n = 0;
  return `￥${n.toFixed(2)}`;
};

const formatPercent = (v: number | null | undefined) => {
  if (v == null || !Number.isFinite(v)) return "-";
  return `${(v * 100).toFixed(2)}%`;
};

const FinanceSkuPage: React.FC = () => {
  const [range, setRange] = useState<DateRange>(getDefaultRange);
  const [platform, setPlatform] = useState("");

  const [rows, setRows] = useState<FinanceSkuRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFinanceSku({
        ...range,
        platform: platform || undefined,
      });
      data.sort(
        (a, b) => (b.gross_profit ?? 0) - (a.gross_profit ?? 0),
      );
      setRows(data);
    } catch (err: unknown) {
      console.error("load finance sku failed", err);
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "加载 SKU 毛利榜失败");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    let revenue = 0;
    let purchase = 0;
    let gross = 0;
    let qty = 0;
    for (const r of rows) {
      revenue += r.revenue ?? 0;
      purchase += r.purchase_cost ?? 0;
      gross += r.gross_profit ?? 0;
      qty += r.qty_sold ?? 0;
    }
    const grossMargin = revenue > 0 ? gross / revenue : null;
    const avgPrice = qty > 0 ? revenue / qty : null;
    const avgCost = qty > 0 ? purchase / qty : null;
    return {
      revenue,
      purchase,
      gross,
      qty,
      grossMargin,
      avgPrice,
      avgCost,
    };
  }, [rows]);

  const handleRangeChange = (field: keyof DateRange, value: string) => {
    setRange((prev) => ({ ...prev, [field]: value }));
  };

  const applyQuickRange = (kind: "30d" | "90d") => {
    const today = new Date();
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const to = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(
      today.getDate(),
    )}`;
    const delta = kind === "30d" ? 29 : 89;
    const fromDt = new Date(
      today.getTime() - delta * 24 * 60 * 60 * 1000,
    );
    const from = `${fromDt.getFullYear()}-${pad2(
      fromDt.getMonth() + 1,
    )}-${pad2(fromDt.getDate())}`;
    setRange({ from_date: from, to_date: to });
  };

  const skuCount = rows.length;

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="财务分析 · SKU 毛利榜"
        description="从商品维度查看销量、收入与毛利，帮助识别真正的赚钱 SKU 与需要警惕的亏损 SKU。"
      />

      {/* 过滤区 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3 text-xs text-slate-700">
            <div className="text-xs font-semibold text-slate-800">
              时间范围
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <span>从</span>
                <input
                  type="date"
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={range.from_date}
                  onChange={(e) =>
                    handleRangeChange("from_date", e.target.value)
                  }
                />
              </div>
              <div className="flex items-center gap-1">
                <span>到</span>
                <input
                  type="date"
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={range.to_date}
                  onChange={(e) =>
                    handleRangeChange("to_date", e.target.value)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => applyQuickRange("30d")}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
              >
                最近 30 天
              </button>
              <button
                type="button"
                onClick={() => applyQuickRange("90d")}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
              >
                最近 90 天
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <span>平台</span>
                <input
                  className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  placeholder="如 PDD（可选）"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs">
            <div className="text-[11px] text-slate-500">
              当前统计 SKU 数：
              <span className="font-mono font-semibold text-slate-900">
                {skuCount}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className={
                "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white " +
                (loading
                  ? "bg-sky-400 opacity-70"
                  : "bg-sky-600 hover:bg-sky-700")
              }
            >
              {loading ? "加载中…" : "刷新"}
            </button>
            {error && (
              <div className="max-w-xs rounded-md border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 汇总卡片 */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">总收入</div>
          <div className="mt-1 font-mono text-xl font-semibold text-slate-900">
            {formatCurrency(totals.revenue)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            总销量：{" "}
            <span className="font-mono">{totals.qty}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg白 p-4 shadow-sm">
          <div className="text-xs text-slate-500">采购成本合计</div>
          <div className="mt-1 font-mono text-xl font-semibold text-slate-900">
            {formatCurrency(totals.purchase)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            平均进货价（估算）：{" "}
            <span className="font-mono">
              {totals.avgCost != null
                ? formatCurrency(totals.avgCost)
                : "-"}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg白 p-4 shadow-sm">
          <div className="text-xs text-slate-500">毛利合计</div>
          <div className="mt-1 font-mono text-xl font-semibold text-slate-900">
            {formatCurrency(totals.gross)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            毛利率：{" "}
            <span className="font-mono">
              {formatPercent(totals.grossMargin)}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg白 p-4 shadow-sm">
          <div className="text-xs text-slate-500">平均售价（估算）</div>
          <div className="mt-1 font-mono text-xl font-semibold text-slate-900">
            {totals.avgPrice != null
              ? formatCurrency(totals.avgPrice)
              : "￥0.00"}
          </div>
        </div>
      </section>

      {/* SKU 毛利榜列表 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            SKU 毛利榜（按毛利从高到低）
          </h2>
          <span className="text-[11px] text-slate-500">
            口径：不含运费；采购成本基于采购单的平均进货价粗估。
          </span>
        </div>

        {rows.length === 0 ? (
          <p className="text-xs text-slate-500">
            当前条件下没有 SKU 数据。
          </p>
        ) : (
          <div className="overflow-auto rounded-xl border border-slate-100">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    商品
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">
                    销量
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">
                    收入
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">
                    采购成本
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">
                    毛利
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">
                    毛利率
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.item_id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-slate-800">
                          {r.title || `Item #${r.item_id}`}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          ID: {r.item_id}
                          {r.sku_id ? ` · SKU: ${r.sku_id}` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {r.qty_sold}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(r.revenue)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(r.purchase_cost)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(r.gross_profit)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatPercent(r.gross_margin)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default FinanceSkuPage;
