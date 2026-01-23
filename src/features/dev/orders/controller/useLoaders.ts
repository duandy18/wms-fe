// src/features/dev/orders/controller/useLoaders.ts
import { useCallback, useState } from "react";
import type { DevOrderContext } from "../DevOrdersPanel";
import {
  fetchDevOrderFacts,
  fetchDevOrderView,
  fetchTraceById,
  type DevOrderInfo,
  type DevOrderItemFact,
  type DevOrderView,
  type TraceEvent as DevTraceEvent,
} from "../api/index";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "未知错误";
  }
}

export function useDevOrdersLoaders(args: {
  onContextChange?: (ctx: DevOrderContext) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orderView, setOrderView] = useState<DevOrderView | null>(null);
  const [orderFacts, setOrderFacts] = useState<DevOrderItemFact[] | null>(null);
  const [traceEvents, setTraceEvents] = useState<DevTraceEvent[]>([]);

  const order: DevOrderInfo | null = orderView?.order ?? null;
  const traceId: string | null = orderView?.trace_id ?? orderView?.order?.trace_id ?? null;

  const loadOrderAndTraceFor = useCallback(
    async (platform: string, shopId: string, extOrderNo: string) => {
      setLoading(true);
      setError(null);

      try {
        const ov = await fetchDevOrderView({ platform, shopId, extOrderNo });
        setOrderView(ov);

        if (args.onContextChange && ov?.order) {
          args.onContextChange({
            platform: ov.order.platform,
            shopId: ov.order.shop_id,
            extOrderNo: ov.order.ext_order_no,
            traceId: ov.trace_id ?? ov.order.trace_id ?? null,
          });
        }

        const facts = await fetchDevOrderFacts({ platform, shopId, extOrderNo });
        setOrderFacts(facts.items || []);

        const tid = ov.trace_id ?? ov.order.trace_id ?? null;
        if (tid) {
          const tr = await fetchTraceById(tid);
          setTraceEvents(tr.events || []);
        } else {
          setTraceEvents([]);
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err) ?? "加载订单失败");
        setOrderView(null);
        setOrderFacts(null);
        setTraceEvents([]);
      } finally {
        setLoading(false);
      }
    },
    [args],
  );

  const loadOrderAndTrace = useCallback(
    async (form: { platform: string; shopId: string; extOrderNo: string }) => {
      await loadOrderAndTraceFor(form.platform.trim(), form.shopId.trim(), form.extOrderNo.trim());
    },
    [loadOrderAndTraceFor],
  );

  return {
    // state
    loading,
    error,
    orderView,
    orderFacts,
    traceEvents,

    // derived
    order,
    traceId,

    // setters
    setError,
    setOrderView,
    setOrderFacts,
    setTraceEvents,

    // loaders
    loadOrderAndTraceFor,
    loadOrderAndTrace,

    // util
    getErrorMessage,
  };
}
