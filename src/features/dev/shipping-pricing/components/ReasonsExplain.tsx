// src/features/dev/shipping-pricing/components/ReasonsExplain.tsx

import React, { useMemo } from "react";
import { safeJson, type ExplainReason } from "../labUtils";

function badgeClass(kind: ExplainReason["kind"]): string {
  if (kind === "zone_match") return "bg-sky-50 text-sky-700 border-sky-200";
  if (kind === "bracket_match") return "bg-amber-50 text-amber-700 border-amber-200";
  if (kind === "surcharge_hit") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (kind === "total") return "bg-slate-900 text-white border-slate-900";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export const ReasonsExplain: React.FC<{ reasons: string[] }> = ({ reasons }) => {
  const parsed = useMemo<ExplainReason[]>(() => {
    return reasons.map((r) => {
      const t = (r ?? "").trim();
      if (!t) return { kind: "other", raw: r, title: "—" };

      if (t.startsWith("zone_match:")) {
        const msg = t.replace(/^zone_match:\s*/g, "");
        return { kind: "zone_match", raw: r, title: "Zone 命中", detail: msg };
      }
      if (t.startsWith("bracket_match:")) {
        const msg = t.replace(/^bracket_match:\s*/g, "");
        return { kind: "bracket_match", raw: r, title: "Bracket 命中", detail: msg };
      }
      if (t.startsWith("surcharge_hit:")) {
        const msg = t.replace(/^surcharge_hit:\s*/g, "");
        return { kind: "surcharge_hit", raw: r, title: "附加费命中", detail: msg };
      }
      if (t.startsWith("total=")) {
        return { kind: "total", raw: r, title: "合计", detail: t };
      }

      // fallback
      return { kind: "other", raw: r, title: "说明", detail: t };
    });
  }, [reasons]);

  if (!reasons.length) {
    return <div className="text-sm text-slate-500">无 reasons</div>;
  }

  return (
    <div className="space-y-2">
      {parsed.map((x, idx) => (
        <div key={`${idx}-${x.raw}`} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-900">{x.title}</div>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeClass(x.kind)}`}>
              {x.kind}
            </span>
          </div>

          {x.detail ? (
            <div className="mt-2 text-xs font-mono text-slate-700 whitespace-pre-wrap break-words">{x.detail}</div>
          ) : (
            <div className="mt-2 text-xs font-mono text-slate-500">—</div>
          )}

          {/* 需要时展开 raw */}
          <details className="mt-2">
            <summary className="cursor-pointer text-[11px] text-slate-500">raw</summary>
            <pre className="mt-2 max-h-[160px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] font-mono text-slate-700">
              {safeJson(x.raw)}
            </pre>
          </details>
        </div>
      ))}
    </div>
  );
};

export default ReasonsExplain;
