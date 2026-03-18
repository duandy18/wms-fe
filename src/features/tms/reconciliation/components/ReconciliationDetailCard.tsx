// src/features/tms/reconciliation/components/ReconciliationDetailCard.tsx

import React from "react";
import type { ShippingBillReconciliationDetailResponse } from "../types";

interface Props {
  detail: ShippingBillReconciliationDetailResponse | null;
  loading: boolean;
  error: string;
  onClose: () => void;
}

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

function formatNumber(value: number | null): string {
  return value == null ? "-" : String(value);
}

function formatMoney(value: number | null): string {
  return value == null ? "-" : `￥${value.toFixed(2)}`;
}

const ReconciliationDetailCard: React.FC<Props> = ({ detail, loading, error, onClose }) => {
  if (!loading && !error && !detail) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">异常详情</h2>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          onClick={onClose}
        >
          关闭
        </button>
      </div>

      {loading ? <div className="text-sm text-slate-500">正在加载详情…</div> : null}

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {detail ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">异常状态</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {detail.reconciliation.status}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">承运商</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {detail.reconciliation.carrier_code}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">运单号</div>
              <div className="mt-1 font-mono text-sm font-semibold text-slate-900">
                {detail.reconciliation.tracking_no}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">创建时间</div>
              <div className="mt-1 font-mono text-sm font-semibold text-slate-900">
                {formatDateTime(detail.reconciliation.created_at)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">账单明细</div>
              {detail.bill_item ? (
                <div className="space-y-2 text-sm text-slate-700">
                  <div>承运商：{detail.bill_item.carrier_code}</div>
                  <div>账期：{detail.bill_item.bill_month ?? "-"}</div>
                  <div className="font-mono">运单号：{detail.bill_item.tracking_no}</div>
                  <div>业务时间：{formatDateTime(detail.bill_item.business_time)}</div>
                  <div>目的省：{detail.bill_item.destination_province ?? "-"}</div>
                  <div>目的市：{detail.bill_item.destination_city ?? "-"}</div>
                  <div>计费重：{formatNumber(detail.bill_item.billing_weight_kg)}</div>
                  <div>运费：{formatMoney(detail.bill_item.freight_amount)}</div>
                  <div>附加费：{formatMoney(detail.bill_item.surcharge_amount)}</div>
                  <div>总额：{formatMoney(detail.bill_item.total_amount)}</div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">无账单明细。</div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">物流台账</div>
              {detail.shipping_record ? (
                <div className="space-y-2 text-sm text-slate-700">
                  <div>订单号：{detail.shipping_record.order_ref}</div>
                  <div>平台：{detail.shipping_record.platform}</div>
                  <div>店铺：{detail.shipping_record.shop_id}</div>
                  <div>承运商：{detail.shipping_record.carrier_code ?? "-"}</div>
                  <div>承运商名：{detail.shipping_record.carrier_name ?? "-"}</div>
                  <div className="font-mono">
                    运单号：{detail.shipping_record.tracking_no ?? "-"}
                  </div>
                  <div>毛重：{formatNumber(detail.shipping_record.gross_weight_kg)}</div>
                  <div>预估成本：{formatMoney(detail.shipping_record.cost_estimated)}</div>
                  <div>目的省：{detail.shipping_record.dest_province ?? "-"}</div>
                  <div>目的市：{detail.shipping_record.dest_city ?? "-"}</div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">无物流台账。</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">重量差</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {formatNumber(detail.reconciliation.weight_diff_kg)}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">成本差</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {formatMoney(detail.reconciliation.cost_diff)}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">调整金额</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {formatMoney(detail.reconciliation.adjust_amount)}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ReconciliationDetailCard;
