// src/features/inventory/outbound-metrics/OutboundMetricsPage.tsx

import React, { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import type { OutboundMetrics } from "./types";

import { Button } from "../../../components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../../components/ui/popover";
import { Calendar } from "../../../components/ui/calendar";
import { cn } from "../../../lib/utils";
import { format } from "date-fns";

// ==== API 封装（自动拼上 platform） ===================

async function fetchOutboundTodayApi(platform: string) {
  const data = await apiGet<OutboundMetrics>(
    `/metrics/outbound/today?platform=${platform}`
  );
  return { data };
}

async function fetchOutboundByDayApi(day: string, platform: string) {
  const path = `/metrics/outbound/by-day/${encodeURIComponent(
    day
  )}?platform=${platform}`;
  const data = await apiGet<OutboundMetrics>(path);
  return { data };
}

// ========== 页面主体 ===================================

export default function OutboundMetricsPage() {
  const [todayMetrics, setTodayMetrics] = useState<OutboundMetrics | null>(null);
  const [dayMetrics, setDayMetrics] = useState<OutboundMetrics | null>(null);

  const [platform, setPlatform] = useState("PDD");

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);

  const canRead = true;

  async function loadToday() {
    setLoadingToday(true);
    setError(null);
    try {
      const res = await fetchOutboundTodayApi(platform);
      setTodayMetrics(res.data);
    } catch (err: any) {
      setError(err?.message ?? "加载今日出库指标失败");
    } finally {
      setLoadingToday(false);
    }
  }

  async function loadByDay() {
    if (!selectedDate) {
      setError("请选择日期");
      return;
    }
    const dayStr = format(selectedDate, "yyyy-MM-dd");
    setLoadingDay(true);
    setError(null);
    try {
      const res = await fetchOutboundByDayApi(dayStr, platform);
      setDayMetrics(res.data);
    } catch (err: any) {
      setError(err?.message ?? "加载出库指标失败");
    } finally {
      setLoadingDay(false);
    }
  }

  // 平台切换 → 自动刷新今日
  useEffect(() => {
    void loadToday();
  }, [platform]);

  if (!canRead) {
    return (
      <div className="text-sm text-slate-500 mt-4">
        你没有 metrics.outbound.read 权限。
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题区 */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">
          出库指标（Outbound Metrics v2）
        </h1>
        <p className="text-sm text-slate-500">
          基于订单、拣货、发运、路由与 FEFO 行为的综合出库指标。
        </p>
      </header>

      {/* 错误提示 */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* 平台选择器 */}
      <section className="flex items-center gap-3">
        <label className="text-sm text-slate-700">平台：</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="PDD">PDD</option>
          <option value="TB">TB</option>
          <option value="JD">JD</option>
        </select>
      </section>

      {/* 今日指标 */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">
          今日出库（Today）
        </h2>

        {loadingToday ? (
          <div className="text-sm text-slate-600">加载中…</div>
        ) : !todayMetrics ? (
          <div className="text-sm text-slate-500">暂无数据。</div>
        ) : (
          <MetricsBlock metrics={todayMetrics} />
        )}
      </section>

      {/* 按日期查询 */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">按日期查询</h2>

        <div className="flex items-center gap-3">
          {/* 日期选择器（shadcn Calendar） */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                {selectedDate
                  ? format(selectedDate, "yyyy-MM-dd")
                  : "选择日期"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={(d) => setSelectedDate(d ?? null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button onClick={loadByDay} disabled={loadingDay} className="text-sm">
            {loadingDay ? "加载中…" : "查询"}
          </Button>
        </div>

        {loadingDay ? (
          <div className="text-sm text-slate-600">加载中…</div>
        ) : dayMetrics ? (
          <MetricsBlock metrics={dayMetrics} />
        ) : (
          <div className="text-sm text-slate-500">无记录。</div>
        )}
      </section>
    </div>
  );
}

// ----------------- 抽出的展示组件 -----------------

function MetricsBlock({ metrics }: { metrics: OutboundMetrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div>总单量：{metrics.total_orders}</div>
      <div>成功量：{metrics.success_orders}</div>
      <div>成功率：{metrics.success_rate}%</div>
      <div>fallback 次数：{metrics.fallback_times}</div>
      <div>fallback 比例：{metrics.fallback_rate}%</div>
      <div>FEFO 命中率：{metrics.fefo_hit_rate}%</div>
    </div>
  );
}
