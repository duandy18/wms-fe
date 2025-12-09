// src/features/orders/OrderDetailPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import {
  fetchOrderFacts,
  fetchOrderView,
  type OrderFacts,
  type OrderView,
} from "./api";
import {
  reconcileOrderById,
  type DevOrderReconcileResult,
} from "../dev/orders/api";
import { createReceiveTaskFromOrder } from "../receive-tasks/api";

const formatTs = (ts: string | null | undefined) =>
  ts ? ts.replace("T", " ").replace("Z", "") : "-";

type NavState =
  | undefined
  | {
      orderId?: number;
      platform?: string;
      shopId?: string;
      extOrderNo?: string;
    };

type ApiErrorShape = {
  message?: string;
  response?: {
    data?: {
      detail?: string;
    };
  };
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.response?.data?.detail ?? e?.message ?? fallback;
};

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const navState = (location.state as NavState) || {};
  const orderIdNum = orderId ? Number(orderId) : NaN;

  const [orderView, setOrderView] = useState<OrderView | null>(null);
  const [facts, setFacts] = useState<OrderFacts | null>(null);
  const [reconcile, setReconcile] =
    useState<DevOrderReconcileResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [creatingRma, setCreatingRma] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platform = navState.platform;
  const shopId = navState.shopId;
  const extOrderNo = navState.extOrderNo;

  const order = orderView?.order ?? null;
  const traceId = order?.trace_id ?? facts?.order.trace_id ?? null;

  const hasRemainingRefundable = useMemo(() => {
    if (!facts?.items?.length) return false;
    return facts.items.some((i) => i.qty_remaining_refundable > 0);
  }, [facts]);

  const totals = useMemo(() => {
    if (!facts?.items?.length) {
      return {
        ordered: 0,
        shipped: 0,
        returned: 0,
        remaining: 0,
      };
    }
    return facts.items.reduce(
      (acc, f) => {
        acc.ordered += f.qty_ordered;
        acc.shipped += f.qty_shipped;
        acc.returned += f.qty_returned;
        acc.remaining += f.qty_remaining_refundable;
        return acc;
      },
      { ordered: 0, shipped: 0, returned: 0, remaining: 0 },
    );
  }, [facts]);

  async function load() {
    if (!Number.isFinite(orderIdNum)) {
      setError("URL 中的 orderId 无效。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let plat = platform;
      let shop = shopId;
      let ext = extOrderNo;

      // 如果没有带上平台信息，用对账接口补一遍
      if (!plat || !shop || !ext) {
        const recon = await reconcileOrderById(orderIdNum);
        plat = recon.platform;
        shop = recon.shop_id;
        ext = recon.ext_order_no;
      }

      if (!plat || !shop || !ext) {
        throw new Error("缺少平台/店铺/外部订单号信息。");
      }

      const ov = await fetchOrderView({
        platform: plat,
        shopId: shop,
        extOrderNo: ext,
      });
      setOrderView(ov);

      const of = await fetchOrderFacts({
        platform: plat,
        shopId: shop,
        extOrderNo: ext,
      });
      setFacts(of);
    } catch (err) {
      console.error("load order detail failed", err);
      setError(getErrorMessage(err, "加载订单详情失败"));
      setOrderView(null);
      setFacts(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function handleReconcile() {
    if (!Number.isFinite(orderIdNum)) return;
    setReconcileLoading(true);
    setError(null);
    try {
      const res = await reconcileOrderById(orderIdNum);
      setReconcile(res);
    } catch (err) {
      console.error("reconcileOrderById failed", err);
      setError(getErrorMessage(err, "对账失败"));
      setReconcile(null);
    } finally {
      setReconcileLoading(false);
    }
  }

  async function handleCreateRma() {
    if (!order || !facts || !facts.items?.length) return;

    const candidates = facts.items.filter(
      (i) => i.qty_remaining_refundable > 0,
    );
    if (!candidates.length) {
      setError("该订单当前没有剩余可退数量。");
      return;
    }

    setCreatingRma(true);
    setError(null);
    try {
      const payload = {
        warehouse_id: order.warehouse_id ?? 1,
        lines: candidates.map((f) => ({
          item_id: f.item_id,
          qty: f.qty_remaining_refundable,
          item_name: f.title ?? null,
          batch_code: null as string | null,
        })),
      };

      const task = await createReceiveTaskFromOrder(order.id, payload);
      navigate(`/receive-tasks/${task.id}`);
    } catch (err) {
      console.error("createReceiveTaskFromOrder failed", err);
      setError(getErrorMessage(err, "创建退货任务失败"));
    } finally {
      setCreatingRma(false);
    }
  }

  function makeOrderRef() {
    if (!order) return null;
    const plat = (order.platform || "").toUpperCase();
    return `ORD:${plat}:${order.shop_id}:${order.ext_order_no}`;
  }

  function handleViewStock(itemId: number) {
    if (!order) return;
    const wid = order.warehouse_id ?? "";
    const qs = new URLSearchParams();
    qs.set("item_id", String(itemId));
    if (wid) qs.set("warehouse_id", String(wid));
    navigate(`/tools/stocks?${qs.toString()}`);
  }

  function handleViewLedger() {
    const ref = makeOrderRef();
    if (!ref) return;
    const qs = new URLSearchParams();
    qs.set("ref", ref);
    if (traceId) qs.set("trace_id", traceId);
    navigate(`/tools/ledger?${qs.toString()}`);
  }

  function handleViewTrace() {
    if (!traceId) return;
    const qs = new URLSearchParams();
    qs.set("trace_id", traceId);
    navigate(`/trace?${qs.toString()}`);
  }

  return (
    <div className="p-6 space-y-5">
      <PageTitle
        title={`订单详情 #${orderId}`}
        description="订单头信息、行事实（数量四件套）以及退货 / 对账 / 链路 / 库存 / 台账入口。"
      />

      <button
        type="button"
        className="mb-2 text-xs text-slate-600 hover:text-slate-900"
        onClick={() => navigate("/orders")}
      >
        ← 返回订单列表
      </button>

      {loading && (
        <div className="text-sm text-slate-500">加载中…</div>
      )}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {order && (
        <>
          {/* 头部信息 */}
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800">
                基本信息
              </h2>
              <div className="text-xs text-slate-500">
                创建时间：{formatTs(order.created_at)}，状态：
                <span className="font-medium">
                  {order.status ?? "-"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-2 gap-x-8 md:grid-cols-3">
              <div>
                <div className="text-[11px] text-slate-500">
                  平台 / 店铺
                </div>
                <div>
                  {order.platform}/{order.shop_id}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">
                  外部订单号
                </div>
                <div className="font-mono text-[12px]">
                  {order.ext_order_no}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">
                  仓库 ID
                </div>
                <div>{order.warehouse_id ?? "-"}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">
                  金额 / 实付
                </div>
                <div className="font-mono text-[12px]">
                  {order.order_amount ?? "-"} /{" "}
                  {order.pay_amount ?? "-"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">
                  trace_id
                </div>
                <div className="font-mono text-[11px]">
                  {traceId ?? "（暂无）"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">
                  退货状态提示
                </div>
                <div className="text-[11px]">
                  {hasRemainingRefundable ? (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                      该订单仍有剩余可退数量
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      无剩余可退（或尚未发货）
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              {traceId && (
                <button
                  type="button"
                  onClick={handleViewTrace}
                  className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
                >
                  查看链路（Trace 页）
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleReconcile()}
                disabled={reconcileLoading}
                className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100 disabled:opacity-60"
              >
                {reconcileLoading ? "对账中…" : "事实对账（仅查看）"}
              </button>
              {hasRemainingRefundable && (
                <button
                  type="button"
                  onClick={() => void handleCreateRma()}
                  disabled={creatingRma}
                  className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60"
                >
                  {creatingRma
                    ? "创建退货任务中…"
                    : "从订单创建退货任务（RMA）"}
                </button>
              )}
              {order && (
                <button
                  type="button"
                  onClick={handleViewLedger}
                  className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
                >
                  查看账本（按 ORD:ref）
                </button>
              )}
            </div>
          </section>

          {/* 行事实 */}
          {facts && (
            <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">
                  行事实（下单 / 发货 / 退货 / 剩余可退）
                </h2>
                <div className="text-xs text-slate-500">
                  共 {facts.items.length} 行 · 合计：
                  <span className="ml-1 font-mono text-[11px]">
                    下单 {totals.ordered} / 发货 {totals.shipped} / 退货{" "}
                    {totals.returned} / 可退 {totals.remaining}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="min-w-full text-[11px]">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600">
                    <tr>
                      <th className="px-2 py-1 text-left">Item ID</th>
                      <th className="px-2 py-1 text-left">标题</th>
                      <th className="px-2 py-1 text-right">下单数量</th>
                      <th className="px-2 py-1 text-right">已发货</th>
                      <th className="px-2 py-1 text-right">已退货</th>
                      <th className="px-2 py-1 text-right">
                        剩余可退
                      </th>
                      <th className="px-2 py-1 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facts.items.map((f) => (
                      <tr
                        key={f.item_id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-2 py-1 font-mono text-[11px]">
                          {f.item_id}
                        </td>
                        <td className="px-2 py-1">
                          {f.title ?? f.sku_id ?? "-"}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {f.qty_ordered}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {f.qty_shipped}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {f.qty_returned}
                        </td>
                        <td className="px-2 py-1 text-right">
                          <span
                            className={
                              f.qty_remaining_refundable > 0
                                ? "font-semibold text-emerald-700"
                                : "text-slate-500"
                            }
                          >
                            {f.qty_remaining_refundable}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-right">
                          <div className="flex flex-wrap justify-end gap-1">
                            <button
                              type="button"
                              className="rounded border border-slate-300 px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                              onClick={() => handleViewStock(f.item_id)}
                            >
                              库存
                            </button>
                            <button
                              type="button"
                              className="rounded border border-slate-300 px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                              onClick={handleViewLedger}
                            >
                              账本
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {reconcile && (
                <div className="mt-1 rounded-md bg-slate-50 px-2.5 py-2 text-[11px] text-slate-700">
                  {reconcile.issues.length === 0 ? (
                    <span>对账结果：未发现异常。</span>
                  ) : (
                    <>
                      <div className="font-semibold text-amber-700">
                        对账发现 {reconcile.issues.length} 条异常：
                      </div>
                      <ul className="mt-1 list-disc pl-4">
                        {reconcile.issues.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default OrderDetailPage;
