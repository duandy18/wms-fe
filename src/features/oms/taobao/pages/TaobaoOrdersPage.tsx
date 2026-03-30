import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTaobaoOrderLedgerList } from "../api/orders";
import type { TaobaoOrderLedgerRow } from "../types/orders";

const TaobaoOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<TaobaoOrderLedgerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTaobaoOrderLedgerList();
        setRows(data);
      } catch (err) {
        console.error("load taobao ledger list failed", err);
        setError("加载淘宝订单台账失败。");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-semibold">淘宝订单台账</h1>
        <p className="text-sm text-slate-500">
          基于 taobao_orders 展示淘宝平台订单摘要。
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
                <th className="px-3 py-2">淘宝主订单号</th>
                <th className="px-3 py-2">交易状态</th>
                <th className="px-3 py-2">交易类型</th>
                <th className="px-3 py-2">创建时间</th>
                <th className="px-3 py-2">付款时间</th>
                <th className="px-3 py-2">实付金额</th>
                <th className="px-3 py-2">应付金额</th>
                <th className="px-3 py-2">首次拉取</th>
                <th className="px-3 py-2">最近同步</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  onClick={() => navigate(`/oms/taobao/orders/${row.id}`)}
                >
                  <td className="px-3 py-2">{row.store_id}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.tid}</td>
                  <td className="px-3 py-2">{row.status || "—"}</td>
                  <td className="px-3 py-2">{row.type || "—"}</td>
                  <td className="px-3 py-2">{row.created || "—"}</td>
                  <td className="px-3 py-2">{row.pay_time || "—"}</td>
                  <td className="px-3 py-2">{row.payment ?? "—"}</td>
                  <td className="px-3 py-2">{row.total_fee ?? "—"}</td>
                  <td className="px-3 py-2">{row.pulled_at || "—"}</td>
                  <td className="px-3 py-2">{row.last_synced_at || "—"}</td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={10}>
                    暂无淘宝订单。
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

export default TaobaoOrdersPage;
