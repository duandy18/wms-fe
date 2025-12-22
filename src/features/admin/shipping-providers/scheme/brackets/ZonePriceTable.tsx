// src/features/admin/shipping-providers/scheme/brackets/ZonePriceTable.tsx
//
// Zone × 重量分段 报价表填写区
// - 行：当前 Zone
// - 列：重量分段（来自方案级模板）
// - 单元格：固定价 / 票费+元/kg（线性口径）

import React, { useState } from "react";
import type { WeightSegment } from "./PricingRuleEditor";

type PriceCell =
  | { mode: "flat"; amount: string }
  | { mode: "linear_total"; ticketFee: string; ratePerKg: string };

function segLabel(s: WeightSegment): string {
  if (!s.max) return `${s.min}kg+`;
  return `${s.min}–${s.max}kg`;
}

export const ZonePriceTable: React.FC<{
  zoneName: string;
  segments: WeightSegment[];
}> = ({ zoneName, segments }) => {
  const [prices, setPrices] = useState<Record<number, PriceCell>>({});

  function setCell(idx: number, cell: PriceCell) {
    setPrices((prev) => ({ ...prev, [idx]: cell }));
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold mb-3">报价填写（Zone：{zoneName}）</div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b px-3 py-2 text-left text-xs text-slate-500">重量区间</th>
              {segments.map((s, idx) => (
                <th key={idx} className="border-b px-3 py-2 text-center text-xs font-mono">
                  {segLabel(s)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border-b px-3 py-3 text-sm text-slate-600">收费方式</td>
              {segments.map((_, idx) => {
                const cell = prices[idx];
                return (
                  <td key={idx} className="border-b px-3 py-2 text-center">
                    <select
                      className="rounded border border-slate-300 px-2 py-1 text-sm"
                      value={cell?.mode ?? "linear_total"}
                      onChange={(e) => {
                        const mode = e.target.value as "flat" | "linear_total";
                        setCell(
                          idx,
                          mode === "flat"
                            ? { mode: "flat", amount: "" }
                            : { mode: "linear_total", ticketFee: "", ratePerKg: "" },
                        );
                      }}
                    >
                      <option value="linear_total">票费 + 元/kg</option>
                      <option value="flat">固定价</option>
                    </select>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="px-3 py-3 text-sm text-slate-600">价格</td>
              {segments.map((_, idx) => {
                const cell = prices[idx];
                return (
                  <td key={idx} className="px-3 py-2 text-center">
                    {cell?.mode === "linear_total" ? (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <input
                          className="w-16 rounded border border-slate-300 px-1 py-1 font-mono"
                          placeholder="票费"
                          value={cell.ticketFee}
                          onChange={(e) => setCell(idx, { ...cell, ticketFee: e.target.value })}
                        />
                        <input
                          className="w-16 rounded border border-slate-300 px-1 py-1 font-mono"
                          placeholder="元/kg"
                          value={cell.ratePerKg}
                          onChange={(e) => setCell(idx, { ...cell, ratePerKg: e.target.value })}
                        />
                      </div>
                    ) : (
                      <input
                        className="w-20 rounded border border-slate-300 px-2 py-1 text-sm font-mono"
                        placeholder="金额"
                        value={cell?.amount ?? ""}
                        onChange={(e) => setCell(idx, { mode: "flat", amount: e.target.value })}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        本表只负责填写 Zone 在各重量区间下的报价口径（固定价 / 票费+元/kg）。
      </div>
    </div>
  );
};

export default ZonePriceTable;
