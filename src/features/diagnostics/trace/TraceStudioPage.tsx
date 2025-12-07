// src/features/diagnostics/trace/TraceStudioPage.tsx
//
// Trace Studio：统一入口（真正的 orchestrator）
// - Tab1: 事件流 / 分组视图（TraceEventsView）
// - Tab2: 订单生命周期（OrderLifecycleView）
//
// 本中控负责：
// - 管理 traceId / warehouseId / focusRef / activeTab
// - 从 URL 读入 trace_id / warehouse_id / focus_ref / tab
// - 把这些状态通过 props 分发给子模块

import React, { useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { TraceEventsView } from "./TraceEventsView";
import { OrderLifecycleView } from "../order-lifecycle/OrderLifecycleView";

type TraceStudioTab = "trace" | "lifecycle";

const TAB_PARAM_KEY = "tab";

const TraceStudioPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tabParam = searchParams.get(TAB_PARAM_KEY) as TraceStudioTab | null;

  // 初始状态从 URL 读取
  const [traceId, setTraceId] = useState(
    () => searchParams.get("trace_id") ?? "",
  );
  const [warehouseId, setWarehouseId] = useState(
    () => searchParams.get("warehouse_id") ?? "",
  );
  const focusRef = searchParams.get("focus_ref") ?? null;

  const activeTab: TraceStudioTab = useMemo(() => {
    if (tabParam === "trace" || tabParam === "lifecycle") {
      return tabParam;
    }
    return "trace";
  }, [tabParam]);

  const switchTab = (tab: TraceStudioTab) => {
    const params = new URLSearchParams(searchParams);
    params.set(TAB_PARAM_KEY, tab);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // 是否在挂载时根据 URL 中的 trace_id 自动查询一次
  const autoRunOnMount = !!searchParams.get("trace_id");

  return (
    <div className="px-6 lg:px-10 py-4 space-y-4">
      {/* 顶部标题 + Tab 切换 */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Trace Studio（链路诊断工作台）
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            围绕 trace_id 的事件流、分组视图与订单生命周期诊断。
          </p>
        </div>

        <div className="inline-flex rounded-full bg-slate-900/5 p-1 text-sm">
          <button
            type="button"
            onClick={() => switchTab("trace")}
            className={
              "px-4 py-1.5 rounded-full transition text-xs " +
              (activeTab === "trace"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-900/10")
            }
          >
            事件流 / 分组视图
          </button>
          <button
            type="button"
            onClick={() => switchTab("lifecycle")}
            className={
              "px-4 py-1.5 rounded-full transition text-xs " +
              (activeTab === "lifecycle"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-900/10")
            }
          >
            订单生命周期
          </button>
        </div>
      </div>

      {/* 主体内容：现在由 Studio 负责把状态分发给子模块 */}
      <div className="rounded-lg border border-slate-200 bg-white py-4">
        {activeTab === "trace" ? (
          <TraceEventsView
            traceId={traceId}
            warehouseId={warehouseId}
            focusRef={focusRef}
            onChangeTraceId={setTraceId}
            onChangeWarehouseId={setWarehouseId}
            autoRunOnMount={autoRunOnMount}
          />
        ) : (
          <OrderLifecycleView
            traceId={traceId}
            onChangeTraceId={setTraceId}
          />
        )}
      </div>
    </div>
  );
};

export default TraceStudioPage;
