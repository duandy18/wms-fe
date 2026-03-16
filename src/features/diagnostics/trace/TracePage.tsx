// src/features/diagnostics/trace/TracePage.tsx
//
// Trace 页面壳
// - 主入口 /trace 已由 TraceStudioPage 接管
// - 本组件保留为轻量页面壳
//
// 如后续完成统一路由收口，可再评估是否移除该页面壳。

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
