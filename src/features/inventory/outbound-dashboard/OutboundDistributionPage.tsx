// src/features/inventory/outbound-dashboard/OutboundDistributionPage.tsx

import React, { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

import { SectionCard } from "../../../components/wmsdu/SectionCard";
import { BarChartSimple } from "../../../components/wmsdu/BarChartSimple";
import { DataTable } from "../../../components/wmsdu/DataTable";
import type { ColumnDef } from "../../../components/wmsdu/DataTable";

type DistributionPoint = {
  hour: string;
  orders: number;
  pick_qty: number;
};

type OutboundToday = {
  day: string;
  platform: string;
  distribution: DistributionPoint[];
};

type ApiErrorShape = { message?: string };

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

export default function OutboundDistributionPage() {
  const [platform, setPlatform] = useState("PDD");
  const [data, setData] = useState<OutboundToday | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await apiGet<OutboundToday>(
        `/metrics/outbound/today?platform=${platform}`,
      );
      setData(res);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "加载按小时分布失败"));
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  const chartData =
    data?.distribution?.map((d) => ({ label: d.hour, value: d.orders })) ?? [];

  const columns: ColumnDef<DistributionPoint>[] = [
    { key: "hour", header: "小时", align: "center" },
    { key: "orders", header: "订单量", align: "right" },
    { key: "pick_qty", header: "拣货件数", align: "right" },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">
          出库分布（按小时）
        </h1>
        <p className="text-sm text-slate-500">
          按小时聚合订单创建量与拣货件数，观察高峰时段。
        </p>
      </header>

      <div className="flex items-center gap-3">
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
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <SectionCard title="订单量（小时分布）">
        <BarChartSimple data={chartData} valueSuffix="单" />
      </SectionCard>

      <SectionCard title="明细表">
        <DataTable
          columns={columns}
          rows={data?.distribution ?? []}
          emptyText="当前日期无出库记录。"
        />
      </SectionCard>
    </div>
  );
}
