// src/features/shipment/components/ShippingReportsListTable.tsx
//
// 分拆说明：
// - 本文件从 ShippingReportsPage.tsx 中拆出“发货明细列表（分页 + 钻取）”区域。
// - 目标是把明细表、行操作、分页逻辑从主页面抽离，降低 ShippingReportsPage 的复杂度。
// - 当前保持纯展示 + 回调驱动，不承载数据请求状态。

import React from "react";
import { getShipmentStatusLabel } from "../domain/shipmentStatus";
import type { ShippingListRow } from "../api/shippingReportsApi";

type Props = {
  listRows: ShippingListRow[];
  listTotal: number;
  listOffset: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  onOpenRecordDetail: (row: ShippingListRow) => void;
  onOpenTrace: (row: ShippingListRow) => void;
  onPageChange: (direction: "prev" | "next") => void;
};

const formatCurrency = (n: number | null | undefined) =>
  n == null ? "-" : `￥${n.toFixed(2)}`;

const formatDateTime = (s: string | null | undefined) =>
  s ? s.replace("T", " ").replace("Z", "") : "-";

function getMetaField(
  row: ShippingListRow,
  key: string,
): string | undefined {
  const meta = (row.meta ?? {}) as Record<string, unknown>;
  const v = meta[key];
  return typeof v === "string" ? v : undefined;
}

const ShippingReportsListTable: React.FC<Props> = ({
  listRows,
  listTotal,
  listOffset,
  pageSize,
  currentPage,
  totalPages,
  onOpenRecordDetail,
  onOpenTrace,
  onPageChange,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          发货明细列表
        </h2>
        <div className="text-[11px] text-slate-500">
          共{" "}
          <span className="font-mono font-semibold text-slate-800">
            {listTotal}
          </span>{" "}
          条记录，
          {listTotal > 0 ? (
            <>
              当前第 <span className="font-mono">{currentPage}</span> /
              <span className="font-mono">{totalPages}</span> 页
            </>
          ) : (
            "暂无数据"
          )}
        </div>
      </div>

      {listRows.length === 0 ? (
        <p className="text-xs text-slate-500">
          当前筛选范围内暂无发货明细记录。
        </p>
      ) : (
        <>
          <div className="overflow-auto rounded-xl border border-slate-100">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    时间
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    订单引用
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    快递公司
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    目的地
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">
                    仓库
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">
                    毛重(kg)
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">
                    预估费用
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    状态
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {listRows.map((r) => {
                  const destProvince = getMetaField(r, "dest_province");
                  const destCity = getMetaField(r, "dest_city");
                  const destDistrict = getMetaField(r, "dest_district");

                  return (
                    <tr
                      key={r.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-3 py-2 text-[11px] text-slate-500">
                        {formatDateTime(r.created_at)}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => onOpenRecordDetail(r)}
                          className="font-mono text-[11px] text-sky-700 hover:underline"
                        >
                          {r.order_ref}
                        </button>
                      </td>
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
                      <td className="px-3 py-2 text-[11px] text-slate-600">
                        {destProvince || destCity || destDistrict ? (
                          <>
                            {destProvince ?? "-"} {destCity ?? ""}{" "}
                            {destDistrict ?? ""}
                          </>
                        ) : (
                          <span className="text-slate-400">未知</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {r.warehouse_id ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {r.gross_weight_kg ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.cost_estimated ?? null)}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {r.status ? getShipmentStatusLabel(r.status) : "-"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenRecordDetail(r)}
                            className="rounded border border-slate-300 px-2 py-[2px] text-[11px] text-slate-700 hover:bg-slate-50"
                          >
                            账本
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenTrace(r)}
                            disabled={!r.trace_id}
                            className={
                              "rounded border px-2 py-[2px] text-[11px] " +
                              (r.trace_id
                                ? "border-sky-300 text-sky-700 hover:bg-sky-50"
                                : "border-slate-200 text-slate-300")
                            }
                          >
                            Trace
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
            <div>
              当前显示第{" "}
              <span className="font-mono">
                {listTotal === 0 ? 0 : listOffset + 1}-
                {Math.min(listOffset + pageSize, listTotal)}
              </span>{" "}
              条记录
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange("prev")}
                disabled={listOffset === 0}
                className={
                  "rounded border px-2 py-1 " +
                  (listOffset === 0
                    ? "border-slate-200 text-slate-300"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50")
                }
              >
                上一页
              </button>
              <button
                type="button"
                onClick={() => onPageChange("next")}
                disabled={listOffset + pageSize >= listTotal}
                className={
                  "rounded border px-2 py-1 " +
                  (listOffset + pageSize >= listTotal
                    ? "border-slate-200 text-slate-300"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50")
                }
              >
                下一页
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default ShippingReportsListTable;
