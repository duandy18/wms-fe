// src/features/diagnostics/order-lifecycle/OrderLifecyclePage.tsx
//
// 订单生命周期诊断页（旧入口壳）
// - Studio 内部使用 OrderLifecycleView
// - 本文件保留给独立路由 /tools/order-lifecycle 使用（若需要）

import React, { useState } from "react";
import { OrderLifecycleView } from "./OrderLifecycleView";

const OrderLifecyclePage: React.FC = () => {
  const [traceId, setTraceId] = useState("");

  return (
    <OrderLifecycleView
      traceId={traceId}
      onChangeTraceId={setTraceId}
    />
  );
};

export default OrderLifecyclePage;
