// src/features/dev/ship/DevShipPanel.tsx
//
// DevConsole 发货成本调试面板（骨架）
// - 输入订单号 / 重量 / 目的地
// - 展示各物流公司费用矩阵
// - 后续接 /ship/calc
//

import React, { useState } from "react";

type DevCarrierQuote = {
  carrier: string;
  name: string;
  estCost: number;
  formula: string;
};

export const DevShipPanel: React.FC = () => {
  const [orderRef, setOrderRef] = useState("");
  const [weight, setWeight] = useState("2.36");
  const [province, setProvince] = useState("广东省");
  const [city, setCity] = useState("深圳市");
  const [district, setDistrict] = useState("南山区");
  const [quotes, setQuotes] = useState<DevCarrierQuote[]>([]);

  const handleCalc = () => {
    // TODO: 调 /ship/calc，这里先用假数据模拟
    const w = Number.parseFloat(weight || "0");
    const fake: DevCarrierQuote[] = [
      {
        carrier: "ZTO",
        name: "中通",
        estCost: 3.5 + Math.max(0, w - 1) * 1.2,
        formula: "base 3.5 + max(0, w-1)*1.2",
      },
      {
        carrier: "YTO",
        name: "圆通",
        estCost: 3.8 + Math.max(0, w - 1) * 1.1,
        formula: "base 3.8 + max(0, w-1)*1.1",
      },
      {
        carrier: "JT",
        name: "极兔",
        estCost: 3.2 + Math.max(0, w - 1) * 1.3,
        formula: "base 3.2 + max(0, w-1)*1.3",
      },
    ];
    setQuotes(fake);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-slate-700">
          发货费用计算调试
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">订单号 / 平台单号</label>
            <input
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="可选，用于记录调试上下文"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">重量(kg)</label>
            <input
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">省份</label>
            <input
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">城市 / 区县</label>
            <div className="flex gap-2">
              <input
                className="w-1/2 rounded-lg border px-2 py-1.5 text-sm"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <input
                className="w-1/2 rounded-lg border px-2 py-1.5 text-sm"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCalc}
          className="mt-4 inline-flex items-center rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white"
        >
          计算费用矩阵（调试）
        </button>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-slate-700">
          费用矩阵 & 公式展开
        </div>
        {quotes.length === 0 ? (
          <p className="text-xs text-slate-500">
            还没有结果。输入重量与目的地后，点击“计算费用矩阵”。
          </p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                    物流公司
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                    预估费用(元)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                    计算公式（调试用）
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.carrier} className="border-t">
                    <td className="px-3 py-2">
                      {q.name}
                      <span className="ml-1 text-[11px] text-slate-500">
                        ({q.carrier})
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      ￥{q.estCost.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-[11px] font-mono text-slate-600">
                      {q.formula}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
