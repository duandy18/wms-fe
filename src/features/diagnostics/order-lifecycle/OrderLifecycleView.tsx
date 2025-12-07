// src/features/diagnostics/order-lifecycle/OrderLifecycleView.tsx
//
// 订单生命周期诊断视图（Lifecycle v2, trace_id 驱动）
// - 由 TraceStudio / 独立页面共用
// - 接收 traceId / onChangeTraceId 作为 props，不直接读 URL

import React, { useState } from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import { apiGet } from "../../../lib/api";
import type {
  OrderLifecycleStageV2,
  OrderLifecycleSummaryV2,
} from "../../dev/orders/api";

type LifecycleV2Response = {
  ok: boolean;
  trace_id: string;
  stages: OrderLifecycleStageV2[];
  summary: OrderLifecycleSummaryV2;
};

type Props = {
  traceId: string;
  onChangeTraceId: (v: string) => void;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "加载生命周期 v2 失败";
  }
};

export const OrderLifecycleView: React.FC<Props> = ({
  traceId,
  onChangeTraceId,
}) => {
  const [data, setData] = useState<LifecycleV2Response | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const tid = traceId.trim();
    if (!tid) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const r = await apiGet<LifecycleV2Response>(
        "/diagnostics/lifecycle/order-v2",
        { trace_id: tid },
      );
      setData(r);
    } catch (err: unknown) {
      console.error("load lifecycle v2 failed:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const stages = data?.stages || [];
  const summary = data?.summary;

  return (
    <div className="px-6 lg:px-10 space-y-8">
      <SectionCard
        title="订单生命周期诊断（Lifecycle v2 / trace_id）"
        className="p-6 space-y-4"
      >
        {/* 输入区 */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600">
              trace_id
            </label>
            <input
              placeholder="例如 demo:order:PDD:1:DEMO-..."
              className="mt-1 h-9 w-80 rounded border border-slate-300 px-3 text-sm"
              value={traceId}
              onChange={(e) => onChangeTraceId(e.target.value)}
            />
          </div>
          <button
            onClick={load}
            disabled={loading || !traceId.trim()}
            className="h-9 px-6 rounded bg-slate-900 text-xs font-medium text-white disabled:opacity-60"
          >
            {loading ? "加载中…" : "加载生命周期"}
          </button>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* 概览 + 健康状态 */}
        {data && (
          <div className="mt-3 space-y-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                当前 trace_id:{" "}
                <span className="font-mono font-semibold">
                  {data.trace_id}
                </span>
              </span>
              <span className="text-[10px] text-slate-500">
                阶段数：{stages.length}
              </span>
            </div>
            {summary && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  总体健康：
                  {summary.health === "OK" && (
                    <span className="ml-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                      OK
                    </span>
                  )}
                  {summary.health === "WARN" && (
                    <span className="ml-1 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
                      WARN
                    </span>
                  )}
                  {summary.health === "BAD" && (
                    <span className="ml-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 border border-red-200">
                      BAD
                    </span>
                  )}
                </div>
                {summary.issues && summary.issues.length > 0 && (
                  <div className="text-[10px] text-slate-500">
                    发现 {summary.issues.length} 条问题
                  </div>
                )}
              </div>
            )}
            {summary && summary.issues && summary.issues.length > 0 && (
              <ul className="mt-1 list-disc pl-5 text-[11px] text-slate-700">
                {summary.issues.map((iss, idx) => (
                  <li key={idx}>{iss}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 阶段表格视图 */}
        {stages.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded border border-slate-200">
            <table className="min-w-full border-collapse text-[11px] text-slate-800">
              <thead className="bg-slate-100 text-[11px] font-semibold text-slate-700">
                <tr>
                  <th className="px-2 py-1 text-left">阶段</th>
                  <th className="px-2 py-1 text-left">时间</th>
                  <th className="px-2 py-1 text-left">状态</th>
                  <th className="px-2 py-1 text-left">SLA</th>
                  <th className="px-2 py-1 text-left">证据类型</th>
                  <th className="px-2 py-1 text-left">来源 source</th>
                  <th className="px-2 py-1 text-left">ref</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((s) => (
                  <tr
                    key={s.key}
                    className="border-t border-slate-100 align-top"
                  >
                    <td className="px-2 py-1">
                      <div className="font-semibold text-slate-800">
                        {s.label}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {s.key}
                      </div>
                    </td>
                    <td className="px-2 py-1 font-mono text-[10px] text-slate-600">
                      {s.ts ?? "-"}
                    </td>
                    <td className="px-2 py-1">
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] " +
                          (s.present
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-50 text-slate-400 border border-slate-200")
                        }
                      >
                        {s.present ? "已发生" : "暂无记录"}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-[10px]">
                      {s.sla_bucket === "ok" && (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 border border-emerald-200">
                          正常
                        </span>
                      )}
                      {s.sla_bucket === "warn" && (
                        <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700 border border-amber-200">
                          接近超时
                        </span>
                      )}
                      {s.sla_bucket === "breach" && (
                        <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-700 border border-red-200">
                          已超时
                        </span>
                      )}
                      {!s.sla_bucket && (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-2 py-1 text-[10px] text-slate-600">
                      {s.evidence_type ?? "-"}
                    </td>
                    <td className="px-2 py-1 text-[10px] text-slate-600">
                      {s.source ?? "-"}
                    </td>
                    <td className="px-2 py-1 text-[10px] text-slate-600">
                      <span className="font-mono break-all">
                        {s.ref ?? "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading &&
          !error && (
            <div className="mt-3 text-xs text-slate-500">
              暂无结果（请输入 trace_id 并点击「加载生命周期」）。
            </div>
          )
        )}

        {/* 原始 JSON 视图 */}
        {data && (
          <div className="mt-4">
            <div className="mb-1 text-[11px] font-semibold text-slate-700">
              原始响应（RAW, 调试用）
            </div>
            <pre className="max-h-[60vh] overflow-auto rounded bg-slate-50 p-3 text-[11px] text-slate-700">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </SectionCard>
    </div>
  );
};
