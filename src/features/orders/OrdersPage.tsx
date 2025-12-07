// src/features/orders/OrdersPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import {
  StandardTable,
  type ColumnDef,
} from "../../components/wmsdu/StandardTable";
import {
  fetchOrdersList,
  fetchOrderView,
  fetchOrderFacts,
  type OrderSummary,
  type OrderView,
  type OrderFacts,
} from "./api";

const formatTs = (ts: string | null | undefined) =>
  ts ? ts.replace("T", " ").replace("Z", "") : "-";

function renderStatus(status?: string | null) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
        -
      </span>
    );
  }
  const s = status.toUpperCase();
  let cls =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ";
  if (s === "CREATED" || s === "PAID" || s === "RESERVED") {
    cls += "bg-sky-50 text-sky-700 border border-sky-200";
  } else if (s === "SHIPPED") {
    cls += "bg-indigo-50 text-indigo-700 border border-indigo-200";
  } else if (s === "PARTIALLY_RETURNED") {
    cls += "bg-amber-50 text-amber-700 border border-amber-200";
  } else if (s === "RETURNED") {
    cls += "bg-emerald-50 text-emerald-700 border border-emerald-200";
  } else if (s === "CANCELED") {
    cls += "bg-slate-100 text-slate-600 border border-slate-200";
  } else {
    cls += "bg-slate-50 text-slate-700 border border-slate-200";
  }
  return <span className={cls}>{status}</span>;
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();

  // 列表过滤器
  const [platform, setPlatform] = useState("PDD");
  const [shopId, setShopId] = useState("");
  const [status, setStatus] = useState("");
  const [timeFrom, setTimeFrom] = useState(""); // YYYY-MM-DD
  const [timeTo, setTimeTo] = useState("");
  const [limit, setLimit] = useState(100);

  // 列表数据
  const [rows, setRows] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 内嵌详情：选中订单 + 详情数据
  const [selectedSummary, setSelectedSummary] =
    useState<OrderSummary | null>(null);
  const [selectedView, setSelectedView] = useState<OrderView | null>(null);
  const [selectedFacts, setSelectedFacts] = useState<OrderFacts | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // ===== 列表加载 =====
  async function loadList() {
    setLoading(true);
    setError(null);
    try {
      const params: any = { limit };
      if (platform.trim()) params.platform = platform.trim();
      if (shopId.trim()) params.shopId = shopId.trim();
      if (status.trim()) params.status = status.trim();
      if (timeFrom.trim())
        params.time_from = `${timeFrom.trim()}T00:00:00Z`;
      if (timeTo.trim())
        params.time_to = `${timeTo.trim()}T23:59:59Z`;

      const list = await fetchOrdersList(params);
      setRows(list);

      // 如果当前选中的订单已经不在列表里了，顺便清掉详情
      if (
        selectedSummary &&
        !list.some((r) => r.id === selectedSummary.id)
      ) {
        setSelectedSummary(null);
        setSelectedView(null);
        setSelectedFacts(null);
        setDetailError(null);
      }
    } catch (err: any) {
      console.error("fetchOrdersList failed", err);
      setError(err?.message ?? "加载订单列表失败");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== 加载某一行的订单详情（头 + 行事实） =====
  async function loadDetail(summary: OrderSummary) {
    setSelectedSummary(summary);
    setSelectedView(null);
    setSelectedFacts(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const ov = await fetchOrderView({
        platform: summary.platform,
        shopId: summary.shop_id,
        extOrderNo: summary.ext_order_no,
      });
      setSelectedView(ov);

      const of = await fetchOrderFacts({
        platform: summary.platform,
        shopId: summary.shop_id,
        extOrderNo: summary.ext_order_no,
      });
      setSelectedFacts(of);
    } catch (err: any) {
      console.error("load order detail failed", err);
      setDetailError(err?.message ?? "加载订单详情失败");
      setSelectedView(null);
      setSelectedFacts(null);
    } finally {
      setDetailLoading(false);
    }
  }

  const columns: ColumnDef<OrderSummary>[] = [
    {
      key: "platform",
      header: "平台",
      render: (r) => r.platform,
    },
    {
      key: "shop_id",
      header: "店铺",
      render: (r) => r.shop_id,
    },
    {
      key: "ext_order_no",
      header: "外部订单号",
      render: (r) => (
        <span className="font-mono text-[11px]">
          {r.ext_order_no}
        </span>
      ),
    },
    {
      key: "status",
      header: "状态",
      render: (r) => renderStatus(r.status),
    },
    {
      key: "amount",
      header: "金额 / 实付",
      align: "right",
      render: (r) => (
        <span className="font-mono text-[11px]">
          {r.order_amount ?? "-"}
          {" / "}
          {r.pay_amount ?? "-"}
        </span>
      ),
    },
    {
      key: "warehouse_id",
      header: "仓库",
      render: (r) => r.warehouse_id ?? "-",
    },
    {
      key: "created_at",
      header: "创建时间",
      render: (r) => formatTs(r.created_at),
    },
    {
      key: "actions",
      header: "操作",
      render: (r) => (
        <button
          type="button"
          className="text-xs text-sky-700 hover:underline"
          onClick={() => void loadDetail(r)}
        >
          查看详情
        </button>
      ),
    },
  ];

  // 选中订单的一些派生量
  const detailOrder = selectedView?.order ?? null;
  const detailFacts = selectedFacts?.items ?? [];

  const detailTotals = useMemo(() => {
    if (!detailFacts.length) {
      return { ordered: 0, shipped: 0, returned: 0, remaining: 0 };
    }
    return detailFacts.reduce(
      (acc, f) => {
        acc.ordered += f.qty_ordered;
        acc.shipped += f.qty_shipped;
        acc.returned += f.qty_returned;
        acc.remaining += f.qty_remaining_refundable;
        return acc;
      },
      { ordered: 0, shipped: 0, returned: 0, remaining: 0 },
    );
  }, [detailFacts]);

  // 构造一个方便跳 DevConsole 的查询串
  function devConsoleHref() {
    if (!detailOrder) return "/dev";
    const qs = new URLSearchParams();
    qs.set("platform", detailOrder.platform);
    qs.set("shop_id", detailOrder.shop_id);
    qs.set("ext_order_no", detailOrder.ext_order_no);
    return `/dev?${qs.toString()}`;
  }

  return (
    <div className="p-6 space-y-4">
      <PageTitle
        title="订单管理"
        description="按平台 / 店铺 / 状态 / 时间窗口浏览订单。在下方列表中选择一行，在列表下方查看详情；更深入的退货、对账、Trace 在 DevConsole 中完成。"
      />

      {/* 过滤器 */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">平台</span>
            <input
              className="h-9 w-28 rounded border border-slate-300 px-2 text-sm"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="如 PDD"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">店铺 ID</span>
            <input
              className="h-9 w-32 rounded border border-slate-300 px-2 text-sm"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              placeholder="可选"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">状态</span>
            <input
              className="h-9 w-32 rounded border border-slate-300 px-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="如 SHIPPED / RETURNED"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">开始日期</span>
            <input
              className="h-9 rounded border border-slate-300 px-2 text-sm"
              type="date"
              value={timeFrom}
              onChange={(e) => setTimeFrom(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">结束日期</span>
            <input
              className="h-9 rounded border border-slate-300 px-2 text-sm"
              type="date"
              value={timeTo}
              onChange={(e) => setTimeTo(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">每页数量</span>
            <input
              className="h-9 w-20 rounded border border-slate-300 px-2 text-sm"
              type="number"
              value={limit}
              onChange={(e) =>
                setLimit(Number(e.target.value || "") || 50)
              }
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => void loadList()}
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? "查询中…" : "查询"}
          </button>
        </div>

        {error && (
          <div className="text-xs text-red-600">{error}</div>
        )}
      </section>

      {/* 列表 */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <StandardTable<OrderSummary>
          columns={columns}
          data={rows}
          dense
          getRowKey={(r) => r.id}
          emptyText={
            loading
              ? "加载中…"
              : "暂无订单，可以先在 DevConsole 或平台回放生成一些订单。"
          }
          footer={
            <span className="text-xs text-slate-500">
              共 {rows.length} 条记录（当前页）
            </span>
          }
        />
      </section>

      {/* 详情：放在列表下面 */}
      {selectedSummary && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                订单详情（当前选中）
              </h2>
              <div className="text-xs text-slate-500">
                {selectedSummary.platform}/{selectedSummary.shop_id} ·{" "}
                <span className="font-mono text-[11px]">
                  {selectedSummary.ext_order_no}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedSummary(null);
                  setSelectedView(null);
                  setSelectedFacts(null);
                  setDetailError(null);
                }}
                className="rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
              >
                关闭详情
              </button>
              <a
                href={devConsoleHref()}
                className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
              >
                在 DevConsole 中诊断
              </a>
            </div>
          </div>

          {detailLoading && (
            <div className="text-xs text-slate-500">
              正在加载订单详情…
            </div>
          )}
          {detailError && (
            <div className="text-xs text-red-600">{detailError}</div>
          )}

          {detailOrder && (
            <>
              <div className="grid grid-cols-1 gap-y-2 md:grid-cols-3 md:gap-x-8 text-xs">
                <div>
                  <div className="text-[11px] text-slate-500">
                    平台 / 店铺
                  </div>
                  <div>
                    {detailOrder.platform}/{detailOrder.shop_id}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">
                    外部订单号
                  </div>
                  <div className="font-mono text-[11px]">
                    {detailOrder.ext_order_no}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">
                    状态
                  </div>
                  <div>{renderStatus(detailOrder.status)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">
                    仓库 ID
                  </div>
                  <div>{detailOrder.warehouse_id ?? "-"}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">
                    金额 / 实付
                  </div>
                  <div className="font-mono text-[11px]">
                    {detailOrder.order_amount ?? "-"} /{" "}
                    {detailOrder.pay_amount ?? "-"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">
                    创建时间
                  </div>
                  <div>{formatTs(detailOrder.created_at)}</div>
                </div>
              </div>

              {detailFacts.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-700">
                      行事实（下单 / 发货 / 退货 / 剩余可退）
                    </h3>
                    <div className="text-[11px] text-slate-500">
                      共 {detailFacts.length} 行 · 合计：下单{" "}
                      {detailTotals.ordered} / 发货{" "}
                      {detailTotals.shipped} / 退货{" "}
                      {detailTotals.returned} / 可退{" "}
                      {detailTotals.remaining}
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-md border border-slate-200">
                    <table className="min-w-full text-[11px]">
                      <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600">
                        <tr>
                          <th className="px-2 py-1 text-left">Item ID</th>
                          <th className="px-2 py-1 text-left">标题</th>
                          <th className="px-2 py-1 text-right">下单</th>
                          <th className="px-2 py-1 text-right">
                            已发货
                          </th>
                          <th className="px-2 py-1 text-right">
                            已退货
                          </th>
                          <th className="px-2 py-1 text-right">
                            剩余可退
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailFacts.map((f) => (
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default OrdersPage;
