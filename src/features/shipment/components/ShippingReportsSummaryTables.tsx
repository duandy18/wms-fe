// src/features/shipment/components/ShippingReportsSummaryTables.tsx
//
// 分拆说明：
// - 本文件从 ShippingReportsPage.tsx 中拆出四块聚合表：按快递公司 / 按省份 / 按店铺 / 按仓库统计。
// - 目标是把纯展示型聚合表区域从主页面中抽离，降低主页面复杂度。
// - 当前不承载任何请求逻辑，只接收父组件传入的数据进行渲染。

import React from "react";
import type {
  ShippingCarrierRow,
  ShippingProvinceRow,
  ShippingShopRow,
  ShippingWarehouseRow,
} from "../api/shippingReportsApi";

type Props = {
  carrierRows: ShippingCarrierRow[];
  provinceRows: ShippingProvinceRow[];
  shopRows: ShippingShopRow[];
  warehouseRows: ShippingWarehouseRow[];
};

const formatCurrency = (n: number | null | undefined) =>
  n == null ? "-" : `￥${n.toFixed(2)}`;

const ShippingReportsSummaryTables: React.FC<Props> = ({
  carrierRows,
  provinceRows,
  shopRows,
  warehouseRows,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              按快递公司统计
            </h2>
            <span className="text-[11px] text-slate-500">
              按 cost_estimated 聚合
            </span>
          </div>
          {carrierRows.length === 0 ? (
            <p className="text-xs text-slate-500">
              当前筛选范围内没有发货记录。
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      快递公司
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      发货次数
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      总成本
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      平均成本
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {carrierRows.map((r) => (
                    <tr
                      key={`${r.carrier_code ?? "NULL"}-${r.carrier_name ?? ""}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="text-slate-800">
                            {r.carrier_name || "-"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {r.carrier_code || ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {r.ship_cnt}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.total_cost)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.avg_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              按省份统计
            </h2>
          </div>
          {provinceRows.length === 0 ? (
            <p className="text-xs text-slate-500">
              当前筛选范围内没有发货记录。
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      省份
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      发货次数
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      总成本
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      平均成本
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {provinceRows.map((r) => (
                    <tr
                      key={r.province ?? "UNKNOWN"}
                      className="border-t border-slate-100"
                    >
                      <td className="px-3 py-2">
                        {r.province || (
                          <span className="text-slate-400">未知</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {r.ship_cnt}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.total_cost)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.avg_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              按店铺统计
            </h2>
          </div>
          {shopRows.length === 0 ? (
            <p className="text-xs text-slate-500">
              当前筛选范围内没有发货记录。
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      平台 / 店铺
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      发货次数
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      总成本
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      平均成本
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shopRows.map((r) => (
                    <tr
                      key={`${r.platform}-${r.shop_id}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="text-slate-800">{r.platform}</span>
                          <span className="text-[10px] text-slate-400">
                            shop: {r.shop_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {r.ship_cnt}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.total_cost)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.avg_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              按仓库统计
            </h2>
          </div>
          {warehouseRows.length === 0 ? (
            <p className="text-xs text-slate-500">
              当前筛选范围内没有发货记录，或者尚未记录仓库 ID。
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      仓库 ID
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      发货次数
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      总成本
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      平均成本
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseRows.map((r, idx) => (
                    <tr
                      key={r.warehouse_id ?? `NULL-${idx}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-3 py-2">
                        {r.warehouse_id ?? (
                          <span className="text-slate-400">未知</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {r.ship_cnt}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.total_cost)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.avg_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default ShippingReportsSummaryTables;
