// src/features/operations/outbound-pick/OrderPickSidebar.tsx
//
// 左侧：订单列表（可操作） + 创建拣货任务（后端解析执行仓）
// 约束：不在 Sidebar 渲染订单详情（详情搬到页面右侧）
//
// 方案 1：创建任务只传 order_id，不手工选仓（避免与店铺绑定/路由事实冲突）

import React, { useEffect, useMemo, useState } from "react";

import type { OrderSummary } from "../../orders/api";
import { useOrdersList } from "../../orders/hooks/useOrdersList";
import { formatTs, renderStatus } from "../../orders/ui/format";

import { CreatePickTaskCard } from "./orderPick/CreatePickTaskCard";
import type { PickTask } from "./pickTasksApi";

// ✅ 新增：订单解析卡（字段驱动：replay，不推导）
import { OrderExplainCard } from "./orderExplain/OrderExplainCard";
import type { OrderExplainCardInput } from "./orderExplain/types";

type Props = {
  selectedOrderId: number | null;
  onSelectOrder: (summary: OrderSummary) => void;
  onClearSelectedOrder: () => void;

  // 方案 1：不传 warehouse_id，由后端解析
  onCreatePickTaskFromOrder: (summary: OrderSummary) => Promise<PickTask>;
};

export const OrderPickSidebar: React.FC<Props> = ({
  selectedOrderId,
  onSelectOrder,
  onClearSelectedOrder,
  onCreatePickTaskFromOrder,
}) => {
  const list = useOrdersList({ initialPlatform: "PDD" });

  // 固定 MVP：把 status 收敛到 CREATED（幂等）
  // 说明：这里的 status 是“订单头状态 orders.status”，不是履约状态。
  const statusRaw = list.filters.status;
  const setFilters = list.setFilters;

  useEffect(() => {
    const st = String(statusRaw || "").trim().toUpperCase();
    if (st === "CREATED") return;
    setFilters((prev) => ({ ...prev, status: "CREATED" }));
  }, [statusRaw, setFilters]);

  // 若当前选中订单不在列表里，清掉选择态（右侧也会回空态）
  useEffect(() => {
    if (!selectedOrderId) return;
    const exists = list.rows.some((r) => r.id === selectedOrderId);
    if (!exists) onClearSelectedOrder();
  }, [selectedOrderId, list.rows, onClearSelectedOrder]);

  const pickedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return list.rows.find((r) => r.id === selectedOrderId) ?? null;
  }, [selectedOrderId, list.rows]);

  const explainInput = useMemo<OrderExplainCardInput | null>(() => {
    if (!pickedOrder) return null;
    return {
      orderId: pickedOrder.id,
      platform: pickedOrder.platform,
      shop_id: pickedOrder.shop_id,
      ext_order_no: pickedOrder.ext_order_no,
      store_id: pickedOrder.store_id ?? null,
    };
  }, [pickedOrder]);

  const [creatingTask, setCreatingTask] = useState(false);
  const [createTaskError, setCreateTaskError] = useState<string | null>(null);
  const [createdTask, setCreatedTask] = useState<PickTask | null>(null);

  useEffect(() => {
    setCreatingTask(false);
    setCreateTaskError(null);
    setCreatedTask(null);
  }, [pickedOrder?.id]);

  const canCreateTask = useMemo(() => {
    return !!pickedOrder && !creatingTask;
  }, [pickedOrder, creatingTask]);

  async function handleCreateTask() {
    if (!pickedOrder) return;
    setCreateTaskError(null);
    setCreatedTask(null);
    setCreatingTask(true);
    try {
      const t = await onCreatePickTaskFromOrder(pickedOrder);
      setCreatedTask(t);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "创建拣货任务失败";
      setCreateTaskError(msg);
    } finally {
      setCreatingTask(false);
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">订单列表（订单头状态）</h2>
        <button
          type="button"
          onClick={() => void list.loadList()}
          disabled={list.loading}
          className="text-[11px] px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {list.loading ? "刷新中…" : "刷新"}
        </button>
      </div>

      <div className="text-[11px] text-slate-500 space-y-1">
        <div>方案 1：不再手工选仓；创建任务时由后端解析执行仓。</div>
        <div>
          说明：下方“订单状态”指 <span className="font-mono">orders.status</span>（订单头状态）。
          履约状态请看右侧业务卡中的 <span className="font-mono">fulfillment_status</span>。
        </div>
      </div>

      {/* 极简过滤：平台/店铺（订单头状态固定 CREATED） */}
      <div className="flex flex-wrap items-end gap-2 text-[11px]">
        <div className="flex flex-col gap-1">
          <span className="text-slate-500">平台</span>
          <input
            className="h-8 w-20 rounded border border-slate-300 px-2 text-[12px]"
            value={list.filters.platform}
            onChange={(e) => list.setFilters((prev) => ({ ...prev, platform: e.target.value }))}
            placeholder="如 PDD"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-slate-500">店铺</span>
          <input
            className="h-8 w-24 rounded border border-slate-300 px-2 text-[12px]"
            value={list.filters.shopId}
            onChange={(e) => list.setFilters((prev) => ({ ...prev, shopId: e.target.value }))}
            placeholder="可选"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-slate-500">订单状态</span>
          <input
            className="h-8 w-28 rounded border border-slate-200 bg-slate-50 px-2 text-[12px] text-slate-600"
            value="CREATED"
            readOnly
            aria-label="订单头状态（orders.status）"
          />
          <div className="text-[10px] text-slate-400">订单头状态（不是履约状态）</div>
        </div>

        <button
          type="button"
          onClick={() => void list.loadList()}
          disabled={list.loading}
          className="h-8 rounded-md bg-slate-900 px-3 text-[11px] font-semibold text-white disabled:opacity-60"
        >
          查询
        </button>

        {list.error && <div className="text-[11px] text-red-600">{list.error}</div>}
      </div>

      {/* 订单列表 */}
      <div className="border border-slate-200 rounded-lg max-h-[360px] overflow-auto text-xs">
        {list.rows.length === 0 ? (
          <div className="px-3 py-2 text-slate-500">
            {list.loading ? "加载中…" : "暂无订单（订单头状态=CREATED）。"}
          </div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-[11px] text-slate-600">
                <th className="px-2 py-2 text-left">平台</th>
                <th className="px-2 py-2 text-left">店铺</th>
                <th className="px-2 py-2 text-left">外部订单号</th>
                <th className="px-2 py-2 text-left">订单状态</th>
                <th className="px-2 py-2 text-left">创建时间</th>
              </tr>
            </thead>
            <tbody>
              {list.rows.map((r) => {
                const active = selectedOrderId === r.id;
                return (
                  <tr
                    key={r.id}
                    className={"cursor-pointer border-t border-slate-100 " + (active ? "bg-sky-50" : "hover:bg-slate-50")}
                    onClick={() => onSelectOrder(r)}
                    title="点击在右侧查看订单详情（只读）"
                  >
                    <td className="px-2 py-2">{r.platform}</td>
                    <td className="px-2 py-2">{r.shop_id}</td>
                    <td className="px-2 py-2">
                      <span className="font-mono text-[11px]">{r.ext_order_no}</span>
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

      {/* ✅ 订单解析卡：订单列表下方，创建任务上方 */}
      <OrderExplainCard input={explainInput} />

      <CreatePickTaskCard
        pickedOrder={pickedOrder}
        creatingTask={creatingTask}
        createTaskError={createTaskError}
        createdTask={createdTask}
        canCreateTask={canCreateTask}
        onCreate={handleCreateTask}
      />
    </section>
  );
};
