// src/features/admin/shipping-providers/scheme/preview/result/DestAdjustmentsCard.tsx

import React from "react";
import type { QuoteDestAdjustmentOut } from "../types";
import { safeMoney, safeText } from "../utils";

export const DestAdjustmentsCard: React.FC<{ rows: QuoteDestAdjustmentOut[] }> = ({ rows }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-800">目的地附加费（叠加在基础运费之上）</div>
      <div className="mt-1 text-xs text-slate-500">说明：以下费用在基础运费基础上直接叠加；未命中则为 0。</div>

      {rows.length ? (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-700">
                <th className="px-3 py-2 w-[72px]">序号</th>
                <th className="px-3 py-2 w-[120px]">ID</th>
                <th className="px-3 py-2 w-[100px]">范围</th>
                <th className="px-3 py-2">省份</th>
                <th className="px-3 py-2">城市</th>
                <th className="px-3 py-2 w-[140px]">金额（元）</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((d, idx) => (
                <tr key={String(d.id ?? idx)} className="border-b border-slate-100 align-top text-sm">
                  <td className="px-3 py-2 font-mono text-slate-700">{idx + 1}</td>
                  <td className="px-3 py-2 font-mono text-slate-900">{safeText(d.id)}</td>
                  <td className="px-3 py-2">{safeText(d.scope) === "city" ? "市" : "省"}</td>
                  <td className="px-3 py-2 text-slate-900">{safeText(d.province)}</td>
                  <td className="px-3 py-2 text-slate-900">{d.city ? safeText(d.city) : "—"}</td>
                  <td className="px-3 py-2 font-mono text-slate-900">{d.amount == null ? "—" : safeMoney(d.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-2 text-sm font-mono text-slate-600">未命中（+0.00）</div>
      )}
    </div>
  );
};

export default DestAdjustmentsCard;
