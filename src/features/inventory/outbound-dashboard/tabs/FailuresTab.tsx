// src/features/inventory/outbound-dashboard/tabs/FailuresTab.tsx
import React from "react";
import { SectionCard } from "../../../../components/wmsdu/SectionCard";
import { DataTable, type ColumnDef } from "../../../../components/wmsdu/DataTable";
import { cn } from "../../../../lib/utils";
import {
  type FailuresResponse,
  type FailureDetail,
} from "../types";

type FailuresTabProps = {
  data: FailuresResponse | null;
};

export const FailuresTab: React.FC<FailuresTabProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="mt-4 text-xs text-slate-400">暂无失败统计。</div>
    );
  }

  const summaryRows = [
    { label: "路由失败", value: data.routing_failed },
    { label: "拣货失败", value: data.pick_failed },
    { label: "发运失败", value: data.ship_failed },
    { label: "库存不足", value: data.inventory_insufficient },
  ];

  const hasSummary = summaryRows.some((r) => r.value > 0);

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

  return (
    <div className="space-y-4 mt-4">
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
                    : "border-slate-200 bg-slate-50 text-slate-500",
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
          rows={data.details}
          emptyText={
            hasSummary
              ? "没有收集到失败明细（只有聚合统计）。"
              : "当前日期没有出库失败记录。"
          }
        />
      </SectionCard>
    </div>
  );
};
