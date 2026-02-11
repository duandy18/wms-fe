// src/features/ops/dev/order-parse-simulator/components/ResultCard.tsx

import React from "react";
import type { JsonObject } from "../types";

export function ResultCard(props: { result: JsonObject | null }) {
  const r = props.result as Record<string, unknown> | null;
  const report = (r && (r.report as Record<string, unknown>)) || null;
  const genStats = (r && (r.gen_stats as Record<string, unknown>)) || null;

  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div className="text-sm font-semibold text-slate-900">结果摘要</div>

      {!props.result ? <div className="text-sm text-slate-600">暂无结果</div> : null}

      {report ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-slate-500">by_status</div>
            <pre className="mt-1 text-xs whitespace-pre-wrap">{JSON.stringify(report.by_status ?? {}, null, 2)}</pre>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-xs text-slate-500">by_unresolved_reason</div>
            <pre className="mt-1 text-xs whitespace-pre-wrap">{JSON.stringify(report.by_unresolved_reason ?? {}, null, 2)}</pre>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-xs text-slate-500">watch_stats</div>
            <pre className="mt-1 text-xs whitespace-pre-wrap">{JSON.stringify(report.watch_stats ?? {}, null, 2)}</pre>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-xs text-slate-500">replay_stats</div>
            <pre className="mt-1 text-xs whitespace-pre-wrap">{JSON.stringify(report.replay_stats ?? null, null, 2)}</pre>
          </div>

          <div className="rounded-lg border p-3 col-span-2">
            <div className="text-xs text-slate-500">expanded_items_multiplication</div>
            <pre className="mt-1 text-xs whitespace-pre-wrap">
              {JSON.stringify(report.expanded_items_multiplication ?? {}, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}

      {genStats ? (
        <div className="rounded-lg border p-3">
          <div className="text-xs text-slate-500">gen_stats</div>
          <pre className="mt-1 text-xs whitespace-pre-wrap">{JSON.stringify(genStats, null, 2)}</pre>
        </div>
      ) : null}

      {props.result ? (
        <details className="rounded-lg border p-3">
          <summary className="cursor-pointer text-sm text-slate-700">查看原始 JSON</summary>
          <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(props.result, null, 2)}</pre>
        </details>
      ) : null}
    </div>
  );
}
