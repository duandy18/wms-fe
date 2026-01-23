// src/features/dev/orders/DevOrderLifecycleCard.tsx
import React from "react";
import type {
  OrderLifecycleStageV2,
  OrderLifecycleSummaryV2,
} from "./api/index";

type Props = {
  traceId: string | null | undefined;
  stages: OrderLifecycleStageV2[];
  summary: OrderLifecycleSummaryV2 | null;
  consistencyIssues: string[];
  loading: boolean;
  error: string | null;
};

export const DevOrderLifecycleCard: React.FC<Props> = ({
  traceId,
  stages,
  summary,
  consistencyIssues,
  loading,
  error,
}) => {
  const issues = summary?.issues ?? [];

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-xs">
      <div className="font-semibold text-slate-800">
        生命周期 v2（trace_id）
      </div>

      {!traceId && (
        <div className="text-slate-500">暂无 trace_id</div>
      )}
      {traceId && (
        <div className="mt-0.5 text-[11px] text-slate-500">
          trace_id: <span className="font-mono">{traceId}</span>
        </div>
      )}

      {loading && (
        <div className="mt-1 text-slate-500">加载中…</div>
      )}
      {error && (
        <div className="mt-1 text-red-600">{error}</div>
      )}

      {summary && (
        <div className="mt-2">
          健康度：
          <span className="ml-1 rounded bg-slate-100 px-2 py-0.5 font-mono">
            {summary.health}
          </span>
        </div>
      )}

      {issues.length > 0 && (
        <ul className="mt-1 list-disc pl-4 text-[11px] text-amber-700">
          {issues.map((i, idx) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      )}

      {consistencyIssues.length > 0 && (
        <>
          <div className="mt-2 font-semibold text-amber-800">
            生命周期 × 事实层不一致：
          </div>
          <ul className="list-disc pl-4 text-[11px] text-amber-700">
            {consistencyIssues.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </>
      )}

      {stages.length > 0 && (
        <ul className="mt-3 space-y-2">
          {stages.map((s) => (
            <li key={s.key}>
              <div className="flex gap-2">
                <div
                  className={
                    "h-3 w-3 rounded-full " +
                    (s.present
                      ? "bg-emerald-500"
                      : "bg白 border border-slate-300")
                  }
                />
                <div>
                  <div className="font-semibold">
                    {s.label}{" "}
                    {s.present ? null : (
                      <span className="text-slate-400">(缺失)</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {s.ts ?? "—"}
                  </div>
                  {s.evidence_type && (
                    <div className="text-[10px] text-slate-500">
                      evidence: {s.evidence_type}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
