// src/features/inventory/outbound-dashboard/OutboundWarehousePage.tsx

import React, { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

import { SectionCard } from "../../../components/wmsdu/SectionCard";
import { DataTable } from "../../../components/wmsdu/DataTable";
import type { ColumnDef } from "../../../components/wmsdu/DataTable";

type WarehouseMetric = {
  warehouse_id: number;
  total_orders: number;
  success_orders: number;
  success_rate: number;
  pick_qty: number;
};

type WarehouseResponse = {
  day: string;
  platform: string;
  warehouses: WarehouseMetric[];
};

export default function OutboundWarehousePage() {
  const [platform, setPlatform] = useState("PDD");
  const [day, setDay] = useState<string>("");
  const [data, setData] = useState<WarehouseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!day) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<WarehouseResponse>(
        `/metrics/outbound/by-warehouse?platform=${platform}&day=${day}`
      );
      setData(res);
    } catch (err: any) {
      setError(err?.message ?? "加载仓库维度出库指标失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (day) void load();
  }, [platform, day]);

  const columns: ColumnDef<WarehouseMetric>[] = [
    { key: "warehouse_id", header: "仓库 ID" },
    { key: "total_orders", header: "总单量", align: "right" },
    { key: "success_orders", header: "成功单量", align: "right" },
    {
      key: "success_rate",
      header: "成功率",
      align: "right",
      render: (row) => `${row.success_rate.toFixed(1)}%`,
    },
    { key: "pick_qty", header: "拣货件数", align: "right" },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">
          按仓库拆分出库指标
        </h1>
        <p className="text-sm text-slate-500">
          观察每个仓库的订单量、成功率与拣货件数表现。
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
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

        <span className="text-xs text-slate-600">日期：</span>
        <input
          className="border rounded-lg px-3 py-1.5 text-xs"
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading || !day}
          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs disabled:opacity-60"
        >
          {loading ? "加载中…" : "查询"}
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <SectionCard title="按仓库拆分">
        <DataTable
          columns={columns}
          rows={data?.warehouses ?? []}
          emptyText="当前日期没有按仓库拆分的出库记录。"
        />
      </SectionCard>
    </div>
  );
}
