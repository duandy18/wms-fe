// src/features/operations/outbound-pick/PickTaskDetailPanel.tsx
//
// 任务详情 Panel：显示当前任务头信息 + 订单信息 + 行明细
// - 左上：任务信息（task_id / ref / 仓库 / 状态）
// - 右上：订单信息（ext_order_no / 订单金额 / 实付金额）
// - 下方：行明细表：SKU / 名称 / 规格 / 单位 / Req / Picked / 剩余 / Batch / 来源 / 行状态
// - 支持点击行选择当前 active item，配合 FEFO / 扫码联动
// - 当 activeItemId 变化时，自动滚动到对应行。

import React, { useEffect, useRef } from "react";
import type { PickTask } from "./pickTasksApi";
import type { ItemBasic } from "../../../master-data/itemsApi";
import type { OrderView } from "../../orders/api";

type Props = {
  task: PickTask | null;
  loading: boolean;
  error: string | null;
  itemMetaMap: Record<number, ItemBasic>;
  activeItemId: number | null;
  onSelectItemId: (itemId: number | null) => void;
  orderInfo: OrderView | null;
};

export const PickTaskDetailPanel: React.FC<Props> = ({
  task,
  error,
  itemMetaMap,
  activeItemId,
  onSelectItemId,
  orderInfo,
}) => {
  const statusBadgeClass = (status: string) => {
    if (status === "DONE")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "PICKING")
      return "bg-sky-50 text-sky-700 border-sky-200";
    if (status === "READY")
      return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});

  // activeItemId 变化时自动滚动到对应行
  useEffect(() => {
    if (activeItemId == null) return;
    const row = rowRefs.current[activeItemId];
    if (row && row.scrollIntoView) {
      row.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeItemId]);

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (!task) {
    return (
      <div className="text-sm text-slate-500">
        请在左侧选择一条拣货任务。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 任务头 + 订单头：左右两列布局 */}
      <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 md:grid-cols-2">
        {/* 左：任务信息 */}
        <div className="space-y-1">
          <div>
            <span className="mr-1 text-slate-500">任务 ID:</span>
            <span className="font-mono">{task.id}</span>
          </div>
          <div>
            <span className="mr-1 text-slate-500">Ref:</span>
            <span className="font-mono break-all">
              {task.ref ?? "-"}
            </span>
          </div>
          <div>
            <span className="mr-1 text-slate-500">仓库:</span>
            <span className="font-mono">{task.warehouse_id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-1 text-slate-500">状态:</span>
            <span
              className={
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs " +
                statusBadgeClass(task.status)
              }
            >
              {task.status}
            </span>
          </div>
        </div>

        {/* 右：订单信息（如能解析到） */}
        {orderInfo ? (
          <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700">
            <div>
              <span className="mr-1 text-slate-500">订单号:</span>
              <span className="font-mono">
                {orderInfo.order.ext_order_no}
              </span>
            </div>
            <div>
              <span className="mr-1 text-slate-500">订单金额:</span>
              <span className="font-mono">
                {orderInfo.order.order_amount ?? "-"}
              </span>
            </div>
            <div>
              <span className="mr-1 text-slate-500">实付金额:</span>
              <span className="font-mono">
                {orderInfo.order.pay_amount ?? "-"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500">
            未能解析订单信息（ref 非 ORD:platform:shop:ext 格式或订单不存在）。
          </div>
        )}
      </div>

      {/* 行明细表格 */}
      <div className="mt-1 max-h-72 overflow-auto rounded-lg border border-slate-200">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50">
            <tr className="text-xs text-slate-600">
              <th className="px-3 py-2 text-left">商品（SKU / 名称 / 规格 / 单位）</th>
              <th className="px-3 py-2 text-right">Req</th>
              <th className="px-3 py-2 text-right">Picked</th>
              <th className="px-3 py-2 text-right">剩余</th>
              <th className="px-3 py-2 text-left">Batch</th>
              <th className="px-3 py-2 text-left">来源</th>
              <th className="px-3 py-2 text-left">行状态</th>
            </tr>
          </thead>
          <tbody>
            {task.lines.map((ln) => {
              const meta = itemMetaMap[ln.item_id];
              const isActive = activeItemId === ln.item_id;

              const remaining = ln.req_qty - ln.picked_qty;
              let lineStatus: "OK" | "UNDER" | "OVER" = "OK";
              if (remaining > 0) lineStatus = "UNDER";
              else if (remaining < 0) lineStatus = "OVER";

              const lineStatusClass =
                lineStatus === "OK"
                  ? "text-slate-700"
                  : lineStatus === "UNDER"
                  ? "text-amber-700"
                  : "text-red-700";

              return (
                <tr
                  key={ln.id}
                  ref={(el) => {
                    if (el) rowRefs.current[ln.item_id] = el;
                  }}
                  className={
                    "border-t border-slate-100 cursor-pointer " +
                    (isActive ? "bg-sky-50" : "hover:bg-slate-50")
                  }
                  onClick={() => onSelectItemId(ln.item_id)}
                >
                  <td className="px-3 py-2 align-top">
                    {meta ? (
                      <div className="flex flex-col">
                        <span className="font-mono text-slate-800">
                          {meta.sku}
                        </span>
                        <span className="text-xs text-slate-700">
                          {meta.name}
                          {meta.spec ? ` · ${meta.spec}` : ""}
                          {meta.uom ? ` · ${meta.uom}` : ""}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          item_id={ln.item_id}
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-slate-800">
                        item_id={ln.item_id}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">{ln.req_qty}</td>
                  <td className="px-3 py-2 text-right">
                    {ln.picked_qty}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {remaining}
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {ln.batch_code ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {ln.order_id ? "订单行" : "拣货行为行"}
                  </td>
                  <td className={"px-3 py-2 text-xs " + lineStatusClass}>
                    {lineStatus}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
