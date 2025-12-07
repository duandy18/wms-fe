// src/features/dev/DevShipPanel.tsx
//
// DevConsole 发货成本调试面板（接入 /ship/calc）
// - 输入重量 + 省市区
// - 查看各物流公司的费用矩阵和计算公式

import React, { useState } from "react";
import { calcShipQuotes, type ShipQuote } from "../operations/ship/api";

const DevShipPanel: React.FC = () => {
  const [orderRef, setOrderRef] = useState("");
  const [weight, setWeight] = useState("2.36");
  const [province, setProvince] = useState("广东省");
  const [city, setCity] = useState("深圳市");
  const [district, setDistrict] = useState("南山区");

  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<ShipQuote[]>([]);
  const [error, setError] = useState<string | null>(null);

  const numericWeight = Number(weight) || 0;

  const handleCalc = async () => {
    if (!numericWeight || numericWeight <= 0) {
      setError("请先填写正确的重量（kg）");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await calcShipQuotes({
        weight_kg: numericWeight,
        province,
        city,
        district,
        debug_ref: orderRef || undefined,
      });
      setQuotes(res.quotes);
    } catch (e: unknown) {
      console.error("DevShipPanel calcShipQuotes failed", e);
      const msg =
        e instanceof Error ? e.message : "计算运费失败";
      setError(msg);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          发货费用计算调试
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">
              订单号 / 平台单号（可选）
            </label>
            <input
              className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="用于记录调试上下文，不参与计算"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500">重量(kg)</label>
            <input
              className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500">省份</label>
            <input
              className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">城市 / 区县</label>
            <div className="mt-1 flex gap-2">
              <input
                className="w-1/2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <input
                className="w-1/2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCalc}
          disabled={loading || numericWeight <= 0}
          className={
            "mt-4 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm " +
            (loading || numericWeight <= 0
              ? "bg-sky-400 opacity-70"
              : "bg-sky-600 hover:bg-sky-700")
          }
        >
          {loading ? "计算中…" : "计算费用矩阵"}
        </button>

        {error && (
          <p className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}
      </section>

      <section className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          费用矩阵 & 计算公式
        </h2>

        {quotes.length === 0 ? (
          <p className="text-xs text-slate-500">
            还没有结果。填写重量与地区后，点击“计算费用矩阵”查看各物流公司的报价。
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
                  <tr key={q.carrier} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      {q.name}
                      <span className="ml-1 text-[11px] text-slate-500">
                        ({q.carrier})
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      ￥{q.est_cost.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-[11px] font-mono text-slate-600">
                      {q.formula ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default DevShipPanel;
