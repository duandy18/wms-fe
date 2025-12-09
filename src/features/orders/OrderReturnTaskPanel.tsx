// src/features/orders/OrderReturnTaskPanel.tsx
//
// 订单退货 → 生成收货任务（ReceiveTask, source_type=ORDER）面板
//

import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";

type Props = {
  orderId: number;
};

type OrderLine = {
  id: number;
  item_id: number;
  item_name?: string | null;
  sku?: string | null;
  qty?: number | null;
};

type OrderDetail = {
  id: number;
  warehouse_id?: number | null;
  lines?: OrderLine[];
};

type QtyInputMap = Record<number, string>;

type ReceiveTaskFromOrderResponse = {
  id: number;
  source_type: string;
  source_id: number | null;
  warehouse_id: number;
  lines: Array<{
    id: number;
    item_id: number;
    scanned_qty: number;
    expected_qty: number | null;
  }>;
};

type ApiErrorShape = {
  message?: string;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

export const OrderReturnTaskPanel: React.FC<Props> = ({ orderId }) => {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [qtyInputs, setQtyInputs] = useState<QtyInputMap>({});
  const [creatingTask, setCreatingTask] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdTask, setCreatedTask] =
    useState<ReceiveTaskFromOrderResponse | null>(null);

  const [warehouseIdInput, setWarehouseIdInput] = useState<string>("1");

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || orderId <= 0) return;
      setLoadingOrder(true);
      setOrderError(null);
      try {
        const data = await apiGet<OrderDetail>(`/orders/${orderId}`);
        setOrder(data);
        if (data.warehouse_id != null) {
          setWarehouseIdInput(String(data.warehouse_id));
        }
      } catch (err) {
        console.error("OrderReturnTaskPanel: load order failed", err);
        setOrder(null);
        setOrderError(getErrorMessage(err, "加载订单详情失败"));
      } finally {
        setLoadingOrder(false);
      }
    };
    void loadOrder();
  }, [orderId]);

  const handleQtyChange = (lineId: number, value: string) => {
    setQtyInputs((prev) => ({ ...prev, [lineId]: value }));
  };

  const handleCreateTask = async () => {
    if (!order) {
      setCreateError("订单信息尚未加载，无法创建退货任务");
      return;
    }

    const whRaw = warehouseIdInput.trim();
    const whId = Number(whRaw || "0");
    if (!Number.isFinite(whId) || whId <= 0) {
      setCreateError("仓库 ID 必须为正整数");
      return;
    }

    const lines = (order.lines || [])
      .map((l) => {
        const raw = (qtyInputs[l.id] ?? "").trim();
        const qty = raw ? Number(raw) : 0;
        return {
          item_id: l.item_id,
          item_name: l.item_name ?? undefined,
          qty,
        };
      })
      .filter((x) => x.qty > 0);

    if (!lines.length) {
      setCreateError("请至少为一行输入大于 0 的退货数量");
      return;
    }

    setCreatingTask(true);
    setCreateError(null);
    setCreatedTask(null);

    try {
      const payload = {
        warehouse_id: whId,
        lines: lines.map((l) => ({
          item_id: l.item_id,
          item_name: l.item_name,
          qty: l.qty,
          batch_code: null,
        })),
      };

      const resp = await apiPost<ReceiveTaskFromOrderResponse>(
        `/receive-tasks/from-order/${order.id}`,
        payload,
      );
      setCreatedTask(resp);
    } catch (err) {
      console.error("OrderReturnTaskPanel: create return task failed", err);
      setCreateError(getErrorMessage(err, "创建退货收货任务失败"));
    } finally {
      setCreatingTask(false);
    }
  };

  if (!orderId || orderId <= 0) {
    return null;
  }

  return (
    <section className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          订单退货收货任务
        </h2>
        <span className="text-[11px] text-slate-500">
          根据本订单创建退货收货任务（ReceiveTask, source_type=ORDER），
          后续在收货 Cockpit 的「订单退货」模式下按任务 ID 绑定并完成收货。
        </span>
      </div>

      {orderError && (
        <div className="text-xs text-red-600">{orderError}</div>
      )}

      {order && (
        <div className="text-xs text-slate-600">
          订单 ID：
          <span className="font-mono">{order.id}</span>，建议仓库：
          <input
            className="ml-1 inline-block w-16 rounded border border-slate-300 px-1 py-0.5 text-[11px] font-mono"
            value={warehouseIdInput}
            onChange={(e) => setWarehouseIdInput(e.target.value)}
          />
        </div>
      )}

      <div className="max-h-64 overflow-y-auto rounded bg-slate-50 border border-slate-100">
        <table className="min-w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="px-2 py-1 text-right">行ID</th>
              <th className="px-2 py-1 text-right">Item</th>
              <th className="px-2 py-1 text-left">商品名</th>
              <th className="px-2 py-1 text-right">原始数量</th>
              <th className="px-2 py-1 text-right">本次退货数量</th>
            </tr>
          </thead>
          <tbody>
            {loadingOrder ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-2 py-2 text-center text-slate-500"
                >
                  订单加载中…
                </td>
              </tr>
            ) : !order || !order.lines || order.lines.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-2 py-2 text-center text-slate-500"
                >
                  该订单没有行，无法创建退货任务。
                </td>
              </tr>
            ) : (
              order.lines.map((l) => (
                <tr
                  key={l.id}
                  className="border-t border-slate-100 align-top"
                >
                  <td className="px-2 py-1 text-right font-mono">
                    {l.id}
                  </td>
                  <td className="px-2 py-1 text-right font-mono">
                    {l.item_id}
                  </td>
                  <td className="px-2 py-1">
                    {l.item_name ?? "-"}
                  </td>
                  <td className="px-2 py-1 text-right font-mono">
                    {l.qty ?? "-"}
                  </td>
                  <td className="px-2 py-1 text-right">
                    <input
                      className="w-20 rounded border border-slate-300 px-1 py-0.5 text-right font-mono"
                      placeholder="0"
                      value={qtyInputs[l.id] ?? ""}
                      onChange={(e) => handleQtyChange(l.id, e.target.value)}
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
          disabled={creatingTask || !order}
          onClick={handleCreateTask}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-60"
        >
          {creatingTask ? "创建中…" : "创建退货收货任务"}
        </button>
        {createdTask && (
          <span className="text-[11px] text-emerald-700">
            已创建退货收货任务：任务 ID=
            <span className="font-mono">{createdTask.id}</span>{" "}
            （source_type={createdTask.source_type}）。请前往收货 Cockpit →
            订单退货模式，按任务 ID 绑定。
          </span>
        )}
      </div>
    </section>
  );
};
