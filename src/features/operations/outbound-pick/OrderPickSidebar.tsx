// src/features/operations/outbound-pick/OrderPickSidebar.tsx
//
// 左侧：订单列表（可操作） + 下方订单详情（只读）
// - 默认只看 status=CREATED（可履约 MVP）
// - 点击订单行：下方加载订单详情（像入库页）
// - 把“当前选中订单 summary”回传给右侧（用于创建拣货任务）

import React, { useEffect } from "react";

import type { OrderSummary } from "../../orders/api";
import { useOrdersList } from "../../orders/hooks/useOrdersList";
import { useOrderInlineDetail } from "../../orders/hooks/useOrderInlineDetail";
import { OrderInlineDetailPanel } from "../../orders/components/OrderInlineDetailPanel";
import { formatTs, renderStatus } from "../../orders/ui/format";

type Props = {
  onPickOrder: (summary: OrderSummary | null) => void;
};

export const OrderPickSidebar: React.FC<Props> = ({ onPickOrder }) => {
  const list = useOrdersList({ initialPlatform: "PDD" });
  const detail = useOrderInlineDetail();

  // 固定 MVP：默认只看 CREATED（可履约订单）
  useEffect(() => {
    if (list.filters.status.trim().toUpperCase() === "CREATED") return;
    list.setFilters((prev) => ({ ...prev, status: "CREATED" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当详情选中变化时，同步给右侧（创建任务用）
  useEffect(() => {
    onPickOrder(detail.selectedSummary ?? null);
  }, [detail.selectedSummary, onPickOrder]);

  // 若当前选中订单不在列表里，清掉详情
  useEffect(() => {
    if (!detail.selectedSummary) return;
    const exists = list.rows.some((r) => r.id === detail.selectedSummary?.id);
    if (!exists) {
      detail.closeDetail();
    }
  }, [list.rows, detail]);

  function devConsoleHref() {
    const o = detail.detailOrder;
    if (!o) return "/dev";
    const qs = new URLSearchParams();
    qs.set("platform", o.platform);
    qs.set("shop_id", o.shop_id);
    qs.set("ext_order_no", o.ext_order_no);
    return `/dev?${qs.toString()}`;
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          订单列表（可履约）
        </h2>
        <button
          type="button"
          onClick={() => void list.loadList()}
          disabled={list.loading}
          className="text-[11px] px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {list.loading ? "刷新中…" : "刷新"}
        </button>
      </div>

      {/* 极简过滤：平台/店铺（状态固定 CREATED） */}
      <div className="flex flex-wrap items-end gap-2 text-[11px]">
        <div className="flex flex-col gap-1">
          <span className="text-slate-500">平台</span>
          <input
            className="h-8 w-20 rounded border border-slate-300 px-2 text-[12px]"
            value={list.filters.platform}
            onChange={(e) =>
              list.setFilters((prev) => ({ ...prev, platform: e.target.value }))
            }
            placeholder="如 PDD"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-slate-500">店铺</span>
          <input
            className="h-8 w-24 rounded border border-slate-300 px-2 text-[12px]"
            value={list.filters.shopId}
            onChange={(e) =>
              list.setFilters((prev) => ({ ...prev, shopId: e.target.value }))
            }
            placeholder="可选"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-slate-500">状态</span>
          <input
            className="h-8 w-24 rounded border border-slate-200 bg-slate-50 px-2 text-[12px] text-slate-600"
            value="CREATED"
            readOnly
          />
        </div>

        <button
          type="button"
          onClick={() => void list.loadList()}
          disabled={list.loading}
          className="h-8 rounded-md bg-slate-900 px-3 text-[11px] font-semibold text-white disabled:opacity-60"
        >
          查询
        </button>

        {list.error && (
          <div className="text-[11px] text-red-600">{list.error}</div>
        )}
      </div>

      {/* 上：订单列表（整行可点） */}
      <div className="border border-slate-200 rounded-lg max-h-[360px] overflow-auto text-xs">
        {list.rows.length === 0 ? (
          <div className="px-3 py-2 text-slate-500">
            {list.loading ? "加载中…" : "暂无可履约订单（CREATED）。"}
          </div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-[11px] text-slate-600">
                <th className="px-2 py-2 text-left">平台</th>
                <th className="px-2 py-2 text-left">店铺</th>
                <th className="px-2 py-2 text-left">外部订单号</th>
                <th className="px-2 py-2 text-left">状态</th>
                <th className="px-2 py-2 text-left">创建时间</th>
              </tr>
            </thead>
            <tbody>
              {list.rows.map((r) => {
                const active = detail.selectedSummary?.id === r.id;
                return (
                  <tr
                    key={r.id}
                    className={
                      "cursor-pointer border-t border-slate-100 " +
                      (active ? "bg-sky-50" : "hover:bg-slate-50")
                    }
                    onClick={() => void detail.loadDetail(r)}
                    title="点击查看订单详情（只读）"
                  >
                    <td className="px-2 py-2">{r.platform}</td>
                    <td className="px-2 py-2">{r.shop_id}</td>
                    <td className="px-2 py-2">
                      <span className="font-mono text-[11px]">
                        {r.ext_order_no}
                      </span>
                    </td>
                    <td className="px-2 py-2">{renderStatus(r.status)}</td>
                    <td className="px-2 py-2">{formatTs(r.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 下：订单详情（像入库页一样放在列表下面） */}
      {detail.selectedSummary && (
        <div className="pt-2">
          <OrderInlineDetailPanel
            selectedSummary={detail.selectedSummary}
            selectedView={detail.selectedView}
            selectedFacts={detail.selectedFacts}
            detailLoading={detail.detailLoading}
            detailError={detail.detailError}
            onClose={detail.closeDetail}
            devConsoleHref={devConsoleHref}
          />
        </div>
      )}
    </section>
  );
};
