import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPddOrderLedgerList } from "../api/orders";
import type { PddOrderLedgerRow } from "../types/orders";

const PddOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PddOrderLedgerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPddOrderLedgerList();
        setRows(data);
      } catch (err) {
        console.error("load pdd ledger list failed", err);
        setError("加载拼多多订单台账失败。");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-semibold">拼多多订单台账</h1>
        <p className="text-sm text-slate-500">
          基于 pdd_orders 展示拼多多平台订单摘要。
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
                <th className="px-3 py-2">平台单号</th>
                <th className="px-3 py-2">订单状态</th>
                <th className="px-3 py-2">成交时间</th>
                <th className="px-3 py-2">订单金额</th>
                <th className="px-3 py-2">首次拉取</th>
                <th className="px-3 py-2">最近同步</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  onClick={() => navigate(`/oms/pdd/orders/${row.id}`)}
                >
                  <td className="px-3 py-2">{row.store_id}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.order_sn}</td>
                  <td className="px-3 py-2">{row.order_status || "—"}</td>
                  <td className="px-3 py-2">{row.confirm_at || "—"}</td>
                  <td className="px-3 py-2">{row.pay_amount ?? row.goods_amount ?? "—"}</td>
                  <td className="px-3 py-2">{row.pulled_at || "—"}</td>
                  <td className="px-3 py-2">{row.last_synced_at || "—"}</td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={7}>
                    暂无拼多多订单。
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

export default PddOrdersPage;
