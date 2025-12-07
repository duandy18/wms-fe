// src/features/inventory/outbound-dashboard/OutboundFailuresPage.tsx

import React, { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

import { SectionCard } from "../../../components/wmsdu/SectionCard";
import { DataTable } from "../../../components/wmsdu/DataTable";
import type { ColumnDef } from "../../../components/wmsdu/DataTable";
import { cn } from "../../../lib/utils";

type FailureDetail = {
  ref: string;
  trace_id?: string | null;
  fail_point: string;
  message?: string | null;
};

type FailuresResponse = {
  day: string;
  platform: string;
  routing_failed: number;
  pick_failed: number;
  ship_failed: number;
  inventory_insufficient: number;
  details: FailureDetail[];
};

export default function OutboundFailuresPage() {
  const [platform, setPlatform] = useState("PDD");
  const [day, setDay] = useState<string>("");
  const [data, setData] = useState<FailuresResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!day) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<FailuresResponse>(
        `/metrics/outbound/failures?platform=${platform}&day=${day}`
      );
      setData(res);
    } catch (err: any) {
      setError(err?.message ?? "加载出库失败指标失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (day) void load();
  }, [platform, day]);

  const summaryRows = data
    ? [
        { label: "路由失败", value: data.routing_failed },
        { label: "拣货失败", value: data.pick_failed },
        { label: "发运失败", value: data.ship_failed },
        { label: "库存不足", value: data.inventory_insufficient },
      ]
    : [];

  const columns: ColumnDef<FailureDetail>[] = [
    { key: "ref", header: "引用 ref" },
    {
      key: "trace_id",
      header: "trace_id",
      render: (row) => row.trace_id || "-",
    },
    { key: "fail_point", header: "失败点" },
    {
      key: "message",
      header: "说明",
      render: (row) => row.message || "",
    },
  ];

  const hasSummary = summaryRows.some((r) => r.value > 0);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">
          出库失败诊断
        </h1>
        <p className="text-sm text-slate-500">
          聚合路由失败、拣货失败、发运失败、库存不足等关键异常，辅助定位问题。
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

      <SectionCard title="失败汇总">
        {summaryRows.length === 0 ? (
          <div className="text-xs text-slate-400">暂无汇总。</div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {summaryRows.map((r) => (
              <div
                key={r.label}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-2 py-1",
                  r.value > 0
                    ? "border-rose-300 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                )}
              >
                <span>{r.label}</span>
                <span className="font-mono">{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="失败明细">
        <DataTable
          columns={columns}
          rows={data?.details ?? []}
          emptyText={
            hasSummary
              ? "没有收集到失败明细（只有聚合统计）。"
              : "当前日期没有出库失败记录。"
          }
        />
      </SectionCard>
    </div>
  );
}
