// src/features/orders/OrderReturnTaskPanel.tsx
//
// 订单退货 → 跳转退货入库单页面
//

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchOrderFactsById,
  fetchOrderViewById,
} from "./api/client";
import type { OrderFacts, OrderView } from "./api/types";

type Props = {
  orderId: number;
};

type QtyInputMap = Record<number, string>;

type ReturnLineRow = {
  row_key: number;
  item_id: number;
  item_name: string | null;
  sku: string | null;
  qty_ordered: number;
  qty_remaining_refundable: number;
};

type ReturnLineDraft = {
  item_id: number;
  qty: number;
  qty_remaining_refundable: number;
};

type ApiErrorShape = {
  message?: string;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

export const OrderReturnTaskPanel: React.FC<Props> = ({ orderId }) => {
  const navigate = useNavigate();

  const [orderView, setOrderView] = useState<OrderView | null>(null);
  const [orderFacts, setOrderFacts] = useState<OrderFacts | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [qtyInputs, setQtyInputs] = useState<QtyInputMap>({});
  const [openingReceiptPage, setOpeningReceiptPage] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const order = orderView?.order ?? null;

  const lineRows = useMemo<ReturnLineRow[]>(() => {
    const factItems = orderFacts?.items ?? [];
    return factItems.map((item) => ({
      row_key: item.item_id,
      item_id: item.item_id,
      item_name: item.title ?? null,
      sku: item.sku_id ?? null,
      qty_ordered: item.qty_ordered,
      qty_remaining_refundable: item.qty_remaining_refundable,
    }));
  }, [orderFacts]);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || orderId <= 0) return;

      setLoadingOrder(true);
      setOrderError(null);

      try {
        const [view, facts] = await Promise.all([
          fetchOrderViewById(orderId),
          fetchOrderFactsById(orderId),
        ]);
        setOrderView(view);
        setOrderFacts(facts);
      } catch (err: unknown) {
        console.error("OrderReturnTaskPanel: load order failed", err);
        setOrderView(null);
        setOrderFacts(null);
        setOrderError(getErrorMessage(err, "加载订单详情失败"));
      } finally {
        setLoadingOrder(false);
      }
    };

    void loadOrder();
  }, [orderId]);

  const handleQtyChange = (itemId: number, value: string) => {
    setQtyInputs((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleOpenReceiptPage = async () => {
    if (!order) {
      setCreateError("订单信息尚未加载，无法打开退货入库单页面");
      return;
    }

    const lines: ReturnLineDraft[] = lineRows
      .map((row) => {
        const raw = (qtyInputs[row.item_id] ?? "").trim();
        const qty = raw ? Number(raw) : 0;
        return {
          item_id: row.item_id,
          qty,
          qty_remaining_refundable: row.qty_remaining_refundable,
        };
      })
      .filter((x) => x.qty > 0);

    if (!lines.length) {
      setCreateError("请至少为一行输入大于 0 的退货数量");
      return;
    }

    const overLine = lines.find((x) => x.qty > x.qty_remaining_refundable);
    if (overLine) {
      setCreateError(
        `item_id=${overLine.item_id} 的退货数量超过剩余可退数量（${overLine.qty_remaining_refundable}）`,
      );
      return;
    }

    const platform = String(order.platform || "").toUpperCase().trim();
    const shopId = String(order.shop_id || "").trim();
    const extOrderNo = String(order.ext_order_no || "").trim();
    if (!platform || !shopId || !extOrderNo) {
      setCreateError("当前订单缺少规范订单键，无法打开退货入库单页面");
      return;
    }

    const orderRef = `ORD:${platform}:${shopId}:${extOrderNo}`;

    setOpeningReceiptPage(true);
    setCreateError(null);
    try {
      navigate(`/inventory-adjustment/return-inbound?order_key=${encodeURIComponent(orderRef)}`);
    } catch (err: unknown) {
      console.error("OrderReturnTaskPanel: open returns receipt page failed", err);
      setCreateError(getErrorMessage(err, "打开退货入库单页面失败"));
    } finally {
      setOpeningReceiptPage(false);
    }
  };

  if (!orderId || orderId <= 0) {
    return null;
  }

  return (
    <section className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          订单退货入库单
        </h2>
        <span className="text-[11px] text-slate-500">
          根据本订单的剩余可退数量，直接进入退货入库单页面；在单据区生成并发布后，再进入收货页执行退货收货。
        </span>
      </div>

      {orderError && (
        <div className="text-xs text-red-600">{orderError}</div>
      )}

      <div className="max-h-64 overflow-y-auto rounded border border-slate-100 bg-slate-50">
        <table className="min-w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="px-2 py-1 text-right">Item</th>
              <th className="px-2 py-1 text-left">商品名</th>
              <th className="px-2 py-1 text-left">SKU</th>
              <th className="px-2 py-1 text-right">下单数量</th>
              <th className="px-2 py-1 text-right">剩余可退</th>
              <th className="px-2 py-1 text-right">本次退货数量</th>
            </tr>
          </thead>
          <tbody>
            {loadingOrder ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-2 py-2 text-center text-slate-500"
                >
                  订单加载中…
                </td>
              </tr>
            ) : !order || lineRows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-2 py-2 text-center text-slate-500"
                >
                  该订单没有可用行，无法发起退货入库。
                </td>
              </tr>
            ) : (
              lineRows.map((row) => (
                <tr
                  key={row.row_key}
                  className="border-t border-slate-100 align-top"
                >
                  <td className="px-2 py-1 text-right font-mono">
                    {row.item_id}
                  </td>
                  <td className="px-2 py-1">
                    {row.item_name ?? "-"}
                  </td>
                  <td className="px-2 py-1 font-mono">
                    {row.sku ?? "-"}
                  </td>
                  <td className="px-2 py-1 text-right font-mono">
                    {row.qty_ordered}
                  </td>
                  <td className="px-2 py-1 text-right font-mono">
                    {row.qty_remaining_refundable}
                  </td>
                  <td className="px-2 py-1 text-right">
                    <input
                      className="w-20 rounded border border-slate-300 px-1 py-0.5 text-right font-mono"
                      placeholder="0"
                      value={qtyInputs[row.item_id] ?? ""}
                      onChange={(e) =>
                        handleQtyChange(row.item_id, e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {createError && (
        <div className="text-[11px] text-red-600">{createError}</div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={openingReceiptPage || !order}
          onClick={() => {
            void handleOpenReceiptPage();
          }}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-60"
        >
          {openingReceiptPage ? "跳转中…" : "前往退货入库单"}
        </button>
      </div>
    </section>
  );
};
