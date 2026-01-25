// src/features/dev/orders/OrdersDevPanel.tsx
import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { DevOrdersPanel, type DevOrderContext } from "./DevOrdersPanel";

const LAST_ORDER_KEY = "devconsole_last_order_ctx";

export const OrdersDevPanel: React.FC = () => {
  const [searchParams] = useSearchParams();

  const urlPlatform = searchParams.get("platform") || undefined;
  const urlShopId = searchParams.get("shop_id") || undefined;
  const urlExtOrderNo = searchParams.get("ext_order_no") || undefined;
  const urlTraceId = searchParams.get("trace_id") || undefined;

  const initialOrderCtx = useMemo<DevOrderContext | undefined>(() => {
    if (urlExtOrderNo) {
      return {
        platform: urlPlatform || "PDD",
        shopId: urlShopId || "1",
        extOrderNo: urlExtOrderNo,
        traceId: urlTraceId,
      };
    }

    try {
      const raw = localStorage.getItem(LAST_ORDER_KEY);
      if (!raw) return undefined;
      const ctx = JSON.parse(raw) as DevOrderContext;
      if (ctx && ctx.extOrderNo) return ctx;
    } catch {
      // ignore
    }
    return undefined;
  }, [urlExtOrderNo, urlPlatform, urlShopId, urlTraceId]);

  // 若用户带 ext_order_no，则自动查询；否则保持旧行为（最近一次 ctx）
  const autoQuery = !!initialOrderCtx?.extOrderNo;

  // 兼容：如果用户通过 URL 带了 ext_order_no，把它写入最近上下文
  useEffect(() => {
    if (!urlExtOrderNo) return;
    try {
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(initialOrderCtx));
    } catch {
      // ignore
    }
  }, [urlExtOrderNo, initialOrderCtx]);

  const handleOrderContextChange = (ctx: DevOrderContext) => {
    try {
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(ctx));
    } catch {
      // ignore
    }
  };

  return (
    <DevOrdersPanel
      initialPlatform={initialOrderCtx?.platform}
      initialShopId={initialOrderCtx?.shopId}
      initialExtOrderNo={initialOrderCtx?.extOrderNo}
      autoQuery={autoQuery}
      onContextChange={handleOrderContextChange}
    />
  );
};
