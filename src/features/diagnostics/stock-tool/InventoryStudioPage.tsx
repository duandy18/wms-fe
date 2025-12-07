// src/features/diagnostics/stock-tool/InventoryStudioPage.tsx
//
// Inventory Studio：库存 & 批次 & 智能诊断工作台
// - Tab1: 智能库存仪表盘（IntelligenceDashboardPage）
// - Tab2: 库存批次切片（StockToolPage）
// - Tab3: 批次生命周期（BatchLifelinePage）
//
// 本文件作为中控：
// - 解析 URL 上的 tab / warehouse_id / item_id / batch_code / hash(#lifeline)
// - 决定当前活动 Tab
// - 把 wh/item/batch 分发给子模块作为 initial props
// - Tab 切换时同步更新 URL 的 tab 参数

import React, { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import StockToolPage from "./StockToolPage";
import BatchLifelinePage from "../batch-lifeline/BatchLifelinePage";
import IntelligenceDashboardPage from "../intelligence-dashboard/IntelligenceDashboardPage";

type InventoryStudioTab = "dashboard" | "stock" | "batch";

const TAB_PARAM_KEY = "tab";

const InventoryStudioPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 从 URL 中解析 tab / wh / item / batch
  const tabParam = searchParams.get(TAB_PARAM_KEY) as
    | InventoryStudioTab
    | null;

  const whParam = searchParams.get("warehouse_id");
  const itemParam = searchParams.get("item_id");
  const batchParam = searchParams.get("batch_code");
  const hash = location.hash;

  // 解析成 number / string，供子模块使用
  const initialWarehouseId = whParam ? Number(whParam) : undefined;
  const initialItemId = itemParam ? Number(itemParam) : undefined;
  const initialBatchCode = batchParam ?? undefined;

  // 根据 URL 决定当前 Tab：
  // 1) hash=#lifeline 且有 wh/item/batch → 优先 Batch Lifeline
  // 2) 显式 tab 参数 → 使用 tab 参数
  // 3) 有 wh/item → 默认 Stock 切片
  // 4) 否则 → Dashboard
  const activeTab: InventoryStudioTab = useMemo(() => {
    if (
      hash === "#lifeline" &&
      initialWarehouseId !== undefined &&
      initialItemId !== undefined &&
      initialBatchCode
    ) {
      return "batch";
    }

    if (
      tabParam === "dashboard" ||
      tabParam === "stock" ||
      tabParam === "batch"
    ) {
      return tabParam;
    }

    if (initialWarehouseId !== undefined && initialItemId !== undefined) {
      return "stock";
    }

    return "dashboard";
  }, [hash, initialWarehouseId, initialItemId, initialBatchCode, tabParam]);

  // 切换 Tab：保持其它 query 参数不变，只更新 tab
  const switchTab = (tab: InventoryStudioTab) => {
    const params = new URLSearchParams(searchParams);
    params.set(TAB_PARAM_KEY, tab);
    // 切 Tab 时去掉 hash，避免 lifeline 残留
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  return (
    <div className="px-6 lg:px-10 py-4 space-y-4">
      {/* 标题 + Tab 切换 */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Inventory Studio（库存诊断工作台）
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            从全局健康 → 库存批次切片 → 单批次生命周期，逐层下钻的库存诊断入口。
          </p>
        </div>

        <div className="inline-flex rounded-full bg-slate-900/5 p-1 text-sm">
          <button
            type="button"
            onClick={() => switchTab("dashboard")}
            className={
              "px-3 py-1.5 rounded-full transition text-xs " +
              (activeTab === "dashboard"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-900/10")
            }
          >
            智能仪表盘
          </button>
          <button
            type="button"
            onClick={() => switchTab("stock")}
            className={
              "px-3 py-1.5 rounded-full transition text-xs " +
              (activeTab === "stock"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-900/10")
            }
          >
            库存批次切片
          </button>
          <button
            type="button"
            onClick={() => switchTab("batch")}
            className={
              "px-3 py-1.5 rounded-full transition text-xs " +
              (activeTab === "batch"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-900/10")
            }
          >
            批次生命周期
          </button>
        </div>
      </div>

      {/* 主体内容区 */}
      <div className="rounded-lg border border-slate-200 bg-white py-4">
        {activeTab === "dashboard" && <IntelligenceDashboardPage />}

        {activeTab === "stock" && (
          <StockToolPage
            initialWarehouseId={initialWarehouseId}
            initialItemId={initialItemId}
            initialBatchCode={initialBatchCode}
          />
        )}

        {activeTab === "batch" && (
          <BatchLifelinePage
            initialWarehouseId={initialWarehouseId}
            initialItemId={initialItemId}
            initialBatchCode={initialBatchCode}
          />
        )}
      </div>
    </div>
  );
};

export default InventoryStudioPage;
