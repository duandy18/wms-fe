// src/features/diagnostics/intelligence-dashboard/SuggestionFeedCard.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import type { AutohealResult, AutohealSuggestion } from "./api";

type SuggestionProps = {
  autoheal: AutohealResult | null;
  suggestions: AutohealSuggestion[];
};

export const SuggestionFeedCard: React.FC<SuggestionProps> = ({
  autoheal,
  suggestions,
}) => {
  return (
    <SectionCard
      title="自动修复建议（Auto-Heal Suggestions）"
      description="基于 ledger 与 stocks 差异生成的自动校正建议（尚未执行）"
      className="h-full p-6 space-y-4"
    >
      {!autoheal || autoheal.count === 0 ? (
        <div className="text-xs text-slate-500">当前没有修复建议。</div>
      ) : (
        <>
          <div className="text-xs text-slate-600">
            共 {autoheal.count} 条建议，下面展示前 {suggestions.length} 条。
          </div>
          <div className="text-xs">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 text-[11px] text-slate-500">
                  <th className="px-2 py-1 text-left">WH</th>
                  <th className="px-2 py-1 text-left">Item</th>
                  <th className="px-2 py-1 text-left">Batch</th>
                  <th className="px-2 py-1 text-right">Ledger</th>
                  <th className="px-2 py-1 text-right">Stocks</th>
                  <th className="px-2 py-1 text-right">Diff</th>
                  <th className="px-2 py-1 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((s) => {
                  const href = `/tools/stocks?warehouse_id=${s.warehouse_id}&item_id=${s.item_id}&batch_code=${encodeURIComponent(
                    s.batch_code,
                  )}`;
                  return (
                    <tr
                      key={`${s.warehouse_id}-${s.item_id}-${s.batch_code}`}
                      className="border-b last:border-0 hover:bg-sky-50"
                    >
                      <td className="px-2 py-1">{s.warehouse_id}</td>
                      <td className="px-2 py-1">{s.item_id}</td>
                      <td className="px-2 py-1">
                        <a
                          href={href}
                          className="text-sky-700 hover:underline font-mono"
                        >
                          {s.batch_code}
                        </a>
                      </td>
                      <td className="px-2 py-1 text-right">{s.ledger}</td>
                      <td className="px-2 py-1 text-right">{s.stocks}</td>
                      <td className="px-2 py-1 text-right text-rose-600">
                        {s.diff}
                      </td>
                      <td className="px-2 py-1 text-right">
                        <span className="inline-flex items-center rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-700">
                          {s.action} {s.adjust_delta}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-slate-500">
            执行层可以通过 /inventory/autoheal/execute 接口真正落地这些操作（建议先 dry-run，确认后再执行）。
          </div>
        </>
      )}
    </SectionCard>
  );
};
