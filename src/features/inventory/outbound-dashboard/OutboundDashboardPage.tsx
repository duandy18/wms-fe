// src/features/inventory/outbound-dashboard/OutboundDashboardPage.tsx

import React, { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

import { Button } from "../../../components/ui/button";
import { MetricCard } from "../../../components/wmsdu/MetricCard";

import {
  DEFAULT_RANGE_DAYS,
  type TabId,
  type OutboundToday,
  type RangeResponse,
  type WarehouseResponse,
  type FailuresResponse,
  type FefoRiskResponse,
  type ShopResponse,
} from "./types";
import { TabsBar } from "./TabsBar";
import { OverviewTab } from "./tabs/OverviewTab";
import { TrendsTab } from "./tabs/TrendsTab";
import { HourlyTab } from "./tabs/HourlyTab";
import { WarehouseTab } from "./tabs/WarehouseTab";
import { ShopTab } from "./tabs/ShopTab";
import { FailuresTab } from "./tabs/FailuresTab";
import { FefoTab } from "./tabs/FefoTab";

// --------- API 封装 -----------------------------------

async function fetchToday(platform: string) {
  return apiGet<OutboundToday>(`/metrics/outbound/today?platform=${platform}`);
}

async function fetchRange(platform: string, days: number) {
  return apiGet<RangeResponse>(
    `/metrics/outbound/range?platform=${platform}&days=${days}`,
  );
}

async function fetchByWarehouse(platform: string, day: string) {
  return apiGet<WarehouseResponse>(
    `/metrics/outbound/by-warehouse?platform=${platform}&day=${day}`,
  );
}

async function fetchFailures(platform: string, day: string) {
  return apiGet<FailuresResponse>(
    `/metrics/outbound/failures?platform=${platform}&day=${day}`,
  );
}

async function fetchFefoRisk(days: number) {
  return apiGet<FefoRiskResponse>(`/metrics/fefo-risk?days=${days}`);
}

async function fetchByShop(platform: string, day: string) {
  return apiGet<ShopResponse>(
    `/metrics/outbound/by-shop?platform=${platform}&day=${day}`,
  );
}

// ------------- 页面主体 -----------------------------------

const OutboundDashboardPage: React.FC = () => {
  const [platform, setPlatform] = useState("PDD");
  const [rangeDays, setRangeDays] = useState(DEFAULT_RANGE_DAYS);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const [today, setToday] = useState<OutboundToday | null>(null);
  const [rangeData, setRangeData] = useState<RangeResponse | null>(null);
  const [warehouseData, setWarehouseData] =
    useState<WarehouseResponse | null>(null);
  const [failuresData, setFailuresData] =
    useState<FailuresResponse | null>(null);
  const [fefoRiskData, setFefoRiskData] =
    useState<FefoRiskResponse | null>(null);
  const [shopData, setShopData] = useState<ShopResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentDay = today?.day || "";

  async function reloadAll() {
    setLoading(true);
    setError(null);
    try {
      const todayRes = await fetchToday(platform);
      setToday(todayRes);

      const day = todayRes.day;

      const [rangeRes, whRes, failRes, fefoRes, shopRes] = await Promise.all([
        fetchRange(platform, rangeDays),
        fetchByWarehouse(platform, day),
        fetchFailures(platform, day),
        fetchFefoRisk(DEFAULT_RANGE_DAYS),
        fetchByShop(platform, day),
      ]);

      setRangeData(rangeRes);
      setWarehouseData(whRes);
      setFailuresData(failRes);
      setFefoRiskData(fefoRes);
      setShopData(shopRes);
    } catch (err: any) {
      setError(err?.message ?? "加载出库指标 Dashboard 失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reloadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, rangeDays]);

  const isEmptyToday = !today || today.total_orders === 0;

  return (
    <div className="space-y-6">
      {/* 顶部标题 + 控制器 */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">
          出库指标总览（Outbound Dashboard）
        </h1>
        <p className="text-sm text-slate-500">
          出库成功率、fallback 比例、FEFO 命中率等指标的一站式面板。
        </p>
      </header>

      {/* 顶栏控制器 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">平台：</span>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-xs"
          >
            <option value="PDD">PDD</option>
            <option value="TB">TB</option>
            <option value="JD">JD</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">趋势天数：</span>
          <select
            value={rangeDays}
            onChange={(e) => {
              const v = Number(e.target.value) || DEFAULT_RANGE_DAYS;
              setRangeDays(v);
            }}
            className="border rounded-lg px-3 py-1.5 text-xs"
          >
            <option value={7}>最近 7 天</option>
            <option value={14}>最近 14 天</option>
            <option value={30}>最近 30 天</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => void reloadAll()}
          className="text-xs"
        >
          {loading ? "刷新中…" : "刷新"}
        </Button>

        {currentDay && (
          <div className="text-xs text-slate-500">
            当前日期：
            <span className="font-mono">{currentDay}</span>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* 顶部 KPI 卡片（所有 Tab 共用） */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="今日总单量"
          value={today?.total_orders ?? 0}
          subtitle={currentDay ? `日期：${currentDay}` : undefined}
        />
        <MetricCard
          title="出库成功率"
          value={today?.success_rate ?? 0}
          unit="%"
          variant="success"
          subtitle="成功订单 / 总订单"
        />
        <MetricCard
          title="fallback 比例"
          value={today?.fallback_rate ?? 0}
          unit="%"
          variant="muted"
          subtitle="走兜底路由的占比"
        />
        <MetricCard
          title="FEFO 命中率"
          value={today?.fefo_hit_rate ?? 0}
          unit="%"
          variant="muted"
          subtitle="正确命中最早到期批次的比例"
        />
      </section>

      {/* 内部 Tabs */}
      <TabsBar activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 内容：Page 只做调度，展示交给子模块 */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab
            today={today}
            range={rangeData}
            warehouses={warehouseData}
          />
        )}
        {activeTab === "trends" && <TrendsTab range={rangeData} />}
        {activeTab === "hourly" && <HourlyTab today={today} />}
        {activeTab === "warehouse" && (
          <WarehouseTab data={warehouseData} />
        )}
        {activeTab === "shop" && <ShopTab data={shopData} />}
        {activeTab === "failures" && (
          <FailuresTab data={failuresData} />
        )}
        {activeTab === "fefo" && <FefoTab data={fefoRiskData} />}
      </div>

      {isEmptyToday && (
        <div className="text-[11px] text-slate-400">
          当前日期没有出库记录，部分图表可能为空，这属于正常情况。
        </div>
      )}
    </div>
  );
};

export default OutboundDashboardPage;
