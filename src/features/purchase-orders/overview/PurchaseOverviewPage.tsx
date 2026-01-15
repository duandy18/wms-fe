// src/features/purchase-orders/overview/PurchaseOverviewPage.tsx

import React, { useState } from "react";
import { PurchaseOrdersProgressTab } from "./PurchaseOrdersProgressTab";
import { PurchaseReportsTab } from "./PurchaseReportsTab";

type MainTab = "orders" | "reports";

const PurchaseOverviewPage: React.FC = () => {
  const [mainTab, setMainTab] = useState<MainTab>("orders");

  return (
    <div className="p-6 space-y-6">
      {/* 标题行：左侧标题 + 右侧 Tab */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">采购概览</h1>
          <div className="mt-1 text-sm text-slate-600">
            同一页面里查看采购进度与采购统计。统计支持“事实（收货）/计划（下单）”口径切换，避免误判。
          </div>
        </div>

        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setMainTab("orders")}
            className={
              "px-3 py-1.5 rounded-full font-medium transition-colors " +
              (mainTab === "orders"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:bg-slate-200/70")
            }
          >
            采购单进度
          </button>
          <button
            type="button"
            onClick={() => setMainTab("reports")}
            className={
              "px-3 py-1.5 rounded-full font-medium transition-colors " +
              (mainTab === "reports"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:bg-slate-200/70")
            }
          >
            采购统计
          </button>
        </div>
      </div>

      {mainTab === "orders" && <PurchaseOrdersProgressTab />}
      {mainTab === "reports" && <PurchaseReportsTab />}
    </div>
  );
};

export default PurchaseOverviewPage;
