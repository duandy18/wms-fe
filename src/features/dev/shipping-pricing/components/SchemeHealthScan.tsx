// src/features/dev/shipping-pricing/components/SchemeHealthScan.tsx
//
// B) Scheme Health Scan：覆盖/空洞/重叠/pricing_mode 分布
// - 不做“业务推断”，只做结构一致性扫描

import React, { useMemo, useState } from "react";
import { fetchPricingSchemeDetail } from "../../../admin/shipping-providers/api";
import type { PricingSchemeDetail, PricingSchemeZoneBracket, PricingSchemeZone } from "../../../admin/shipping-providers/api.types";
import { safeJson } from "../labUtils";

type Range = { id: number; min: number; max: number | null; mode: string };

function toRange(b: PricingSchemeZoneBracket): Range {
  const min = Number(b.min_kg);
  const max = b.max_kg == null ? null : Number(b.max_kg);
  return {
    id: b.id,
    min,
    max,
    mode: String(b.pricing_mode ?? "").toLowerCase(),
  };
}

function sortRanges(r: Range[]): Range[] {
  const a = [...r];
  a.sort((x, y) => {
    if (x.min !== y.min) return x.min - y.min;
    const xm = x.max == null ? Number.POSITIVE_INFINITY : x.max;
    const ym = y.max == null ? Number.POSITIVE_INFINITY : y.max;
    return xm - ym;
  });
  return a;
}

function epsEq(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) <= eps;
}

function maxVal(m: number | null): number {
  return m == null ? Number.POSITIVE_INFINITY : m;
}

function scanRanges(ranges: Range[]) {
  const issues: string[] = [];
  const gaps: Array<{ from: number; to: number }> = [];
  const overlaps: Array<{ a: Range; b: Range }> = [];

  const rs = sortRanges(ranges);

  if (!rs.length) {
    issues.push("no_brackets: 当前 Zone 没有任何 bracket");
    return { issues, gaps, overlaps, rs };
  }

  // gap from 0 to first.min
  if (rs[0].min > 0 && !epsEq(rs[0].min, 0)) {
    gaps.push({ from: 0, to: rs[0].min });
    issues.push(`gap: 0~${rs[0].min}`);
  }

  for (let i = 1; i < rs.length; i++) {
    const prev = rs[i - 1];
    const cur = rs[i];

    const prevMax = maxVal(prev.max);
    const curMin = cur.min;

    if (prev.max == null) {
      // prev already covers INF; any further bracket overlaps by definition
      overlaps.push({ a: prev, b: cur });
      issues.push(`overlap: prev(${prev.min}~INF) overlaps next(${cur.min}~${cur.max ?? "INF"})`);
      continue;
    }

    if (curMin < prevMax && !epsEq(curMin, prevMax)) {
      overlaps.push({ a: prev, b: cur });
      issues.push(`overlap: ${prev.min}~${prev.max} overlaps ${cur.min}~${cur.max ?? "INF"}`);
    } else if (curMin > prevMax && !epsEq(curMin, prevMax)) {
      gaps.push({ from: prevMax, to: curMin });
      issues.push(`gap: ${prevMax}~${curMin}`);
    }
  }

  return { issues, gaps, overlaps, rs };
}

function modeStats(ranges: Range[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const r of ranges) {
    const k = r.mode || "unknown";
    m[k] = (m[k] ?? 0) + 1;
  }
  return m;
}

export const SchemeHealthScan: React.FC<{ schemeId: number | null }> = ({ schemeId }) => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [detail, setDetail] = useState<PricingSchemeDetail | null>(null);

  const run = async () => {
    if (!schemeId || schemeId <= 0) {
      setErr("scheme_id 必须是正整数");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const d = await fetchPricingSchemeDetail(schemeId);
      setDetail(d);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "拉取 scheme detail 失败");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const report = useMemo(() => {
    if (!detail) return null;

    const zones: PricingSchemeZone[] = detail.zones ?? [];
    const zoneReports = zones.map((z) => {
      const activeBrackets = (z.brackets ?? []).filter((b) => b.active);
      const ranges = activeBrackets.map(toRange);
      const scan = scanRanges(ranges);
      const stats = modeStats(ranges);

      return {
        zone_id: z.id,
        zone_name: z.name,
        brackets_active: activeBrackets.length,
        mode_stats: stats,
        issues: scan.issues,
        ranges: scan.rs,
      };
    });

    const totalIssues = zoneReports.reduce((acc, x) => acc + x.issues.length, 0);

    return {
      scheme_id: detail.id,
      scheme_name: detail.name,
      zones: zones.length,
      total_issues: totalIssues,
      zone_reports: zoneReports,
    };
  }, [detail]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">Scheme Health Scan</div>
          <div className="mt-1 text-xs text-slate-500">覆盖/空洞/重叠/pricing_mode 分布（结构诊断）。</div>
        </div>
        <button
          type="button"
          className={"rounded-xl px-3 py-2 text-xs font-semibold " + (loading ? "bg-slate-200 text-slate-500" : "bg-slate-900 text-white hover:bg-slate-800")}
          onClick={() => void run()}
          disabled={loading}
        >
          {loading ? "扫描中…" : "运行扫描"}
        </button>
      </div>

      {err ? <div className="mt-2 text-sm text-red-700">{err}</div> : null}

      {!report ? (
        <div className="mt-3 text-sm text-slate-500">尚未扫描。点击“运行扫描”。</div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="text-slate-700">
              scheme：<span className="font-mono">#{report.scheme_id}</span> · {report.scheme_name}
            </div>
            <div className="mt-1 text-slate-700">
              zones：<span className="font-mono">{report.zones}</span> · total_issues：<span className="font-mono">{report.total_issues}</span>
            </div>
          </div>

          <details className="rounded-xl border border-slate-200 bg-white p-3">
            <summary className="cursor-pointer text-xs font-semibold text-slate-700">查看扫描报告（JSON）</summary>
            <pre className="mt-3 max-h-[420px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-700">
              {safeJson(report)}
            </pre>
          </details>

          <div className="overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">zone</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">active_brackets</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">pricing_mode 分布</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">issues</th>
                </tr>
              </thead>
              <tbody>
                {report.zone_reports.map((zr) => (
                  <tr key={zr.zone_id} className="border-b border-slate-100">
                    <td className="px-3 py-2">
                      <div className="text-slate-900">{zr.zone_name}</div>
                      <div className="text-xs font-mono text-slate-500">zone_id={zr.zone_id}</div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{zr.brackets_active}</td>
                    <td className="px-3 py-2 text-xs font-mono text-slate-700">{safeJson(zr.mode_stats)}</td>
                    <td className="px-3 py-2 text-xs text-slate-700">
                      {zr.issues.length ? (
                        <ul className="list-disc pl-4 space-y-1 font-mono">
                          {zr.issues.slice(0, 6).map((x, i) => (
                            <li key={`${zr.zone_id}-${i}`}>{x}</li>
                          ))}
                          {zr.issues.length > 6 ? <li>…({zr.issues.length - 6} more)</li> : null}
                        </ul>
                      ) : (
                        <span className="text-emerald-700 font-semibold">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeHealthScan;
