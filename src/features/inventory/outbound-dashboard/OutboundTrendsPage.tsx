// src/features/inventory/outbound-dashboard/OutboundTrendsPage.tsx
import React, { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import { TrendChart } from "../../../components/wmsdu/TrendChart";

type RangeDaySummary = {
  day: string;
  total_orders: number;
  success_rate: number;
  fallback_rate: number;
  fefo_hit_rate: number;
};

type RangeResponse = {
  platform: string;
  days: RangeDaySummary[];
};

type ApiErrorShape = { message?: string };

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

export default function OutboundTrendsPage() {
  const [platform, setPlatform] = useState("PDD");
  const [days, setDays] = useState(14);
  const [data, setData] = useState<RangeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<RangeResponse>(
        `/metrics/outbound/range?platform=${platform}&days=${days}`,
      );
      setData(res);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "加载趋势数据失败"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, days]);

  const mk =
    (getter: (d: RangeDaySummary) => number) =>
    (data?.days ?? []).map((d) => ({
      label: d.day.slice(5),
      value: getter(d),
    }));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">
          出库趋势（Trends）
        </h1>
        <p className="text-sm text-slate-500">
          最近 N 天的出库成功率 / fallback 比例 / FEFO 命中率。
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-slate-600">平台：</span>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-xs"
        >
          <option value="PDD">PDD</option>
          <option value="TB">TB</option>
          <option value="JD">JD</option>
        </select>

        <span className="text-xs text-slate-600">天数：</span>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value) || 7)}
          className="rounded-lg border px-3 py-1.5 text-xs"
        >
          <option value={7}>7</option>
          <option value={14}>14</option>
          <option value={30}>30</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-xs text-slate-500">加载中…</div>
      )}

      {data && data.days.length > 0 && (
        <div className="space-y-4">
          <SectionCard title="出库成功率（%）">
            <TrendChart data={mk((d) => d.success_rate)} valueSuffix="%" />
          </SectionCard>
          <SectionCard title="FEFO 命中率（%）">
            <TrendChart data={mk((d) => d.fefo_hit_rate)} valueSuffix="%" />
          </SectionCard>
          <SectionCard title="fallback 比例（%）">
            <TrendChart data={mk((d) => d.fallback_rate)} valueSuffix="%" />
          </SectionCard>
        </div>
      )}

      {!loading && (!data || data.days.length === 0) && (
        <div className="text-xs text-slate-400">暂无趋势数据。</div>
      )}
    </div>
  );
}
