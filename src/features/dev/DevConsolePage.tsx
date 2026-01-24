// src/features/dev/DevConsolePage.tsx
// ================================================================
//  DevConsole v3 —— 已降级为兼容入口（deprecated）
//
//  Phase 5.5：Tab → 页面化
//  - 新入口：/ops/dev/*
//  - /dev：兼容入口（保留旧 query 语义），统一跳转到 /ops/dev/*
//  - 不改业务逻辑、不改 API
// ================================================================

import React, { useMemo } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { DevPanelId } from "./DevConsoleTypes";

const DevConsolePage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // 兼容旧参数：?panel=Orders|PickTasks|Inbound|Count|Platform
  const urlPanel = (searchParams.get("panel") as DevPanelId | null) ?? null;

  const targetPath = useMemo(() => {
    switch (urlPanel) {
      case DevPanelId.PickTasks:
        return "/ops/dev/pick";
      case DevPanelId.Inbound:
        return "/ops/dev/inbound";
      case DevPanelId.Count:
        return "/ops/dev/count";
      case DevPanelId.Platform:
        return "/ops/dev/platform";
      case DevPanelId.Orders:
      default:
        return "/ops/dev/orders";
    }
  }, [urlPanel]);

  // 保留除 panel 以外的查询参数（orders 页会消费 platform/shop_id/ext_order_no/trace_id）
  const preserved = new URLSearchParams(searchParams);
  preserved.delete("panel");
  const qs = preserved.toString();

  return <Navigate to={qs ? `${targetPath}?${qs}` : targetPath} replace />;
};

export default DevConsolePage;
