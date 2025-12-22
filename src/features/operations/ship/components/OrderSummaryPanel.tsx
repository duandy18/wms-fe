// src/features/operations/ship/components/OrderSummaryPanel.tsx

import React from "react";
import { UI } from "../ui";

type Props = {
  province: string;
  city: string;
  district: string;
  totalWeightKg: number;
  packagingWeightKg: number;
};

function safeKg(v: number, digits = 3) {
  if (!Number.isFinite(v)) return "-";
  return v.toFixed(digits);
}

export const OrderSummaryPanel: React.FC<Props> = ({
  province,
  city,
  district,
  totalWeightKg,
  packagingWeightKg,
}) => {
  return (
    <section className={UI.card}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className={UI.h2}>订单明细（占位）</h2>
        <div className="text-sm text-slate-600">
          目的地：
          <span className="ml-2 font-mono">
            {province} {city} {district}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full border-collapse text-base">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">商品</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">数量</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">单件重量(kg)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">小计重量(kg)</th>
            </tr>
          </thead>
          <tbody>
            {/* Phase 4：替换为真实订单行 */}
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3">示例商品 A</td>
              <td className="px-4 py-3 text-right font-mono">1</td>
              <td className="px-4 py-3 text-right font-mono">1.00</td>
              <td className="px-4 py-3 text-right font-mono">1.00</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3">示例商品 B</td>
              <td className="px-4 py-3 text-right font-mono">2</td>
              <td className="px-4 py-3 text-right font-mono">0.50</td>
              <td className="px-4 py-3 text-right font-mono">1.00</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="px-4 py-3 text-sm font-semibold text-slate-700">合计</td>
              <td className="px-4 py-3 text-right font-mono text-sm font-semibold">—</td>
              <td />
              <td className="px-4 py-3 text-right font-mono text-sm font-semibold">
                {safeKg(totalWeightKg, 2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-600">
          当前毛重：
          <span className="ml-2 font-mono">{safeKg(totalWeightKg, 3)} kg</span>
          {" · "}
          包材：
          <span className="ml-2 font-mono">{safeKg(packagingWeightKg, 3)} kg</span>
        </div>
        <div className="mt-1 text-sm text-slate-500">
          Phase 4：这里将接入体积重、估重校验与多包裹拆分视图。
        </div>
      </div>
    </section>
  );
};
