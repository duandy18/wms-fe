// src/features/inventory/outbound-dashboard/OutboundFefoRiskPage.tsx

import React, { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

import { SectionCard } from "../../../components/wmsdu/SectionCard";
import { DataTable } from "../../../components/wmsdu/DataTable";
import type { ColumnDef } from "../../../components/wmsdu/DataTable";
import { BarChartSimple } from "../../../components/wmsdu/BarChartSimple";

type FefoItemRisk = {
  item_id: number;
  sku: string;
  name: string;
  near_expiry_batches: number;
  fefo_hit_rate_7d: number;
  risk_score: number;
};

type FefoRiskResponse = {
  as_of: string;
  items: FefoItemRisk[];
};

type ApiErrorShape = { message?: string };

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

export default function OutboundFefoRiskPage() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<FefoRiskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiGet<FefoRiskResponse>(
        `/metrics/fefo-risk?days=${days}`,
      );
      setData(res);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "加载 FEFO 风险失败"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const rows = data?.items ?? [];

  const columns: ColumnDef<FefoItemRisk>[] = [
    { key: "item_id", header: "Item ID" },
    { key: "sku", header: "SKU" },
    { key: "name", header: "名称" },
    {
      key: "near_expiry_batches",
      header: "临期批次",
      align: "right",
    },
    {
      key: "fefo_hit_rate_7d",
      header: `${days} 日 FEFO 命中率`,
      align: "right",
      render: (row) => `${row.fefo_hit_rate_7d.toFixed(1)}%`,
    },
    {
      key: "risk_score",
      header: "风险评分",
      align: "right",
    },
  ];

  const chartData = rows.slice(0, 10).map((item) => ({
    label: item.sku || `ITEM-${item.item_id}`,
    value: item.risk_score,
  }));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">
          FEFO 风险监控
        </h1>
        <p className="text-sm text-slate-500">
          临期批次、FEFO 命中率、风险评分多维展示。
        </p>
      </header>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-600">回看天数：</span>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value) || 7)}
          className="rounded-lg border px-3 py-1.5 text-xs"
        >
          <option value={7}>7</option>
          <option value={14}>14</option>
          <option value={30}>30</option>
        </select>

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white disabled:opacity-60"
        >
          {loading ? "加载中…" : "刷新"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* FEFO 风险条形图 */}
      <SectionCard title="Top 风险 SKU（风险评分）">
        <BarChartSimple data={chartData} height={220} />
      </SectionCard>

      {/* 明细表 */}
      <SectionCard title="FEFO 风险明细">
        <DataTable
          columns={columns}
          rows={rows}
          emptyText="暂无 FEFO 风险数据。"
        />
      </SectionCard>
    </div>
  );
}
