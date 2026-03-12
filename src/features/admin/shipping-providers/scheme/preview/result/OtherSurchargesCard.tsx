// src/features/admin/shipping-providers/scheme/preview/result/OtherSurchargesCard.tsx

import React from "react";
import type { QuoteSurchargeOut } from "../types";
import { safeMoney, safeText } from "../utils";
import { renderDetailCn } from "../quotePreviewResultHelpers";

function renderScopeCn(scope: unknown): string {
  const s = String(scope ?? "").trim().toLowerCase();
  if (s === "city") return "市";
  if (s === "province") return "省";
  return s ? safeText(scope) : "—";
}

export const OtherSurchargesCard: React.FC<{ rows: QuoteSurchargeOut[] }> = ({ rows }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-800">附加费命中明细</div>
      <div className="mt-1 text-xs text-slate-500">提示：该区块为当前后端 calc 输出的只读解释，展示命中的省级/城市附加费。</div>

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
                <th className="px-3 py-2">计费明细</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((s, idx) => (
                <tr key={s.id ?? idx} className="border-b border-slate-100 align-top text-sm">
                  <td className="px-3 py-2 font-mono text-slate-700">{idx + 1}</td>
                  <td className="px-3 py-2 font-mono text-slate-900">{safeText(s.id)}</td>
                  <td className="px-3 py-2 text-slate-900">{renderScopeCn(s.scope)}</td>
                  <td className="px-3 py-2 text-slate-900">{safeText(s.province_name ?? s.province_code)}</td>
                  <td className="px-3 py-2 text-slate-900">{safeText(s.city_name ?? s.city_code)}</td>
                  <td className="px-3 py-2 font-mono text-slate-900">{s.amount == null ? "—" : safeMoney(s.amount)}</td>
                  <td className="px-3 py-2">{renderDetailCn(s.detail ?? null)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-2 text-sm font-mono text-slate-600">未命中附加费（+0.00）</div>
      )}
    </div>
  );
};

export default OtherSurchargesCard;
