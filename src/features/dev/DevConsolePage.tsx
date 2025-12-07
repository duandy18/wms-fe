// src/features/dev/DevConsolePage.tsx
// ================================================================
//  DevConsole v3 —— 业务链路调试实验室（Link-Lab）
//  - Orders (订单链路调试)
//  - PickTasks (拣货链路调试)
//  - Inbound (入库链路调试)
//  - Count (盘点链路调试)
//  - Ship (发货成本调试)
//  - Platform (轻量工具)
//
//  Page 自身只做：Tabs + 状态调度，不做业务逻辑。
// ================================================================

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { DevConsoleTabs } from "./DevConsoleTabs";
import { DevPanelId } from "./DevConsoleTypes";

// 子面板
import { DevOrdersPanel, type DevOrderContext } from "./orders/DevOrdersPanel";
import { DevPickTasksPanel } from "./DevPickTasksPanel";
import { DevPlatformPanel } from "./DevPlatformPanel";
import { DevInboundPanel } from "./DevInboundPanel";
import { DevCountPanel } from "./DevCountPanel";
import DevShipPanel from "./DevShipPanel";

const LAST_ORDER_KEY = "devconsole_last_order_ctx";

const DevConsolePage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // 当前激活面板（默认 orders）
  const [activePanel, setActivePanel] = useState<DevPanelId>(DevPanelId.Orders);

  // URL 参数解析
  const urlPanel = searchParams.get("panel") as DevPanelId | null;
  const urlPlatform = searchParams.get("platform") || undefined;
  const urlShopId = searchParams.get("shop_id") || undefined;
  const urlExtOrderNo = searchParams.get("ext_order_no") || undefined;
  const urlTraceId = searchParams.get("trace_id") || undefined;

  // 初始 panel
  useEffect(() => {
    const validPanels = Object.values(DevPanelId);
    if (urlPanel && validPanels.includes(urlPanel)) {
      setActivePanel(urlPanel);
    } else if (urlExtOrderNo) {
      setActivePanel(DevPanelId.Orders);
    } else {
      try {
        const raw = localStorage.getItem(LAST_ORDER_KEY);
        if (raw) {
          const ctx = JSON.parse(raw) as DevOrderContext;
          if (ctx && ctx.extOrderNo) {
            setActivePanel(DevPanelId.Orders);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [urlPanel, urlExtOrderNo]);

  // 初始订单上下文
  let initialOrderCtx: DevOrderContext | undefined = undefined;
  if (urlExtOrderNo) {
    initialOrderCtx = {
      platform: urlPlatform || "PDD",
      shopId: urlShopId || "1",
      extOrderNo: urlExtOrderNo,
      traceId: urlTraceId,
    };
  } else {
    try {
      const raw = localStorage.getItem(LAST_ORDER_KEY);
      if (raw) {
        const ctx = JSON.parse(raw) as DevOrderContext;
        if (ctx && ctx.extOrderNo) initialOrderCtx = ctx;
      }
    } catch {
      // ignore
    }
  }

  const handleOrderContextChange = (ctx: DevOrderContext) => {
    try {
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(ctx));
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          后端调试台（DevConsole v3）
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          链路调试实验室（Orders / Pick / Inbound / Count / Ship）+ 工具（Platform）
        </p>
      </header>

      {/* Tabs */}
      <DevConsoleTabs active={activePanel} onChange={setActivePanel} />

      {/* 面板分发 */}
      {activePanel === DevPanelId.Orders && (
        <section className="space-y-4 rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-800">
            订单链路调试（Orders → Trace）
          </h2>
          <DevOrdersPanel
            initialPlatform={initialOrderCtx?.platform}
            initialShopId={initialOrderCtx?.shopId}
            initialExtOrderNo={initialOrderCtx?.extOrderNo}
            autoQuery={!!initialOrderCtx?.extOrderNo}
            onContextChange={handleOrderContextChange}
          />
        </section>
      )}

      {activePanel === DevPanelId.PickTasks && <DevPickTasksPanel />}

      {activePanel === DevPanelId.Inbound && (
        <section className="space-y-4 rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-800">
            入库链路调试（PO → 收货任务 → 扫码 → commit → trace）
          </h2>
          <DevInboundPanel />
        </section>
      )}

      {activePanel === DevPanelId.Count && (
        <section className="space-y-4 rounded-xl border bg白 p-4 rounded-xl border">
          <h2 className="text-lg font-semibold text-slate-800">
            盘点链路调试（Count / Scan=mode:count）
          </h2>
          <DevCountPanel />
        </section>
      )}

      {activePanel === DevPanelId.Ship && (
        <section className="space-y-4 rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-800">
            发货成本调试（Ship / 物流费用矩阵）
          </h2>
          <DevShipPanel />
        </section>
      )}

      {activePanel === DevPanelId.Platform && <DevPlatformPanel />}
    </div>
  );
};

export default DevConsolePage;
