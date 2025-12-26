// src/features/orders/page/components/OrderDetailCard.tsx

import React from "react";
import { UI } from "../ui";
import { formatTs, statusPillClass } from "../utils";
import type { OrderSummary, OrderFacts, OrderView } from "../../api";

function renderStatus(status?: string | null) {
  if (!status) return <span className={statusPillClass(null)}>-</span>;
  return <span className={statusPillClass(status)}>{status}</span>;
}

export const OrderDetailCard: React.FC<{
  selectedSummary: OrderSummary;

  detailOrder: OrderView["order"] | null;

  detailFacts: Array<OrderFacts["items"][number]>;
  detailTotals: { ordered: number; shipped: number; returned: number; remaining: number };

  detailLoading: boolean;
  detailError: string | null;

  devConsoleHref: string;

  onClose: () => void;
}> = ({ selectedSummary, detailOrder, detailFacts, detailTotals, detailLoading, detailError, devConsoleHref, onClose }) => {
  return (
    <section className={UI.card}>
      <div className={UI.detailHeadRow}>
        <div>
          <h2 className={UI.detailTitle}>订单详情（当前选中）</h2>
          <div className={UI.hint}>
            {selectedSummary.platform}/{selectedSummary.shop_id} · <span className={UI.mono11}>{selectedSummary.ext_order_no}</span>
          </div>
        </div>

        <div className={UI.detailActions}>
          <button type="button" onClick={onClose} className={UI.pillBtn}>
            关闭详情
          </button>
          <a href={devConsoleHref} className={UI.devLink}>
            在 DevConsole 中诊断
          </a>
        </div>
      </div>

      {detailLoading ? <div className={UI.hint}>正在加载订单详情…</div> : null}
      {detailError ? <div className={UI.err}>{detailError}</div> : null}

      {detailOrder ? (
        <>
          <div className={UI.grid3}>
            <div>
              <div className={UI.label11}>平台 / 店铺</div>
              <div>
                {detailOrder.platform}/{detailOrder.shop_id}
              </div>
            </div>

            <div>
              <div className={UI.label11}>外部订单号</div>
              <div className={UI.mono11}>{detailOrder.ext_order_no}</div>
            </div>

            <div>
              <div className={UI.label11}>状态</div>
              <div>{renderStatus(detailOrder.status)}</div>
            </div>

            <div>
              <div className={UI.label11}>仓库 ID</div>
              <div>{detailOrder.warehouse_id ?? "-"}</div>
            </div>

            <div>
              <div className={UI.label11}>金额 / 实付</div>
              <div className={UI.mono11}>
                {detailOrder.order_amount ?? "-"} / {detailOrder.pay_amount ?? "-"}
              </div>
            </div>

            <div>
              <div className={UI.label11}>创建时间</div>
              <div>{formatTs(detailOrder.created_at)}</div>
            </div>
          </div>

          {detailFacts.length > 0 ? (
            <div className="mt-3 space-y-2">
              <div className={UI.factsHead}>
                <h3 className={UI.factsTitle}>行事实（下单 / 发货 / 退货 / 剩余可退）</h3>
                <div className={UI.factsMeta}>
                  共 {detailFacts.length} 行 · 合计：下单 {detailTotals.ordered} / 发货 {detailTotals.shipped} / 退货 {detailTotals.returned} / 可退{" "}
                  {detailTotals.remaining}
                </div>
              </div>

              <div className={UI.factsWrap}>
                <table className={UI.factsTable}>
                  <thead className={UI.factsThead}>
                    <tr>
                      <th className={UI.factsTd}>Item ID</th>
                      <th className={UI.factsTd}>标题</th>
                      <th className={`${UI.factsTd} text-right`}>下单</th>
                      <th className={`${UI.factsTd} text-right`}>已发货</th>
                      <th className={`${UI.factsTd} text-right`}>已退货</th>
                      <th className={`${UI.factsTd} text-right`}>剩余可退</th>
                    </tr>
                  </thead>

                  <tbody>
                    {detailFacts.map((f) => (
                      <tr key={f.item_id} className={UI.factsTr}>
                        <td className={UI.factsTdMono}>{f.item_id}</td>
                        <td className={UI.factsTd}>{f.title ?? f.sku_id ?? "-"}</td>
                        <td className={`${UI.factsTd} text-right`}>{f.qty_ordered}</td>
                        <td className={`${UI.factsTd} text-right`}>{f.qty_shipped}</td>
                        <td className={`${UI.factsTd} text-right`}>{f.qty_returned}</td>
                        <td className={`${UI.factsTd} text-right`}>
                          <span className={f.qty_remaining_refundable > 0 ? "font-semibold text-emerald-700" : "text-slate-500"}>
                            {f.qty_remaining_refundable}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
};

export default OrderDetailCard;
