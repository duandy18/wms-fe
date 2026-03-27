import React, { useEffect, useMemo } from "react";

import { useOrdersList } from "@/features/orders/hooks/useOrdersList";
import { useOrderInlineDetail } from "@/features/orders/hooks/useOrderInlineDetail";

import { PlatformOrderMirrorPanel } from "./PlatformOrderMirrorPanel";
import { OrderExplainCard } from "./orderExplain/OrderExplainCard";
import type { OrderExplainCardInput } from "./orderExplain/types";

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function formatNullable(value?: string | number | null): string {
  if (value == null) return "-";
  const s = String(value).trim();
  return s || "-";
}

const OrdersPage: React.FC = () => {
  const { rows, loading, error, loadList } = useOrdersList({ limit: 100 });

  const {
    selectedSummary,
    detailOrder,
    detailLoading,
    detailError,
    loadDetail,
    reloadDetail,
  } = useOrderInlineDetail();

  useEffect(() => {
    if (selectedSummary) return;
    if (rows.length <= 0) return;
    void loadDetail(rows[0]);
  }, [rows, selectedSummary, loadDetail]);

  const explainInput = useMemo<OrderExplainCardInput | null>(() => {
    if (!selectedSummary) return null;
    return {
      orderId: selectedSummary.id,
      platform: selectedSummary.platform,
      store_id: selectedSummary.store_id ?? null,
      ext_order_no: selectedSummary.ext_order_no,
      shop_id: selectedSummary.shop_id || undefined,
    };
  }, [selectedSummary]);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">订单解析</h1>
        <p className="mt-1 text-sm text-slate-500">
          当前页先接真实订单列表选择态。左侧选订单，右侧查看解析结果与平台订单镜像；后续再继续补人工处理、确认建单等能力。
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-900">订单列表</div>
              <div className="mt-1 text-xs text-slate-500">
                当前默认拉取未发运订单，点击一行查看右侧解析结果。
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadList()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            >
              刷新
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
                订单列表加载中...
              </div>
            ) : rows.length <= 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
                暂无可解析订单
              </div>
            ) : (
              rows.map((row) => {
                const active = selectedSummary?.id === row.id;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => void loadDetail(row)}
                    className={[
                      "block w-full rounded-xl border px-3 py-3 text-left transition",
                      active
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-slate-900">
                        {formatNullable(row.ext_order_no)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatNullable(row.platform)}
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] text-slate-600">
                      <div>
                        <span className="text-slate-400">shop：</span>
                        {formatNullable(row.shop_id)}
                      </div>
                      <div>
                        <span className="text-slate-400">store_id：</span>
                        {formatNullable(row.store_id)}
                      </div>
                      <div>
                        <span className="text-slate-400">状态：</span>
                        {formatNullable(row.status)}
                      </div>
                      <div>
                        <span className="text-slate-400">履约：</span>
                        {formatNullable(row.fulfillment_status)}
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400">
                      创建时间：{formatDateTime(row.created_at)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <div className="space-y-4">
          <OrderExplainCard input={explainInput} />

          <PlatformOrderMirrorPanel
            summary={selectedSummary}
            detailOrder={detailOrder}
            loading={detailLoading}
            error={detailError}
            onReload={() => void reloadDetail()}
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
