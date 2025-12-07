// src/features/diagnostics/intelligence-dashboard/IntelligenceDashboardPage.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchInsights,
  fetchAnomaly,
  fetchAgeing,
  fetchAutohealSuggestions,
  fetchPrediction,
  fetchHotItems,
  type Insights,
  type AnomalyResult,
  type AgeingRow,
  type AutohealResult,
  type HotItem,
  type PredictionResult,
  type AutohealSuggestion,
} from "./api";
import { HealthScoreCard } from "./HealthScoreCard";
import { RiskRadarCard } from "./RiskRadarCard";
import { WarehouseEfficiencyCard } from "./WarehouseEfficiencyCard";
import { HotItemsCard } from "./HotItemsCard";
import { BatchRiskCard } from "./BatchRiskCard";
import { AnomalySpotlightCard } from "./AnomalySpotlightCard";
import { SuggestionFeedCard } from "./SuggestionFeedCard";
import { PredictionCard } from "./PredictionCard";

// -------- 小工具：时间 --------
function isoNow(): string {
  return new Date().toISOString();
}
function isoNDaysAgo(n: number): string {
  const now = new Date();
  return new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "加载失败";
  }
};

// ================== 主页面（中控） ==================
export const IntelligenceDashboardPage: React.FC = () => {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [anomaly, setAnomaly] = useState<AnomalyResult | null>(null);
  const [ageing, setAgeing] = useState<AgeingRow[]>([]);
  const [autoheal, setAutoheal] = useState<AutohealResult | null>(null);
  const [hotItems, setHotItems] = useState<HotItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 预测部分独立状态（用户输入）
  const [predWarehouseId, setPredWarehouseId] = useState<string>("1");
  const [predItemId, setPredItemId] = useState<string>("");
  const [predDays, setPredDays] = useState<string>("7");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [predLoading, setPredLoading] = useState(false);

  // 页面加载：把能自动拉的全部拉一次
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cut = isoNow();
      const from = isoNDaysAgo(7);

      const [ins, anom, age, heal, hot] = await Promise.all([
        fetchInsights(),
        fetchAnomaly(cut),
        fetchAgeing(30),
        fetchAutohealSuggestions(cut),
        fetchHotItems(from, cut),
      ]);

      setInsights(ins);
      setAnomaly(anom);
      setAgeing(age);
      setAutoheal(heal);
      setHotItems(hot);
    } catch (err: unknown) {
      console.error("loadDashboard failed", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // 全局健康分：用 insight 三个指数合成 0~100 分
  const overallScore = useMemo(() => {
    if (!insights) return null;
    const h = insights.inventory_health_score ?? 0;
    const acc = insights.inventory_accuracy_score ?? 0;
    const snap = insights.snapshot_accuracy_score ?? 0;
    const score = (acc * 0.5 + snap * 0.3 + h * 0.2) * 100;
    return Math.round(score);
  }, [insights]);

  // 高风险批次（只取 top 10）
  const topRiskBatches = useMemo(() => {
    return [...ageing].sort((a, b) => a.days_left - b.days_left).slice(0, 10);
  }, [ageing]);

  // 异常聚光灯（只取 ledger_vs_stocks 前几个）
  const spotlightRows = useMemo(() => {
    if (!anomaly) return [];
    return anomaly.ledger_vs_stocks.slice(0, 10);
  }, [anomaly]);

  // 自动修复建议（前 10 条）
  const suggestionRows = useMemo<AutohealSuggestion[]>(() => {
    if (!autoheal) return [];
    return autoheal.suggestions.slice(0, 10);
  }, [autoheal]);

  async function handleRunPrediction() {
    if (!predWarehouseId || !predItemId) return;
    setPredLoading(true);
    try {
      const res = await fetchPrediction(
        Number(predWarehouseId),
        Number(predItemId),
        Number(predDays || "7"),
      );
      setPrediction(res);
    } catch (err) {
      console.error("run prediction failed", err);
    } finally {
      setPredLoading(false);
    }
  }

  return (
    <div className="px-6 lg:px-10 py-4 space-y-8">
      {/* 顶部控制条 */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900">
          智能库存仪表盘（Inventory Intelligence Dashboard）
        </h1>
        <button
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? "刷新中..." : "刷新数据"}
        </button>
      </div>

      {error && (
        <div className="text-xs text-rose-600">
          仪表盘加载失败：{error}
        </div>
      )}

      {/* 第一行：全局健康 + 风险雷达 + 仓库效率 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <HealthScoreCard insights={insights} overallScore={overallScore} />
        <RiskRadarCard
          insights={insights}
          ageingCount={ageing.length}
          anomaly={anomaly}
          autoheal={autoheal}
        />
        <WarehouseEfficiencyCard insights={insights} />
      </div>

      {/* 第二行：热销商品 + 高风险批次 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <HotItemsCard hotItems={hotItems} />
        <BatchRiskCard rows={topRiskBatches} />
      </div>

      {/* 第三行：异常聚光灯 + 自动修复建议 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AnomalySpotlightCard rows={spotlightRows} />
        <SuggestionFeedCard autoheal={autoheal} suggestions={suggestionRows} />
      </div>

      {/* 第四行：预测模块 */}
      <div className="grid gap-4 lg:grid-cols-1">
        <PredictionCard
          warehouseId={predWarehouseId}
          setWarehouseId={setPredWarehouseId}
          itemId={predItemId}
          setItemId={setPredItemId}
          days={predDays}
          setDays={setPredDays}
          prediction={prediction}
          loading={predLoading}
          onRun={handleRunPrediction}
        />
      </div>
    </div>
  );
};

export default IntelligenceDashboardPage;
