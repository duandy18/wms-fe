// src/features/purchase-orders/PurchaseOrderSupplierReport.tsx
import React, { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";
import type { SupplierReportRow } from "./reportsApi";

type Props = {
  supplierId: number | null;
  supplierName: string | null;
  warehouseId: string | null;
};

type ApiErrorShape = {
  message?: string;
};

const parseMoney = (v: string | null | undefined): number => {
  if (!v) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

export const PurchaseOrderSupplierReport: React.FC<Props> = ({
  supplierId,
  supplierName,
  warehouseId,
}) => {
  const [rows, setRows] = useState<SupplierReportRow[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!supplierId) {
        setRows([]);
        setTotalAmount(0);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const qs = new URLSearchParams();
        qs.set("supplier_id", String(supplierId));

        if (warehouseId && warehouseId.trim()) {
          const wid = Number(warehouseId.trim());
          if (!Number.isNaN(wid) && wid > 0) {
            qs.set("warehouse_id", String(wid));
          }
        }

        const data = await apiGet<SupplierReportRow[]>(
          `/purchase-reports/suppliers?${qs.toString()}`,
        );

        const list = data || [];
        setRows(list);

        const sum = list.reduce(
          (acc, r) => acc + parseMoney(r.total_amount),
          0,
        );
        setTotalAmount(sum);
      } catch (err) {
        setError(getErrorMessage(err, "加载供应商采购报告失败"));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [supplierId, warehouseId]);

  if (!supplierId) {
    return (
      <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        请选择供应商后，将在此处显示该供应商的历史采购统计（可导出 CSV）。
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            当前供应商历史采购汇总
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            供应商：{supplierName}；金额计算基于所有历史采购单。
          </p>
        </div>

        {rows.length > 0 && (
          <button
            type="button"
            onClick={() => exportCsv(rows, totalAmount)}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
          >
            导出 CSV
          </button>
        )}
      </div>

      {loading && (
        <div className="text-xs text-slate-500">加载中…</div>
      )}
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {!loading && rows.length === 0 && !error && (
        <div className="text-xs text-slate-500">
          没有找到该供应商的历史采购记录。
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-[520px] border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600">
                <th className="border border-slate-200 px-2 py-1 text-left">
                  供应商
                </th>
                <th className="border border-slate-200 px-2 py-1 text-right">
                  单据数
                </th>
                <th className="border border-slate-200 px-2 py-1 text-right">
                  订购件数
                </th>
                <th className="border border-slate-200 px-2 py-1 text-right">
                  最小单位数
                </th>
                <th className="border border-slate-200 px-2 py-1 text-right">
                  金额合计
                </th>
                <th className="border border-slate-200 px-2 py-1 text-right">
                  平均单价
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className="border-t border-slate-100">
                  <td className="border border-slate-200 px-2 py-1">
                    {r.supplier_name}
                  </td>
                  <td className="border border-slate-200 px-2 py-1 text-right font-mono">
                    {r.order_count}
                  </td>
                  <td className="border border-slate-200 px-2 py-1 text-right font-mono">
                    {r.total_qty_cases}
                  </td>
                  <td className="border border-slate-200 px-2 py-1 text-right font-mono">
                    {r.total_units}
                  </td>
                  <td className="border border-slate-200 px-2 py-1 text-right font-mono">
                    {r.total_amount}
                  </td>
                  <td className="border border-slate-200 px-2 py-1 text-right font-mono">
                    {r.avg_unit_price ?? "-"}
                  </td>
                </tr>
              ))}

              <tr className="bg-slate-50 font-semibold">
                <td
                  className="border border-slate-200 px-2 py-1"
                  colSpan={4}
                >
                  合计金额
                </td>
                <td className="border border-slate-200 px-2 py-1 text-right font-mono">
                  {totalAmount.toFixed(2)}
                </td>
                <td className="border border-slate-200 px-2 py-1" />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

function exportCsv(rows: SupplierReportRow[], totalAmount: number) {
  const header = [
    "供应商ID",
    "供应商名称",
    "单据数",
    "订购件数",
    "最小单位数",
    "金额合计",
    "平均单价",
  ];

  const dataRows = rows.map((r) => [
    r.supplier_id ?? "",
    r.supplier_name,
    r.order_count,
    r.total_qty_cases,
    r.total_units,
    r.total_amount,
    r.avg_unit_price ?? "",
  ]);

  const sumRow = ["", "合计", "", "", "", totalAmount.toFixed(2), ""];

  const csv = [header, ...dataRows, sumRow]
    .map((row) =>
      row
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\r\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "supplier-report.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
