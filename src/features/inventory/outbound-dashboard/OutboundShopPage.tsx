// src/features/inventory/outbound-dashboard/OutboundShopPage.tsx

import React, { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

import { SectionCard } from "../../../components/wmsdu/SectionCard";
import { DataTable } from "../../../components/wmsdu/DataTable";
import type { ColumnDef } from "../../../components/wmsdu/DataTable";

type ShopMetric = {
  shop_id: string;
  total_orders: number;
  success_orders: number;
  success_rate: number;
  fallback_times: number;
  fallback_rate: number;
};

type ShopResponse = {
  day: string;
  platform: string;
  shops: ShopMetric[];
};

type ApiErrorShape = { message?: string };

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

export default function OutboundShopPage() {
  const [platform, setPlatform] = useState("PDD");
  const [day, setDay] = useState<string>("");
  const [data, setData] = useState<ShopResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!day) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<ShopResponse>(
        `/metrics/outbound/by-shop?platform=${platform}&day=${day}`,
      );
      setData(res);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "加载店铺维度出库指标失败"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (day) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, day]);

  const columns: ColumnDef<ShopMetric>[] = [
    { key: "shop_id", header: "店铺 ID" },
    { key: "total_orders", header: "总单量", align: "right" },
    { key: "success_orders", header: "成功单量", align: "right" },
    {
      key: "success_rate",
      header: "成功率",
      align: "right",
      render: (row) => `${row.success_rate.toFixed(1)}%`,
    },
    { key: "fallback_times", header: "fallback 次数", align: "right" },
    {
      key: "fallback_rate",
      header: "fallback 比例",
      align: "right",
      render: (row) => `${row.fallback_rate.toFixed(1)}%`,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">
          按店铺拆分出库指标
        </h1>
        <p className="text-sm text-slate-500">
          展示每个店铺的订单量、成功率与 fallback 表现。
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

        <span className="text-xs text-slate-600">日期：</span>
        <input
          className="rounded-lg border px-3 py-1.5 text-xs"
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading || !day}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white disabled:opacity-60"
        >
          {loading ? "加载中…" : "查询"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <SectionCard title="按店铺拆分">
        <DataTable
          columns={columns}
          rows={data?.shops ?? []}
          emptyText="当前日期没有按店铺拆分的出库记录。"
        />
      </SectionCard>
    </div>
  );
}
