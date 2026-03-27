// src/features/admin/stores/components/order-sim/execute/LinesTable.tsx

import React, { useMemo } from "react";
import type { OrderSimPreview, ResolvedRow } from "../../../api_order_ingest";
import { summarizeExpandedItems, asStr } from "./utils";
import { RowDetail } from "./RowDetail";

export function LinesTable(props: {
  storeId: number;
  preview: OrderSimPreview;
  resolved: ResolvedRow[];
  unresolved: ResolvedRow[];
}) {
  const { preview, resolved, unresolved } = props;

  const resolvedByCode = useMemo(() => {
    const m = new Map<string, ResolvedRow>();
    for (const r of resolved ?? []) {
      if (r && r.filled_code) m.set(r.filled_code, r);
    }
    return m;
  }, [resolved]);

  const unresolvedByCode = useMemo(() => {
    const m = new Map<string, ResolvedRow>();
    for (const r of unresolved ?? []) {
      if (r && r.filled_code) m.set(r.filled_code, r);
    }
    return m;
  }, [unresolved]);

  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
      <div className="text-sm font-semibold text-slate-800">订单行</div>
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="py-2 pr-2 w-10">状态</th>
              <th className="py-2 pr-2 w-10">行</th>
              <th className="py-2 pr-2 min-w-[140px]">filled_code</th>
              <th className="py-2 pr-2 min-w-[220px]">标题</th>
              <th className="py-2 pr-2 w-20">qty</th>
              <th className="py-2 pr-2 min-w-[260px]">展开明细（item×need_qty）</th>
            </tr>
          </thead>
          <tbody>
            {preview.raw_lines.map((ln, idx) => {
              const lineNo = Number((ln as Record<string, unknown>).line_no ?? idx + 1);
              const filledCode = asStr((ln as Record<string, unknown>).filled_code);
              const title = asStr((ln as Record<string, unknown>).title);
              const qty = Number((ln as Record<string, unknown>).qty ?? 0);

              const hitResolved = filledCode ? resolvedByCode.get(filledCode) ?? null : null;
              const hitUnresolved = filledCode ? unresolvedByCode.get(filledCode) ?? null : null;

              const ok = Boolean(hitResolved) && !hitUnresolved;
              const statusMark = ok ? "✅" : "❌";
              const expText = summarizeExpandedItems(hitResolved?.expanded_items ?? null);

              return (
                <tr key={`${filledCode}-${idx}`} className="border-t align-top">
                  <td className="py-2 pr-2 text-xs">{statusMark}</td>
                  <td className="py-2 pr-2 text-slate-500 text-xs">{lineNo}</td>
                  <td className="py-2 pr-2 font-mono text-xs text-slate-700">{filledCode || "（空码）"}</td>
                  <td className="py-2 pr-2 text-xs text-slate-700">{title || "—"}</td>
                  <td className="py-2 pr-2 text-xs text-slate-700">{Number.isFinite(qty) ? qty : "—"}</td>
                  <td className="py-2 pr-2 text-xs text-slate-700 whitespace-pre-line">{expText}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {unresolved.length ? (
          <div className="mt-3">
            <div className="text-sm font-semibold text-slate-800">未解析明细（{unresolved.length}）</div>
            <div className="mt-2">
              {unresolved.map((u, idx) => (
                <div key={`${u.filled_code}-${idx}`} className="mb-2">
                  <div className="text-xs text-slate-700">
                    行：<span className="font-mono">{u.filled_code || "（空码）"}</span> · qty={u.qty}
                  </div>
                  <RowDetail row={u} storeId={props.storeId} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
