// src/features/diagnostics/trace/TracePage.tsx
//
// 旧 Trace 页面壳（兼容用）
// - 主入口 /trace 已由 TraceStudioPage 接管
// - 本组件仅用于可能存在的旧路由或开发调试
//
// 如果你不再需要独立的 TracePage，可以在路由中移除对它的引用。

import React, { useState } from "react";
import { TraceEventsView } from "./TraceEventsView";

const TracePage: React.FC = () => {
  const [traceId, setTraceId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  return (
    <div className="px-6 lg:px-10 py-4 space-y-4">
      <TraceEventsView
        traceId={traceId}
        warehouseId={warehouseId}
        onChangeTraceId={setTraceId}
        onChangeWarehouseId={setWarehouseId}
      />
    </div>
  );
};

export default TracePage;
