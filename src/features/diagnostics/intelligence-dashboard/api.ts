// src/features/diagnostics/intelligence-dashboard/api.ts

import { apiGet, apiPost } from "../../../lib/api";
import type {
  LedgerList,
  LedgerRow,
  LedgerQueryPayload,
} from "../ledger-tool/types";

// ---- 类型定义 ----

export type Insights = {
  inventory_health_score: number;
  inventory_accuracy_score: number;
  snapshot_accuracy_score: number;
  batch_activity_30days: number;
  batch_risk_score: number;
  warehouse_efficiency: number;
};

export type AnomalyResult = {
  ledger_vs_stocks: Array<{
    wh: number;
    item: number;
    batch: string;
    ledger: number;
    stocks: number;
    diff: number;
  }>;
  ledger_vs_snapshot: Array<{
    wh: number;
    item: number;
    batch: string;
    ledger: number;
    snapshot: number;
    diff: number;
  }>;
  stocks_vs_snapshot: Array<{
    wh: number;
    item: number;
    batch: string;
    stocks: number;
    snapshot: number;
    diff: number;
  }>;
};

export type AgeingRow = {
  warehouse_id: number;
  item_id: number;
  batch_code: string;
  expiry_date: string;
  days_left: number;
  risk_level: string;
};

export type AutohealSuggestion = {
  warehouse_id: number;
  item_id: number;
  batch_code: string;
  ledger: number;
  stocks: number;
  diff: number;
  action: string;
  adjust_delta: number;
};

export type AutohealResult = {
  count: number;
  suggestions: AutohealSuggestion[];
};

export type PredictionResult = {
  warehouse_id: number;
  item_id: number;
  current_qty: number;
  avg_daily_outbound: number;
  predicted_qty: number;
  days: number;
  risk: string;
};

export type HotItem = {
  item_id: number;
  warehouse_id: number | null;
  total_outbound: number;
  events: number;
};

// ---- API 封装 ----

type InsightsWrapped = { ok: boolean; insights: Insights };

export async function fetchInsights(): Promise<Insights> {
  const res = await apiGet<InsightsWrapped | Insights>(
    "/inventory/intelligence/insights",
  );
  if ("insights" in res) {
    return res.insights;
  }
  return res;
}

export async function fetchAnomaly(cutIso: string): Promise<AnomalyResult> {
  const res = await apiGet<{ ok: boolean; anomaly: AnomalyResult }>(
    "/inventory/intelligence/anomaly",
    { cut: cutIso },
  );
  return res.anomaly;
}

export async function fetchAgeing(
  withinDays = 30,
): Promise<AgeingRow[]> {
  const res = await apiGet<{ ok: boolean; ageing: AgeingRow[] }>(
    "/inventory/intelligence/ageing",
    { within_days: withinDays },
  );
  return res.ageing;
}

export async function fetchAutohealSuggestions(
  cutIso: string,
): Promise<AutohealResult> {
  const res = await apiGet<{ ok: boolean; autoheal: AutohealResult }>(
    "/inventory/intelligence/autoheal",
    { cut: cutIso },
  );
  return res.autoheal;
}

export async function fetchPrediction(
  warehouseId: number,
  itemId: number,
  days: number,
): Promise<PredictionResult> {
  const res = await apiGet<{ ok: boolean; predict: PredictionResult }>(
    "/inventory/intelligence/predict",
    {
      warehouse_id: warehouseId,
      item_id: itemId,
      days,
    },
  );
  return res.predict;
}

// ---- 热销商品（基于最近 N 天 SHIP 台账） ----

export async function fetchHotItems(
  timeFromIso: string,
  timeToIso: string,
  limitItems = 5,
): Promise<HotItem[]> {
  const payload: LedgerQueryPayload = {
    limit: 1000,
    offset: 0,
    reason: "SHIP", // 只看出库
    time_from: timeFromIso,
    time_to: timeToIso,
  };

  const res = await apiPost<LedgerList>("/stock/ledger/query", payload);

  const map = new Map<
    number,
    {
      item_id: number;
      warehouse_id: number | null;
      total_outbound: number;
      events: number;
    }
  >();

  res.items.forEach((row: LedgerRow) => {
    if (row.delta >= 0) return; // 出库是负数
    const key = row.item_id;
    const existing =
      map.get(key) ??
      {
        item_id: row.item_id,
        warehouse_id: row.warehouse_id ?? null,
        total_outbound: 0,
        events: 0,
      };
    existing.total_outbound += -row.delta;
    existing.events += 1;
    map.set(key, existing);
  });

  const list = Array.from(map.values()).sort(
    (a, b) => b.total_outbound - a.total_outbound,
  );

  return list.slice(0, limitItems);
}
