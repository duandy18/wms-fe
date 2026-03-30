import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchJdOrderLedgerDetail } from "../api/orders";
import type { JdOrderLedgerDetail } from "../types/orders";
import { RawJsonPanel } from "../../shared/components/RawJsonPanel";

const cardCls = "rounded-lg border border-slate-200 bg-white p-4";
const labelCls = "text-xs text-slate-500";
const valueCls = "mt-1 text-sm text-slate-900";

const JdOrderDetailPage: React.FC = () => {
  const { jdOrderId } = useParams<{ jdOrderId: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<JdOrderLedgerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!jdOrderId) {
        setError("缺少 jdOrderId。");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchJdOrderLedgerDetail(Number(jdOrderId));
        setDetail(data);
      } catch (err) {
        console.error("load jd order detail failed", err);
        setError("加载京东订单详情失败。");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [jdOrderId]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          onClick={() => navigate("/oms/jd/orders")}
        >
          返回订单台账
        </button>
        <div>
          <h1 className="text-xl font-semibold">京东订单详情</h1>
          <p className="text-sm text-slate-500">
            基于 jd_orders + jd_order_items 展示京东平台订单事实。
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
                <div className={labelCls}>京东主订单号</div>
                <div className={valueCls}>{detail.order_id}</div>
              </div>
              <div>
                <div className={labelCls}>商家ID</div>
                <div className={valueCls}>{detail.vender_id || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>订单状态</div>
                <div className={valueCls}>{detail.order_state || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>订单类型</div>
                <div className={valueCls}>{detail.order_type || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>买家标识</div>
                <div className={valueCls}>{detail.buyer_pin || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>订单备注</div>
                <div className={valueCls}>{detail.order_remark || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>卖家备注</div>
                <div className={valueCls}>{detail.seller_remark || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>付款确认</div>
                <div className={valueCls}>{detail.payment_confirm || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>订单总金额</div>
                <div className={valueCls}>{detail.order_total_price ?? "—"}</div>
              </div>
              <div>
                <div className={labelCls}>商家应收</div>
                <div className={valueCls}>{detail.order_seller_price ?? "—"}</div>
              </div>
              <div>
                <div className={labelCls}>运费金额</div>
                <div className={valueCls}>{detail.freight_price ?? "—"}</div>
              </div>
              <div>
                <div className={labelCls}>下单时间</div>
                <div className={valueCls}>{detail.order_start_time || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>结束时间</div>
                <div className={valueCls}>{detail.order_end_time || "—"}</div>
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
                <div className={valueCls}>{detail.consignee_name || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>手机号</div>
                <div className={valueCls}>{detail.consignee_mobile || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>电话</div>
                <div className={valueCls}>{detail.consignee_phone || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>省</div>
                <div className={valueCls}>{detail.consignee_province || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>市</div>
                <div className={valueCls}>{detail.consignee_city || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>区/县</div>
                <div className={valueCls}>{detail.consignee_county || "—"}</div>
              </div>
              <div>
                <div className={labelCls}>街道/镇</div>
                <div className={valueCls}>{detail.consignee_town || "—"}</div>
              </div>
              <div className="md:col-span-3">
                <div className={labelCls}>详细地址</div>
                <div className={valueCls}>{detail.consignee_address || "—"}</div>
              </div>
            </div>
          </section>

          <section className={cardCls}>
            <h2 className="text-base font-semibold text-slate-900">商品明细</h2>
            <div className="mt-4 overflow-auto rounded-lg border border-slate-200">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="px-3 py-2">SKU ID</th>
                    <th className="px-3 py-2">外部SKU编码</th>
                    <th className="px-3 py-2">商品ID</th>
                    <th className="px-3 py-2">商品名称</th>
                    <th className="px-3 py-2">SKU描述</th>
                    <th className="px-3 py-2 text-right">数量</th>
                    <th className="px-3 py-2 text-right">单价</th>
                    <th className="px-3 py-2 text-right">赠品标识</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-mono text-xs">{item.sku_id || "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{item.outer_sku_id || "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{item.ware_id || "—"}</td>
                      <td className="px-3 py-2">{item.item_name || "—"}</td>
                      <td className="px-3 py-2">{item.sku_name || "—"}</td>
                      <td className="px-3 py-2 text-right">{item.item_total}</td>
                      <td className="px-3 py-2 text-right">{item.item_price ?? "—"}</td>
                      <td className="px-3 py-2 text-right">{item.gift_point ?? "—"}</td>
                    </tr>
                  ))}
                  {!detail.items.length ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-slate-500" colSpan={8}>
                        暂无商品明细。
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

export default JdOrderDetailPage;
