// src/features/diagnostics/ledger-tool/LedgerStudioPage.tsx
//
// Ledger Studio：统一所有“账本诊断”能力
// - Tab1: 账本查询 / 汇总 / 对账（LedgerToolPage）
// - Tab2: Ledger Cockpit 多维对账 + 三账一致性（LedgerCockpitPage）
// - Tab3: Ledger Timeline（LedgerTimelinePage）
//
// 本中控负责：
// - 解析 URL 上的 ?tab=tool|cockpit|timeline
// - 控制当前 Tab
// - 切换 Tab 时同步更新 tab 参数（保持其它 query 不变）

import React, { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import LedgerToolPage from "./LedgerToolPage";
import LedgerCockpitPage from "../ledger-cockpit/LedgerCockpitPage";
import LedgerTimelinePage from "../ledger-timeline/LedgerTimelinePage";

export type LedgerStudioTab = "tool" | "cockpit" | "timeline";

const TAB_PARAM_KEY = "tab";

const LedgerStudioPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tabParam = searchParams.get(TAB_PARAM_KEY) as LedgerStudioTab | null;

  // 从 URL 解析当前 tab，默认用 "tool"
  const activeTab: LedgerStudioTab = useMemo(() => {
    if (tabParam === "tool" || tabParam === "cockpit" || tabParam === "timeline") {
      return tabParam;
    }
    return "tool";
  }, [tabParam]);

  // 切 Tab：只改 tab=，其它 query（比如 warehouse_id/item_id）保留
  const switchTab = (tab: LedgerStudioTab) => {
    const params = new URLSearchParams(searchParams);
    params.set(TAB_PARAM_KEY, tab);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  return (
    <div className="px-6 lg:px-10 py-4 space-y-4">
      {/* 标题 + Tab 切换 */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Ledger Studio（台账诊断工作台）
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            以 stock_ledger 为中心的查询、汇总、对账、时间线与三账一致性分析。
          </p>
        </div>

        <div className="inline-flex rounded-full bg-slate-900/5 p-1 text-sm">
          <button
            type="button"
            onClick={() => switchTab("tool")}
            className={
              "px-3 py-1.5 rounded-full transition text-xs " +
              (activeTab === "tool"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-900/10")
            }
          >
            账本查询 & 汇总
          </button>
          <button
            type="button"
            onClick={() => switchTab("cockpit")}
            className={
              "px-3 py-1.5 rounded-full transition text-xs " +
              (activeTab === "cockpit"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-900/10")
            }
          >
            多维对账 & 三账一致性
          </button>
          <button
            type="button"
            onClick={() => switchTab("timeline")}
            className={
              "px-3 py-1.5 rounded-full transition text-xs " +
              (activeTab === "timeline"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-900/10")
            }
          >
            Ledger 时间线
          </button>
        </div>
      </div>

      {/* 主体内容区 */}
      <div className="rounded-lg border border-slate-200 bg-white py-4">
        {activeTab === "tool" && <LedgerToolPage />}
        {activeTab === "cockpit" && <LedgerCockpitPage />}
        {activeTab === "timeline" && <LedgerTimelinePage />}
      </div>
    </div>
  );
};

export default LedgerStudioPage;
