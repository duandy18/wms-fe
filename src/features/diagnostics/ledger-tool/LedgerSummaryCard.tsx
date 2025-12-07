// src/features/diagnostics/ledger-tool/LedgerSummaryCard.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import type { LedgerSummary } from "./types";

type Props = {
  summary: LedgerSummary | null;
};

function formatDateTime(s?: string | null): string {
  if (!s) return "";
  // 2025-11-26T02:57:43.124975Z → 2025-11-26
  return s.slice(0, 10);
}

export const LedgerSummaryCard: React.FC<Props> = ({ summary }) => {
  const hasSummary = !!summary && summary.by_reason?.length > 0;

  let desc = "暂无统计数据，请先执行一次查询。";
  if (summary) {
    const from = formatDateTime(summary.filters.time_from);
    const to = formatDateTime(summary.filters.time_to);
    const rangeText =
      from && to
        ? `${from} ~ ${to}`
        : from && !to
          ? `${from} ~ (自动补 now)`
          : !from && to
            ? `(自动补 7 天前) ~ ${to}`
            : "最近 7 天(默认)";
    desc = `本次筛选净变动：${summary.net_delta}（时间窗：${rangeText}）`;
  }

  return (
    <SectionCard
      title="统计（按原因）"
      description={desc}
      className="rounded-none p-6 md:p-7 space-y-4"
    >
      {hasSummary ? (
        <div className="overflow-x-auto text-sm">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-xs text-slate-500">
                <th className="px-3 py-1 text-left">原因(reason)</th>
                <th className="px-3 py-1 text-right">笔数(count)</th>
                <th className="px-3 py-1 text-right">sum(delta)</th>
              </tr>
            </thead>
            <tbody>
              {summary!.by_reason.map((r) => (
                <tr key={r.reason} className="border-b last:border-0">
                  <td className="px-3 py-1">{r.reason}</td>
                  <td className="px-3 py-1 text-right">{r.count}</td>
                  <td className="px-3 py-1 text-right">
                    <span
                      className={
                        r.total_delta > 0
                          ? "text-emerald-600 font-semibold"
                          : r.total_delta < 0
                            ? "text-rose-600 font-semibold"
                            : "text-slate-700"
                      }
                    >
                      {r.total_delta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-xs text-slate-500">
          没有统计结果。先设置过滤条件并点击「查询」，系统会按 reason 聚合
          count 和 sum(delta)。
        </div>
      )}
    </SectionCard>
  );
};
