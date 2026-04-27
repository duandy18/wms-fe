import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ComboComponentsView } from "../../../shared/components/ComboComponentsView";
import { RawPayloadPanel } from "../../../shared/components/RawPayloadPanel";
import { StatusBadge } from "../../../shared/components/StatusBadge";
import { poiUi } from "../../../shared/ui";
import {
  fetchJdNativeOrderDetail,
  fetchJdNativeOrders,
} from "../api/jdNativeOrdersApi";
import type {
  JdOrderLedgerDetail,
  JdOrderLedgerRow,
} from "../contracts/jdNativeOrders";

function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function FieldView(props: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <div className={poiUi.label}>{props.label}</div>
      <div className={poiUi.value}>{displayValue(props.value)}</div>
    </div>
  );
}

function hasComboComponents(payload: unknown): boolean {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }

  const comboComponents = (payload as { combo_components?: unknown }).combo_components;
  return Array.isArray(comboComponents) && comboComponents.length > 0;
}

const JdNativeOrdersPage: React.FC = () => {
  const [rows, setRows] = useState<JdOrderLedgerRow[]>([]);
  const [detail, setDetail] = useState<JdOrderLedgerDetail | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRows() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJdNativeOrders({ limit: 200, offset: 0 });
      setRows(data);
    } catch (err) {
      console.error("load jd native orders failed", err);
      setError(err instanceof Error ? err.message : "加载京东原生订单台账失败");
    } finally {
      setLoading(false);
    }
  }

  async function toggleDetail(orderId: number) {
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null);
      setDetail(null);
      return;
    }

    setSelectedOrderId(orderId);
    setDetail(null);
    setDetailLoading(true);
    setError(null);

    try {
      const data = await fetchJdNativeOrderDetail(orderId);
      setDetail(data);
    } catch (err) {
      console.error("load jd native order detail failed", err);
      setError(err instanceof Error ? err.message : "加载京东原生订单详情失败");
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    void loadRows();
  }, []);

  return (
    <div className={poiUi.page}>
      <section className={poiUi.hero}>
        <div className={poiUi.pill}>京东</div>
        <h1 className={poiUi.heroTitle}>京东原生订单台账</h1>
        <p className={poiUi.heroDesc}>
          本页只核对京东原生订单事实，展示已经落库的平台订单头、商品行、原始载荷和组合商品信息。
          不做内部订单创建，不做商品映射，不接财务事实表。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/platform-order-ingestion/jd/collect"
            className={poiUi.secondaryLink}
          >
            返回京东订单采集
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className={poiUi.cardTitle}>原生订单列表</h2>
            <p className={poiUi.cardDesc}>
              数据来自 jd_orders。点击订单行会在该行下方展开订单头、地址、商品明细和原始 payload。
            </p>
          </div>
          {selectedOrderId ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              当前展开订单 ID：
              <span className="font-mono text-slate-900">{selectedOrderId}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 overflow-auto rounded-2xl border border-slate-200">
          <table className={poiUi.table}>
            <thead>
              <tr>
                <th className={poiUi.th}>ID</th>
                <th className={poiUi.th}>店铺ID</th>
                <th className={poiUi.th}>平台单号</th>
                <th className={poiUi.th}>订单状态</th>
                <th className={poiUi.th}>订单类型</th>
                <th className={poiUi.th}>下单时间</th>
                <th className={poiUi.th}>修改时间</th>
                <th className={poiUi.th}>订单总额</th>
                <th className={poiUi.th}>商家应收</th>
                <th className={poiUi.th}>最近同步</th>
                <th className={poiUi.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const active = selectedOrderId === row.id;

                return (
                  <React.Fragment key={row.id}>
                    <tr
                      className={`cursor-pointer hover:bg-slate-50 ${
                        active ? "bg-slate-100" : ""
                      }`}
                      onClick={() => void toggleDetail(row.id)}
                    >
                      <td className={poiUi.td}>{row.id}</td>
                      <td className={poiUi.td}>{row.store_id}</td>
                      <td className={`${poiUi.td} font-mono text-xs`}>
                        {row.order_id}
                      </td>
                      <td className={poiUi.td}>
                        <StatusBadge value={row.order_state} />
                      </td>
                      <td className={poiUi.td}>{displayValue(row.order_type)}</td>
                      <td className={poiUi.td}>{displayValue(row.order_start_time)}</td>
                      <td className={poiUi.td}>{displayValue(row.modified)}</td>
                      <td className={poiUi.td}>{displayValue(row.order_total_price)}</td>
                      <td className={poiUi.td}>{displayValue(row.order_seller_price)}</td>
                      <td className={poiUi.td}>{displayValue(row.last_synced_at)}</td>
                      <td className={poiUi.td}>
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          aria-expanded={active}
                          onClick={(event) => {
                            event.stopPropagation();
                            void toggleDetail(row.id);
                          }}
                        >
                          {active ? "收起" : "展开"}
                        </button>
                      </td>
                    </tr>

                    {active ? (
                      <tr>
                        <td className="border-b border-slate-200 bg-slate-50 p-4" colSpan={11}>
                          {detailLoading ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                              正在加载订单详情…
                            </div>
                          ) : null}

                          {!detailLoading && detail ? (
                            <div className="space-y-4">
                              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                  <div>
                                    <h3 className={poiUi.cardTitle}>订单头信息</h3>
                                    <p className={poiUi.cardDesc}>
                                      平台订单号：{detail.order_id}
                                    </p>
                                  </div>
                                  <StatusBadge value={detail.order_state} />
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                  <FieldView label="订单ID" value={detail.id} />
                                  <FieldView label="店铺ID" value={detail.store_id} />
                                  <FieldView label="平台单号" value={detail.order_id} />
                                  <FieldView label="商家ID" value={detail.vender_id} />
                                  <FieldView label="订单类型" value={detail.order_type} />
                                  <FieldView label="订单状态" value={detail.order_state} />
                                  <FieldView label="买家标识" value={detail.buyer_pin} />
                                  <FieldView label="订单总额" value={detail.order_total_price} />
                                  <FieldView label="商家应收" value={detail.order_seller_price} />
                                  <FieldView label="运费" value={detail.freight_price} />
                                  <FieldView label="付款确认" value={detail.payment_confirm} />
                                  <FieldView label="下单时间" value={detail.order_start_time} />
                                  <FieldView label="订单结束时间" value={detail.order_end_time} />
                                  <FieldView label="修改时间" value={detail.modified} />
                                  <FieldView label="最近同步" value={detail.last_synced_at} />
                                </div>
                              </section>

                              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                                <h3 className={poiUi.cardTitle}>地址信息</h3>
                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                  <FieldView label="收件人" value={detail.consignee_name} />
                                  <FieldView label="手机号" value={detail.consignee_mobile} />
                                  <FieldView label="电话" value={detail.consignee_phone} />
                                  <FieldView label="省" value={detail.consignee_province} />
                                  <FieldView label="市" value={detail.consignee_city} />
                                  <FieldView label="区县" value={detail.consignee_county} />
                                  <FieldView label="街道/镇" value={detail.consignee_town} />
                                  <div className="md:col-span-3">
                                    <FieldView label="详细地址" value={detail.consignee_address} />
                                  </div>
                                  <div className="md:col-span-3">
                                    <FieldView label="订单备注" value={detail.order_remark} />
                                  </div>
                                  <div className="md:col-span-3">
                                    <FieldView label="卖家备注" value={detail.seller_remark} />
                                  </div>
                                </div>
                              </section>

                              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                                <h3 className={poiUi.cardTitle}>商品明细</h3>
                                <p className={poiUi.cardDesc}>
                                  数据来自 jd_order_items。组合商品只展示平台原生 combo_components，不做内部 SKU 映射。
                                </p>

                                <div className="mt-4 overflow-auto rounded-2xl border border-slate-200">
                                  <table className={poiUi.table}>
                                    <thead>
                                      <tr>
                                        <th className={poiUi.th}>SKU ID</th>
                                        <th className={poiUi.th}>外部SKU编码</th>
                                        <th className={poiUi.th}>商品ID</th>
                                        <th className={poiUi.th}>商品名</th>
                                        <th className={poiUi.th}>规格</th>
                                        <th className={poiUi.th}>数量</th>
                                        <th className={poiUi.th}>单价</th>
                                        <th className={poiUi.th}>赠品标识</th>
                                        <th className={poiUi.th}>组合成分</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detail.items.map((item) => (
                                        <tr
                                          key={item.id}
                                          className={
                                            hasComboComponents(item.raw_item_payload)
                                              ? "bg-amber-50/40"
                                              : ""
                                          }
                                        >
                                          <td className={`${poiUi.td} font-mono text-xs`}>
                                            {displayValue(item.sku_id)}
                                          </td>
                                          <td className={`${poiUi.td} font-mono text-xs`}>
                                            {displayValue(item.outer_sku_id)}
                                          </td>
                                          <td className={`${poiUi.td} font-mono text-xs`}>
                                            {displayValue(item.ware_id)}
                                          </td>
                                          <td className={poiUi.td}>{displayValue(item.item_name)}</td>
                                          <td className={poiUi.td}>{displayValue(item.sku_name)}</td>
                                          <td className={poiUi.td}>{item.item_total}</td>
                                          <td className={poiUi.td}>{displayValue(item.item_price)}</td>
                                          <td className={poiUi.td}>{displayValue(item.gift_point)}</td>
                                          <td className={poiUi.td}>
                                            <ComboComponentsView payload={item.raw_item_payload} />
                                          </td>
                                        </tr>
                                      ))}
                                      {!detail.items.length ? (
                                        <tr>
                                          <td className={poiUi.td} colSpan={9}>
                                            暂无商品明细。
                                          </td>
                                        </tr>
                                      ) : null}
                                    </tbody>
                                  </table>
                                </div>
                              </section>

                              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                <RawPayloadPanel
                                  title="raw_summary_payload"
                                  payload={detail.raw_summary_payload}
                                />
                                <RawPayloadPanel
                                  title="raw_detail_payload"
                                  payload={detail.raw_detail_payload}
                                />
                              </div>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}

              {!rows.length ? (
                <tr>
                  <td className={poiUi.td} colSpan={11}>
                    {loading ? "加载中…" : "暂无京东原生订单。"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default JdNativeOrdersPage;
