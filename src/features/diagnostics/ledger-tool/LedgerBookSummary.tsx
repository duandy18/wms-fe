// src/features/diagnostics/ledger-tool/LedgerBookSummary.tsx

import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import type { LedgerSummary, LedgerRow } from "./types";

// 格式化 yyyy-mm-dd，从 ISO 中截断
function formatDate(s?: string | null): string {
  if (!s) return "";
  return s.slice(0, 10);
}

type Props = {
  summary: LedgerSummary | null;
  // 基于台账明细做 movement_type 聚合
  rows?: LedgerRow[];
};

export const LedgerBookSummary: React.FC<Props> = ({ summary, rows }) => {
  const hasSummary = !!summary && summary.by_reason?.length > 0;
  const hasRows = Array.isArray(rows) && rows.length > 0;

  let desc = "暂无统计数据。";
  if (summary) {
    const f = formatDate(summary.filters.time_from);
    const t = formatDate(summary.filters.time_to);
    const rangeText =
      f && t
        ? `${f} ~ ${t}`
        : f && !t
          ? `${f} ~ (自动补 now)`
          : "最近 7 天(默认)";
    desc = `本时间窗净变动：${summary.net_delta}（时间窗：${rangeText}）`;
  }

  // 按 movement_type 聚合（前端聚合，不改后端接口）
  const movementStats: Record<string, { count: number; total_delta: number }> =
    {};

  if (hasRows) {
    for (const r of rows!) {
      const mt = r.movement_type || "UNKNOWN";
      if (!movementStats[mt]) {
        movementStats[mt] = { count: 0, total_delta: 0 };
      }
      movementStats[mt].count += 1;
      movementStats[mt].total_delta += r.delta;
    }
  }

  const movementRows = Object.entries(movementStats).map(([mt, v]) => ({
    movement_type: mt,
    count: v.count,
    total_delta: v.total_delta,
  }));

  return (
    <SectionCard
      title="统计（按原因 & 按动作类型）"
      description={desc}
      className="rounded-none p-6 md:p-7 space-y-6"
    >
      {/* 第一部分：按 reason 聚合（原有逻辑） */}
      <div>
        <div className="text-sm mb-2 font-semibold text-slate-700">
          按原因(reason)
        </div>
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
            暂无统计结果（按原因）。
          </div>
        )}
      </div>

      {/* 第二部分：按 movement_type 聚合 */}
      <div>
        <div className="text-sm mb-2 font-semibold text-slate-700">
          按动作类型(movement_type)
        </div>
        {movementRows.length > 0 ? (
          <div className="overflow-x-auto text-sm">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 text-xs text-slate-500">
                  <th className="px-3 py-1 text-left">动作类型</th>
                  <th className="px-3 py-1 text-right">笔数(count)</th>
                  <th className="px-3 py-1 text-right">sum(delta)</th>
                </tr>
              </thead>
              <tbody>
                {movementRows.map((r) => (
                  <tr
                    key={r.movement_type}
                    className="border-b last:border-0"
                  >
                    <td className="px-3 py-1">{r.movement_type}</td>
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
            暂无统计结果（按动作类型）。
          </div>
        )}
      </div>
    </SectionCard>
  );
};
