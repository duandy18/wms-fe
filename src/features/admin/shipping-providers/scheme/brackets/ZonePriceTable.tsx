// src/features/admin/shipping-providers/scheme/brackets/ZonePriceTable.tsx
//
// Zone × 重量分段 报价表填写区
// - 行：当前 Zone
// - 列：重量分段（来自方案级模板）
// - 单元格：固定价 / 票费+元/kg（线性口径）

import React, { useState } from "react";
import type { WeightSegment } from "./PricingRuleEditor";
import { PUI } from "./ui";

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
    <div className={PUI.zonePriceCard}>
      <div className={PUI.zonePriceTitle}>报价填写（Zone：{zoneName}）</div>

      <div className={PUI.zonePriceTableWrap}>
        <table className={PUI.zonePriceTable}>
          <thead>
            <tr>
              <th className={PUI.zonePriceThLeft}>重量区间</th>
              {segments.map((s, idx) => (
                <th key={idx} className={PUI.zonePriceThCenter}>
                  {segLabel(s)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className={PUI.zonePriceTdLabel}>收费方式</td>
              {segments.map((_, idx) => {
                const cell = prices[idx];
                return (
                  <td key={idx} className={PUI.zonePriceTdCell}>
                    <select
                      className={PUI.zonePriceSelect}
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
              <td className={PUI.zonePriceTdLabel}>价格</td>
              {segments.map((_, idx) => {
                const cell = prices[idx];
                return (
                  <td key={idx} className={PUI.zonePriceTdCell}>
                    {cell?.mode === "linear_total" ? (
                      <div className={PUI.zonePriceInputsRow}>
                        <input
                          className={PUI.zonePriceInputXs}
                          placeholder="票费"
                          value={cell.ticketFee}
                          onChange={(e) => setCell(idx, { ...cell, ticketFee: e.target.value })}
                        />
                        <input
                          className={PUI.zonePriceInputXs}
                          placeholder="元/kg"
                          value={cell.ratePerKg}
                          onChange={(e) => setCell(idx, { ...cell, ratePerKg: e.target.value })}
                        />
                      </div>
                    ) : (
                      <input
                        className={PUI.zonePriceInputSm}
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

      <div className={PUI.zonePriceFootHint}>
        本表只负责填写 Zone 在各重量区间下的报价口径（固定价 / 票费+元/kg）。
      </div>
    </div>
  );
};

export default ZonePriceTable;
