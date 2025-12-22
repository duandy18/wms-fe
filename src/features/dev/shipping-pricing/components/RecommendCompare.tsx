// src/features/dev/shipping-pricing/components/RecommendCompare.tsx
//
// recommend 对比组件（多 provider）
// - 展示 quote 列表
// - 选中项展开：reasons / zone+bracket+summary
// - 一键“用该 scheme_id 跑 calc”（回填 schemeIdText）

import React, { useMemo } from "react";
import type { RecommendOut, RecommendQuote } from "../labTypes";
import { safeJson } from "../labUtils";

function readNum(q: RecommendQuote, key: string): number | null {
  const v = (q as Record<string, unknown>)[key];
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function readStr(q: RecommendQuote, key: string): string {
  const v = (q as Record<string, unknown>)[key];
  return typeof v === "string" ? v : "";
}

function readObj(obj: unknown, key: string): Record<string, unknown> | null {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function readArr(obj: unknown, key: string): unknown[] {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  return Array.isArray(v) ? v : [];
}

export const RecommendCompare: React.FC<{
  recOut: RecommendOut | null;
  selectedIdx: number;
  onSelect: (idx: number) => void;
  onUseSchemeIdForCalc: (schemeId: number) => void;
}> = ({ recOut, selectedIdx, onSelect, onUseSchemeIdForCalc }) => {
  const quotes = recOut?.quotes ?? [];
  const recommendedSchemeId = recOut?.recommended_scheme_id ?? null;

  const safeIdx = useMemo(() => {
    if (quotes.length === 0) return 0;
    return Math.min(Math.max(0, selectedIdx), quotes.length - 1);
  }, [quotes.length, selectedIdx]);

  const selectedQuote = quotes.length ? quotes[safeIdx] : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">recommend 对比（多 provider）</div>
          <div className="mt-1 text-xs text-slate-500">
            recommended_scheme_id：<span className="font-mono">{recommendedSchemeId == null ? "—" : String(recommendedSchemeId)}</span>
          </div>
        </div>

        {selectedQuote ? (
          <button
            type="button"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => {
              const sid = readNum(selectedQuote, "scheme_id");
              if (sid != null) onUseSchemeIdForCalc(Math.trunc(sid));
            }}
            title="将选中 quote 的 scheme_id 填回 calc"
          >
            用该 scheme_id 跑 calc
          </button>
        ) : null}
      </div>

      {quotes.length === 0 ? (
        <div className="mt-3 text-sm text-slate-500">尚无 recommend 结果。点击“运行 recommend”。</div>
      ) : (
        <>
          <div className="mt-3 overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">#</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">承运商</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">scheme</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">total</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q, idx) => {
                  const carrierName = readStr(q, "carrier_name") || "-";
                  const carrierCode = readStr(q, "carrier_code") || "-";
                  const sid = readNum(q, "scheme_id");
                  const sname = readStr(q, "scheme_name") || "-";
                  const total = readNum(q, "total_amount");
                  const status = readStr(q, "quote_status") || "-";

                  const active = idx === safeIdx;

                  return (
                    <tr
                      key={`${idx}-${carrierCode}-${sid ?? "na"}`}
                      className={
                        "border-b border-slate-100 cursor-pointer " + (active ? "bg-amber-50" : "hover:bg-slate-50")
                      }
                      onClick={() => onSelect(idx)}
                    >
                      <td className="px-3 py-2 font-mono text-xs text-slate-600">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-slate-900">{carrierName}</div>
                        <div className="text-xs font-mono text-slate-500">{carrierCode}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs font-mono text-slate-700">#{sid == null ? "—" : String(sid)}</div>
                        <div className="text-xs text-slate-500">{sname}</div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-slate-900">{total == null ? "—" : total.toFixed(2)}</td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-700">{status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selectedQuote ? (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-700">选中项（展开）</div>
                <div className="mt-1 text-xs text-slate-600 font-mono">
                  provider_id={readNum(selectedQuote, "provider_id") ?? "—"} · scheme_id={readNum(selectedQuote, "scheme_id") ?? "—"} · total={readNum(selectedQuote, "total_amount") ?? "—"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs font-semibold text-slate-700">reasons[]</div>
                <pre className="mt-2 max-h-[200px] overflow-auto rounded-lg bg-slate-50 p-3 text-xs font-mono text-slate-700">
                  {safeJson(readArr(selectedQuote, "reasons"))}
                </pre>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs font-semibold text-slate-700">zone / bracket / breakdown.summary</div>
                <pre className="mt-2 max-h-[240px] overflow-auto rounded-lg bg-slate-50 p-3 text-xs font-mono text-slate-700">
                  {safeJson({
                    zone: readObj(selectedQuote, "zone"),
                    bracket: readObj(selectedQuote, "bracket"),
                    summary: readObj(readObj(selectedQuote, "breakdown"), "summary"),
                  })}
                </pre>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default RecommendCompare;
