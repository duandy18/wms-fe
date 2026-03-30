import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPddOrderLedgerDetail } from "../api/orders";
import type { PddOrderLedgerDetail } from "../types/orders";
import { RawJsonPanel } from "../../shared/components/RawJsonPanel";

const cardCls = "rounded-lg border border-slate-200 bg-white p-4";
const labelCls = "text-xs text-slate-500";
const valueCls = "mt-1 text-sm text-slate-900";

const PddOrderDetailPage: React.FC = () => {
  const { pddOrderId } = useParams<{ pddOrderId: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<PddOrderLedgerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!pddOrderId) {
        setError("缺少 pddOrderId。");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPddOrderLedgerDetail(Number(pddOrderId));
        setDetail(data);
      } catch (err) {
        console.error("load pdd order detail failed", err);
        setError("加载拼多多订单详情失败。");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [pddOrderId]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          onClick={() => navigate("/oms/pdd/orders")}
        >
          返回订单台账
        </button>
        <div>
          <h1 className="text-xl font-semibold">拼多多订单详情</h1>
          <p className="text-sm text-slate-500">
            基于 pdd_orders + pdd_order_items 展示平台订单事实。
          </p>
        </div>
      </div>

      {loading ? <div className={cardCls}>加载中…</div> : null}
      {error ? <div className={cardCls + " text-red-700"}>{error}</div> : null}

      {detail ? (
        <>
          <section className={cardCls}>
            <h2 className="text-base font-semibold text-slate-900">订单头信息</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <div className={labelCls}>店铺ID</div>
                <div className={valueCls}>{detail.store_id}</div>
              </div>
              <div>
                <div className={labelCls}>平台单号</div>
                <div className={valueCls}>{detail.order_sn}</div>
              </div>
              <div>
                <div className={labelCls}>订单状态</div>
                <div className={valueCls}>{detail.order_status || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>成交时间</div>
                <div className={valueCls}>{detail.confirm_at || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>商品金额</div>
                <div className={valueCls}>{detail.goods_amount ?? "—"}</div>
              </div>
              <div>
                <div className={labelCls}>支付金额</div>
                <div className={valueCls}>{detail.pay_amount ?? "—"}</div>
              </div>
              <div>
                <div className={labelCls}>买家留言</div>
                <div className={valueCls}>{detail.buyer_memo || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>商家备注</div>
                <div className={valueCls}>{detail.remark || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>首次拉取</div>
                <div className={valueCls}>{detail.pulled_at || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>最近同步</div>
                <div className={valueCls}>{detail.last_synced_at || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>创建时间</div>
                <div className={valueCls}>{detail.created_at || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>更新时间</div>
                <div className={valueCls}>{detail.updated_at || "—"}</div>
              </div>
            </div>
          </section>

          <section className={cardCls}>
            <h2 className="text-base font-semibold text-slate-900">地址信息</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <div className={labelCls}>收件人</div>
                <div className={valueCls}>{detail.receiver_name || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>联系电话</div>
                <div className={valueCls}>{detail.receiver_phone || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>省</div>
                <div className={valueCls}>{detail.receiver_province || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>市</div>
                <div className={valueCls}>{detail.receiver_city || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>区</div>
                <div className={valueCls}>{detail.receiver_district || "—"}</div>
              </div>
              <div className="md:col-span-3">
                <div className={labelCls}>详细地址</div>
                <div className={valueCls}>{detail.receiver_address || "—"}</div>
              </div>
            </div>
          </section>

          <section className={cardCls}>
            <h2 className="text-base font-semibold text-slate-900">商品明细</h2>
            <div className="mt-4 overflow-auto rounded-lg border border-slate-200">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="px-3 py-2">平台商品ID</th>
                    <th className="px-3 py-2">平台SKU ID</th>
                    <th className="px-3 py-2">商家编码</th>
                    <th className="px-3 py-2">商品名称</th>
                    <th className="px-3 py-2 text-right">数量</th>
                    <th className="px-3 py-2 text-right">单价</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-mono text-xs">{item.platform_goods_id || "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{item.platform_sku_id || "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{item.outer_id || "—"}</td>
                      <td className="px-3 py-2">{item.goods_name || "—"}</td>
                      <td className="px-3 py-2 text-right">{item.goods_count}</td>
                      <td className="px-3 py-2 text-right">{item.goods_price ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <RawJsonPanel title="raw_summary_payload" payload={detail.raw_summary_payload} />
          <RawJsonPanel title="raw_detail_payload" payload={detail.raw_detail_payload} />
        </>
      ) : null}
    </div>
  );
};

export default PddOrderDetailPage;
