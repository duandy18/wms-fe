import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ComboComponentsView } from "../../../shared/components/ComboComponentsView";
import { RawPayloadPanel } from "../../../shared/components/RawPayloadPanel";
import { StatusBadge } from "../../../shared/components/StatusBadge";
import { poiUi } from "../../../shared/ui";
import { fetchPddNativeOrderDetail, fetchPddNativeOrders } from "../api/pddNativeOrdersApi";
import type { PddOrderLedgerDetail, PddOrderLedgerRow } from "../contracts/pddNativeOrders";

function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function FieldView(props: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <div className={poiUi.label}>{props.label}</div>
      <div className={poiUi.value}>{displayValue(props.value)}</div>
    </div>
  );
}

const PddNativeOrdersPage: React.FC = () => {
  const [rows, setRows] = useState<PddOrderLedgerRow[]>([]);
  const [detail, setDetail] = useState<PddOrderLedgerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRows() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPddNativeOrders({ limit: 200, offset: 0 });
      setRows(data);
      if (data.length > 0 && detail === null) {
        await loadDetail(data[0].id);
      }
    } catch (err) {
      console.error("load pdd native orders failed", err);
      setError(err instanceof Error ? err.message : "加载拼多多原生订单台账失败");
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(orderId: number) {
    setDetailLoading(true);
    setError(null);
    try {
      const data = await fetchPddNativeOrderDetail(orderId);
      setDetail(data);
    } catch (err) {
      console.error("load pdd native order detail failed", err);
      setError(err instanceof Error ? err.message : "加载拼多多原生订单详情失败");
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    void loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={poiUi.page}>
      <section className={poiUi.hero}>
        <div className={poiUi.pill}>拼多多</div>
        <h1 className={poiUi.heroTitle}>拼多多原生订单台账</h1>
        <p className={poiUi.heroDesc}>
          本页只核对拼多多原生订单事实，展示已经落库的平台订单头、商品行、原始载荷和组合商品信息。
          不做内部订单创建，不做商品映射，不接财务事实表。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/platform-order-ingestion/pdd/collect"
            className={poiUi.secondaryLink}
          >
            返回拼多多订单采集
          </Link>
          <Link to="/platform-order-ingestion" className={poiUi.secondaryLink}>
            返回采集总览
          </Link>
          <button
            type="button"
            className={poiUi.secondaryButton}
            disabled={loading}
            onClick={() => void loadRows()}
          >
            刷新台账
          </button>
        </div>
      </section>

      {error ? <div className={poiUi.error}>{error}</div> : null}

      <section className={poiUi.card}>
        <h2 className={poiUi.cardTitle}>原生订单列表</h2>
        <p className={poiUi.cardDesc}>
          数据来自 pdd_orders。点击订单行查看订单头、地址、商品行和原始 payload。
        </p>

        <div className="mt-4 overflow-auto rounded-2xl border border-slate-200">
          <table className={poiUi.table}>
            <thead>
              <tr>
                <th className={poiUi.th}>ID</th>
                <th className={poiUi.th}>店铺ID</th>
                <th className={poiUi.th}>平台单号</th>
                <th className={poiUi.th}>订单状态</th>
                <th className={poiUi.th}>成交时间</th>
                <th className={poiUi.th}>货品金额</th>
                <th className={poiUi.th}>实付金额</th>
                <th className={poiUi.th}>首次拉取</th>
                <th className={poiUi.th}>最近同步</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => void loadDetail(row.id)}
                >
                  <td className={poiUi.td}>{row.id}</td>
                  <td className={poiUi.td}>{row.store_id}</td>
                  <td className={`${poiUi.td} font-mono text-xs`}>{row.order_sn}</td>
                  <td className={poiUi.td}><StatusBadge value={row.order_status} /></td>
                  <td className={poiUi.td}>{displayValue(row.confirm_at)}</td>
                  <td className={poiUi.td}>{displayValue(row.goods_amount)}</td>
                  <td className={poiUi.td}>{displayValue(row.pay_amount)}</td>
                  <td className={poiUi.td}>{displayValue(row.pulled_at)}</td>
                  <td className={poiUi.td}>{displayValue(row.last_synced_at)}</td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td className={poiUi.td} colSpan={9}>
                    {loading ? "加载中…" : "暂无拼多多原生订单。"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {detail ? (
        <>
          <section className={poiUi.card}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className={poiUi.cardTitle}>订单详情</h2>
                <p className={poiUi.cardDesc}>
                  当前订单：{detail.order_sn}
                  {detailLoading ? "（刷新中…）" : ""}
                </p>
              </div>
              <StatusBadge value={detail.order_status} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <FieldView label="订单ID" value={detail.id} />
              <FieldView label="店铺ID" value={detail.store_id} />
              <FieldView label="平台单号" value={detail.order_sn} />
              <FieldView label="成交时间" value={detail.confirm_at} />
              <FieldView label="货品金额" value={detail.goods_amount} />
              <FieldView label="实付金额" value={detail.pay_amount} />
              <FieldView label="首次拉取" value={detail.pulled_at} />
              <FieldView label="最近同步" value={detail.last_synced_at} />
              <FieldView label="更新时间" value={detail.updated_at} />
            </div>
          </section>

          <section className={poiUi.card}>
            <h2 className={poiUi.cardTitle}>地址信息</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <FieldView label="收件人" value={detail.receiver_name} />
              <FieldView label="电话" value={detail.receiver_phone} />
              <FieldView label="省" value={detail.receiver_province} />
              <FieldView label="市" value={detail.receiver_city} />
              <FieldView label="区县" value={detail.receiver_district} />
              <FieldView label="买家留言" value={detail.buyer_memo} />
              <div className="md:col-span-3">
                <FieldView label="详细地址" value={detail.receiver_address} />
              </div>
              <div className="md:col-span-3">
                <FieldView label="商家备注" value={detail.remark} />
              </div>
            </div>
          </section>

          <section className={poiUi.card}>
            <h2 className={poiUi.cardTitle}>商品明细</h2>
            <p className={poiUi.cardDesc}>
              数据来自 pdd_order_items。组合商品只展示平台原生 combo_components，不做内部 SKU 映射。
            </p>

            <div className="mt-4 overflow-auto rounded-2xl border border-slate-200">
              <table className={poiUi.table}>
                <thead>
                  <tr>
                    <th className={poiUi.th}>商品ID</th>
                    <th className={poiUi.th}>SKU ID</th>
                    <th className={poiUi.th}>商家编码</th>
                    <th className={poiUi.th}>商品名</th>
                    <th className={poiUi.th}>数量</th>
                    <th className={poiUi.th}>单价</th>
                    <th className={poiUi.th}>组合成分</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr key={item.id}>
                      <td className={`${poiUi.td} font-mono text-xs`}>
                        {displayValue(item.platform_goods_id)}
                      </td>
                      <td className={`${poiUi.td} font-mono text-xs`}>
                        {displayValue(item.platform_sku_id)}
                      </td>
                      <td className={`${poiUi.td} font-mono text-xs`}>
                        {displayValue(item.outer_id)}
                      </td>
                      <td className={poiUi.td}>{displayValue(item.goods_name)}</td>
                      <td className={poiUi.td}>{item.goods_count}</td>
                      <td className={poiUi.td}>{displayValue(item.goods_price)}</td>
                      <td className={poiUi.td}>
                        <ComboComponentsView payload={item.raw_item_payload} />
                      </td>
                    </tr>
                  ))}
                  {!detail.items.length ? (
                    <tr>
                      <td className={poiUi.td} colSpan={7}>
                        暂无商品明细。
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <RawPayloadPanel
            title="raw_summary_payload"
            payload={detail.raw_summary_payload}
          />
          <RawPayloadPanel
            title="raw_detail_payload"
            payload={detail.raw_detail_payload}
          />
        </>
      ) : null}
    </div>
  );
};

export default PddNativeOrdersPage;
