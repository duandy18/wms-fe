import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchTaobaoOrderLedgerDetail } from "../api/orders";
import type { TaobaoOrderLedgerDetail } from "../types/orders";
import { RawJsonPanel } from "../../shared/components/RawJsonPanel";

const cardCls = "rounded-lg border border-slate-200 bg-white p-4";
const labelCls = "text-xs text-slate-500";
const valueCls = "mt-1 text-sm text-slate-900";

const TaobaoOrderDetailPage: React.FC = () => {
  const { taobaoOrderId } = useParams<{ taobaoOrderId: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<TaobaoOrderLedgerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!taobaoOrderId) {
        setError("缺少 taobaoOrderId。");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTaobaoOrderLedgerDetail(Number(taobaoOrderId));
        setDetail(data);
      } catch (err) {
        console.error("load taobao order detail failed", err);
        setError("加载淘宝订单详情失败。");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [taobaoOrderId]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          onClick={() => navigate("/oms/taobao/orders")}
        >
          返回订单台账
        </button>
        <div>
          <h1 className="text-xl font-semibold">淘宝订单详情</h1>
          <p className="text-sm text-slate-500">
            基于 taobao_orders + taobao_order_items 展示淘宝平台订单事实。
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
                <div className={labelCls}>淘宝主订单号</div>
                <div className={valueCls}>{detail.tid}</div>
              </div>
              <div>
                <div className={labelCls}>交易状态</div>
                <div className={valueCls}>{detail.status || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>交易类型</div>
                <div className={valueCls}>{detail.type || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>买家昵称</div>
                <div className={valueCls}>{detail.buyer_nick || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>买家 OpenUID</div>
                <div className={valueCls}>{detail.buyer_open_uid || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>买家留言</div>
                <div className={valueCls}>{detail.buyer_memo || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>买家附言</div>
                <div className={valueCls}>{detail.buyer_message || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>卖家备注</div>
                <div className={valueCls}>{detail.seller_memo || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>卖家旗帜</div>
                <div className={valueCls}>{detail.seller_flag ?? "—"}</div>
              </div>
              <div>
                <div className={labelCls}>实付金额</div>
                <div className={valueCls}>{detail.payment ?? "—"}</div>
              </div>
              <div>
                <div className={labelCls}>应付金额</div>
                <div className={valueCls}>{detail.total_fee ?? "—"}</div>
              </div>
              <div>
                <div className={labelCls}>邮费</div>
                <div className={valueCls}>{detail.post_fee ?? "—"}</div>
              </div>
              <div>
                <div className={labelCls}>优惠券金额</div>
                <div className={valueCls}>{detail.coupon_fee ?? "—"}</div>
              </div>
              <div>
                <div className={labelCls}>创建时间</div>
                <div className={valueCls}>{detail.created || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>付款时间</div>
                <div className={valueCls}>{detail.pay_time || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>最后修改时间</div>
                <div className={valueCls}>{detail.modified || "—"}</div>
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
                <div className={labelCls}>创建记录时间</div>
                <div className={valueCls}>{detail.created_at || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>更新时间</div>
                <div className={valueCls}>{detail.updated_at || "—"}</div>
              </div>
            </div>
          </section>

          <section className={cardCls}>
            <h2 className="text-base font-semibold text-slate-900">收件信息</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <div className={labelCls}>收件人</div>
                <div className={valueCls}>{detail.receiver_name || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>手机号</div>
                <div className={valueCls}>{detail.receiver_mobile || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>电话</div>
                <div className={valueCls}>{detail.receiver_phone || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>省</div>
                <div className={valueCls}>{detail.receiver_state || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>市</div>
                <div className={valueCls}>{detail.receiver_city || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>区/县</div>
                <div className={valueCls}>{detail.receiver_district || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>街道</div>
                <div className={valueCls}>{detail.receiver_town || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>邮编</div>
                <div className={valueCls}>{detail.receiver_zip || "—"}</div>
              </div>
              <div className="md:col-span-3">
                <div className={labelCls}>详细地址</div>
                <div className={valueCls}>{detail.receiver_address || "—"}</div>
              </div>
            </div>
          </section>

          <section className={cardCls}>
            <h2 className="text-base font-semibold text-slate-900">子订单明细</h2>
            <div className="mt-4 overflow-auto rounded-lg border border-slate-200">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="px-3 py-2">子订单ID</th>
                    <th className="px-3 py-2">商品ID</th>
                    <th className="px-3 py-2">SKU ID</th>
                    <th className="px-3 py-2">外部商品编码</th>
                    <th className="px-3 py-2">外部SKU编码</th>
                    <th className="px-3 py-2">商品标题</th>
                    <th className="px-3 py-2">SKU属性</th>
                    <th className="px-3 py-2 text-right">数量</th>
                    <th className="px-3 py-2 text-right">单价</th>
                    <th className="px-3 py-2 text-right">实付金额</th>
                    <th className="px-3 py-2 text-right">应付金额</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-mono text-xs">{item.oid}</td>
                      <td className="px-3 py-2 font-mono text-xs">{item.num_iid || "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{item.sku_id || "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{item.outer_iid || "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{item.outer_sku_id || "—"}</td>
                      <td className="px-3 py-2">{item.title || "—"}</td>
                      <td className="px-3 py-2">{item.sku_properties_name || "—"}</td>
                      <td className="px-3 py-2 text-right">{item.num}</td>
                      <td className="px-3 py-2 text-right">{item.price ?? "—"}</td>
                      <td className="px-3 py-2 text-right">{item.payment ?? "—"}</td>
                      <td className="px-3 py-2 text-right">{item.total_fee ?? "—"}</td>
                    </tr>
                  ))}
                  {!detail.items.length ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-slate-500" colSpan={11}>
                        暂无子订单明细。
                      </td>
                    </tr>
                  ) : null}
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

export default TaobaoOrderDetailPage;
