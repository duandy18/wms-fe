// src/features/shipping-assist/handoffs/pages/ShippingHandoffPage.tsx

import React, { useCallback, useEffect, useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import { fetchShippingHandoffs } from "../api";
import type { ShippingHandoffRow } from "../types";
import { formatDateTime } from "../types";

const ShippingHandoffPage: React.FC = () => {
  const [rows, setRows] = useState<ShippingHandoffRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchShippingHandoffs({ limit: 500, offset: 0 });
      setRows(Array.isArray(res.rows) ? res.rows : []);
      setTotal(typeof res.total === "number" ? res.total : 0);
    } catch (err) {
      setRows([]);
      setTotal(0);
      setError(err instanceof Error ? err.message : "加载发货交接记录失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="发货交接"
        description="只读展示 WMS 与 Logistics 的发货交接记录。"
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            当前显示 {rows.length} 条 / 合计 {total} 条
          </div>

          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => void reload()}
            disabled={loading}
          >
            {loading ? "刷新中…" : "刷新"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!error && loading ? (
          <div className="text-sm text-slate-500">正在加载发货交接记录…</div>
        ) : null}

        {!error && !loading && rows.length === 0 ? (
          <div className="text-sm text-slate-500">暂无发货交接记录。</div>
        ) : null}

        {!error && rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-right">ID</th>
                  <th className="px-3 py-2 text-left">来源类型</th>
                  <th className="px-3 py-2 text-right">来源ID</th>
                  <th className="px-3 py-2 text-left">来源单号</th>
                  <th className="px-3 py-2 text-left">交接键</th>
                  <th className="px-3 py-2 text-left">导出状态</th>
                  <th className="px-3 py-2 text-left">物流状态</th>
                  <th className="px-3 py-2 text-right">Logistics请求ID</th>
                  <th className="px-3 py-2 text-left">Logistics请求号</th>
                  <th className="px-3 py-2 text-left">导入时间</th>
                  <th className="px-3 py-2 text-left">完成时间</th>
                  <th className="px-3 py-2 text-left">最近尝试</th>
                  <th className="px-3 py-2 text-left">失败原因</th>
                  <th className="px-3 py-2 text-left">创建时间</th>
                  <th className="px-3 py-2 text-left">更新时间</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t align-top">
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {row.id}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {row.source_doc_type}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {row.source_doc_id}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {row.source_doc_no}
                    </td>
                    <td className="max-w-[260px] break-all px-3 py-2 font-mono text-xs">
                      {row.source_ref}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {row.export_status}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {row.logistics_status}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {row.logistics_request_id ?? "-"}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {row.logistics_request_no ?? "-"}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {formatDateTime(row.exported_at)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {formatDateTime(row.logistics_completed_at)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {formatDateTime(row.last_attempt_at)}
                    </td>
                    <td className="max-w-[320px] break-words px-3 py-2 text-xs text-rose-700">
                      {row.last_error || "-"}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {formatDateTime(row.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default ShippingHandoffPage;
