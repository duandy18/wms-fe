// src/features/dev/orders/DevOrderActionsCard.tsx
// 订单动作区：预占 / 拣货 / 发货 / 全链路（纯基础动作，已移除调试场景）

import React from "react";

type Props = {
  isBusy: boolean;
  actionLoading: null | "reserve" | "pick" | "ship" | "full";
  onAction: (type: "reserve" | "pick" | "ship") => void;
  onFullFlow: () => void;
  hasReserved: boolean;
  hasShipped: boolean;
};

export const DevOrderActionsCard: React.FC<Props> = ({
  isBusy,
  actionLoading,
  onAction,
  onFullFlow,
  hasReserved,
  hasShipped,
}) => {
  return (
    <div className="mt-2 flex flex-wrap gap-2 pt-2">
      {/* 预占 */}
      <button
        onClick={() => onAction("reserve")}
        disabled={isBusy}
        className="rounded-md border px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
      >
        {actionLoading === "reserve" ? "预占中…" : "订单预占 (v2)"}
      </button>

      {/* 拣货 */}
      <button
        onClick={() => onAction("pick")}
        disabled={isBusy || !hasReserved}
        className="rounded-md border px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
      >
        {actionLoading === "pick" ? "拣货中…" : "订单拣货 (v2)"}
      </button>

      {/* 发运 */}
      <button
        onClick={() => onAction("ship")}
        disabled={isBusy || !hasReserved}
        className="rounded-md border px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
      >
        {actionLoading === "ship" ? "发运中…" : "订单发运 (v2)"}
      </button>

      {/* 全链路 */}
      <button
        onClick={onFullFlow}
        disabled={isBusy || hasShipped}
        className="rounded-md border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
      >
        {actionLoading === "full"
          ? "全链路测试中…"
          : "订单全链路测试（reserve→pick→ship）"}
      </button>
    </div>
  );
};
