import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJdOrderLedgerList } from "../api/orders";
import type { JdOrderLedgerRow } from "../types/orders";

const JdOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<JdOrderLedgerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchJdOrderLedgerList();
        setRows(data);
      } catch (err) {
        console.error("load jd ledger list failed", err);
        setError("加载京东订单台账失败。");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-semibold">京东订单台账</h1>
        <p className="text-sm text-slate-500">
          基于 jd_orders 展示京东平台订单摘要。
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
          加载中…
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="overflow-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="px-3 py-2">店铺ID</th>
                <th className="px-3 py-2">京东主订单号</th>
                <th className="px-3 py-2">订单状态</th>
                <th className="px-3 py-2">订单类型</th>
                <th className="px-3 py-2">下单时间</th>
                <th className="px-3 py-2">最后修改时间</th>
                <th className="px-3 py-2">订单总金额</th>
                <th className="px-3 py-2">商家应收</th>
                <th className="px-3 py-2">首次拉取</th>
                <th className="px-3 py-2">最近同步</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  onClick={() => navigate(`/oms/jd/orders/${row.id}`)}
                >
                  <td className="px-3 py-2">{row.store_id}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.order_id}</td>
                  <td className="px-3 py-2">{row.order_state || "—"}</td>
                  <td className="px-3 py-2">{row.order_type || "—"}</td>
                  <td className="px-3 py-2">{row.order_start_time || "—"}</td>
                  <td className="px-3 py-2">{row.modified || "—"}</td>
                  <td className="px-3 py-2">{row.order_total_price ?? "—"}</td>
                  <td className="px-3 py-2">{row.order_seller_price ?? "—"}</td>
                  <td className="px-3 py-2">{row.pulled_at || "—"}</td>
                  <td className="px-3 py-2">{row.last_synced_at || "—"}</td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={10}>
                    暂无京东订单。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default JdOrdersPage;
