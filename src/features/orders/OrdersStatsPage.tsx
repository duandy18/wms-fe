// src/features/orders/OrdersStatsPage.tsx
import React, { useEffect, useState } from "react";
import PageTitle from "../../components/ui/PageTitle";
import {
  fetchOrdersDailyStats,
  fetchOrdersLast7Trend,
  fetchOrdersSlaStats,
  type OrdersDailyStats,
  type OrdersTrendItem,
  type OrdersSlaStats,
} from "./api";

const todayYmd = () => new Date().toISOString().slice(0, 10);
const formatDate = (s: string) =>
  s.length >= 10 ? s.slice(0, 10) : s;

// 计算 SLA 窗口（默认 7 天，以当前选中日期为结束）
function buildSlaWindow(dateStr: string): { time_from: string; time_to: string } {
  const end = new Date(dateStr + "T23:59:59Z");
  const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000); // 近 7 天
  return {
    time_from: start.toISOString(),
    time_to: end.toISOString(),
  };
}

const OrdersStatsPage: React.FC = () => {
  const [platform, setPlatform] = useState("PDD");
  const [shopId, setShopId] = useState("");
  const [date, setDate] = useState<string>(todayYmd());

  const [daily, setDaily] = useState<OrdersDailyStats | null>(null);
  const [trend, setTrend] = useState<OrdersTrendItem[]>([]);
  const [sla, setSla] = useState<OrdersSlaStats | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const base = {
        platform: platform.trim() || undefined,
        shopId: shopId.trim() || undefined,
      };

      const slaWindow = buildSlaWindow(date);

      const [dailyRes, trendRes, slaRes] = await Promise.all([
        fetchOrdersDailyStats({
          ...base,
          date,
        }),
        fetchOrdersLast7Trend(base),
        fetchOrdersSlaStats({
          ...slaWindow,
          ...base,
          sla_hours: 24, // 默认 SLA = 24 小时
        }),
      ]);

      setDaily(dailyRes);
      setTrend(trendRes.days || []);
      setSla(slaRes);
    } catch (err: any) {
      console.error("load orders stats failed", err);
      setError(err?.message ?? "加载订单统计失败");
      setDaily(null);
      setTrend([]);
      setSla(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const avgReturnRate =
    trend.length > 0
      ? trend.reduce((acc, d) => acc + d.return_rate, 0) / trend.length
      : 0;

  const cards = [
    {
      label: "当天创建订单数",
      value: daily ? daily.orders_created : "-",
    },
    {
      label: "当天发货订单数",
      value: daily ? daily.orders_shipped : "-",
    },
    {
      label: "当天退货订单数",
      value: daily ? daily.orders_returned : "-",
    },
    {
      label: "近 7 天平均退货率",
      value: trend.length ? avgReturnRate.toFixed(3) : "-",
    },
    {
      label: "近 7 天发货订单数",
      value: sla ? sla.total_orders : "-",
    },
    {
      label: "平均发货耗时(小时)",
      value:
        sla && sla.avg_ship_hours != null
          ? sla.avg_ship_hours.toFixed(2)
          : "-",
    },
    {
      label: "95 分位发货耗时(小时)",
      value:
        sla && sla.p95_ship_hours != null
          ? sla.p95_ship_hours.toFixed(2)
          : "-",
    },
    {
      label: "发货准时率(≤24h)",
      value: sla ? `${(sla.on_time_rate * 100).toFixed(1)}%` : "-",
    },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageTitle
        title="订单统计"
        description="按时间维度观察订单创建 / 发货 / 退货与发货 SLA，可按平台 / 店铺过滤。"
      />

      {/* 过滤器 */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">平台</span>
            <input
              className="h-9 w-28 rounded border border-slate-300 px-2 text-sm"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="如 PDD（留空 = 所有平台）"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">店铺 ID</span>
            <input
              className="h-9 w-32 rounded border border-slate-300 px-2 text-sm"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              placeholder="可选，留空 = 所有店铺"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">统计日期</span>
            <input
              className="h-9 rounded border border-slate-300 px-2 text-sm"
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value || todayYmd())
              }
            />
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => void load()}
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? "刷新中…" : "刷新统计"}
          </button>
        </div>

        {error && (
          <div className="text-xs text-red-600">{error}</div>
        )}
      </section>

      {/* 顶部 KPI 卡片：数量 + SLA */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="text-xs text-slate-500">{c.label}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {c.value}
            </div>
          </div>
        ))}
      </section>

      {/* 近 7 天趋势表 */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700">
        <h2 className="text-sm font-semibold text-slate-800">
          近 7 天订单趋势
        </h2>
        <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
          <table className="min-w-full text-[11px]">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600">
              <tr>
                <th className="px-2 py-1 text-left">日期</th>
                <th className="px-2 py-1 text-right">创建订单</th>
                <th className="px-2 py-1 text-right">发货订单</th>
                <th className="px-2 py-1 text-right">退货订单</th>
                <th className="px-2 py-1 text-right">退货率</th>
              </tr>
            </thead>
            <tbody>
              {trend.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-2 py-3 text-center text-[11px] text-slate-500"
                  >
                    暂无数据。
                  </td>
                </tr>
              )}
              {trend.map((d) => (
                <tr
                  key={d.date}
                  className="border-t border-slate-100"
                >
                  <td className="px-2 py-1 text-left">
                    {formatDate(d.date)}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {d.orders_created}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {d.orders_shipped}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {d.orders_returned}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {(d.return_rate * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-2 text-[11px] text-slate-500">
          退货率 = 每日退货订单数 / 每日发货订单数；若当天没有发货订单，则退货率为 0。
          <br />
          发货 SLA 统计窗口为当前日期往前 7 天，准时发货定义为在 24 小时内发货。
        </p>
      </section>
    </div>
  );
};

export default OrdersStatsPage;
