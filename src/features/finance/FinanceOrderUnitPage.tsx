// src/features/finance/FinanceOrderUnitPage.tsx
//
// 财务分析 · 客单价 & 贡献度分析

import React, { useEffect, useState } from "react";
import PageTitle from "../../components/ui/PageTitle";
import {
  fetchFinanceOrderUnit,
  type FinanceOrderUnitQuery,
  type OrderUnitResponse,
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

const formatCurrency = (v: number | null | undefined) => {
  const n = typeof v === "number" ? v : 0;
  return `￥${n.toFixed(2)}`;
};

const formatPercent = (v: number | null | undefined) => {
  if (v == null || !Number.isFinite(v)) return "-";
  return `${(v * 100).toFixed(1)}%`;
};

const formatDateTime = (s: string | null | undefined) =>
  s ? s.replace("T", " ").replace("Z", "") : "-";

const FinanceOrderUnitPage: React.FC = () => {
  const [range, setRange] = useState<DateRange>(getDefaultRange);
  const [platform, setPlatform] = useState("");
  const [shopId, setShopId] = useState("");

  const [data, setData] = useState<OrderUnitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const query: FinanceOrderUnitQuery = {
        ...range,
        platform: platform || undefined,
        shop_id: shopId || undefined,
      };
      const res = await fetchFinanceOrderUnit(query);
      setData(res);
    } catch (err: unknown) {
      console.error("load finance order-unit failed", err);
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "加载客单价分析失败");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const summary = data?.summary;
  const curve = data?.contribution_curve ?? [];
  const topOrders = data?.top_orders ?? [];

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="财务分析 · 客单价 / 贡献度"
        description="从订单维度查看客单价分布与收入贡献度，识别大额订单对整体收入的支撑程度。"
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

            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="flex items-center gap-1">
                <span>平台</span>
                <input
                  className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  placeholder="如 PDD（可选）"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1">
                <span>店铺 ID</span>
                <input
                  className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  placeholder="如 1（可选）"
                  value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs">
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

      {/* 核心指标卡片 */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">订单数</div>
          <div className="mt-1 font-mono text-xl font-semibold text-slate-900">
            {summary?.order_count ?? 0}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg白 p-4 shadow-sm">
          <div className="text-xs text-slate-500">总收入</div>
          <div className="mt-1 font-mono text-xl font-semibold text-slate-900">
            {formatCurrency(summary?.revenue ?? 0)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg白 p-4 shadow-sm">
          <div className="text-xs text-slate-500">平均客单价</div>
          <div className="mt-1 font-mono text-xl font-semibold text-slate-900">
            {formatCurrency(summary?.avg_order_value ?? 0)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg白 p-4 shadow-sm">
          <div className="text-xs text-slate-500">中位客单价</div>
          <div className="mt-1 font-mono text-xl font-semibold text-slate-900">
            {formatCurrency(summary?.median_order_value ?? 0)}
          </div>
        </div>
      </section>

      {/* 贡献度曲线（表格版） */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            收入贡献度（按订单金额从大到小）
          </h2>
          <span className="text-[11px] text-slate-500">
            示例：前 20% 订单贡献收入的百分比，用于识别“大额订单”对整体收入的拉动程度。
          </span>
        </div>

        {curve.length === 0 ? (
          <p className="text-xs text-slate-500">
            当前条件下没有足够的订单数据。
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    订单占比
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    收入占比
                  </th>
                </tr>
              </thead>
              <tbody>
                {curve.map((p, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-slate-100"
                  >
                    <td className="px-3 py-2">
                      前{" "}
                      <span className="font-mono">
                        {(p.percent_orders * 100).toFixed(0)}%
                      </span>{" "}
                      订单
                    </td>
                    <td className="px-3 py-2">
                      贡献收入{" "}
                      <span className="font-mono">
                        {formatPercent(p.percent_revenue)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Top 订单列表 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            Top 订单列表（按金额从高到低）
          </h2>
          <span className="text-[11px] text-slate-500">
            用于快速定位关键大额订单，可配合订单详情 / Trace 使用。
          </span>
        </div>

        {topOrders.length === 0 ? (
          <p className="text-xs text-slate-500">
            当前条件下没有订单。
          </p>
        ) : (
          <div className="overflow-auto rounded-xl border border-slate-100">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    订单
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    平台 / 店铺
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">
                    金额
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    创建时间
                  </th>
                </tr>
              </thead>
              <tbody>
                {topOrders.map((o) => (
                  <tr
                    key={o.order_id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-mono text-[11px] text-slate-800">
                          #{o.order_id}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {o.ext_order_no}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-slate-800">
                          {o.platform}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          shop: {o.shop_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(o.order_value)}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-600">
                      {formatDateTime(o.created_at)}
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

export default FinanceOrderUnitPage;
